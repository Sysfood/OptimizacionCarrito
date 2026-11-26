import {
  CONTACTO_CLIENTE_VIP_DEMO,
  NOMBRE_CLIENTE_VIP_DEMO,
} from '../dominio/cliente';
import {
  CONTACTO_CLIENTE_DEMO,
  NOMBRE_CLIENTE_DEMO,
} from '../dominio/pedido';
import { fechaHoraLocal, fechaLocal, type Db } from './conexion';

interface ProductoEjemplo {
  nombre: string;
  precio: number;
  unidadesAsignadas: number;
}

const PRODUCTOS_EJEMPLO: ProductoEjemplo[] = [
  { nombre: 'Sándwich de pollo', precio: 3500, unidadesAsignadas: 10 },
  { nombre: 'Empanada de carne', precio: 1800, unidadesAsignadas: 8 },
  { nombre: 'Jugo natural', precio: 2200, unidadesAsignadas: 5 },
  { nombre: 'Café', precio: 1500, unidadesAsignadas: 0 },
];

/**
 * Carga los datos de ejemplo una sola vez. Es idempotente: si ya existe un
 * carrito, no vuelve a crear jornadas, productos ni existencias.
 */
export function sembrar(db: Db): void {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM carrito').get() as {
    total: number;
  };

  if (total === 0) {
    const actualizado = fechaHoraLocal();

    db.exec('BEGIN');
    try {
      const carritoId = Number(
        db
          .prepare('INSERT INTO carrito (nombre, ubicacion) VALUES (?, ?)')
          .run('Carrito Central', 'Acceso principal del campus').lastInsertRowid,
      );

      const jornadaId = Number(
        db
          .prepare(
            `INSERT INTO jornada
               (carrito_id, fecha, hora_apertura, hora_cierre, recepcion_digital)
             VALUES (?, ?, ?, ?, ?)`,
          )
          .run(carritoId, fechaLocal(), '08:00', '18:00', 1).lastInsertRowid,
      );

      const insertarProducto = db.prepare(
        'INSERT INTO producto (nombre, precio) VALUES (?, ?)',
      );
      const insertarExistencia = db.prepare(
        `INSERT INTO existencia
           (jornada_id, producto_id, unidades_asignadas, unidades_reservadas,
            unidades_consumidas, fecha_hora_actualizacion)
         VALUES (?, ?, ?, 0, 0, ?)`,
      );

      for (const producto of PRODUCTOS_EJEMPLO) {
        const productoId = Number(
          insertarProducto.run(producto.nombre, producto.precio).lastInsertRowid,
        );
        insertarExistencia.run(
          jornadaId,
          productoId,
          producto.unidadesAsignadas,
          actualizado,
        );
      }

      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  db.prepare(
    `INSERT OR IGNORE INTO configuracion (clave, valor)
     VALUES ('fuente_inventario_disponible', '1')`,
  ).run();

  const clienteDemo = db
    .prepare('SELECT id FROM cliente WHERE contacto = ?')
    .get(CONTACTO_CLIENTE_DEMO) as { id: number } | undefined;

  if (!clienteDemo) {
    db.prepare('INSERT INTO cliente (nombre, contacto) VALUES (?, ?)').run(
      NOMBRE_CLIENTE_DEMO,
      CONTACTO_CLIENTE_DEMO,
    );
  }

  const clienteVip = db
    .prepare('SELECT id FROM cliente WHERE contacto = ?')
    .get(CONTACTO_CLIENTE_VIP_DEMO) as { id: number } | undefined;

  if (!clienteVip) {
    // La deuda de un cliente VIP nuevo parte en $0 (HU-12).
    db.prepare(
      'INSERT INTO cliente (nombre, contacto, es_vip, deuda) VALUES (?, ?, 1, 0)',
    ).run(NOMBRE_CLIENTE_VIP_DEMO, CONTACTO_CLIENTE_VIP_DEMO);
  }
}
