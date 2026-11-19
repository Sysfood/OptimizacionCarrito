import Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearApp } from '../src/app';
import { aplicarMigraciones, fechaHoraLocal, type Db } from '../src/db/conexion';
import { sembrar } from '../src/db/seed';

let db: Db;
let app: ReturnType<typeof crearApp>;

beforeEach(() => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  aplicarMigraciones(db);
  sembrar(db);
  app = crearApp(db);
});

afterEach(() => {
  db.close();
});

function tarjetaDe(html: string, nombre: string): string {
  const indice = html.indexOf(nombre);
  if (indice < 0) return '';

  const inicio = html.lastIndexOf('<article', indice);
  const fin = html.indexOf('</article>', indice);
  return html.slice(inicio, fin);
}

describe('HU-01 · Consultar disponibilidad antes de desplazarse', () => {
  it('Escenario: Consultar productos disponibles', async () => {
    const respuesta = await request(app).get('/catalogo').expect(200);

    expect(respuesta.text).toContain('Sándwich de pollo');
    expect(respuesta.text).toContain('Empanada de carne');
    expect(respuesta.text).toContain('Jugo natural');
    expect(respuesta.text).toContain('Café');
    expect(respuesta.text).toContain('3.500');
    expect(respuesta.text).toContain('10 unidades vendibles');
    expect(respuesta.text).toContain('Última actualización:');
    expect(respuesta.text).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });

  it('Escenario: Consultar un producto agotado', async () => {
    const respuesta = await request(app).get('/catalogo').expect(200);
    const cafe = tarjetaDe(respuesta.text, 'Café');

    expect(cafe).toContain('Agotado');
    expect(cafe).not.toContain('Agregar');
    expect(cafe).not.toContain('<button');
    expect(cafe).not.toContain('<form');
  });

  it('Escenario: La disponibilidad no puede verificarse', async () => {
    await request(app).post('/demo/fuente-inventario').expect(302);

    const respuesta = await request(app).get('/catalogo').expect(200);

    expect(respuesta.text).toContain('Disponibilidad no verificable');
    expect(respuesta.text).toContain('No se permite iniciar un pago');
    expect(respuesta.text).not.toContain('>Pagar<');
    expect(respuesta.text).not.toContain('href="/pago"');
  });

  it('Escenario: El catálogo refleja un cambio de inventario', async () => {
    const producto = db
      .prepare(`SELECT id FROM producto WHERE nombre = 'Sándwich de pollo'`)
      .get() as { id: number };

    db.prepare(
      `UPDATE existencia
       SET unidades_asignadas = 3, unidades_reservadas = 0, unidades_consumidas = 0
       WHERE producto_id = ?`,
    ).run(producto.id);

    let respuesta = await request(app).get('/catalogo').expect(200);
    expect(respuesta.text).toContain('3 unidades vendibles');

    db.prepare(
      `UPDATE existencia
       SET unidades_consumidas = 1, fecha_hora_actualizacion = ?
       WHERE producto_id = ?`,
    ).run(fechaHoraLocal(), producto.id);

    respuesta = await request(app).get('/catalogo').expect(200);
    expect(respuesta.text).toContain('2 unidades vendibles');
    expect(respuesta.text).toContain('5000');
  });
});
