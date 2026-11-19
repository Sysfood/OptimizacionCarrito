import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { aplicarMigraciones, type Db } from '../src/db/conexion';
import { sembrar } from '../src/db/seed';
import { crearFuenteInventarioSimulada } from '../src/integraciones/fuente-inventario';
import { crearPasarelaPagoSimulada } from '../src/integraciones/pasarela-pago';
import {
  iniciarPago,
  obtenerPedidoPorCodigo,
  procesarResultadoPago,
} from '../src/servicios/pago';
import { agregarProducto } from '../src/servicios/pedido';

let db: Db;
let fuente: ReturnType<typeof crearFuenteInventarioSimulada>;
let pasarela: ReturnType<typeof crearPasarelaPagoSimulada>;

beforeEach(() => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  aplicarMigraciones(db);
  sembrar(db);
  fuente = crearFuenteInventarioSimulada(db);
  pasarela = crearPasarelaPagoSimulada();
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

function crearPedido(
  nombre = 'Sándwich de pollo',
  cantidad = 2,
): number {
  const resultado = agregarProducto(db, fuente, {
    pedidoId: null,
    productoId: idProducto(nombre),
    cantidad,
  });

  if (resultado.tipo !== 'ok') {
    throw new Error(`No se pudo crear el pedido: ${resultado.tipo}`);
  }

  return resultado.pedidoId;
}

function pagoDe(pedidoId: number): {
  id: number;
  referenciaPasarela: string;
  monto: number;
  resultado: string;
} {
  return db
    .prepare(
      `SELECT id,
              referencia_pasarela AS referenciaPasarela,
              monto,
              resultado
       FROM pago WHERE pedido_id = ? ORDER BY id DESC LIMIT 1`,
    )
    .get(pedidoId) as {
    id: number;
    referenciaPasarela: string;
    monto: number;
    resultado: string;
  };
}

function estadoPedido(pedidoId: number): string {
  return (
    db.prepare('SELECT estado FROM pedido WHERE id = ?').get(pedidoId) as {
      estado: string;
    }
  ).estado;
}

function contar(tabla: 'pago' | 'reserva'): number {
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM ${tabla}`).get() as {
    total: number;
  };
  return total;
}

describe('Servicio de pago · inicio', () => {
  it('reserva las unidades, deja el pedido pendiente y registra el intento', () => {
    const pedidoId = crearPedido();

    const resultado = iniciarPago(db, fuente, pasarela, pedidoId);

    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo !== 'ok') return;

    expect(resultado.total).toBe(7000);
    expect(estadoPedido(pedidoId)).toBe('Pendiente de pago');

    const pago = pagoDe(pedidoId);
    expect(pago.resultado).toBe('pendiente');
    expect(pago.monto).toBe(7000);
    expect(pago.referenciaPasarela).toMatch(/^SIM-\d+-[A-Z0-9]+$/);

    const reserva = db
      .prepare(
        `SELECT estado, fecha_hora_inicio AS inicio,
                fecha_hora_vencimiento AS vencimiento
         FROM reserva WHERE pedido_id = ?`,
      )
      .get(pedidoId) as { estado: string; inicio: string; vencimiento: string };
    expect(reserva.estado).toBe('activa');
    expect(reserva.vencimiento).not.toBe(reserva.inicio);

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
    expect(existencia).toEqual({ reservadas: 2, consumidas: 0 });
  });

  it('no reserva ni cobra cuando la disponibilidad ya no alcanza', () => {
    const pedidoId = crearPedido();
    db.prepare(
      `UPDATE existencia SET unidades_consumidas = 9
       WHERE producto_id = ?`,
    ).run(idProducto('Sándwich de pollo'));

    const resultado = iniciarPago(db, fuente, pasarela, pedidoId);

    expect(resultado.tipo).toBe('cambios');
    if (resultado.tipo !== 'cambios') return;

    expect(resultado.disponibilidad).toEqual([
      {
        productoId: idProducto('Sándwich de pollo'),
        nombre: 'Sándwich de pollo',
        cantidadSolicitada: 2,
        unidadesVendibles: 1,
      },
    ]);
    expect(estadoPedido(pedidoId)).toBe('En edición');
    expect(contar('pago')).toBe(0);
    expect(contar('reserva')).toBe(0);
  });
});

describe('Servicio de pago · resultado', () => {
  it('confirma una sola vez y asigna el código de retiro', () => {
    const pedidoId = crearPedido();
    const inicio = iniciarPago(db, fuente, pasarela, pedidoId);
    expect(inicio.tipo).toBe('ok');
    if (inicio.tipo !== 'ok') return;

    const pago = pagoDe(pedidoId);
    const proceso = procesarResultadoPago(db, {
      pagoId: pago.id,
      referencia: pago.referenciaPasarela,
      resultado: 'aprobado',
    });

    expect(proceso.tipo).toBe('confirmado');
    if (proceso.tipo !== 'confirmado') return;

    expect(proceso.codigo).toMatch(/^TC-\d{8}-\d{4}$/);
    expect(proceso.pedido.estado).toBe('Confirmado');
    expect(pagoDe(pedidoId).resultado).toBe('confirmado');

    const reserva = db
      .prepare('SELECT estado FROM reserva WHERE pedido_id = ?')
      .get(pedidoId) as { estado: string };
    expect(reserva.estado).toBe('consumida');

    const segunda = procesarResultadoPago(db, {
      pagoId: pago.id,
      referencia: pago.referenciaPasarela,
      resultado: 'aprobado',
    });
    expect(segunda.tipo).toBe('confirmado');
    if (segunda.tipo !== 'confirmado') return;
    expect(segunda.codigo).toBe(proceso.codigo);

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

  it('libera la reserva y deja el pedido en Pago no realizado', () => {
    const pedidoId = crearPedido();
    iniciarPago(db, fuente, pasarela, pedidoId);
    const pago = pagoDe(pedidoId);

    const proceso = procesarResultadoPago(db, {
      pagoId: pago.id,
      referencia: pago.referenciaPasarela,
      resultado: 'rechazado',
    });

    expect(proceso.tipo).toBe('noRealizado');
    expect(estadoPedido(pedidoId)).toBe('Pago no realizado');
    expect(pagoDe(pedidoId).resultado).toBe('rechazado');

    const reserva = db
      .prepare('SELECT estado FROM reserva WHERE pedido_id = ?')
      .get(pedidoId) as { estado: string };
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

  it('rechaza una referencia que no corresponde al intento', () => {
    const pedidoId = crearPedido();
    iniciarPago(db, fuente, pasarela, pedidoId);
    const pago = pagoDe(pedidoId);

    const proceso = procesarResultadoPago(db, {
      pagoId: pago.id,
      referencia: 'SIM-OTRO-INTENTO',
      resultado: 'aprobado',
    });

    expect(proceso.tipo).toBe('referenciaInvalida');
    expect(estadoPedido(pedidoId)).toBe('Pendiente de pago');
    expect(pagoDe(pedidoId).resultado).toBe('pendiente');
  });

  it('permite reintentar y crea una reserva y un pago nuevos', () => {
    const pedidoId = crearPedido();
    const primero = iniciarPago(db, fuente, pasarela, pedidoId);
    expect(primero.tipo).toBe('ok');
    if (primero.tipo !== 'ok') return;

    const pago1 = pagoDe(pedidoId);
    procesarResultadoPago(db, {
      pagoId: pago1.id,
      referencia: pago1.referenciaPasarela,
      resultado: 'rechazado',
    });

    const segundo = iniciarPago(db, fuente, pasarela, pedidoId);
    expect(segundo.tipo).toBe('ok');
    if (segundo.tipo !== 'ok') return;

    expect(segundo.pagoId).not.toBe(primero.pagoId);
    expect(estadoPedido(pedidoId)).toBe('Pendiente de pago');
    expect(contar('pago')).toBe(2);
    expect(contar('reserva')).toBe(2);

    const reservas = db
      .prepare('SELECT estado FROM reserva WHERE pedido_id = ? ORDER BY id')
      .all(pedidoId) as { estado: string }[];
    expect(reservas.map((fila) => fila.estado)).toEqual(['liberada', 'activa']);
  });
});

describe('Pasarela de pago simulada', () => {
  it('genera una referencia por intento y recuerda el resultado elegido', () => {
    const simulada = crearPasarelaPagoSimulada();

    const { referencia } = simulada.solicitarPago({ pagoId: 7, monto: 3500 });

    expect(referencia).toMatch(/^SIM-7-[A-Z0-9]+$/);
    expect(simulada.verificarResultado(referencia)).toBeNull();

    simulada.registrarResultado(referencia, 'aprobado');
    expect(simulada.verificarResultado(referencia)).toBe('aprobado');
  });

  it('recuerda qué pagos fueron enviados por el estudiante', () => {
    const simulada = crearPasarelaPagoSimulada();
    const { referencia } = simulada.solicitarPago({ pagoId: 8, monto: 2000 });

    expect(simulada.verificarEnvio(referencia)).toBe(false);
    simulada.registrarEnvio(referencia);
    expect(simulada.verificarEnvio(referencia)).toBe(true);
    expect(simulada.verificarEnvio('SIM-otra')).toBe(false);
  });
});

describe('Servicio de pago · consulta', () => {
  it('encuentra un pedido confirmado por código sin importar espacios ni mayúsculas', () => {
    const pedidoId = crearPedido();
    iniciarPago(db, fuente, pasarela, pedidoId);
    const pago = pagoDe(pedidoId);
    const proceso = procesarResultadoPago(db, {
      pagoId: pago.id,
      referencia: pago.referenciaPasarela,
      resultado: 'aprobado',
    });
    expect(proceso.tipo).toBe('confirmado');
    if (proceso.tipo !== 'confirmado') return;

    const consultado = obtenerPedidoPorCodigo(
      db,
      `  ${proceso.codigo.toLowerCase()}  `,
    );

    expect(consultado?.id).toBe(pedidoId);
    expect(consultado?.codigo).toBe(proceso.codigo);
  });
});
