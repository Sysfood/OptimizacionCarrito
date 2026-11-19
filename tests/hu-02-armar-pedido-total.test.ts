import Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearApp } from '../src/app';
import { aplicarMigraciones, type Db } from '../src/db/conexion';
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

function idProducto(nombre: string): number {
  const fila = db.prepare('SELECT id FROM producto WHERE nombre = ?').get(nombre) as {
    id: number;
  };
  return fila.id;
}

function filaDe(html: string, nombre: string): string {
  const indice = html.indexOf(nombre);
  if (indice < 0) return '';

  const inicio = html.lastIndexOf('<tr', indice);
  const fin = html.indexOf('</tr>', indice);
  return html.slice(inicio, fin);
}

describe('HU-02 · Armar un pedido y conocer su total', () => {
  it('Escenario: Calcular el total de los productos seleccionados', async () => {
    const agente = request.agent(app);

    await agente
      .post('/pedido/agregar')
      .type('form')
      .send({ productoId: idProducto('Sándwich de pollo'), cantidad: 2 })
      .expect(302);

    await agente
      .post('/pedido/agregar')
      .type('form')
      .send({ productoId: idProducto('Jugo natural'), cantidad: 1 })
      .expect(302);

    const respuesta = await agente.get('/pedido').expect(200);

    expect(filaDe(respuesta.text, 'Sándwich de pollo')).toContain('data-subtotal="7000"');
    expect(filaDe(respuesta.text, 'Jugo natural')).toContain('data-subtotal="2200"');
    expect(respuesta.text).toContain('data-total="9200"');
    expect(respuesta.text).toContain('En edición');
  });

  it('Escenario: Modificar o quitar productos del pedido', async () => {
    const agente = request.agent(app);
    const sandwichId = idProducto('Sándwich de pollo');
    const jugoId = idProducto('Jugo natural');

    await agente
      .post('/pedido/agregar')
      .type('form')
      .send({ productoId: sandwichId, cantidad: 2 })
      .expect(302);
    await agente
      .post('/pedido/agregar')
      .type('form')
      .send({ productoId: jugoId, cantidad: 1 })
      .expect(302);

    await agente
      .post(`/pedido/detalle/${jugoId}/actualizar`)
      .type('form')
      .send({ cantidad: 3 })
      .expect(302);

    let respuesta = await agente.get('/pedido').expect(200);
    expect(filaDe(respuesta.text, 'Jugo natural')).toContain('data-subtotal="6600"');
    expect(respuesta.text).toContain('data-total="13600"');

    await agente.post(`/pedido/detalle/${sandwichId}/eliminar`).expect(302);

    respuesta = await agente.get('/pedido').expect(200);
    expect(respuesta.text).toContain('data-total="6600"');
    expect(respuesta.text).not.toContain(
      `action="/pedido/detalle/${sandwichId}/actualizar"`,
    );

    await agente.post(`/pedido/detalle/${jugoId}/eliminar`).expect(302);

    respuesta = await agente.get('/pedido').expect(200);
    expect(respuesta.text).toContain('Tu pedido está vacío');

    const { total } = db.prepare('SELECT COUNT(*) AS total FROM pedido').get() as {
      total: number;
    };
    expect(total).toBe(0);
  });

  it('Escenario: Solicitar una cantidad superior a la disponible', async () => {
    const respuesta = await request(app)
      .post('/pedido/agregar')
      .type('form')
      .send({ productoId: idProducto('Sándwich de pollo'), cantidad: 11 })
      .expect(200);

    expect(respuesta.text).toContain('el máximo disponible es 10');
    expect(respuesta.text).toContain('Alternativas disponibles');
    expect(respuesta.text).toContain('Empanada de carne');
    expect(respuesta.text).toContain('no se agregaron automáticamente');

    const { total } = db.prepare('SELECT COUNT(*) AS total FROM pedido').get() as {
      total: number;
    };
    expect(total).toBe(0);
  });

  it('Escenario: Cambia el precio o la disponibilidad antes del pago', async () => {
    const agente = request.agent(app);
    const sandwichId = idProducto('Sándwich de pollo');

    await agente
      .post('/pedido/agregar')
      .type('form')
      .send({ productoId: sandwichId, cantidad: 2 })
      .expect(302);

    await agente
      .post('/demo/precio')
      .type('form')
      .send({ productoId: sandwichId, precio: 4000 })
      .expect(302);

    let respuesta = await agente.post('/pedido/revalidar').expect(200);
    expect(respuesta.text).toContain('El precio de');
    expect(respuesta.text).toContain('Sándwich de pollo');
    expect(respuesta.text).toContain('data-total-nuevo="8000"');
    expect(respuesta.text).toContain('Aceptar nuevo total');
    expect(respuesta.text).toMatch(/el pago no se inicia/i);

    const antesDeAceptar = db
      .prepare('SELECT precio_unitario AS precio FROM detalle_pedido WHERE producto_id = ?')
      .get(sandwichId) as { precio: number };
    expect(antesDeAceptar.precio).toBe(3500);

    respuesta = await agente.post('/pedido/aceptar-total').expect(200);
    expect(respuesta.text).toContain('Pedido listo para pagar');
    expect(respuesta.text).toContain('data-total="8000"');

    const despuesDeAceptar = db
      .prepare('SELECT precio_unitario AS precio FROM detalle_pedido WHERE producto_id = ?')
      .get(sandwichId) as { precio: number };
    expect(despuesDeAceptar.precio).toBe(4000);

    respuesta = await agente.post('/pedido/revalidar').expect(200);
    expect(respuesta.text).toContain('Pedido listo para pagar');
  });

  it('Escenario adicional: la disponibilidad ya no alcanza para la cantidad pedida', async () => {
    const agente = request.agent(app);
    const sandwichId = idProducto('Sándwich de pollo');

    await agente
      .post('/pedido/agregar')
      .type('form')
      .send({ productoId: sandwichId, cantidad: 2 })
      .expect(302);

    await agente
      .post('/demo/consumir')
      .type('form')
      .send({ productoId: sandwichId, cantidad: 9 })
      .expect(302);

    let respuesta = await agente.post('/pedido/revalidar').expect(200);
    expect(respuesta.text).toContain('ahora quedan 1');
    expect(respuesta.text).toContain('Volver al pedido');
    expect(respuesta.text).not.toContain('Aceptar nuevo total');

    respuesta = await agente.post('/pedido/aceptar-total').expect(200);
    expect(respuesta.text).not.toContain('Pedido listo para pagar');

    await agente
      .post(`/pedido/detalle/${sandwichId}/actualizar`)
      .type('form')
      .send({ cantidad: 1 })
      .expect(302);

    respuesta = await agente.post('/pedido/revalidar').expect(200);
    expect(respuesta.text).toContain('Pedido listo para pagar');
  });
});
