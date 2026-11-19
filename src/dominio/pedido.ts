export type EstadoPedido =
  | 'En edición'
  | 'Pendiente de pago'
  | 'Confirmado'
  | 'Pago no realizado'
  | 'En conciliación'
  | 'En preparación'
  | 'Listo para retiro'
  | 'Entregado'
  | 'Reembolsado';

export interface Pedido {
  id: number;
  clienteId: number;
  jornadaId: number;
  estado: EstadoPedido;
  codigo: string | null;
  estimacionPreparacion: string | null;
  fechaHoraConfirmacion: string | null;
  fechaHoraListo: string | null;
  fechaHoraEntrega: string | null;
}

export interface DetallePedido {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export function calcularSubtotal(cantidad: number, precioUnitario: number): number {
  return cantidad * precioUnitario;
}

export function calcularTotal(
  detalles: Pick<DetallePedido, 'cantidad' | 'precioUnitario'>[],
): number {
  return detalles.reduce(
    (total, detalle) => total + calcularSubtotal(detalle.cantidad, detalle.precioUnitario),
    0,
  );
}

export const NOMBRE_CLIENTE_DEMO = 'Estudiante de demostración';
export const CONTACTO_CLIENTE_DEMO = 'demo@turnocarrito.local';
