import { fechaHoraLocal, fechaLocal, type Db } from '../db/conexion';
import type { Pago } from '../dominio/pago';
import type { Reserva } from '../dominio/reserva';
import type { ResultadoPasarela, ServicioPago } from '../integraciones/pasarela-pago';
import type { FuenteInventario } from '../integraciones/fuente-inventario';
import {
  obtenerPedido,
  revalidarPedido,
  type CambioDisponibilidad,
  type CambioPrecio,
  type PedidoVista,
} from './pedido';

const ESTADOS_PAGABLES = ['En edición', 'Pago no realizado'];

interface FilaPago {
  id: number;
  pedidoId: number;
  referenciaPasarela: string | null;
  monto: number;
  resultado: Pago['resultado'];
  fechaHora: string;
}

interface FilaReserva {
  id: number;
  pedidoId: number;
  fechaHoraInicio: string;
  fechaHoraVencimiento: string;
  estado: Reserva['estado'];
}

class SinDisponibilidadError extends Error {
  constructor(readonly productoId: number) {
    super('No hay unidades vendibles para reservar');
    this.name = 'SinDisponibilidadError';
  }
}

function sumarMinutos(fechaHora: string, minutos: number): string {
  const [fecha, hora = '00:00:00'] = fechaHora.split(' ');
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [horas, minutosActuales, segundos = 0] = hora.split(':').map(Number);
  const resultado = new Date(anio, mes - 1, dia, horas, minutosActuales, segundos);
  resultado.setMinutes(resultado.getMinutes() + minutos);
  return fechaHoraLocal(resultado);
}

function buscarPago(db: Db, pagoId: number): Pago | null {
  const fila = db
    .prepare(
      `SELECT
         id AS id,
         pedido_id AS pedidoId,
         referencia_pasarela AS referenciaPasarela,
         monto AS monto,
         resultado AS resultado,
         fecha_hora AS fechaHora
       FROM pago
       WHERE id = ?`,
    )
    .get(pagoId) as FilaPago | undefined;

  return fila ?? null;
}

function buscarReservaActiva(db: Db, pedidoId: number): Reserva | null {
  const fila = db
    .prepare(
      `SELECT
         id AS id,
         pedido_id AS pedidoId,
         fecha_hora_inicio AS fechaHoraInicio,
         fecha_hora_vencimiento AS fechaHoraVencimiento,
         estado AS estado
       FROM reserva
       WHERE pedido_id = ? AND estado = 'activa'
       ORDER BY id DESC
       LIMIT 1`,
    )
    .get(pedidoId) as FilaReserva | undefined;

  return fila ?? null;
}

function generarCodigo(db: Db, fecha = new Date()): string {
  const base = `TC-${fechaLocal(fecha).replace(/-/g, '')}`;
  const fila = db
    .prepare(
      `SELECT codigo FROM pedido
       WHERE codigo LIKE ?
       ORDER BY codigo DESC
       LIMIT 1`,
    )
    .get(`${base}-%`) as { codigo: string } | undefined;

  const ultimo = fila ? Number(fila.codigo.slice(-4)) : 0;
  const siguiente = Number.isFinite(ultimo) ? ultimo + 1 : 1;
  return `${base}-${String(siguiente).padStart(4, '0')}`;
}

function esColisionDeCodigo(error: unknown): boolean {
  return (
    error instanceof Error && /UNIQUE constraint failed: pedido\.codigo/.test(error.message)
  );
}

export type ResultadoInicioPago =
  | { tipo: 'ok'; pedidoId: number; pagoId: number; total: number }
  | { tipo: 'sinPedido' }
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
    };

/**
 * Inicia un pago (o un reintento desde «Pago no realizado»). Revalida precio y
 * disponibilidad, reserva las unidades en una transacción, deja el pedido en
 * «Pendiente de pago» y registra el intento de pago con la referencia de la
 * pasarela simulada.
 */
export function iniciarPago(
  db: Db,
  fuente: FuenteInventario,
  pasarela: ServicioPago,
  pedidoId: number,
): ResultadoInicioPago {
  const pedido = obtenerPedido(db, pedidoId);
  if (
    !pedido ||
    !ESTADOS_PAGABLES.includes(pedido.estado) ||
    pedido.detalles.length === 0
  ) {
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

  const crearPago = db.transaction(() => {
    const actual = obtenerPedido(db, pedidoId);
    if (
      !actual ||
      !ESTADOS_PAGABLES.includes(actual.estado) ||
      actual.detalles.length === 0
    ) {
      throw new Error('El pedido ya no está disponible para pagar');
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

    db.prepare(
      `INSERT INTO reserva (pedido_id, fecha_hora_inicio, fecha_hora_vencimiento, estado)
       VALUES (?, ?, ?, 'activa')`,
    ).run(pedidoId, ahora, sumarMinutos(ahora, 3));

    const pago = db
      .prepare(
        `INSERT INTO pago (pedido_id, monto, resultado, fecha_hora)
         VALUES (?, ?, 'pendiente', ?)`,
      )
      .run(pedidoId, actual.total, ahora);
    const pagoId = Number(pago.lastInsertRowid);

    const { referencia } = pasarela.solicitarPago({ pagoId, monto: actual.total });
    db.prepare('UPDATE pago SET referencia_pasarela = ? WHERE id = ?').run(
      referencia,
      pagoId,
    );

    const cambio = db
      .prepare(
        `UPDATE pedido SET estado = 'Pendiente de pago'
         WHERE id = ? AND estado IN ('En edición', 'Pago no realizado')`,
      )
      .run(pedidoId);

    if (cambio.changes === 0) {
      throw new Error('El pedido ya no está disponible para pagar');
    }

    return { pedidoId, pagoId, total: actual.total };
  });

  try {
    return { tipo: 'ok', ...crearPago() };
  } catch (error) {
    if (error instanceof SinDisponibilidadError) {
      const actual = obtenerPedido(db, pedidoId);
      const detalle = actual?.detalles.find(
        (item) => item.productoId === error.productoId,
      );

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

export type ResultadoProcesoPago =
  | { tipo: 'confirmado'; pedido: PedidoVista; codigo: string }
  | { tipo: 'noRealizado'; pedido: PedidoVista; resultado: ResultadoPasarela }
  | { tipo: 'pagoNoEncontrado' }
  | { tipo: 'referenciaInvalida' }
  | { tipo: 'sinReservaActiva'; pedido: PedidoVista }
  | { tipo: 'estadoInesperado'; pedido: PedidoVista };

/**
 * Aplica el resultado informado por la pasarela. Es idempotente por pago y por
 * pedido: una notificación repetida no crea otro pago, código, reserva ni venta.
 */
export function procesarResultadoPago(
  db: Db,
  parametros: { pagoId: number; referencia: string; resultado: ResultadoPasarela },
): ResultadoProcesoPago {
  const pago = buscarPago(db, parametros.pagoId);
  if (!pago) return { tipo: 'pagoNoEncontrado' };

  if (!pago.referenciaPasarela || pago.referenciaPasarela !== parametros.referencia) {
    return { tipo: 'referenciaInvalida' };
  }

  const pedido = obtenerPedido(db, pago.pedidoId);
  if (!pedido) return { tipo: 'pagoNoEncontrado' };

  if (pago.resultado === 'confirmado') {
    if (pedido.estado === 'Confirmado' && pedido.codigo) {
      return { tipo: 'confirmado', pedido, codigo: pedido.codigo };
    }

    return { tipo: 'estadoInesperado', pedido };
  }

  if (pago.resultado === 'rechazado') {
    return {
      tipo: 'noRealizado',
      pedido,
      resultado: parametros.resultado === 'cancelado' ? 'cancelado' : 'rechazado',
    };
  }

  if (parametros.resultado === 'aprobado') {
    return confirmarPago(db, pago, pedido);
  }

  return rechazarPago(db, pago, pedido, parametros.resultado);
}

function confirmarPago(
  db: Db,
  pago: Pago,
  pedido: PedidoVista,
): ResultadoProcesoPago {
  if (pedido.estado === 'Confirmado' && pedido.codigo) {
    return { tipo: 'confirmado', pedido, codigo: pedido.codigo };
  }

  if (pedido.estado !== 'Pendiente de pago') {
    return { tipo: 'estadoInesperado', pedido };
  }

  const reserva = buscarReservaActiva(db, pedido.id);
  if (!reserva) {
    return { tipo: 'sinReservaActiva', pedido };
  }

  const confirmar = db.transaction(() => {
    const ahora = fechaHoraLocal();

    const pagoActualizado = db
      .prepare(
        `UPDATE pago SET resultado = 'confirmado'
         WHERE id = ? AND resultado = 'pendiente'`,
      )
      .run(pago.id);

    if (pagoActualizado.changes === 0) {
      throw new Error('El pago ya fue procesado');
    }

    const reservaActualizada = db
      .prepare(
        `UPDATE reserva SET estado = 'consumida'
         WHERE id = ? AND estado = 'activa'`,
      )
      .run(reserva.id);

    if (reservaActualizada.changes === 0) {
      throw new Error('La reserva ya no está activa');
    }

    const consumir = db.prepare(
      `UPDATE existencia
       SET unidades_reservadas = unidades_reservadas - ?,
           unidades_consumidas = unidades_consumidas + ?,
           fecha_hora_actualizacion = ?
       WHERE jornada_id = ? AND producto_id = ?
         AND unidades_reservadas >= ?`,
    );

    for (const detalle of pedido.detalles) {
      const resultado = consumir.run(
        detalle.cantidad,
        detalle.cantidad,
        ahora,
        pedido.jornada.id,
        detalle.productoId,
        detalle.cantidad,
      );

      if (resultado.changes === 0) {
        throw new Error('La reserva ya no cubre las unidades del pedido');
      }
    }

    for (let intento = 0; intento < 2; intento += 1) {
      try {
        const codigo = generarCodigo(db);
        const pedidoActualizado = db
          .prepare(
            `UPDATE pedido
             SET estado = 'Confirmado', codigo = ?, fecha_hora_confirmacion = ?
             WHERE id = ? AND estado = 'Pendiente de pago'`,
          )
          .run(codigo, ahora, pedido.id);

        if (pedidoActualizado.changes === 0) {
          throw new Error('El pedido ya no está pendiente de pago');
        }

        return codigo;
      } catch (error) {
        if (intento === 0 && esColisionDeCodigo(error)) continue;
        throw error;
      }
    }

    throw new Error('No fue posible asignar el código de retiro');
  });

  const codigo = confirmar();
  const actualizado = obtenerPedido(db, pedido.id);

  if (!actualizado || !actualizado.codigo) {
    return { tipo: 'estadoInesperado', pedido: actualizado ?? pedido };
  }

  return { tipo: 'confirmado', pedido: actualizado, codigo };
}

function rechazarPago(
  db: Db,
  pago: Pago,
  pedido: PedidoVista,
  resultado: ResultadoPasarela,
): ResultadoProcesoPago {
  if (pedido.estado === 'Confirmado') {
    return pedido.codigo
      ? { tipo: 'confirmado', pedido, codigo: pedido.codigo }
      : { tipo: 'estadoInesperado', pedido };
  }

  if (pedido.estado !== 'Pendiente de pago') {
    return { tipo: 'noRealizado', pedido, resultado };
  }

  const liberar = db.transaction(() => {
    const ahora = fechaHoraLocal();

    const pagoActualizado = db
      .prepare(
        `UPDATE pago SET resultado = 'rechazado'
         WHERE id = ? AND resultado = 'pendiente'`,
      )
      .run(pago.id);

    if (pagoActualizado.changes === 0) {
      throw new Error('El pago ya fue procesado');
    }

    const reserva = buscarReservaActiva(db, pedido.id);

    if (reserva) {
      db.prepare(
        `UPDATE reserva SET estado = 'liberada'
         WHERE id = ? AND estado = 'activa'`,
      ).run(reserva.id);

      const liberarUnidades = db.prepare(
        `UPDATE existencia
         SET unidades_reservadas = unidades_reservadas - ?,
             fecha_hora_actualizacion = ?
         WHERE jornada_id = ? AND producto_id = ?
           AND unidades_reservadas >= ?`,
      );

      for (const detalle of pedido.detalles) {
        liberarUnidades.run(
          detalle.cantidad,
          ahora,
          pedido.jornada.id,
          detalle.productoId,
          detalle.cantidad,
        );
      }
    }

    const actualizado = db
      .prepare(
        `UPDATE pedido SET estado = 'Pago no realizado'
         WHERE id = ? AND estado = 'Pendiente de pago'`,
      )
      .run(pedido.id);

    if (actualizado.changes === 0) {
      throw new Error('El pedido ya no está pendiente de pago');
    }
  });

  liberar();
  const actualizado = obtenerPedido(db, pedido.id);
  return { tipo: 'noRealizado', pedido: actualizado ?? pedido, resultado };
}

export function obtenerPago(db: Db, pagoId: number): Pago | null {
  return buscarPago(db, pagoId);
}

export function obtenerPagoPendiente(
  db: Db,
  pedidoId: number,
): { id: number } | null {
  const fila = db
    .prepare(
      `SELECT id FROM pago
       WHERE pedido_id = ? AND resultado = 'pendiente'
       ORDER BY id DESC
       LIMIT 1`,
    )
    .get(pedidoId) as { id: number } | undefined;

  return fila ?? null;
}

export function obtenerPagoConfirmado(
  db: Db,
  pedidoId: number,
): { id: number; referenciaPasarela: string } | null {
  const fila = db
    .prepare(
      `SELECT id, referencia_pasarela AS referenciaPasarela
       FROM pago
       WHERE pedido_id = ? AND resultado = 'confirmado'
       ORDER BY id DESC
       LIMIT 1`,
    )
    .get(pedidoId) as { id: number; referenciaPasarela: string | null } | undefined;

  if (!fila || !fila.referenciaPasarela) return null;

  return { id: fila.id, referenciaPasarela: fila.referenciaPasarela };
}

export function normalizarCodigo(codigo: string): string {
  return codigo.replace(/\s+/g, '').toUpperCase();
}

export function obtenerPedidoPorCodigo(
  db: Db,
  codigo: string,
): PedidoVista | null {
  const normalizado = normalizarCodigo(codigo);
  if (!normalizado) return null;

  const fila = db
    .prepare('SELECT id FROM pedido WHERE codigo = ?')
    .get(normalizado) as { id: number } | undefined;

  return fila ? obtenerPedido(db, fila.id) : null;
}

/**
 * Actualiza el texto de estimación o atraso solo mientras el pedido está
 * confirmado. El pedido no se cancela por superar la estimación.
 */
export function actualizarEstimacion(
  db: Db,
  pedidoId: number,
  texto: string,
): boolean {
  const limpio = texto.trim().slice(0, 120);
  if (!limpio) return false;

  const resultado = db
    .prepare(
      `UPDATE pedido SET estimacion_preparacion = ?
       WHERE id = ? AND estado = 'Confirmado'`,
    )
    .run(limpio, pedidoId);

  return resultado.changes > 0;
}
