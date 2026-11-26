import type { Db } from '../db/conexion';
import type { EstadoPedido } from '../dominio/pedido';
import { calcularTotal, CONTACTO_CLIENTE_DEMO } from '../dominio/pedido';
import { calcularUnidadesVendibles } from '../dominio/existencia';
import type { FuenteInventario } from '../integraciones/fuente-inventario';
import {
  obtenerCatalogo,
  type JornadaCatalogo,
  type ProductoCatalogo,
} from './catalogo';

export interface DetallePedidoVista {
  id: number;
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  unidadesVendibles: number;
  fechaHoraActualizacion: string;
}

export interface PedidoVista {
  id: number;
  clienteId: number;
  /** El cliente VIP puede confirmar pedidos sin pago previo (HU-11). */
  esVip: boolean;
  estado: EstadoPedido;
  codigo: string | null;
  estimacionPreparacion: string | null;
  fechaHoraConfirmacion: string | null;
  jornada: JornadaCatalogo;
  detalles: DetallePedidoVista[];
  total: number;
}

export interface AlternativaProducto {
  id: number;
  nombre: string;
  precio: number;
  unidadesVendibles: number;
}

export interface CambioPrecio {
  productoId: number;
  nombre: string;
  precioAnterior: number;
  precioNuevo: number;
}

export interface CambioDisponibilidad {
  productoId: number;
  nombre: string;
  cantidadSolicitada: number;
  unidadesVendibles: number;
}

interface FilaPedido {
  id: number;
  clienteId: number;
  esVip: number;
  estado: EstadoPedido;
  codigo: string | null;
  estimacionPreparacion: string | null;
  fechaHoraConfirmacion: string | null;
  jornadaId: number;
  fecha: string;
  horaApertura: string;
  horaCierre: string;
  recepcionDigital: number;
}

interface FilaDetalle {
  id: number;
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  unidadesAsignadas: number;
  unidadesReservadas: number;
  unidadesConsumidas: number;
  fechaHoraActualizacion: string;
}

const ESTADO_EN_EDICION: EstadoPedido = 'En edición';
const ESTADOS_REVALIDABLES: EstadoPedido[] = ['En edición', 'Pago no realizado'];

function buscarPedido(db: Db, pedidoId: number): FilaPedido | null {
  const fila = db
    .prepare(
      `SELECT
         p.id AS id,
         p.cliente_id AS clienteId,
         c.es_vip AS esVip,
         p.estado AS estado,
         p.codigo AS codigo,
         p.estimacion_preparacion AS estimacionPreparacion,
         p.fecha_hora_confirmacion AS fechaHoraConfirmacion,
         p.jornada_id AS jornadaId,
         j.fecha AS fecha,
         j.hora_apertura AS horaApertura,
         j.hora_cierre AS horaCierre,
         j.recepcion_digital AS recepcionDigital
       FROM pedido p
       JOIN jornada j ON j.id = p.jornada_id
       JOIN cliente c ON c.id = p.cliente_id
       WHERE p.id = ?`,
    )
    .get(pedidoId) as FilaPedido | undefined;

  return fila ?? null;
}

function estaEnEdicion(pedido: FilaPedido | null): boolean {
  return pedido?.estado === ESTADO_EN_EDICION;
}

/**
 * Lee un pedido con sus detalles y el total calculado. No depende de la
 * fuente de inventario: los detalles se conservan aunque la fuente no
 * responda. La revalidación sí exige la fuente disponible.
 */
export function obtenerPedido(db: Db, pedidoId: number): PedidoVista | null {
  const pedido = buscarPedido(db, pedidoId);
  if (!pedido) return null;

  const filas = db
    .prepare(
      `SELECT
         d.id AS id,
         d.producto_id AS productoId,
         p.nombre AS nombre,
         d.cantidad AS cantidad,
         d.precio_unitario AS precioUnitario,
         COALESCE(e.unidades_asignadas, 0) AS unidadesAsignadas,
         COALESCE(e.unidades_reservadas, 0) AS unidadesReservadas,
         COALESCE(e.unidades_consumidas, 0) AS unidadesConsumidas,
         COALESCE(e.fecha_hora_actualizacion, '') AS fechaHoraActualizacion
       FROM detalle_pedido d
       JOIN producto p ON p.id = d.producto_id
       LEFT JOIN existencia e
         ON e.jornada_id = ? AND e.producto_id = d.producto_id
       WHERE d.pedido_id = ?
       ORDER BY d.id`,
    )
    .all(pedido.jornadaId, pedidoId) as FilaDetalle[];

  const detalles: DetallePedidoVista[] = filas.map((fila) => ({
    id: fila.id,
    productoId: fila.productoId,
    nombre: fila.nombre,
    cantidad: fila.cantidad,
    precioUnitario: fila.precioUnitario,
    subtotal: fila.cantidad * fila.precioUnitario,
    unidadesVendibles: calcularUnidadesVendibles({
      unidadesAsignadas: fila.unidadesAsignadas,
      unidadesReservadas: fila.unidadesReservadas,
      unidadesConsumidas: fila.unidadesConsumidas,
    }),
    fechaHoraActualizacion: fila.fechaHoraActualizacion,
  }));

  return {
    id: pedido.id,
    clienteId: pedido.clienteId,
    esVip: Boolean(pedido.esVip),
    estado: pedido.estado,
    codigo: pedido.codigo,
    estimacionPreparacion: pedido.estimacionPreparacion,
    fechaHoraConfirmacion: pedido.fechaHoraConfirmacion,
    jornada: {
      id: pedido.jornadaId,
      fecha: pedido.fecha,
      horaApertura: pedido.horaApertura,
      horaCierre: pedido.horaCierre,
      recepcionDigital: Boolean(pedido.recepcionDigital),
    },
    detalles,
    total: calcularTotal(detalles),
  };
}

function perteneceAlCliente(pedido: FilaPedido, clienteId: number | null): boolean {
  return clienteId === null || pedido.clienteId === clienteId;
}

function resolverPedidoEnEdicion(
  db: Db,
  pedidoId: number | null,
  jornadaId: number,
  clienteId: number | null,
): number {
  if (pedidoId !== null) {
    const existente = buscarPedido(db, pedidoId);

    if (
      existente &&
      estaEnEdicion(existente) &&
      existente.jornadaId === jornadaId &&
      perteneceAlCliente(existente, clienteId)
    ) {
      return existente.id;
    }
  }

  let propietario = clienteId;

  if (propietario === null) {
    const cliente = db
      .prepare('SELECT id FROM cliente WHERE contacto = ?')
      .get(CONTACTO_CLIENTE_DEMO) as { id: number } | undefined;

    if (!cliente) {
      throw new Error(
        'Falta el cliente de demostración. Ejecuta npm run db:seed antes de usar el pedido.',
      );
    }

    propietario = cliente.id;
  }

  const resultado = db
    .prepare(
      `INSERT INTO pedido (cliente_id, jornada_id, estado)
       VALUES (?, ?, ?)`,
    )
    .run(propietario, jornadaId, ESTADO_EN_EDICION);

  return Number(resultado.lastInsertRowid);
}

function alternativasDe(
  productos: ProductoCatalogo[],
  productoId: number,
): AlternativaProducto[] {
  return productos
    .filter((producto) => producto.id !== productoId && producto.unidadesVendibles > 0)
    .map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      unidadesVendibles: producto.unidadesVendibles,
    }));
}

function cantidadEnPedido(db: Db, pedidoId: number, productoId: number): number {
  const fila = db
    .prepare(
      `SELECT cantidad FROM detalle_pedido
       WHERE pedido_id = ? AND producto_id = ?`,
    )
    .get(pedidoId, productoId) as { cantidad: number } | undefined;

  return fila?.cantidad ?? 0;
}

export type ResultadoAgregar =
  | { tipo: 'ok'; pedidoId: number }
  | { tipo: 'cantidadInvalida' }
  | { tipo: 'noDisponible'; motivo: string }
  | { tipo: 'productoNoEncontrado' }
  | {
      tipo: 'excedeDisponible';
      productoId: number;
      nombre: string;
      cantidadSolicitada: number;
      maximo: number;
      alternativas: AlternativaProducto[];
    };

/**
 * Agrega un producto a un pedido en edición. Si el pedido no existe o ya no
 * está en edición, crea uno nuevo para la jornada vigente.
 */
export function agregarProducto(
  db: Db,
  fuente: FuenteInventario,
  parametros: {
    pedidoId: number | null;
    productoId: number;
    cantidad: number;
    /** Dueño del pedido. Si se omite, se usa el estudiante de demostración. */
    clienteId?: number;
  },
): ResultadoAgregar {
  const { pedidoId, productoId, cantidad } = parametros;
  const clienteId = parametros.clienteId ?? null;

  if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
    return { tipo: 'cantidadInvalida' };
  }

  const catalogo = obtenerCatalogo(db, fuente);
  if (catalogo.tipo === 'noDisponible') {
    return { tipo: 'noDisponible', motivo: catalogo.motivo };
  }

  const producto = catalogo.productos.find((item) => item.id === productoId);
  if (!producto) {
    return { tipo: 'productoNoEncontrado' };
  }

  const pedidoExistente = pedidoId !== null ? buscarPedido(db, pedidoId) : null;
  const pedidoUtilizable =
    pedidoExistente &&
    estaEnEdicion(pedidoExistente) &&
    pedidoExistente.jornadaId === catalogo.jornada.id &&
    perteneceAlCliente(pedidoExistente, clienteId)
      ? pedidoExistente
      : null;

  const cantidadActual = pedidoUtilizable
    ? cantidadEnPedido(db, pedidoUtilizable.id, productoId)
    : 0;
  const cantidadSolicitada = cantidadActual + cantidad;

  if (cantidadSolicitada > producto.unidadesVendibles) {
    return {
      tipo: 'excedeDisponible',
      productoId,
      nombre: producto.nombre,
      cantidadSolicitada,
      maximo: producto.unidadesVendibles,
      alternativas: alternativasDe(catalogo.productos, productoId),
    };
  }

  const aplicar = db.transaction(() => {
    const pedido = resolverPedidoEnEdicion(db, pedidoId, catalogo.jornada.id, clienteId);

    db.prepare(
      `INSERT INTO detalle_pedido
         (pedido_id, producto_id, cantidad, precio_unitario)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (pedido_id, producto_id)
       DO UPDATE SET cantidad = cantidad + excluded.cantidad`,
    ).run(pedido, productoId, cantidad, producto.precio);

    return pedido;
  });

  return { tipo: 'ok', pedidoId: aplicar() };
}

export type ResultadoActualizar =
  | { tipo: 'ok'; pedidoId: number }
  | { tipo: 'cantidadInvalida' }
  | { tipo: 'sinPedido' }
  | { tipo: 'detalleNoEncontrado' }
  | { tipo: 'noDisponible'; motivo: string }
  | { tipo: 'productoNoEncontrado' }
  | {
      tipo: 'excedeDisponible';
      productoId: number;
      nombre: string;
      cantidadSolicitada: number;
      maximo: number;
      alternativas: AlternativaProducto[];
    };

export function actualizarCantidad(
  db: Db,
  fuente: FuenteInventario,
  parametros: { pedidoId: number; productoId: number; cantidad: number },
): ResultadoActualizar {
  const { pedidoId, productoId, cantidad } = parametros;

  if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
    return { tipo: 'cantidadInvalida' };
  }

  const pedido = buscarPedido(db, pedidoId);
  if (!estaEnEdicion(pedido)) {
    return { tipo: 'sinPedido' };
  }

  const detalle = db
    .prepare(
      `SELECT id FROM detalle_pedido
       WHERE pedido_id = ? AND producto_id = ?`,
    )
    .get(pedidoId, productoId) as { id: number } | undefined;

  if (!detalle) {
    return { tipo: 'detalleNoEncontrado' };
  }

  const catalogo = obtenerCatalogo(db, fuente);
  if (catalogo.tipo === 'noDisponible') {
    return { tipo: 'noDisponible', motivo: catalogo.motivo };
  }

  const producto = catalogo.productos.find((item) => item.id === productoId);
  if (!producto) {
    return { tipo: 'productoNoEncontrado' };
  }

  if (cantidad > producto.unidadesVendibles) {
    return {
      tipo: 'excedeDisponible',
      productoId,
      nombre: producto.nombre,
      cantidadSolicitada: cantidad,
      maximo: producto.unidadesVendibles,
      alternativas: alternativasDe(catalogo.productos, productoId),
    };
  }

  db.prepare(
    `UPDATE detalle_pedido SET cantidad = ?
     WHERE pedido_id = ? AND producto_id = ?`,
  ).run(cantidad, pedidoId, productoId);

  return { tipo: 'ok', pedidoId };
}

export type ResultadoEliminar =
  | { tipo: 'ok'; pedidoEliminado: boolean }
  | { tipo: 'sinPedido' }
  | { tipo: 'detalleNoEncontrado' };

export function eliminarDetalle(
  db: Db,
  pedidoId: number,
  productoId: number,
): ResultadoEliminar {
  const pedido = buscarPedido(db, pedidoId);
  if (!estaEnEdicion(pedido)) {
    return { tipo: 'sinPedido' };
  }

  const resultado = db
    .prepare(
      `DELETE FROM detalle_pedido
       WHERE pedido_id = ? AND producto_id = ?`,
    )
    .run(pedidoId, productoId);

  if (resultado.changes === 0) {
    return { tipo: 'detalleNoEncontrado' };
  }

  const { total } = db
    .prepare('SELECT COUNT(*) AS total FROM detalle_pedido WHERE pedido_id = ?')
    .get(pedidoId) as { total: number };

  if (total === 0) {
    db.prepare('DELETE FROM pedido WHERE id = ?').run(pedidoId);
    return { tipo: 'ok', pedidoEliminado: true };
  }

  return { tipo: 'ok', pedidoEliminado: false };
}

export type ResultadoRevalidacion =
  | { tipo: 'noDisponible'; motivo: string }
  | { tipo: 'sinPedido' }
  | {
      tipo: 'cambios';
      pedido: PedidoVista;
      precios: CambioPrecio[];
      disponibilidad: CambioDisponibilidad[];
      totalAnterior: number;
      totalNuevo: number;
    }
  | { tipo: 'listo'; pedido: PedidoVista };

/**
 * Compara el pedido con los precios y la disponibilidad vigentes. Un cambio
 * de disponibilidad que todavía cubre la cantidad pedida no bloquea el pago,
 * porque no altera la selección ni el total.
 */
export function revalidarPedido(
  db: Db,
  fuente: FuenteInventario,
  pedidoId: number,
): ResultadoRevalidacion {
  const pedido = obtenerPedido(db, pedidoId);
  if (!pedido || !ESTADOS_REVALIDABLES.includes(pedido.estado) || pedido.detalles.length === 0) {
    return { tipo: 'sinPedido' };
  }

  const catalogo = obtenerCatalogo(db, fuente);
  if (catalogo.tipo === 'noDisponible') {
    return { tipo: 'noDisponible', motivo: catalogo.motivo };
  }

  const productos = new Map(catalogo.productos.map((producto) => [producto.id, producto]));
  const precios: CambioPrecio[] = [];
  const disponibilidad: CambioDisponibilidad[] = [];
  let totalNuevo = 0;

  for (const detalle of pedido.detalles) {
    const producto = productos.get(detalle.productoId);
    const precioVigente = producto ? producto.precio : detalle.precioUnitario;

    if (precioVigente !== detalle.precioUnitario) {
      precios.push({
        productoId: detalle.productoId,
        nombre: detalle.nombre,
        precioAnterior: detalle.precioUnitario,
        precioNuevo: precioVigente,
      });
    }

    const unidadesVigentes = producto ? producto.unidadesVendibles : 0;
    if (detalle.cantidad > unidadesVigentes) {
      disponibilidad.push({
        productoId: detalle.productoId,
        nombre: detalle.nombre,
        cantidadSolicitada: detalle.cantidad,
        unidadesVendibles: unidadesVigentes,
      });
    }

    totalNuevo += detalle.cantidad * precioVigente;
  }

  if (precios.length === 0 && disponibilidad.length === 0) {
    return { tipo: 'listo', pedido };
  }

  return {
    tipo: 'cambios',
    pedido,
    precios,
    disponibilidad,
    totalAnterior: pedido.total,
    totalNuevo,
  };
}

export type ResultadoAceptacion =
  | { tipo: 'noDisponible'; motivo: string }
  | { tipo: 'sinPedido' }
  | {
      tipo: 'disponibilidad';
      pedido: PedidoVista;
      disponibilidad: CambioDisponibilidad[];
    }
  | { tipo: 'listo'; pedido: PedidoVista };

/**
 * Acepta los precios vigentes. La disponibilidad se revisa antes: si alguna
 * cantidad ya no alcanza, no se actualiza nada y se pide ajustar o eliminar.
 */
export function aceptarNuevoTotal(
  db: Db,
  fuente: FuenteInventario,
  pedidoId: number,
): ResultadoAceptacion {
  const pedido = obtenerPedido(db, pedidoId);
  if (!pedido || !ESTADOS_REVALIDABLES.includes(pedido.estado) || pedido.detalles.length === 0) {
    return { tipo: 'sinPedido' };
  }

  const catalogo = obtenerCatalogo(db, fuente);
  if (catalogo.tipo === 'noDisponible') {
    return { tipo: 'noDisponible', motivo: catalogo.motivo };
  }

  const productos = new Map(catalogo.productos.map((producto) => [producto.id, producto]));
  const disponibilidad: CambioDisponibilidad[] = [];

  for (const detalle of pedido.detalles) {
    const producto = productos.get(detalle.productoId);
    const unidadesVigentes = producto ? producto.unidadesVendibles : 0;

    if (detalle.cantidad > unidadesVigentes) {
      disponibilidad.push({
        productoId: detalle.productoId,
        nombre: detalle.nombre,
        cantidadSolicitada: detalle.cantidad,
        unidadesVendibles: unidadesVigentes,
      });
    }
  }

  if (disponibilidad.length > 0) {
    return { tipo: 'disponibilidad', pedido, disponibilidad };
  }

  db.transaction(() => {
    const actualizarPrecio = db.prepare(
      'UPDATE detalle_pedido SET precio_unitario = ? WHERE id = ?',
    );

    for (const detalle of pedido.detalles) {
      const producto = productos.get(detalle.productoId);
      const precioVigente = producto ? producto.precio : detalle.precioUnitario;
      actualizarPrecio.run(precioVigente, detalle.id);
    }
  })();

  return { tipo: 'listo', pedido: obtenerPedido(db, pedidoId) as PedidoVista };
}
