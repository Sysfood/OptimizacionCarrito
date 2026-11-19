import type { Db } from '../db/conexion';
import { calcularUnidadesVendibles } from '../dominio/existencia';
import type { FuenteInventario } from '../integraciones/fuente-inventario';

export interface JornadaCatalogo {
  id: number;
  fecha: string;
  horaApertura: string;
  horaCierre: string;
  recepcionDigital: boolean;
}

export interface ProductoCatalogo {
  id: number;
  nombre: string;
  precio: number;
  unidadesVendibles: number;
  agotado: boolean;
  fechaHoraActualizacion: string;
}

export type ResultadoCatalogo =
  | { tipo: 'ok'; jornada: JornadaCatalogo; productos: ProductoCatalogo[] }
  | { tipo: 'noDisponible'; motivo: string };

interface FilaJornada {
  id: number;
  fecha: string;
  horaApertura: string;
  horaCierre: string;
  recepcionDigital: number;
}

/**
 * Devuelve la jornada más reciente que tenga existencias cargadas. Es la
 * misma jornada que usan el catálogo y el pedido en edición.
 */
export function obtenerJornadaVigente(db: Db): JornadaCatalogo | null {
  const jornada = db
    .prepare(
      `SELECT
         j.id AS id,
         j.fecha AS fecha,
         j.hora_apertura AS horaApertura,
         j.hora_cierre AS horaCierre,
         j.recepcion_digital AS recepcionDigital
       FROM jornada j
       WHERE EXISTS (SELECT 1 FROM existencia e WHERE e.jornada_id = j.id)
       ORDER BY j.fecha DESC, j.id DESC
       LIMIT 1`,
    )
    .get() as FilaJornada | undefined;

  if (!jornada) return null;

  return {
    id: jornada.id,
    fecha: jornada.fecha,
    horaApertura: jornada.horaApertura,
    horaCierre: jornada.horaCierre,
    recepcionDigital: Boolean(jornada.recepcionDigital),
  };
}

/**
 * Devuelve el catálogo de la jornada más reciente que tenga existencias
 * cargadas. No modifica datos: HU-01 es de solo lectura.
 */
export function obtenerCatalogo(db: Db, fuente: FuenteInventario): ResultadoCatalogo {
  const jornada = obtenerJornadaVigente(db);

  if (!jornada) {
    return {
      tipo: 'noDisponible',
      motivo: 'No hay una jornada con disponibilidad cargada.',
    };
  }

  const disponibilidad = fuente.consultarExistencias(jornada.id);

  if (disponibilidad.tipo === 'noDisponible') {
    return { tipo: 'noDisponible', motivo: disponibilidad.motivo };
  }

  if (disponibilidad.existencias.length === 0) {
    return {
      tipo: 'noDisponible',
      motivo: 'La jornada no tiene existencias cargadas.',
    };
  }

  const productos: ProductoCatalogo[] = disponibilidad.existencias.map((existencia) => {
    const unidadesVendibles = calcularUnidadesVendibles(existencia);

    return {
      id: existencia.productoId,
      nombre: existencia.nombre,
      precio: existencia.precio,
      unidadesVendibles,
      agotado: unidadesVendibles <= 0,
      fechaHoraActualizacion: existencia.fechaHoraActualizacion,
    };
  });

  return {
    tipo: 'ok',
    jornada,
    productos,
  };
}
