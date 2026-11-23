export type EstadoReserva = 'activa' | 'consumida' | 'liberada';

export interface Reserva {
  id: number;
  pedidoId: number;
  fechaHoraInicio: string;
  fechaHoraVencimiento: string;
  estado: EstadoReserva;
}

/** Una reserva solo es vigente si está activa y su plazo no venció (EST-02). */
export function reservaVigente(reserva: Reserva, ahora: string): boolean {
  return reserva.estado === 'activa' && reserva.fechaHoraVencimiento > ahora;
}

/** Una reserva venció cuando su plazo terminó sin que se consumiera o liberara. */
export function reservaVencida(reserva: Reserva, ahora: string): boolean {
  return reserva.estado === 'activa' && reserva.fechaHoraVencimiento <= ahora;
}
