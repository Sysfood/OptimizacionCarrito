export interface Existencia {
  id: number;
  jornadaId: number;
  productoId: number;
  unidadesAsignadas: number;
  unidadesReservadas: number;
  unidadesConsumidas: number;
  fechaHoraActualizacion: string;
}

/**
 * Unidades vendibles = asignadas − reservadas − consumidas.
 * Se acota a cero para no mostrar disponibilidad negativa ante datos inconsistentes.
 */
export function calcularUnidadesVendibles(
  existencia: Pick<
    Existencia,
    'unidadesAsignadas' | 'unidadesReservadas' | 'unidadesConsumidas'
  >,
): number {
  const vendibles =
    existencia.unidadesAsignadas -
    existencia.unidadesReservadas -
    existencia.unidadesConsumidas;
  return Math.max(0, vendibles);
}
