export type EstadoReserva = 'activa' | 'consumida' | 'liberada';

export interface Reserva {
  id: number;
  pedidoId: number;
  fechaHoraInicio: string;
  fechaHoraVencimiento: string;
  estado: EstadoReserva;
}
