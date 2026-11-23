import { randomUUID } from 'node:crypto';

/**
 * Reversa o reembolso de un pago aprobado que llegó después del vencimiento de
 * la reserva y no pudo asegurarse. El proveedor real no está definido
 * (Derivación 1), así que la implementación es simulada.
 */
export interface ServicioReversa {
  solicitarReversa(referencia: string, monto: number): { referenciaReversa: string };
}

/**
 * No recibe ni persiste datos de tarjeta: solo conserva la referencia de la
 * pasarela y el monto, como exige RP-18.
 */
export function crearReversaPagoSimulada(): ServicioReversa {
  return {
    solicitarReversa(referencia, monto) {
      const referenciaReversa = `REV-${referencia}-${randomUUID().slice(0, 6).toUpperCase()}`;
      console.log(
        `[reversa simulada] referencia=${referencia} monto=${monto} referenciaReversa=${referenciaReversa}`,
      );
      return { referenciaReversa };
    },
  };
}
