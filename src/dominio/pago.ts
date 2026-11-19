export type EstadoPago = 'pendiente' | 'rechazado' | 'confirmado';

export interface Pago {
  id: number;
  pedidoId: number;
  referenciaPasarela: string | null;
  monto: number;
  resultado: EstadoPago;
  fechaHora: string;
}
