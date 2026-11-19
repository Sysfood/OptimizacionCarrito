import { randomUUID } from 'node:crypto';

export type ResultadoPasarela = 'aprobado' | 'rechazado' | 'cancelado';

export interface ServicioPago {
  solicitarPago(datos: { pagoId: number; monto: number }): { referencia: string };
  registrarEnvio(referencia: string): void;
  verificarEnvio(referencia: string): boolean;
  registrarResultado(referencia: string, resultado: ResultadoPasarela): void;
  verificarResultado(referencia: string): ResultadoPasarela | null;
}

/**
 * Pasarela simulada: genera una referencia por intento, recuerda en memoria
 * que el estudiante envió el pago y el resultado que la pasarela emite en la
 * pantalla de demostración. No recibe ni almacena datos de tarjeta (RP-18).
 */
export function crearPasarelaPagoSimulada(): ServicioPago {
  const resultados = new Map<string, ResultadoPasarela>();
  const envios = new Set<string>();

  return {
    solicitarPago({ pagoId }) {
      return { referencia: `SIM-${pagoId}-${randomUUID().slice(0, 8).toUpperCase()}` };
    },
    registrarEnvio(referencia) {
      envios.add(referencia);
    },
    verificarEnvio(referencia) {
      return envios.has(referencia);
    },
    registrarResultado(referencia, resultado) {
      resultados.set(referencia, resultado);
    },
    verificarResultado(referencia) {
      return resultados.get(referencia) ?? null;
    },
  };
}
