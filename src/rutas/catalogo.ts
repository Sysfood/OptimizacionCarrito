import { Router, type Request, type Response } from 'express';
import type { Db } from '../db/conexion';
import {
  fuenteEstaDisponible,
  type FuenteInventario,
} from '../integraciones/fuente-inventario';
import { obtenerCatalogo, type JornadaCatalogo } from '../servicios/catalogo';

export const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export function formatearFechaHora(valor: string): string {
  const [fecha, hora = ''] = valor.split(' ');
  const partes = fecha.split('-');

  if (partes.length !== 3) return valor;

  const [anio, mes, dia] = partes;
  return `${dia}/${mes}/${anio} ${hora.slice(0, 5)}`;
}

export interface ProductoVista {
  id: number;
  nombre: string;
  precio: number;
  precioFormateado: string;
  unidadesVendibles: number;
  agotado: boolean;
  unidadesTexto: string;
  fechaHoraActualizacion: string;
  actualizacionFormateada: string;
}

export interface AlternativaVista {
  nombre: string;
  precioFormateado: string;
  unidadesTexto: string;
}

export interface ErrorPedidoVista {
  titulo: string;
  mensaje: string;
  alternativas: AlternativaVista[];
}

export type VistaCatalogo =
  | { tipo: 'noDisponible'; motivo: string; fuenteDisponible: boolean }
  | {
      tipo: 'ok';
      jornada: JornadaCatalogo;
      productos: ProductoVista[];
      fuenteDisponible: boolean;
    };

function textoUnidades(cantidad: number): string {
  return `${cantidad} ${cantidad === 1 ? 'unidad vendible' : 'unidades vendibles'}`;
}

export function prepararCatalogo(db: Db, fuente: FuenteInventario): VistaCatalogo {
  const resultado = obtenerCatalogo(db, fuente);
  const fuenteDisponible = fuenteEstaDisponible(db);

  if (resultado.tipo === 'noDisponible') {
    return { tipo: 'noDisponible', motivo: resultado.motivo, fuenteDisponible };
  }

  const productos: ProductoVista[] = resultado.productos.map((producto) => ({
    ...producto,
    precioFormateado: formatoPrecio.format(producto.precio),
    actualizacionFormateada: formatearFechaHora(producto.fechaHoraActualizacion),
    unidadesTexto: textoUnidades(producto.unidadesVendibles),
  }));

  return {
    tipo: 'ok',
    jornada: resultado.jornada,
    productos,
    fuenteDisponible,
  };
}

export function alternativasParaVista(
  alternativas: { nombre: string; precio: number; unidadesVendibles: number }[],
): AlternativaVista[] {
  return alternativas.map((alternativa) => ({
    nombre: alternativa.nombre,
    precioFormateado: formatoPrecio.format(alternativa.precio),
    unidadesTexto: textoUnidades(alternativa.unidadesVendibles),
  }));
}

export function renderizarCatalogo(
  db: Db,
  fuente: FuenteInventario,
  res: Response,
  errorPedido: ErrorPedidoVista | null = null,
): void {
  const vista = prepararCatalogo(db, fuente);

  if (vista.tipo === 'noDisponible') {
    res.status(200).render('no-disponible', {
      titulo: 'Catálogo',
      motivo: vista.motivo,
      fuenteDisponible: vista.fuenteDisponible,
    });
    return;
  }

  res.status(200).render('catalogo', {
    titulo: 'Catálogo',
    jornada: vista.jornada,
    productos: vista.productos,
    fuenteDisponible: vista.fuenteDisponible,
    errorPedido,
  });
}

export function crearRutasCatalogo(db: Db, fuente: FuenteInventario): Router {
  const router = Router();

  const mostrarCatalogo = (_req: Request, res: Response) => {
    renderizarCatalogo(db, fuente, res);
  };

  router.get('/', mostrarCatalogo);
  router.get('/catalogo', mostrarCatalogo);

  return router;
}
