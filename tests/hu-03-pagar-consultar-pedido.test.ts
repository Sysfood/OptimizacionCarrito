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

type Agente = ReturnType<typeof request.agent>;

interface PagoIniciado {
  pedidoId: number;
  pagoId: number;
  referencia: string;
}

function idProducto(nombre: string): number {
  const fila = db.prepare('SELECT id FROM producto WHERE nombre = ?').get(nombre) as {
    id: number;
  };
  return fila.id;
}

function contar(tabla: 'pago' | 'reserva' | 'pedido'): number {
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM ${tabla}`).get() as {
    total: number;
  };
  return total;
}

function pedidoEnBase(pedidoId: number): {
  estado: string;
  codigo: string | null;
  estimacion: string | null;
} {
  return db
    .prepare(
      `SELECT estado, codigo, estimacion_preparacion AS estimacion
       FROM pedido WHERE id = ?`,
    )
    .get(pedidoId) as { estado: string; codigo: string | null; estimacion: string | null };
}

async function iniciarCompra(
  agente: Agente,
  producto = 'Sándwich de pollo',
  cantidad = 2,
  enviar = true,
): Promise<PagoIniciado> {
  await agente
    .post('/pedido/agregar')
    .type('form')
    .send({ productoId: idProducto(producto), cantidad })
    .expect(302);
  await agente.post('/pedido/revalidar').expect(200);

  const respuesta = await agente.post('/pedido/pagar').expect(302);
  const pagoId = Number(
    respuesta.headers.location?.match(/\/demo\/pasarela\/(\d+)/)?.[1] ?? NaN,
  );
  expect(Number.isSafeInteger(pagoId)).toBe(true);

  const pagina = await agente.get(`/demo/pasarela/${pagoId}`).expect(200);
  const referencia =
    pagina.text.match(/name="referencia" value="([^"]+)"/)?.[1] ?? '';
  expect(referencia).not.toBe('');
  expect(pagina.text).toContain('Enviar pago');
  expect(pagina.text).not.toContain('Aprobar pago');

  if (enviar) {
    const envio = await agente
      .post(`/demo/pasarela/${pagoId}/enviar`)
      .type('form')
      .send({ referencia })
      .expect(200);
    expect(envio.text).toContain('Pasarela de pago (simulada)');
    expect(envio.text).toContain('Emitir resultado: aprobado');
  }

  const fila = db
    .prepare('SELECT pedido_id AS pedidoId FROM pago WHERE id = ?')
    .get(pagoId) as { pedidoId: number };

  return { pedidoId: fila.pedidoId, pagoId, referencia };
}

function responderPago(
  agente: Agente,
  pago: PagoIniciado,
  resultado: 'aprobado' | 'rechazado' | 'cancelado',
) {
  return agente
    .post(`/demo/pasarela/${pago.pagoId}/resultado`)
    .type('form')
    .send({ referencia: pago.referencia, resultado });
}

async function confirmarCompra(
  agente: Agente,
  producto = 'Sándwich de pollo',
  cantidad = 2,
): Promise<PagoIniciado> {
  const pago = await iniciarCompra(agente, producto, cantidad);
  await responderPago(agente, pago, 'aprobado').expect(302);
  return pago;
}

describe('HU-03 · Pago y seguimiento', () => {
  it('HU-03 · Resultado sin envío previo', async () => {
    const agente = request.agent(app);
    const pago = await iniciarCompra(agente, 'Sándwich de pollo', 2, false);

    await responderPago(agente, pago, 'aprobado').expect(409);

    expect(pedidoEnBase(pago.pedidoId).estado).toBe('Pendiente de pago');
    const reserva = db
      .prepare('SELECT estado FROM reserva WHERE pedido_id = ?')
      .get(pago.pedidoId) as { estado: string };
    expect(reserva.estado).toBe('activa');
    expect(contar('pago')).toBe(1);
  });

  it('Escenario: Confirmar un pago aprobado', async () => {
    const agente = request.agent(app);
    const pago = await iniciarCompra(agente);

    const respuesta = await responderPago(agente, pago, 'aprobado').expect(302);
    expect(respuesta.headers.location).toBe(
      `/pedido/confirmacion/${pago.pedidoId}`,
    );

    const pagina = await agente.get(respuesta.headers.location).expect(200);
    expect(pagina.text).toContain('Pedido confirmado');
    expect(pagina.text).toContain('Sándwich de pollo');
    expect(pagina.text).toMatch(/TC-\d{8}-\d{4}/);
    expect(pagina.text).toContain('Confirmado');

    const pedido = pedidoEnBase(pago.pedidoId);
    expect(pedido.estado).toBe('Confirmado');
    expect(pedido.codigo).toMatch(/^TC-\d{8}-\d{4}$/);

    const pagoFila = db
      .prepare('SELECT resultado FROM pago WHERE id = ?')
      .get(pago.pagoId) as { resultado: string };
    expect(pagoFila.resultado).toBe('confirmado');

    const reserva = db
      .prepare('SELECT estado FROM reserva WHERE pedido_id = ?')
      .get(pago.pedidoId) as { estado: string };
    expect(reserva.estado).toBe('consumida');

    const existencia = db
      .prepare(
        `SELECT unidades_reservadas AS reservadas,
                unidades_consumidas AS consumidas
         FROM existencia WHERE producto_id = ?`,
      )
      .get(idProducto('Sándwich de pollo')) as {
      reservadas: number;
      consumidas: number;
    };
    expect(existencia).toEqual({ reservadas: 0, consumidas: 2 });
  });

  it('Escenario: La Pasarela de pago rechaza el pago', async () => {
    const agente = request.agent(app);
    const pago = await iniciarCompra(agente);

    const respuesta = await responderPago(agente, pago, 'rechazado').expect(302);
    expect(respuesta.headers.location).toBe(
      `/pedido/pago-no-realizado/${pago.pedidoId}?motivo=rechazado`,
    );

    const pagina = await agente.get(respuesta.headers.location).expect(200);
    expect(pagina.text).toContain('Pago rechazado');
    expect(pagina.text).toContain('Pago no realizado');
    expect(pagina.text).toContain('Reintentar pago');
    expect(pagina.text).toContain('Sándwich de pollo');

    expect(pedidoEnBase(pago.pedidoId).estado).toBe('Pago no realizado');

    const pagoFila = db
      .prepare('SELECT resultado FROM pago WHERE id = ?')
      .get(pago.pagoId) as { resultado: string };
    expect(pagoFila.resultado).toBe('rechazado');

    const reserva = db
      .prepare('SELECT estado FROM reserva WHERE pedido_id = ?')
      .get(pago.pedidoId) as { estado: string };
    expect(reserva.estado).toBe('liberada');

    const existencia = db
      .prepare(
        `SELECT unidades_reservadas AS reservadas,
                unidades_consumidas AS consumidas
         FROM existencia WHERE producto_id = ?`,
      )
      .get(idProducto('Sándwich de pollo')) as {
      reservadas: number;
      consumidas: number;
    };
    expect(existencia).toEqual({ reservadas: 0, consumidas: 0 });
  });

  it('Escenario adicional: La Pasarela de pago cancela el pago', async () => {
    const agente = request.agent(app);
    const pago = await iniciarCompra(agente);

    const respuesta = await responderPago(agente, pago, 'cancelado').expect(302);
    expect(respuesta.headers.location).toBe(
      `/pedido/pago-no-realizado/${pago.pedidoId}?motivo=cancelado`,
    );

    const pagina = await agente.get(respuesta.headers.location).expect(200);
    expect(pagina.text).toContain('Pago cancelado');
    expect(pagina.text).toContain('Pago no realizado');
    expect(pedidoEnBase(pago.pedidoId).estado).toBe('Pago no realizado');

    const reserva = db
      .prepare('SELECT estado FROM reserva WHERE pedido_id = ?')
      .get(pago.pedidoId) as { estado: string };
    expect(reserva.estado).toBe('liberada');
  });

  it('Escenario: La Pasarela de pago informa dos veces el mismo pago aprobado', async () => {
    const agente = request.agent(app);
    const pago = await confirmarCompra(agente);
    const antes = pedidoEnBase(pago.pedidoId);

    await agente
      .post(`/pedido/confirmacion/${pago.pedidoId}/repetir`)
      .expect(302);

    const pagina = await agente
      .get(`/pedido/confirmacion/${pago.pedidoId}`)
      .expect(200);

    const despues = pedidoEnBase(pago.pedidoId);
    expect(despues.codigo).toBe(antes.codigo);
    expect(despues.estado).toBe('Confirmado');
    expect(pagina.text).toContain(antes.codigo ?? '');

    expect(contar('pedido')).toBe(1);
    expect(contar('pago')).toBe(1);
    expect(contar('reserva')).toBe(1);

    const existencia = db
      .prepare(
        `SELECT unidades_reservadas AS reservadas,
                unidades_consumidas AS consumidas
         FROM existencia WHERE producto_id = ?`,
      )
      .get(idProducto('Sándwich de pollo')) as {
      reservadas: number;
      consumidas: number;
    };
    expect(existencia).toEqual({ reservadas: 0, consumidas: 2 });
  });

  it('Escenario: Consultar un pedido confirmado', async () => {
    const agente = request.agent(app);
    const pago = await confirmarCompra(agente);
    const { codigo } = pedidoEnBase(pago.pedidoId);

    const formulario = await agente.get('/pedido/consultar').expect(200);
    expect(formulario.text).toContain('Consultar pedido');
    expect(formulario.text).toContain('Código de retiro');

    const consulta = await agente
      .post('/pedido/consultar')
      .type('form')
      .send({ codigo })
      .expect(200);

    expect(consulta.text).toContain(codigo ?? '');
    expect(consulta.text).toContain('Confirmado');
    expect(consulta.text).toContain('Sándwich de pollo');
    expect(consulta.text).toContain('data-total="7000"');
  });

  it('Escenario: La estimación de preparación no está disponible', async () => {
    const agente = request.agent(app);
    const pago = await confirmarCompra(agente);

    const pagina = await agente
      .get(`/pedido/confirmacion/${pago.pedidoId}`)
      .expect(200);

    expect(pagina.text).toContain('Estimación no disponible');
    expect(pagina.text).toContain('no es una cita ni garantiza una hora de retiro');
    expect(pagina.text).toContain('Confirmado');
  });

  it('Escenario: El pedido presenta un atraso', async () => {
    const agente = request.agent(app);
    const pago = await confirmarCompra(agente);

    await agente
      .post('/demo/estimacion')
      .type('form')
      .send({ pedidoId: pago.pedidoId, texto: 'Retraso de 10 minutos' })
      .expect(302);

    const pagina = await agente
      .get(`/pedido/confirmacion/${pago.pedidoId}`)
      .expect(200);

    expect(pagina.text).toContain('Retraso de 10 minutos');
    expect(pagina.text).toContain('Estimación informativa');
    expect(pagina.text).toContain('Confirmado');

    expect(pedidoEnBase(pago.pedidoId).estado).toBe('Confirmado');

    const { codigo } = pedidoEnBase(pago.pedidoId);
    const consulta = await agente
      .post('/pedido/consultar')
      .type('form')
      .send({ codigo })
      .expect(200);
    expect(consulta.text).toContain('Retraso de 10 minutos');
  });

  it('Escenario adicional: Código de retiro inexistente', async () => {
    const respuesta = await request(app)
      .post('/pedido/consultar')
      .type('form')
      .send({ codigo: 'TC-00000000-9999' })
      .expect(200);

    expect(respuesta.text).toContain('No se encontró un pedido con ese código.');
    expect(respuesta.text).not.toContain('Sándwich de pollo');
  });

  it('Escenario adicional: iniciar el pago sin disponibilidad', async () => {
    const agente = request.agent(app);

    await agente
      .post('/pedido/agregar')
      .type('form')
      .send({ productoId: idProducto('Sándwich de pollo'), cantidad: 2 })
      .expect(302);
    await agente
      .post('/demo/consumir')
      .type('form')
      .send({ productoId: idProducto('Sándwich de pollo'), cantidad: 9 })
      .expect(302);

    const respuesta = await agente.post('/pedido/pagar').expect(200);
    expect(respuesta.text).toContain('ahora quedan 1');
    expect(respuesta.text).not.toContain('Aceptar nuevo total');

    expect(contar('pago')).toBe(0);
    expect(contar('reserva')).toBe(0);

    const pedido = db
      .prepare('SELECT id, estado FROM pedido LIMIT 1')
      .get() as { id: number; estado: string };
    expect(pedido.estado).toBe('En edición');
  });

  it('Escenario adicional: reintentar con un total distinto', async () => {
    const agente = request.agent(app);
    const pago = await iniciarCompra(agente);
    await responderPago(agente, pago, 'rechazado').expect(302);

    db.prepare('UPDATE producto SET precio = ? WHERE id = ?').run(
      4000,
      idProducto('Sándwich de pollo'),
    );

    const cambios = await agente.post('/pedido/reintentar').expect(200);
    expect(cambios.text).toContain('Aceptar nuevo total');
    expect(cambios.text).toContain('data-total-nuevo="8000"');
    expect(contar('pago')).toBe(1);

    const listo = await agente.post('/pedido/aceptar-total').expect(200);
    expect(listo.text).toContain('Pedido listo para pagar');
    expect(listo.text).toContain('data-total="8000"');

    const nuevoPago = await agente.post('/pedido/pagar').expect(302);
    const nuevoPagoId = Number(
      nuevoPago.headers.location?.match(/\/demo\/pasarela\/(\d+)/)?.[1] ?? NaN,
    );
    expect(nuevoPagoId).not.toBe(pago.pagoId);

    const paginaPasarela = await agente
      .get(`/demo/pasarela/${nuevoPagoId}`)
      .expect(200);
    const nuevaReferencia =
      paginaPasarela.text.match(/name="referencia" value="([^"]+)"/)?.[1] ?? '';
    expect(nuevaReferencia).not.toBe('');

    await agente
      .post(`/demo/pasarela/${nuevoPagoId}/enviar`)
      .type('form')
      .send({ referencia: nuevaReferencia })
      .expect(200);

    await agente
      .post(`/demo/pasarela/${nuevoPagoId}/resultado`)
      .type('form')
      .send({ referencia: nuevaReferencia, resultado: 'aprobado' })
      .expect(302);

    const pedido = pedidoEnBase(pago.pedidoId);
    expect(pedido.estado).toBe('Confirmado');
    expect(contar('pago')).toBe(2);

    const reservas = db
      .prepare('SELECT estado FROM reserva WHERE pedido_id = ? ORDER BY id')
      .all(pago.pedidoId) as { estado: string }[];
    expect(reservas.map((fila) => fila.estado)).toEqual(['liberada', 'consumida']);
  });

  it('Escenario adicional: dos confirmaciones del mismo día generan códigos consecutivos', async () => {
    const primero = await confirmarCompra(request.agent(app), 'Sándwich de pollo', 1);
    const segundo = await confirmarCompra(request.agent(app), 'Empanada de carne', 1);

    const codigo1 = pedidoEnBase(primero.pedidoId).codigo ?? '';
    const codigo2 = pedidoEnBase(segundo.pedidoId).codigo ?? '';

    expect(codigo1).toMatch(/^TC-\d{8}-\d{4}$/);
    expect(codigo2).toMatch(/^TC-\d{8}-\d{4}$/);
    expect(codigo1.slice(0, 11)).toBe(codigo2.slice(0, 11));
    expect(Number(codigo2.slice(-4))).toBe(Number(codigo1.slice(-4)) + 1);
  });
});
