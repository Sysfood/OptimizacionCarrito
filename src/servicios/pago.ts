import { fechaHoraLocal, fechaLocal, type Db } from '../db/conexion';
import type { Pago } from '../dominio/pago';
import { reservaVigente, type Reserva } from '../dominio/reserva';
import type { ResultadoPasarela, ServicioPago } from '../integraciones/pasarela-pago';
import type { FuenteInventario } from '../integraciones/fuente-inventario';
import {
  crearReversaPagoSimulada,
  type ServicioReversa,
} from '../integraciones/reversa-pago';
import { aplicarTransicionReserva, buscarReservaActiva } from './reserva';
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

class SinDisponibilidadError extends Error {
  constructor(readonly productoId?: number) {
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

/**
 * Vence las reservas activas cuyo plazo terminó. Se llama antes de iniciar un
 * pago y antes de procesar un resultado, porque no hay un temporizador en
 * segundo plano (design.md, decisión 1).
 */
export function vencerReservasExpiradas(db: Db, pedidoId?: number): number[] {
  const ahora = fechaHoraLocal();
  const filas = db
    .prepare(
      `SELECT id, pedido_id AS pedidoId FROM reserva
       WHERE estado = 'activa' AND fecha_hora_vencimiento <= ?
         ${pedidoId === undefined ? '' : 'AND pedido_id = ?'}`,
    )
    .all(...(pedidoId === undefined ? [ahora] : [ahora, pedidoId])) as {
    id: number;
    pedidoId: number;
  }[];

  const afectados: number[] = [];
  for (const fila of filas) {
    const transicion = aplicarTransicionReserva({
      db,
      reservaId: fila.id,
      evento: 'vencimiento',
      ahora,
    });
    if (transicion.tipo !== 'ok') continue;

    db.prepare(
      `UPDATE pedido SET estado = 'Pago no realizado'
       WHERE id = ? AND estado = 'Pendiente de pago'`,
    ).run(fila.pedidoId);
    afectados.push(fila.pedidoId);
  }
  return afectados;
}

/** Control de demostración: fuerza el vencimiento de la reserva activa. */
export function vencerReservaActiva(db: Db, pedidoId: number): boolean {
  const reserva = buscarReservaActiva(db, pedidoId);
  if (!reserva) return false;

  const transicion = aplicarTransicionReserva({
    db,
    reservaId: reserva.id,
    evento: 'vencimiento',
    forzarVencimiento: true,
  });
  if (transicion.tipo !== 'ok') return false;

  db.prepare(
    `UPDATE pedido SET estado = 'Pago no realizado'
     WHERE id = ? AND estado = 'Pendiente de pago'`,
  ).run(pedidoId);
  return true;
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
  vencerReservasExpiradas(db);
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
  | { tipo: 'estadoInesperado'; pedido: PedidoVista }
  | { tipo: 'enConciliacion'; pedido: PedidoVista; motivo: string }
  | { tipo: 'reembolsado'; pedido: PedidoVista; referenciaReversa: string };

function referenciaReversaDe(db: Db, pagoId: number): string | null {
  const fila = db
    .prepare(
      `SELECT referencia_reversa AS referenciaReversa FROM conciliacion
       WHERE pago_id = ? AND referencia_reversa IS NOT NULL
       ORDER BY id DESC LIMIT 1`,
    )
    .get(pagoId) as { referenciaReversa: string } | undefined;
  return fila?.referenciaReversa ?? null;
}

/**
 * Resuelve un pago aprobado después del vencimiento. Si aún hay unidades,
 * las asegura en una sola operación y confirma; si no, registra la
 * conciliación y activa la reversa/reembolso simulado, sin pasar a preparación.
 */
function conciliarPagoAprobado(
  db: Db,
  pago: Pago,
  pedido: PedidoVista,
  reversa: ServicioReversa,
): ResultadoProcesoPago {
  const anterior = db
    .prepare(
      `SELECT estado, motivo FROM conciliacion WHERE pago_id = ? ORDER BY id DESC LIMIT 1`,
    )
    .get(pago.id) as { estado: string; motivo: string } | undefined;

  if (anterior?.estado === 'reembolsada') {
    return {
      tipo: 'reembolsado',
      pedido,
      referenciaReversa: referenciaReversaDe(db, pago.id) ?? 'sin referencia',
    };
  }
  if (anterior?.estado === 'en_resolucion') {
    return { tipo: 'enConciliacion', pedido, motivo: anterior.motivo };
  }
  if (pedido.estado === 'Confirmado' && pedido.codigo) {
    return { tipo: 'confirmado', pedido, codigo: pedido.codigo };
  }

  const ahora = fechaHoraLocal();
  const asegurar = db.transaction(() => {
    const actual = obtenerPedido(db, pago.pedidoId);
    if (!actual) throw new SinDisponibilidadError();
    if (actual.estado === 'Confirmado' && actual.codigo) {
      return {
        tipo: 'yaConfirmado' as const,
        pedido: actual,
        codigo: actual.codigo,
      };
    }

    const consumir = db.prepare(
      `UPDATE existencia
       SET unidades_consumidas = unidades_consumidas + ?,
           fecha_hora_actualizacion = ?
       WHERE jornada_id = ? AND producto_id = ?
         AND unidades_asignadas - unidades_reservadas - unidades_consumidas >= ?`,
    );
    for (const detalle of actual.detalles) {
      const cambio = consumir.run(
        detalle.cantidad,
        ahora,
        actual.jornada.id,
        detalle.productoId,
        detalle.cantidad,
      );
      if (cambio.changes === 0) throw new SinDisponibilidadError(detalle.productoId);
    }

    db.prepare(
      `INSERT INTO reserva (pedido_id, fecha_hora_inicio, fecha_hora_vencimiento, estado)
       VALUES (?, ?, ?, 'consumida')`,
    ).run(actual.id, ahora, ahora);

    db.prepare(
      `UPDATE pago SET resultado = 'confirmado' WHERE id = ? AND resultado = 'pendiente'`,
    ).run(pago.id);

    let codigo = '';
    for (let intento = 0; intento < 2; intento += 1) {
      try {
        codigo = generarCodigo(db);
        const cambio = db
          .prepare(
            `UPDATE pedido
             SET estado = 'Confirmado', codigo = ?, fecha_hora_confirmacion = ?
             WHERE id = ?`,
          )
          .run(codigo, ahora, actual.id);
        if (cambio.changes === 0) throw new Error('No fue posible confirmar el pedido');
        break;
      } catch (error) {
        if (intento === 0 && esColisionDeCodigo(error)) continue;
        throw error;
      }
    }

    db.prepare(
      `INSERT INTO conciliacion (pago_id, estado, motivo, fecha_hora, referencia_reversa)
       VALUES (?, 'confirmada', ?, ?, NULL)`,
    ).run(pago.id, 'pago aprobado tardío con disponibilidad', ahora);

    return {
      tipo: 'confirmado' as const,
      pedido: obtenerPedido(db, actual.id) ?? actual,
      codigo,
    };
  });

  try {
    const resultado = asegurar.immediate();
    return { tipo: 'confirmado', pedido: resultado.pedido, codigo: resultado.codigo };
  } catch (error) {
    if (!(error instanceof SinDisponibilidadError)) throw error;
  }

  const motivo = 'pago aprobado tardío sin disponibilidad';
  const { referenciaReversa } = reversa.solicitarReversa(
    pago.referenciaPasarela ?? '',
    pago.monto,
  );

  db.transaction(() => {
    const registro = db
      .prepare(
        `INSERT INTO conciliacion (pago_id, estado, motivo, fecha_hora, referencia_reversa)
         VALUES (?, 'en_resolucion', ?, ?, NULL)`,
      )
      .run(pago.id, motivo, ahora);
    db.prepare(`UPDATE pedido SET estado = 'En conciliación' WHERE id = ?`).run(pedido.id);
    db.prepare(
      `UPDATE conciliacion SET estado = 'reembolsada', referencia_reversa = ? WHERE id = ?`,
    ).run(referenciaReversa, Number(registro.lastInsertRowid));
    db.prepare(`UPDATE pedido SET estado = 'Reembolsado' WHERE id = ?`).run(pedido.id);
  })();

  return {
    tipo: 'reembolsado',
    pedido: obtenerPedido(db, pago.pedidoId) ?? pedido,
    referenciaReversa,
  };
}

/**
 * Aplica el resultado informado por la pasarela. Es idempotente por pago y por
 * pedido: una notificación repetida no crea otro pago, código, reserva ni venta.
 */
export function procesarResultadoPago(
  db: Db,
  parametros: { pagoId: number; referencia: string; resultado: ResultadoPasarela },
  reversa: ServicioReversa = crearReversaPagoSimulada(),
): ResultadoProcesoPago {
  const pago = buscarPago(db, parametros.pagoId);
  if (!pago) return { tipo: 'pagoNoEncontrado' };

  if (!pago.referenciaPasarela || pago.referenciaPasarela !== parametros.referencia) {
    return { tipo: 'referenciaInvalida' };
  }

  vencerReservasExpiradas(db, pago.pedidoId);
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

  if (pedido.estado === 'Reembolsado') {
    return {
      tipo: 'reembolsado',
      pedido,
      referenciaReversa: referenciaReversaDe(db, pago.id) ?? 'sin referencia',
    };
  }
  if (pedido.estado === 'En conciliación') {
    return {
      tipo: 'enConciliacion',
      pedido,
      motivo: 'pago aprobado tardío en resolución',
    };
  }

  if (parametros.resultado === 'aprobado') {
    const reserva = buscarReservaActiva(db, pedido.id);
    if (reserva && reservaVigente(reserva, fechaHoraLocal())) {
      return confirmarPago(db, pago, pedido);
    }
    return conciliarPagoAprobado(db, pago, pedido, reversa);
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
  const ahoraConfirmacion = fechaHoraLocal();
  if (!reservaVigente(reserva, ahoraConfirmacion)) {
    return { tipo: 'sinReservaActiva', pedido };
  }

  const confirmar = db.transaction(() => {
    const ahora = ahoraConfirmacion;

    const pagoActualizado = db
      .prepare(
        `UPDATE pago SET resultado = 'confirmado'
         WHERE id = ? AND resultado = 'pendiente'`,
      )
      .run(pago.id);

    if (pagoActualizado.changes === 0) {
      throw new Error('El pago ya fue procesado');
    }

    const transicion = aplicarTransicionReserva({
      db,
      reservaId: reserva.id,
      evento: 'pagoAprobado',
      ahora,
    });
    if (transicion.tipo !== 'ok') {
      throw new Error(transicion.motivo);
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
      const transicion = aplicarTransicionReserva({
        db,
        reservaId: reserva.id,
        evento: 'pagoRechazado',
        ahora,
      });
      if (transicion.tipo !== 'ok') {
        throw new Error(transicion.motivo);
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
