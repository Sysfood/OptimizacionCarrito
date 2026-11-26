import Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearApp } from '../src/app';
import { aplicarMigraciones, type Db } from '../src/db/conexion';
import { sembrar } from '../src/db/seed';
import { clienteDelRol, consultarDeuda, saldarDeuda } from '../src/servicios/deuda';

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

type Agente = ReturnType<typeof request.agent>;

function agenteConRol(rol: 'estudiante' | 'vip'): Agente {
  const agente = request.agent(app);
  agente.set('Cookie', `rol=${rol}`);
  return agente;
}

function idProducto(nombre: string): number {
  const fila = db.prepare('SELECT id FROM producto WHERE nombre = ?').get(nombre) as {
    id: number;
  };
  return fila.id;
}

async function comprarComoVip(agente: Agente, producto: string, cantidad: number) {
  await agente
    .post('/pedido/agregar')
    .type('form')
    .send({ productoId: idProducto(producto), cantidad })
    .expect(302);
  await agente.post('/pedido/confirmar-vip').expect(302);
}

describe('HU-12 · Cliente VIP consulta y gestiona su deuda', () => {
  it('Escenario: El cliente VIP ve su deuda', async () => {
    const agente = agenteConRol('vip');

    const pagina = await agente.get('/deuda').expect(200);
    expect(pagina.text).toContain('Mi deuda');
    expect(pagina.text).toContain('Deuda acumulada');
    expect(pagina.text).toMatch(/data-deuda="\d*"/);
  });

  it('Escenario: El cliente VIP tiene deuda', async () => {
    const agente = agenteConRol('vip');
    await comprarComoVip(agente, 'Sándwich de pollo', 2);
    await comprarComoVip(agente, 'Empanada de carne', 1);

    const pagina = await agente.get('/deuda').expect(200);
    // 2 × $3.500 + 1 × $1.800 = $8.800
    expect(pagina.text).toContain('data-deuda="8800"');
    expect(pagina.text).toContain('Pedido sin pago previo');

    const resultado = consultarDeuda(db, clienteDelRol(db, 'vip').id);
    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo === 'ok') {
      expect(resultado.deuda).toBe(8800);
      expect(resultado.movimientos).toHaveLength(2);
    }
  });

  it('Escenario: El cliente VIP no tiene deuda', async () => {
    const agente = agenteConRol('vip');

    const pagina = await agente.get('/deuda').expect(200);
    expect(pagina.text).toContain('data-deuda="0"');
    expect(pagina.text).toContain('Aún no tienes movimientos de deuda');
  });

  it('Escenario: Un cliente que no es VIP no accede a la deuda', async () => {
    const agente = agenteConRol('estudiante');

    const pagina = await agente.get('/deuda').expect(403);
    expect(pagina.text).toContain('exclusiva de los clientes VIP');
    expect(pagina.text).not.toContain('Deuda acumulada');

    const cliente = clienteDelRol(db, 'estudiante');
    expect(consultarDeuda(db, cliente.id).tipo).toBe('noVip');
  });

  it('Escenario adicional: al saldar la deuda vuelve a $0 y queda el abono', async () => {
    const agente = agenteConRol('vip');
    await comprarComoVip(agente, 'Sándwich de pollo', 2);

    const saldado = saldarDeuda(db, clienteDelRol(db, 'vip').id);
    expect(saldado).toBe(7000);

    const pagina = await agente.get('/deuda').expect(200);
    expect(pagina.text).toContain('data-deuda="0"');
    expect(pagina.text).toContain('Pago de deuda');
  });

  it('Escenario adicional: el cliente VIP de demostración parte con deuda $0', () => {
    const cliente = clienteDelRol(db, 'vip');
    expect(cliente.esVip).toBe(true);
    expect(cliente.deuda).toBe(0);
    expect(clienteDelRol(db, 'estudiante').esVip).toBe(false);
  });

  it('Escenario adicional: la sembración es idempotente y no duplica al cliente VIP', () => {
    sembrar(db);
    sembrar(db);
    const { total } = db
      .prepare('SELECT COUNT(*) AS total FROM cliente WHERE es_vip = 1')
      .get() as { total: number };
    expect(total).toBe(1);
  });
});
