import Database from 'better-sqlite3';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { crearApp } from '../src/app';
import { aplicarMigraciones, type Db } from '../src/db/conexion';
import { sembrar } from '../src/db/seed';
import { reservaVigente, type Reserva } from '../src/dominio/reserva';
import { crearReversaPagoSimulada } from '../src/integraciones/reversa-pago';
import { aplicarTransicionReserva } from '../src/servicios/reserva';

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

const PRODUCTO = 'Sándwich de pollo';
const CANTIDAD = 2;

function idProducto(nombre: string): number {
  const fila = db.prepare('SELECT id FROM producto WHERE nombre = ?').get(nombre) as {
    id: number;
  };
  return fila.id;
}

function existenciaDe(nombre: string) {
  const fila = db
    .prepare(
      `SELECT e.unidades_asignadas AS asignadas, e.unidades_reservadas AS reservadas,
              e.unidades_consumidas AS consumidas
       FROM existencia e JOIN producto p ON p.id = e.producto_id
       WHERE p.nombre = ?`,
    )
    .get(nombre) as { asignadas: number; reservadas: number; consumidas: number };
  return {
    ...fila,
    vendibles: fila.asignadas - fila.reservadas - fila.consumidas,
  };
}

function estadoPedido(pedidoId: number): string {
  const fila = db.prepare('SELECT estado FROM pedido WHERE id = ?').get(pedidoId) as {
    estado: string;
  };
  return fila.estado;
}

function codigoPedido(pedidoId: number): string | null {
  const fila = db.prepare('SELECT codigo FROM pedido WHERE id = ?').get(pedidoId) as {
    codigo: string | null;
  };
  return fila.codigo;
}

function estadoReserva(pedidoId: number): string | null {
  const fila = db
    .prepare('SELECT estado FROM reserva WHERE pedido_id = ? ORDER BY id DESC LIMIT 1')
    .get(pedidoId) as { estado: string } | undefined;
  return fila?.estado ?? null;
}

function contarReservas(): number {
  const fila = db.prepare('SELECT COUNT(*) AS total FROM reserva').get() as {
    total: number;
  };
  return fila.total;
}

async function iniciarCompra(
  agente: Agente,
  producto = PRODUCTO,
  cantidad = CANTIDAD,
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

  await agente
    .post(`/demo/pasarela/${pagoId}/enviar`)
    .type('form')
    .send({ referencia })
    .expect(200);

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

async function forzarVencimiento(agente: Agente, pedidoId: number) {
  await agente.post(`/demo/reserva/${pedidoId}/vencer`).expect(302);
}

function crearPedidoConDetalle(productoId: number, cantidad: number): number {
  const cliente = db.prepare('SELECT id FROM cliente LIMIT 1').get() as { id: number };
  const jornada = db.prepare('SELECT id FROM jornada LIMIT 1').get() as { id: number };
  const pedidoId = Number(
    db
      .prepare(
        `INSERT INTO pedido (cliente_id, jornada_id, estado) VALUES (?, ?, 'En edición')`,
      )
      .run(cliente.id, jornada.id).lastInsertRowid,
  );
  db.prepare(
    `INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
     VALUES (?, ?, ?, 3500)`,
  ).run(pedidoId, productoId, cantidad);
  return pedidoId;
}

function crearReservaActiva(pedidoId: number): number {
  const ahora = '2026-11-22 10:00:00';
  return Number(
    db
      .prepare(
        `INSERT INTO reserva (pedido_id, fecha_hora_inicio, fecha_hora_vencimiento, estado)
         VALUES (?, ?, ?, 'activa')`,
      )
      .run(pedidoId, ahora, '2026-11-22 10:03:00').lastInsertRowid,
  );
}

describe('HU-04 · Reserva temporal de unidades', () => {
  it('reservaVigente distingue vigente, vencida y estado final', () => {
    const reserva: Reserva = {
      id: 1,
      pedidoId: 1,
      fechaHoraInicio: '2026-11-22 10:00:00',
      fechaHoraVencimiento: '2026-11-22 10:03:00',
      estado: 'activa',
    };
    expect(reservaVigente(reserva, '2026-11-22 10:02:59')).toBe(true);
    expect(reservaVigente(reserva, '2026-11-22 10:03:00')).toBe(false);
    expect(reservaVigente({ ...reserva, estado: 'consumida' }, '2026-11-22 10:01:00')).toBe(
      false,
    );
  });

  it('aplicarTransicionReserva no permite una segunda transición', () => {
    const pedidoId = crearPedidoConDetalle(idProducto(PRODUCTO), 1);
    const reservaId = crearReservaActiva(pedidoId);

    const primera = aplicarTransicionReserva({
      db,
      reservaId,
      evento: 'pagoRechazado',
      ahora: '2026-11-22 10:01:00',
    });
    expect(primera.tipo).toBe('ok');

    const segunda = aplicarTransicionReserva({
      db,
      reservaId,
      evento: 'pagoAprobado',
      ahora: '2026-11-22 10:01:00',
    });
    expect(segunda.tipo).toBe('noAplica');
  });

  it('la reversa simulada devuelve referencia sin campos de tarjeta', () => {
    const resultado = crearReversaPagoSimulada().solicitarReversa('SIM-1-ABC', 3500);
    expect(resultado.referenciaReversa).toMatch(/^REV-SIM-1-ABC-/);

    const columnas = db.prepare('PRAGMA table_info(conciliacion)').all() as {
      name: string;
    }[];
    const nombres = columnas.map((columna) => columna.name);
    expect(nombres).toContain('referencia_reversa');
    expect(nombres.some((nombre) => /tarjeta|cvv/i.test(nombre))).toBe(false);
  });

  it('HU-04 · Dos pedidos compiten por la última unidad', async () => {
    db.prepare(
      `UPDATE existencia SET unidades_asignadas = 1, unidades_reservadas = 0,
       unidades_consumidas = 0 WHERE producto_id = ?`,
    ).run(idProducto(PRODUCTO));

    const primero = request.agent(app);
    await iniciarCompra(primero, PRODUCTO, 1);

    const segundo = request.agent(app);
    const aviso = await segundo
      .post('/pedido/agregar')
      .type('form')
      .send({ productoId: idProducto(PRODUCTO), cantidad: 1 })
      .expect(200);
    expect(aviso.text).toContain('agotado');

    const activas = db
      .prepare(`SELECT COUNT(*) AS total FROM reserva WHERE estado = 'activa'`)
      .get() as { total: number };
    expect(activas.total).toBe(1);

    const pagos = db.prepare('SELECT COUNT(*) AS total FROM pago').get() as {
      total: number;
    };
    expect(pagos.total).toBe(1);
  });

  it('HU-04 · El pago se aprueba dentro del plazo de reserva', async () => {
    const agente = request.agent(app);
    const pago = await iniciarCompra(agente);
    const antes = existenciaDe(PRODUCTO);

    await responderPago(agente, pago, 'aprobado').expect(302);

    expect(estadoPedido(pago.pedidoId)).toBe('Confirmado');
    expect(estadoReserva(pago.pedidoId)).toBe('consumida');
    const despues = existenciaDe(PRODUCTO);
    expect(despues.reservadas).toBe(antes.reservadas - CANTIDAD);
    expect(despues.consumidas).toBe(antes.consumidas + CANTIDAD);

    await responderPago(agente, pago, 'aprobado').expect(302);
    expect(existenciaDe(PRODUCTO).consumidas).toBe(despues.consumidas);
    expect(contarReservas()).toBe(1);
  });

  it('HU-04 · La reserva vence sin pago aprobado y libera una sola vez', async () => {
    const agente = request.agent(app);
    const pago = await iniciarCompra(agente);
    const antes = existenciaDe(PRODUCTO);

    await forzarVencimiento(agente, pago.pedidoId);

    expect(estadoReserva(pago.pedidoId)).toBe('liberada');
    expect(estadoPedido(pago.pedidoId)).toBe('Pago no realizado');
    const despues = existenciaDe(PRODUCTO);
    expect(despues.reservadas).toBe(antes.reservadas - CANTIDAD);
    expect(despues.vendibles).toBe(antes.vendibles + CANTIDAD);

    await forzarVencimiento(agente, pago.pedidoId);
    expect(existenciaDe(PRODUCTO).vendibles).toBe(despues.vendibles);
  });

  it('HU-04 · Un nuevo intento exige una nueva reserva', async () => {
    const agente = request.agent(app);
    const pago = await iniciarCompra(agente);
    await forzarVencimiento(agente, pago.pedidoId);
    const reservasAntes = contarReservas();

    await agente.post('/pedido/reintentar').expect(302);

    expect(contarReservas()).toBe(reservasAntes + 1);
    expect(estadoReserva(pago.pedidoId)).toBe('activa');
    expect(estadoPedido(pago.pedidoId)).toBe('Pendiente de pago');
  });

  it('HU-04 · Pago aprobado después del vencimiento, sin unidades disponibles', async () => {
    const agente = request.agent(app);
    const pago = await iniciarCompra(agente);
    await forzarVencimiento(agente, pago.pedidoId);

    db.prepare(
      `UPDATE existencia SET unidades_asignadas = unidades_consumidas
       WHERE producto_id = ?`,
    ).run(idProducto(PRODUCTO));

    const respuesta = await responderPago(agente, pago, 'aprobado').expect(302);
    expect(respuesta.headers.location).toContain(
      `/pedido/conciliacion/${pago.pedidoId}`,
    );
    expect(estadoPedido(pago.pedidoId)).toBe('Reembolsado');
    expect(codigoPedido(pago.pedidoId)).toBeNull();

    const pagina = await agente
      .get(`/pedido/conciliacion/${pago.pedidoId}`)
      .expect(200);
    expect(pagina.text).toContain('Pago en resolución');
    expect(pagina.text).toContain('reversa simulada');
    expect(pagina.text).not.toContain('Pedido confirmado');

    const conciliacion = db
      .prepare('SELECT estado FROM conciliacion ORDER BY id DESC LIMIT 1')
      .get() as { estado: string };
    expect(conciliacion.estado).toBe('reembolsada');
  });

  it('HU-04 · Pago aprobado después del vencimiento, con unidades disponibles', async () => {
    const agente = request.agent(app);
    const pago = await iniciarCompra(agente);
    await forzarVencimiento(agente, pago.pedidoId);

    const respuesta = await responderPago(agente, pago, 'aprobado').expect(302);
    expect(respuesta.headers.location).toContain(
      `/pedido/confirmacion/${pago.pedidoId}`,
    );
    expect(estadoPedido(pago.pedidoId)).toBe('Confirmado');
    expect(codigoPedido(pago.pedidoId)).not.toBeNull();

    const conciliacion = db
      .prepare('SELECT estado FROM conciliacion ORDER BY id DESC LIMIT 1')
      .get() as { estado: string };
    expect(conciliacion.estado).toBe('confirmada');
  });
});
