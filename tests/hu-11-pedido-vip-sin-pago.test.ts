import Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearApp } from '../src/app';
import { aplicarMigraciones, type Db } from '../src/db/conexion';
import { sembrar } from '../src/db/seed';
import { configurarDeudaMaxima } from '../src/servicios/deuda';

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

function deudaVip(): number {
  const fila = db
    .prepare('SELECT deuda FROM cliente WHERE es_vip = 1')
    .get() as { deuda: number };
  return fila.deuda;
}

function contar(tabla: 'pedido' | 'pago' | 'movimiento_deuda'): number {
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM ${tabla}`).get() as {
    total: number;
  };
  return total;
}

function pedidoEnBase(pedidoId: number) {
  return db
    .prepare('SELECT estado, codigo FROM pedido WHERE id = ?')
    .get(pedidoId) as { estado: string; codigo: string | null };
}

function estadoReserva(pedidoId: number): string | null {
  const fila = db
    .prepare('SELECT estado FROM reserva WHERE pedido_id = ? ORDER BY id DESC LIMIT 1')
    .get(pedidoId) as { estado: string } | undefined;
  return fila?.estado ?? null;
}

function vendibles(nombre: string): number {
  const fila = db
    .prepare(
      `SELECT e.unidades_asignadas - e.unidades_reservadas - e.unidades_consumidas AS v
       FROM existencia e JOIN producto p ON p.id = e.producto_id WHERE p.nombre = ?`,
    )
    .get(nombre) as { v: number };
  return fila.v;
}

async function armarPedido(agente: Agente, producto = 'Sándwich de pollo', cantidad = 2) {
  await agente
    .post('/pedido/agregar')
    .type('form')
    .send({ productoId: idProducto(producto), cantidad })
    .expect(302);
}

describe('HU-11 · Cliente VIP crea pedido con confirmación automática', () => {
  it('Escenario: Pedido VIP confirmado y deuda aumentada', async () => {
    const agente = agenteConRol('vip');
    await armarPedido(agente);
    await agente.post('/pedido/revalidar').expect(200);

    const respuesta = await agente.post('/pedido/confirmar-vip').expect(302);
    const pedidoId = Number(respuesta.headers.location?.match(/confirmacion\/(\d+)/)?.[1]);
    expect(Number.isSafeInteger(pedidoId)).toBe(true);

    const pedido = pedidoEnBase(pedidoId);
    expect(pedido.estado).toBe('Confirmado');
    expect(pedido.codigo).toMatch(/^TC-\d{8}-\d{4}$/);

    // Sin pago previo: no se pasa por la Pasarela de pago.
    expect(contar('pago')).toBe(0);
    expect(estadoReserva(pedidoId)).toBe('consumida');
    expect(vendibles('Sándwich de pollo')).toBe(8);

    // 2 × $3.500 se suman a la deuda.
    expect(deudaVip()).toBe(7000);

    const pagina = await agente.get(`/pedido/confirmacion/${pedidoId}`).expect(200);
    expect(pagina.text).toContain(pedido.codigo as string);
    expect(pagina.text).toContain('sin pago previo');
    expect(pagina.text).toContain('Sumado a tu deuda');
  });

  it('Escenario: Pedido VIP sin unidades disponibles', async () => {
    const agente = agenteConRol('vip');
    await armarPedido(agente);

    // Otra compra consume las unidades después de armar el pedido.
    db.prepare(
      `UPDATE existencia SET unidades_consumidas = unidades_asignadas WHERE producto_id = ?`,
    ).run(idProducto('Sándwich de pollo'));

    const respuesta = await agente.post('/pedido/confirmar-vip').expect(200);
    expect(respuesta.text).toContain('Sándwich de pollo');

    expect(deudaVip()).toBe(0);
    expect(contar('movimiento_deuda')).toBe(0);
    const pedido = db.prepare('SELECT estado, codigo FROM pedido').get() as {
      estado: string;
      codigo: string | null;
    };
    expect(pedido.estado).toBe('En edición');
    expect(pedido.codigo).toBeNull();
  });

  it('Escenario: Un cliente que no es VIP no puede pedir sin pagar', async () => {
    const agente = agenteConRol('estudiante');
    await armarPedido(agente);

    const respuesta = await agente.post('/pedido/confirmar-vip').expect(403);
    expect(respuesta.text).toContain('Pasarela de pago');

    const pedido = db.prepare('SELECT estado, codigo FROM pedido').get() as {
      estado: string;
      codigo: string | null;
    };
    expect(pedido.estado).toBe('En edición');
    expect(pedido.codigo).toBeNull();
    expect(contar('movimiento_deuda')).toBe(0);
    expect(deudaVip()).toBe(0);
    expect(vendibles('Sándwich de pollo')).toBe(10);
  });

  it('Escenario: Deuda máxima alcanzada', async () => {
    const agente = agenteConRol('vip');
    await armarPedido(agente);
    await agente.post('/pedido/confirmar-vip').expect(302);
    expect(deudaVip()).toBe(7000);

    configurarDeudaMaxima(db, 7000);

    // Nuevo pedido: la deuda ya alcanzó el máximo.
    await agente.post('/pedido/agregar').type('form').send({
      productoId: idProducto('Empanada de carne'),
      cantidad: 1,
    });
    const respuesta = await agente.post('/pedido/confirmar-vip').expect(409);
    expect(respuesta.text).toContain('saldar tu deuda');

    expect(deudaVip()).toBe(7000);
    expect(contar('movimiento_deuda')).toBe(1);

    const segundo = db.prepare('SELECT id, estado, codigo FROM pedido ORDER BY id DESC').get() as {
      id: number;
      estado: string;
      codigo: string | null;
    };
    expect(segundo.estado).toBe('En edición');
    expect(segundo.codigo).toBeNull();
    // Ciclo de vida de la reserva: se activa y se libera sin consumir unidades.
    expect(estadoReserva(segundo.id)).toBe('liberada');
    expect(vendibles('Empanada de carne')).toBe(8);
  });

  it('Escenario adicional: al saldar la deuda el cliente VIP puede volver a pedir', async () => {
    const agente = agenteConRol('vip');
    await armarPedido(agente);
    await agente.post('/pedido/confirmar-vip').expect(302);
    configurarDeudaMaxima(db, 1000);

    await agente.post('/pedido/agregar').type('form').send({
      productoId: idProducto('Empanada de carne'),
      cantidad: 1,
    });
    await agente.post('/pedido/confirmar-vip').expect(409);

    await agente.post('/demo/deuda/saldar').expect(302);
    expect(deudaVip()).toBe(0);

    await agente.post('/pedido/confirmar-vip').expect(302);
    expect(deudaVip()).toBe(1800);
  });

  it('Escenario: Se repite la solicitud de un pedido VIP', async () => {
    const agente = agenteConRol('vip');
    await armarPedido(agente);

    await agente.post('/pedido/confirmar-vip').expect(302);
    const pedidosAntes = contar('pedido');
    const codigo = (db.prepare('SELECT codigo FROM pedido').get() as { codigo: string }).codigo;

    const repetida = await agente.post('/pedido/confirmar-vip').expect(302);
    expect(repetida.headers.location).toContain('/pedido/confirmacion/');

    expect(contar('pedido')).toBe(pedidosAntes);
    expect(contar('movimiento_deuda')).toBe(1);
    expect(deudaVip()).toBe(7000);
    expect((db.prepare('SELECT codigo FROM pedido').get() as { codigo: string }).codigo).toBe(
      codigo,
    );
    expect(vendibles('Sándwich de pollo')).toBe(8);
  });

  it('Escenario adicional: la deuda se acumula entre pedidos del cliente VIP', async () => {
    const agente = agenteConRol('vip');
    await armarPedido(agente, 'Sándwich de pollo', 1);
    await agente.post('/pedido/confirmar-vip').expect(302);

    await armarPedido(agente, 'Empanada de carne', 2);
    await agente.post('/pedido/confirmar-vip').expect(302);

    expect(deudaVip()).toBe(3500 + 2 * 1800);
    expect(contar('movimiento_deuda')).toBe(2);
  });

  it('Escenario adicional: sin deuda máxima configurada no se bloquea ningún pedido', async () => {
    const agente = agenteConRol('vip');
    await armarPedido(agente, 'Sándwich de pollo', 5);
    await agente.post('/pedido/confirmar-vip').expect(302);
    await armarPedido(agente, 'Sándwich de pollo', 5);
    await agente.post('/pedido/confirmar-vip').expect(302);
    expect(deudaVip()).toBe(35000);
  });

  it('Escenario adicional: un estudiante no confirma el pedido VIP de otro cliente', async () => {
    const vip = agenteConRol('vip');
    await armarPedido(vip);
    const pedidoVip = db.prepare('SELECT id FROM pedido').get() as { id: number };

    const estudiante = request.agent(app);
    estudiante.set('Cookie', `rol=estudiante; pedido_id=${pedidoVip.id}`);
    await estudiante.post('/pedido/confirmar-vip').expect(403);

    expect(pedidoEnBase(pedidoVip.id).estado).toBe('En edición');
    expect(deudaVip()).toBe(0);
    expect(contar('movimiento_deuda')).toBe(0);
  });

  it('Escenario adicional: el pedido de un estudiante no pasa a nombre del VIP', async () => {
    const estudiante = agenteConRol('estudiante');
    await armarPedido(estudiante);
    const idEstudiante = (db.prepare('SELECT id FROM pedido').get() as { id: number }).id;

    // El mismo navegador cambia a rol VIP: no reutiliza el pedido del estudiante.
    const vip = request.agent(app);
    vip.set('Cookie', `rol=vip; pedido_id=${idEstudiante}`);
    await vip
      .post('/pedido/agregar')
      .type('form')
      .send({ productoId: idProducto('Jugo natural'), cantidad: 1 })
      .expect(302);

    const pedidos = db
      .prepare('SELECT id, cliente_id AS clienteId FROM pedido ORDER BY id')
      .all() as { id: number; clienteId: number }[];
    expect(pedidos).toHaveLength(2);
    expect(pedidos[0].clienteId).not.toBe(pedidos[1].clienteId);
  });
});
