import { fechaHoraLocal, type Db } from '../db/conexion';
import {
  CONTACTO_CLIENTE_VIP_DEMO,
  type Cliente,
  type MovimientoDeuda,
} from '../dominio/cliente';
import { CONTACTO_CLIENTE_DEMO } from '../dominio/pedido';
import type { FuenteInventario } from '../integraciones/fuente-inventario';
import { CLAVE_DEUDA_MAXIMA, type PoliticaDeuda } from '../integraciones/politica-deuda';
import {
  obtenerPedido,
  revalidarPedido,
  type CambioDisponibilidad,
  type CambioPrecio,
  type PedidoVista,
} from './pedido';
import { esColisionDeCodigo, generarCodigo, sumarMinutos } from './pago';
import { aplicarTransicionReserva } from './reserva';

interface FilaCliente {
  id: number;
  nombre: string;
  contacto: string;
  esVip: number;
  deuda: number;
}

interface FilaMovimiento {
  id: number;
  clienteId: number;
  pedidoId: number | null;
  tipo: MovimientoDeuda['tipo'];
  monto: number;
  fechaHora: string;
}

class SinDisponibilidadError extends Error {
  constructor(readonly productoId?: number) {
    super('No hay unidades vendibles para reservar');
    this.name = 'SinDisponibilidadError';
  }
}

class PedidoYaConfirmadoError extends Error {
  constructor() {
    super('El pedido ya fue confirmado');
    this.name = 'PedidoYaConfirmadoError';
  }
}

const MINUTOS_RESERVA = 3;

function aCliente(fila: FilaCliente): Cliente {
  return {
    id: fila.id,
    nombre: fila.nombre,
    contacto: fila.contacto,
    esVip: Boolean(fila.esVip),
    deuda: fila.deuda,
  };
}

export function obtenerCliente(db: Db, clienteId: number): Cliente | null {
  const fila = db
    .prepare(
      `SELECT id, nombre, contacto, es_vip AS esVip, deuda
       FROM cliente WHERE id = ?`,
    )
    .get(clienteId) as FilaCliente | undefined;

  return fila ? aCliente(fila) : null;
}

/**
 * Cliente que actúa según el rol de demostración: `vip` usa el cliente VIP de
 * demostración y cualquier otro rol usa el estudiante de demostración, que no
 * es VIP y debe pagar por la pasarela.
 */
export function clienteDelRol(db: Db, rol: string): Cliente {
  const contacto = rol === 'vip' ? CONTACTO_CLIENTE_VIP_DEMO : CONTACTO_CLIENTE_DEMO;
  const fila = db
    .prepare(
      `SELECT id, nombre, contacto, es_vip AS esVip, deuda
       FROM cliente WHERE contacto = ?`,
    )
    .get(contacto) as FilaCliente | undefined;

  if (!fila) {
    throw new Error(
      'Falta el cliente de demostración. Ejecuta npm run db:seed antes de usar el pedido.',
    );
  }

  return aCliente(fila);
}

export type ResultadoDeuda =
  | { tipo: 'ok'; cliente: Cliente; deuda: number; movimientos: MovimientoDeuda[] }
  | { tipo: 'noVip' }
  | { tipo: 'clienteNoEncontrado' };

/**
 * HU-12: devuelve la deuda acumulada del cliente VIP. Un cliente nuevo parte
 * en $0 y un cliente que no es VIP no tiene acceso a la consulta.
 */
export function consultarDeuda(db: Db, clienteId: number): ResultadoDeuda {
  const cliente = obtenerCliente(db, clienteId);
  if (!cliente) return { tipo: 'clienteNoEncontrado' };
  if (!cliente.esVip) return { tipo: 'noVip' };

  const movimientos = db
    .prepare(
      `SELECT id, cliente_id AS clienteId, pedido_id AS pedidoId, tipo, monto,
              fecha_hora AS fechaHora
       FROM movimiento_deuda
       WHERE cliente_id = ?
       ORDER BY id DESC`,
    )
    .all(clienteId) as FilaMovimiento[];

  return { tipo: 'ok', cliente, deuda: cliente.deuda, movimientos };
}

export type ResultadoPedidoVip =
  | { tipo: 'ok'; pedido: PedidoVista; codigo: string; deuda: number }
  | { tipo: 'yaConfirmado'; pedido: PedidoVista; codigo: string }
  | { tipo: 'sinPedido' }
  | { tipo: 'noVip' }
  | { tipo: 'noDisponible'; motivo: string }
  | {
      tipo: 'cambios';
      pedido: PedidoVista;
      precios: CambioPrecio[];
      disponibilidad: CambioDisponibilidad[];
      totalAnterior: number;
      totalNuevo: number;
    }
  | {
      tipo: 'disponibilidad';
      pedido: PedidoVista;
      disponibilidad: CambioDisponibilidad[];
    }
  | { tipo: 'deudaMaxima'; deuda: number; maxima: number | null };

/**
 * HU-11: confirma un pedido de un cliente VIP sin pago previo. Revalida precio
 * y disponibilidad, reserva las unidades y consulta la política de deuda
 * máxima (EST-03). Si la política lo permite, consume la reserva, asigna el
 * código de retiro, confirma el pedido y suma su total a la deuda en una sola
 * transacción; si no, libera la reserva y el pedido queda sin confirmar.
 *
 * Es idempotente por pedido: repetir la solicitud no crea otro pedido ni suma
 * la deuda dos veces.
 *
 * `clienteId` es quien realiza la solicitud: debe ser el dueño del pedido y
 * ser VIP; en otro caso se rechaza con `noVip` y no se modifica nada.
 */
export function confirmarPedidoVip(
  db: Db,
  fuente: FuenteInventario,
  politica: PoliticaDeuda,
  pedidoId: number,
  clienteId?: number,
): ResultadoPedidoVip {
  const pedido = obtenerPedido(db, pedidoId);
  if (!pedido) return { tipo: 'sinPedido' };
  if (!pedido.esVip) return { tipo: 'noVip' };
  if (clienteId !== undefined && pedido.clienteId !== clienteId) {
    return { tipo: 'noVip' };
  }

  if (pedido.estado === 'Confirmado' && pedido.codigo) {
    return { tipo: 'yaConfirmado', pedido, codigo: pedido.codigo };
  }
  if (pedido.estado !== 'En edición' || pedido.detalles.length === 0) {
    return { tipo: 'sinPedido' };
  }

  const revalidacion = revalidarPedido(db, fuente, pedidoId);

  switch (revalidacion.tipo) {
    case 'noDisponible':
      return { tipo: 'noDisponible', motivo: revalidacion.motivo };
    case 'sinPedido':
      return { tipo: 'sinPedido' };
    case 'cambios':
      return {
        tipo: 'cambios',
        pedido: revalidacion.pedido,
        precios: revalidacion.precios,
        disponibilidad: revalidacion.disponibilidad,
        totalAnterior: revalidacion.totalAnterior,
        totalNuevo: revalidacion.totalNuevo,
      };
    case 'listo':
      break;
  }

  const aprobar = db.transaction(() => {
    const actual = obtenerPedido(db, pedidoId);
    if (!actual || actual.detalles.length === 0) {
      throw new Error('El pedido ya no está disponible');
    }
    if (actual.estado === 'Confirmado') throw new PedidoYaConfirmadoError();
    if (actual.estado !== 'En edición') {
      throw new Error('El pedido ya no está disponible');
    }

    const ahora = fechaHoraLocal();
    const reservar = db.prepare(
      `UPDATE existencia
       SET unidades_reservadas = unidades_reservadas + ?,
           fecha_hora_actualizacion = ?
       WHERE jornada_id = ? AND producto_id = ?
         AND unidades_asignadas - unidades_reservadas - unidades_consumidas >= ?`,
    );

    for (const detalle of actual.detalles) {
      const resultado = reservar.run(
        detalle.cantidad,
        ahora,
        actual.jornada.id,
        detalle.productoId,
        detalle.cantidad,
      );

      if (resultado.changes === 0) {
        throw new SinDisponibilidadError(detalle.productoId);
      }
    }

    const reserva = db
      .prepare(
        `INSERT INTO reserva (pedido_id, fecha_hora_inicio, fecha_hora_vencimiento, estado)
         VALUES (?, ?, ?, 'activa')`,
      )
      .run(pedidoId, ahora, sumarMinutos(ahora, MINUTOS_RESERVA));
    const reservaId = Number(reserva.lastInsertRowid);

    const cliente = obtenerCliente(db, actual.clienteId);
    if (!cliente || !cliente.esVip) {
      throw new Error('El cliente no es VIP');
    }

    if (!politica.permitePedido({ deudaActual: cliente.deuda, montoPedido: actual.total })) {
      const liberada = aplicarTransicionReserva({
        db,
        reservaId,
        evento: 'deudaMaximaExcedida',
        ahora,
      });
      if (liberada.tipo !== 'ok') throw new Error(liberada.motivo);

      return {
        tipo: 'deudaMaxima' as const,
        deuda: cliente.deuda,
        maxima: politica.deudaMaxima(),
      };
    }

    const consumida = aplicarTransicionReserva({
      db,
      reservaId,
      evento: 'aprobacionVip',
      ahora,
    });
    if (consumida.tipo !== 'ok') throw new Error(consumida.motivo);

    let codigo = '';
    for (let intento = 0; intento < 2; intento += 1) {
      try {
        codigo = generarCodigo(db);
        const cambio = db
          .prepare(
            `UPDATE pedido
             SET estado = 'Confirmado', codigo = ?, fecha_hora_confirmacion = ?
             WHERE id = ? AND estado = 'En edición'`,
          )
          .run(codigo, ahora, pedidoId);

        if (cambio.changes === 0) throw new Error('No fue posible confirmar el pedido');
        break;
      } catch (error) {
        if (intento === 0 && esColisionDeCodigo(error)) continue;
        throw error;
      }
    }

    db.prepare(
      `INSERT INTO movimiento_deuda (cliente_id, pedido_id, tipo, monto, fecha_hora)
       VALUES (?, ?, 'cargo', ?, ?)`,
    ).run(cliente.id, pedidoId, actual.total, ahora);
    db.prepare('UPDATE cliente SET deuda = deuda + ? WHERE id = ?').run(
      actual.total,
      cliente.id,
    );

    return {
      tipo: 'ok' as const,
      codigo,
      deuda: cliente.deuda + actual.total,
    };
  });

  try {
    const resultado = aprobar.immediate();

    if (resultado.tipo === 'deudaMaxima') return resultado;

    const confirmado = obtenerPedido(db, pedidoId) as PedidoVista;
    return { tipo: 'ok', pedido: confirmado, codigo: resultado.codigo, deuda: resultado.deuda };
  } catch (error) {
    if (error instanceof PedidoYaConfirmadoError) {
      const confirmado = obtenerPedido(db, pedidoId);
      if (confirmado?.codigo) {
        return { tipo: 'yaConfirmado', pedido: confirmado, codigo: confirmado.codigo };
      }
    }

    if (error instanceof SinDisponibilidadError) {
      const actual = obtenerPedido(db, pedidoId);
      const detalle = actual?.detalles.find((item) => item.productoId === error.productoId);

      return {
        tipo: 'disponibilidad',
        pedido: actual ?? pedido,
        disponibilidad: detalle
          ? [
              {
                productoId: detalle.productoId,
                nombre: detalle.nombre,
                cantidadSolicitada: detalle.cantidad,
                unidadesVendibles: detalle.unidadesVendibles,
              },
            ]
          : [],
      };
    }

    throw error;
  }
}

/**
 * Control de demostración: registra el pago de la deuda completa de un cliente
 * VIP, como lo haría el vendedor al cobrarla fuera del sistema. Devuelve el
 * monto saldado.
 */
export function saldarDeuda(db: Db, clienteId: number): number {
  return db.transaction(() => {
    const cliente = obtenerCliente(db, clienteId);
    if (!cliente || !cliente.esVip || cliente.deuda <= 0) return 0;

    db.prepare(
      `INSERT INTO movimiento_deuda (cliente_id, pedido_id, tipo, monto, fecha_hora)
       VALUES (?, NULL, 'abono', ?, ?)`,
    ).run(clienteId, cliente.deuda, fechaHoraLocal());
    db.prepare('UPDATE cliente SET deuda = 0 WHERE id = ?').run(clienteId);

    return cliente.deuda;
  })();
}

/** Control de demostración: fija o quita el máximo de deuda de la política simulada. */
export function configurarDeudaMaxima(db: Db, monto: number | null): void {
  if (monto === null) {
    db.prepare('DELETE FROM configuracion WHERE clave = ?').run(CLAVE_DEUDA_MAXIMA);
    return;
  }

  db.prepare(
    `INSERT INTO configuracion (clave, valor) VALUES (?, ?)
     ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor`,
  ).run(CLAVE_DEUDA_MAXIMA, String(monto));
}
