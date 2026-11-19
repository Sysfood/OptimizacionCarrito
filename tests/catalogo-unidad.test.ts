import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { aplicarMigraciones, type Db } from '../src/db/conexion';
import { sembrar } from '../src/db/seed';
import { calcularUnidadesVendibles } from '../src/dominio/existencia';
import {
  crearFuenteInventarioSimulada,
} from '../src/integraciones/fuente-inventario';
import { obtenerCatalogo } from '../src/servicios/catalogo';

describe('Cálculo de unidades vendibles', () => {
  it('descuenta las unidades reservadas y consumidas', () => {
    expect(
      calcularUnidadesVendibles({
        unidadesAsignadas: 10,
        unidadesReservadas: 2,
        unidadesConsumidas: 3,
      }),
    ).toBe(5);
  });

  it('no muestra disponibilidad negativa', () => {
    expect(
      calcularUnidadesVendibles({
        unidadesAsignadas: 1,
        unidadesReservadas: 2,
        unidadesConsumidas: 0,
      }),
    ).toBe(0);
  });
});

describe('Fuente de inventario simulada', () => {
  let db: Db;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    aplicarMigraciones(db);
    sembrar(db);
  });

  afterEach(() => {
    db.close();
  });

  it('devuelve las existencias de la jornada cuando está disponible', () => {
    const jornada = db.prepare('SELECT id FROM jornada LIMIT 1').get() as { id: number };
    const resultado = crearFuenteInventarioSimulada(db).consultarExistencias(jornada.id);

    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo === 'ok') {
      expect(resultado.existencias).toHaveLength(4);
    }
  });

  it('responde noDisponible cuando la configuración está en 0', () => {
    db.prepare(
      `UPDATE configuracion SET valor = '0' WHERE clave = 'fuente_inventario_disponible'`,
    ).run();

    const jornada = db.prepare('SELECT id FROM jornada LIMIT 1').get() as { id: number };
    const resultado = crearFuenteInventarioSimulada(db).consultarExistencias(jornada.id);

    expect(resultado).toEqual({
      tipo: 'noDisponible',
      motivo: 'La fuente de inventario no responde en este momento.',
    });
  });
});

describe('Servicio de catálogo', () => {
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

  it('devuelve los productos de la jornada con sus unidades vendibles', () => {
    const resultado = obtenerCatalogo(db, fuente);

    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo === 'ok') {
      expect(resultado.productos).toHaveLength(4);
      expect(resultado.productos.map((producto) => producto.nombre)).toContain(
        'Sándwich de pollo',
      );
    }
  });

  it('marca como agotado el producto sin unidades', () => {
    const resultado = obtenerCatalogo(db, fuente);

    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo === 'ok') {
      const cafe = resultado.productos.find((producto) => producto.nombre === 'Café');
      expect(cafe?.agotado).toBe(true);
      expect(cafe?.unidadesVendibles).toBe(0);
    }
  });

  it('devuelve noDisponible cuando no existe una jornada con existencias', () => {
    const vacia = new Database(':memory:');
    vacia.pragma('foreign_keys = ON');
    aplicarMigraciones(vacia);

    const resultado = obtenerCatalogo(vacia, crearFuenteInventarioSimulada(vacia));

    expect(resultado).toEqual({
      tipo: 'noDisponible',
      motivo: 'No hay una jornada con disponibilidad cargada.',
    });

    vacia.close();
  });
});
