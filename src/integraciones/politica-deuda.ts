import type { Db } from '../db/conexion';

/**
 * Regla de negocio externa que decide si un cliente VIP puede seguir
 * acumulando deuda. El monto máximo y su criterio no están acordados con el
 * vendedor, por lo que se trata como una caja negra (EST-03): el sistema no
 * asume ningún valor por defecto.
 */
export interface PoliticaDeuda {
  /** Máximo vigente, o null si todavía no hay uno acordado. */
  deudaMaxima(): number | null;
  /** Indica si el cliente puede realizar un nuevo pedido sin pago previo. */
  permitePedido(datos: { deudaActual: number; montoPedido: number }): boolean;
}

export const CLAVE_DEUDA_MAXIMA = 'deuda_maxima';

function leerDeudaMaxima(db: Db): number | null {
  const fila = db
    .prepare('SELECT valor FROM configuracion WHERE clave = ?')
    .get(CLAVE_DEUDA_MAXIMA) as { valor: string } | undefined;

  if (!fila) return null;

  const valor = Number(fila.valor);
  return Number.isSafeInteger(valor) && valor >= 0 ? valor : null;
}

/**
 * Versión simulada: lee el máximo de la tabla `configuracion`. Sin máximo
 * configurado no se bloquea ningún pedido. Con máximo, se bloquea cuando la
 * deuda ya lo alcanzó.
 */
export function crearPoliticaDeudaSimulada(db: Db): PoliticaDeuda {
  return {
    deudaMaxima() {
      return leerDeudaMaxima(db);
    },
    permitePedido({ deudaActual }) {
      const maxima = leerDeudaMaxima(db);
      return maxima === null || deudaActual < maxima;
    },
  };
}
