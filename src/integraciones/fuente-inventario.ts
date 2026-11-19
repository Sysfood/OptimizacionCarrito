import type { Db } from '../db/conexion';

export interface ExistenciaConProducto {
  existenciaId: number;
  productoId: number;
  nombre: string;
  precio: number;
  unidadesAsignadas: number;
  unidadesReservadas: number;
  unidadesConsumidas: number;
  fechaHoraActualizacion: string;
}

export type ResultadoDisponibilidad =
  | { tipo: 'ok'; existencias: ExistenciaConProducto[] }
  | { tipo: 'noDisponible'; motivo: string };

export interface FuenteInventario {
  consultarExistencias(jornadaId: number): ResultadoDisponibilidad;
}

export function fuenteEstaDisponible(db: Db): boolean {
  const fila = db
    .prepare(`SELECT valor FROM configuracion WHERE clave = 'fuente_inventario_disponible'`)
    .get() as { valor: string } | undefined;

  return fila?.valor !== '0';
}

/**
 * Versión simulada de la fuente de inventario. La integración real con el
 * software de ventas del vendedor no está acordada (Derivación 3); esta
 * versión lee la base local y permite forzar el estado «no disponible».
 */
export function crearFuenteInventarioSimulada(db: Db): FuenteInventario {
  return {
    consultarExistencias(jornadaId: number): ResultadoDisponibilidad {
      if (!fuenteEstaDisponible(db)) {
        return {
          tipo: 'noDisponible',
          motivo: 'La fuente de inventario no responde en este momento.',
        };
      }

      const existencias = db
        .prepare(
          `SELECT
             e.id AS existenciaId,
             p.id AS productoId,
             p.nombre AS nombre,
             p.precio AS precio,
             e.unidades_asignadas AS unidadesAsignadas,
             e.unidades_reservadas AS unidadesReservadas,
             e.unidades_consumidas AS unidadesConsumidas,
             e.fecha_hora_actualizacion AS fechaHoraActualizacion
           FROM existencia e
           JOIN producto p ON p.id = e.producto_id
           WHERE e.jornada_id = ?
           ORDER BY p.nombre`,
        )
        .all(jornadaId) as ExistenciaConProducto[];

      return { tipo: 'ok', existencias };
    },
  };
}
