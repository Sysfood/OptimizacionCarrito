import { fechaHoraLocal, type Db } from '../db/conexion';
import {
  reservaVencida,
  reservaVigente,
  type EstadoReserva,
  type Reserva,
} from '../dominio/reserva';

/**
 * Eventos del ciclo de vida de Reserva, derivados de EST-02. Los dos últimos
 * son del flujo del cliente VIP, que no genera pago: `aprobacionVip` consume la
 * reserva y `deudaMaximaExcedida` la libera.
 */
export type EventoReserva =
  | 'pagoAprobado'
  | 'pagoRechazado'
  | 'vencimiento'
  | 'aprobacionVip'
  | 'deudaMaximaExcedida';

const EVENTOS_QUE_CONSUMEN: EventoReserva[] = ['pagoAprobado', 'aprobacionVip'];

interface FilaReserva {
  id: number;
  pedidoId: number;
  fechaHoraInicio: string;
  fechaHoraVencimiento: string;
  estado: EstadoReserva;
}

interface DetalleParaReserva {
  productoId: number;
  cantidad: number;
  jornadaId: number;
}

export type ResultadoTransicionReserva =
  | { tipo: 'ok'; estado: EstadoReserva }
  | { tipo: 'noAplica'; motivo: string };

function buscarReserva(db: Db, reservaId: number): Reserva | null {
  const fila = db
    .prepare(
      `SELECT id, pedido_id AS pedidoId, fecha_hora_inicio AS fechaHoraInicio,
              fecha_hora_vencimiento AS fechaHoraVencimiento, estado
       FROM reserva WHERE id = ?`,
    )
    .get(reservaId) as FilaReserva | undefined;
  return fila ?? null;
}

function detallesDelPedido(db: Db, pedidoId: number): DetalleParaReserva[] {
  return db
    .prepare(
      `SELECT d.producto_id AS productoId, d.cantidad AS cantidad, p.jornada_id AS jornadaId
       FROM detalle_pedido d JOIN pedido p ON p.id = d.pedido_id
       WHERE d.pedido_id = ?`,
    )
    .all(pedidoId) as DetalleParaReserva[];
}

/**
 * Única función que aplica una transición de Reserva (EST-02): valida el estado
 * origen, evalúa la guarda, ejecuta la acción sobre la existencia y guarda el
 * estado destino. Consumida y Liberada son finales, por lo que una segunda
 * transición no puede repetir el efecto.
 */
export function aplicarTransicionReserva(params: {
  db: Db;
  reservaId: number;
  evento: EventoReserva;
  ahora?: string;
  forzarVencimiento?: boolean;
}): ResultadoTransicionReserva {
  const ahora = params.ahora ?? fechaHoraLocal();
  const reserva = buscarReserva(params.db, params.reservaId);

  if (!reserva) {
    return { tipo: 'noAplica', motivo: 'La reserva no existe' };
  }
  if (reserva.estado !== 'activa') {
    return { tipo: 'noAplica', motivo: `La reserva ya está ${reserva.estado}` };
  }
  if (params.evento === 'pagoAprobado' && !reservaVigente(reserva, ahora)) {
    return { tipo: 'noAplica', motivo: 'La reserva ya no está vigente' };
  }
  if (
    params.evento === 'vencimiento' &&
    !params.forzarVencimiento &&
    !reservaVencida(reserva, ahora)
  ) {
    return { tipo: 'noAplica', motivo: 'La reserva todavía está vigente' };
  }

  return params.db.transaction(() => {
    const detalles = detallesDelPedido(params.db, reserva.pedidoId);

    if (EVENTOS_QUE_CONSUMEN.includes(params.evento)) {
      const consumir = params.db.prepare(
        `UPDATE existencia
         SET unidades_reservadas = unidades_reservadas - ?,
             unidades_consumidas = unidades_consumidas + ?,
             fecha_hora_actualizacion = ?
         WHERE jornada_id = ? AND producto_id = ? AND unidades_reservadas >= ?`,
      );
      for (const detalle of detalles) {
        const resultado = consumir.run(
          detalle.cantidad,
          detalle.cantidad,
          ahora,
          detalle.jornadaId,
          detalle.productoId,
          detalle.cantidad,
        );
        if (resultado.changes === 0) {
          throw new Error('La reserva ya no cubre las unidades del pedido');
        }
      }
    } else {
      const liberar = params.db.prepare(
        `UPDATE existencia
         SET unidades_reservadas = unidades_reservadas - ?,
             fecha_hora_actualizacion = ?
         WHERE jornada_id = ? AND producto_id = ? AND unidades_reservadas >= ?`,
      );
      for (const detalle of detalles) {
        liberar.run(
          detalle.cantidad,
          ahora,
          detalle.jornadaId,
          detalle.productoId,
          detalle.cantidad,
        );
      }
    }

    const estadoDestino: EstadoReserva = EVENTOS_QUE_CONSUMEN.includes(params.evento)
      ? 'consumida'
      : 'liberada';
    const cambio = params.db
      .prepare(`UPDATE reserva SET estado = ? WHERE id = ? AND estado = 'activa'`)
      .run(estadoDestino, reserva.id);
    if (cambio.changes === 0) {
      throw new Error('La reserva ya no estaba activa');
    }

    return { tipo: 'ok' as const, estado: estadoDestino };
  })();
}

/** Busca la reserva activa de un pedido, si la hay. */
export function buscarReservaActiva(db: Db, pedidoId: number): Reserva | null {
  const fila = db
    .prepare(
      `SELECT id, pedido_id AS pedidoId, fecha_hora_inicio AS fechaHoraInicio,
              fecha_hora_vencimiento AS fechaHoraVencimiento, estado
       FROM reserva WHERE pedido_id = ? AND estado = 'activa'
       ORDER BY id DESC LIMIT 1`,
    )
    .get(pedidoId) as FilaReserva | undefined;
  return fila ?? null;
}
