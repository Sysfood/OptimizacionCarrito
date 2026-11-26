export interface Cliente {
  id: number;
  nombre: string;
  contacto: string;
  esVip: boolean;
  deuda: number;
}

export type TipoMovimientoDeuda = 'cargo' | 'abono';

export interface MovimientoDeuda {
  id: number;
  clienteId: number;
  pedidoId: number | null;
  tipo: TipoMovimientoDeuda;
  monto: number;
  fechaHora: string;
}

export const NOMBRE_CLIENTE_VIP_DEMO = 'Cliente VIP de demostración';
export const CONTACTO_CLIENTE_VIP_DEMO = 'vip@turnocarrito.local';

/** La deuda de un cliente nuevo parte en $0 (HU-12). */
export const DEUDA_INICIAL = 0;
