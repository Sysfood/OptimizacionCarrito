import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { aplicarMigraciones, fechaHoraLocal, type Db } from '../src/db/conexion';
import { sembrar } from '../src/db/seed';
import { calcularTotal, CONTACTO_CLIENTE_DEMO } from '../src/dominio/pedido';
import { crearFuenteInventarioSimulada } from '../src/integraciones/fuente-inventario';
import {
  aceptarNuevoTotal,
  actualizarCantidad,
  agregarProducto,
  eliminarDetalle,
  obtenerPedido,
  revalidarPedido,
} from '../src/servicios/pedido';

let db: Db;
let fuente: ReturnType<typeof crearFuenteInventarioSimulada>;

beforeEach(() => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  aplicarMigraciones(db);
  sembrar(db);
  fuente = crearFuenteInventarioSimulada(db);
});

afterEach(() => {
  db.close();
});

function idProducto(nombre: string): number {
  const fila = db.prepare('SELECT id FROM producto WHERE nombre = ?').get(nombre) as {
    id: number;
  };
  return fila.id;
}

function agregar(nombre: string, cantidad: number, pedidoId: number | null = null) {
  return agregarProducto(db, fuente, {
    pedidoId,
    productoId: idProducto(nombre),
    cantidad,
  });
}

describe('Dominio del pedido', () => {
  it('calcula subtotales y total a partir de cantidad y precio unitario', () => {
    expect(
      calcularTotal([
        { cantidad: 2, precioUnitario: 3500 },
        { cantidad: 1, precioUnitario: 2200 },
      ]),
    ).toBe(9200);
  });
});

describe('Servicio de pedido · armado', () => {
  it('crea un pedido en edición con el cliente de demostración y la jornada vigente', () => {
    const resultado = agregar('Sándwich de pollo', 2);

    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo !== 'ok') return;

    const pedido = obtenerPedido(db, resultado.pedidoId);

    expect(pedido?.estado).toBe('En edición');
    expect(pedido?.detalles).toHaveLength(1);
    expect(pedido?.total).toBe(7000);

    const fila = db
      .prepare(
        `SELECT c.contacto AS contacto
         FROM pedido p JOIN cliente c ON c.id = p.cliente_id
         WHERE p.id = ?`,
      )
      .get(resultado.pedidoId) as { contacto: string };

    expect(fila.contacto).toBe(CONTACTO_CLIENTE_DEMO);
  });

  it('suma la cantidad cuando el producto ya está en el pedido', () => {
    const primero = agregar('Sándwich de pollo', 2);
    expect(primero.tipo).toBe('ok');
    if (primero.tipo !== 'ok') return;

    const segundo = agregar('Sándwich de pollo', 3, primero.pedidoId);
    expect(segundo.tipo).toBe('ok');
    if (segundo.tipo !== 'ok') return;

    const pedido = obtenerPedido(db, segundo.pedidoId);
    expect(pedido?.detalles).toHaveLength(1);
    expect(pedido?.detalles[0].cantidad).toBe(5);
    expect(pedido?.total).toBe(17500);
  });

  it('rechaza una cantidad superior a las unidades vendibles e informa el máximo', () => {
    const resultado = agregar('Sándwich de pollo', 11);

    expect(resultado.tipo).toBe('excedeDisponible');
    if (resultado.tipo !== 'excedeDisponible') return;

    expect(resultado.maximo).toBe(10);
    expect(resultado.cantidadSolicitada).toBe(11);
    expect(resultado.alternativas.map((alternativa) => alternativa.nombre)).toContain(
      'Empanada de carne',
    );
    expect(resultado.alternativas.map((alternativa) => alternativa.nombre)).not.toContain(
      'Café',
    );

    const { total } = db.prepare('SELECT COUNT(*) AS total FROM pedido').get() as {
      total: number;
    };
    expect(total).toBe(0);
  });

  it('rechaza el producto agotado e informa máximo cero con alternativas', () => {
    const resultado = agregar('Café', 1);

    expect(resultado.tipo).toBe('excedeDisponible');
    if (resultado.tipo !== 'excedeDisponible') return;

    expect(resultado.maximo).toBe(0);
    expect(resultado.alternativas.length).toBeGreaterThan(0);
  });

  it('actualiza la cantidad y rechaza una cantidad que excede lo vendible', () => {
    const agregado = agregar('Sándwich de pollo', 1);
    expect(agregado.tipo).toBe('ok');
    if (agregado.tipo !== 'ok') return;

    const productoId = idProducto('Sándwich de pollo');

    const valida = actualizarCantidad(db, fuente, {
      pedidoId: agregado.pedidoId,
      productoId,
      cantidad: 4,
    });
    expect(valida.tipo).toBe('ok');
    expect(obtenerPedido(db, agregado.pedidoId)?.total).toBe(14000);

    const invalida = actualizarCantidad(db, fuente, {
      pedidoId: agregado.pedidoId,
      productoId,
      cantidad: 11,
    });
    expect(invalida.tipo).toBe('excedeDisponible');
    expect(obtenerPedido(db, agregado.pedidoId)?.detalles[0].cantidad).toBe(4);
  });

  it('elimina el pedido cuando se quita el último detalle', () => {
    const agregado = agregar('Sándwich de pollo', 2);
    expect(agregado.tipo).toBe('ok');
    if (agregado.tipo !== 'ok') return;

    const resultado = eliminarDetalle(
      db,
      agregado.pedidoId,
      idProducto('Sándwich de pollo'),
    );

    expect(resultado).toEqual({ tipo: 'ok', pedidoEliminado: true });
    expect(obtenerPedido(db, agregado.pedidoId)).toBeNull();
  });

  it('devuelve noDisponible cuando la fuente de inventario no responde', () => {
    db.prepare(
      `UPDATE configuracion SET valor = '0' WHERE clave = 'fuente_inventario_disponible'`,
    ).run();

    const resultado = agregar('Sándwich de pollo', 1);
    expect(resultado.tipo).toBe('noDisponible');
  });
});

describe('Servicio de pedido · revalidación', () => {
  it('detecta un cambio de precio y lo aplica al aceptar el nuevo total', () => {
    const agregado = agregar('Sándwich de pollo', 2);
    expect(agregado.tipo).toBe('ok');
    if (agregado.tipo !== 'ok') return;

    const productoId = idProducto('Sándwich de pollo');
    db.prepare('UPDATE producto SET precio = ? WHERE id = ?').run(4000, productoId);

    const revalidacion = revalidarPedido(db, fuente, agregado.pedidoId);
    expect(revalidacion.tipo).toBe('cambios');
    if (revalidacion.tipo !== 'cambios') return;

    expect(revalidacion.precios).toEqual([
      {
        productoId,
        nombre: 'Sándwich de pollo',
        precioAnterior: 3500,
        precioNuevo: 4000,
      },
    ]);
    expect(revalidacion.disponibilidad).toHaveLength(0);
    expect(revalidacion.totalAnterior).toBe(7000);
    expect(revalidacion.totalNuevo).toBe(8000);

    const aceptacion = aceptarNuevoTotal(db, fuente, agregado.pedidoId);
    expect(aceptacion.tipo).toBe('listo');
    if (aceptacion.tipo !== 'listo') return;

    expect(aceptacion.pedido.total).toBe(8000);
    expect(aceptacion.pedido.detalles[0].precioUnitario).toBe(4000);

    expect(revalidarPedido(db, fuente, agregado.pedidoId).tipo).toBe('listo');
  });

  it('bloquea la aceptación cuando la disponibilidad ya no alcanza', () => {
    const agregado = agregar('Sándwich de pollo', 2);
    expect(agregado.tipo).toBe('ok');
    if (agregado.tipo !== 'ok') return;

    const productoId = idProducto('Sándwich de pollo');
    db.prepare(
      `UPDATE existencia
       SET unidades_consumidas = 9, fecha_hora_actualizacion = ?
       WHERE producto_id = ?`,
    ).run(fechaHoraLocal(), productoId);

    const revalidacion = revalidarPedido(db, fuente, agregado.pedidoId);
    expect(revalidacion.tipo).toBe('cambios');
    if (revalidacion.tipo !== 'cambios') return;

    expect(revalidacion.precios).toHaveLength(0);
    expect(revalidacion.disponibilidad).toEqual([
      {
        productoId,
        nombre: 'Sándwich de pollo',
        cantidadSolicitada: 2,
        unidadesVendibles: 1,
      },
    ]);

    const aceptacion = aceptarNuevoTotal(db, fuente, agregado.pedidoId);
    expect(aceptacion.tipo).toBe('disponibilidad');
    if (aceptacion.tipo !== 'disponibilidad') return;

    expect(aceptacion.disponibilidad).toHaveLength(1);
    expect(obtenerPedido(db, agregado.pedidoId)?.detalles[0].cantidad).toBe(2);

    actualizarCantidad(db, fuente, {
      pedidoId: agregado.pedidoId,
      productoId,
      cantidad: 1,
    });

    expect(revalidarPedido(db, fuente, agregado.pedidoId).tipo).toBe('listo');
  });

  it('no revalida cuando la fuente de inventario no responde', () => {
    const agregado = agregar('Sándwich de pollo', 1);
    expect(agregado.tipo).toBe('ok');
    if (agregado.tipo !== 'ok') return;

    db.prepare(
      `UPDATE configuracion SET valor = '0' WHERE clave = 'fuente_inventario_disponible'`,
    ).run();

    expect(revalidarPedido(db, fuente, agregado.pedidoId).tipo).toBe('noDisponible');
    expect(aceptarNuevoTotal(db, fuente, agregado.pedidoId).tipo).toBe('noDisponible');
  });
});
