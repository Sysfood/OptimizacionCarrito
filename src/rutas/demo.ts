import { Router } from 'express';
import { fechaHoraLocal, type Db } from '../db/conexion';
import { obtenerJornadaVigente } from '../servicios/catalogo';

const ROLES_VALIDOS = ['estudiante', 'vendedor', 'encargado'];

function leerEntero(valor: unknown): number | null {
  const texto = String(valor ?? '').trim();
  if (!/^\d+$/.test(texto)) return null;

  const numero = Number(texto);
  return Number.isSafeInteger(numero) ? numero : null;
}

export function crearRutasDemo(db: Db): Router {
  const router = Router();

  router.post('/rol', (req, res) => {
    const rol = String(req.body?.rol ?? 'estudiante');

    if (!ROLES_VALIDOS.includes(rol)) {
      res.status(400).send('Rol de demostración no válido');
      return;
    }

    res.setHeader(
      'Set-Cookie',
      `rol=${encodeURIComponent(rol)}; Path=/; SameSite=Lax; Max-Age=2592000`,
    );
    res.redirect('/catalogo');
  });

  router.post('/fuente-inventario', (_req, res) => {
    const actual = db
      .prepare(`SELECT valor FROM configuracion WHERE clave = 'fuente_inventario_disponible'`)
      .get() as { valor: string } | undefined;

    const nuevoValor = actual?.valor === '0' ? '1' : '0';

    db.prepare(
      `INSERT INTO configuracion (clave, valor) VALUES ('fuente_inventario_disponible', ?)
       ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor`,
    ).run(nuevoValor);

    res.redirect('/catalogo');
  });

  router.post('/precio', (req, res) => {
    const productoId = leerEntero(req.body?.productoId);
    const precio = leerEntero(req.body?.precio);

    if (productoId === null || precio === null) {
      res.status(400).send('Datos de demostración no válidos');
      return;
    }

    const resultado = db
      .prepare('UPDATE producto SET precio = ? WHERE id = ?')
      .run(precio, productoId);

    if (resultado.changes === 0) {
      res.status(404).send('Producto no encontrado');
      return;
    }

    res.redirect('/pedido');
  });

  router.post('/consumir', (req, res) => {
    const productoId = leerEntero(req.body?.productoId);
    const cantidad = leerEntero(req.body?.cantidad ?? 1);
    const jornada = obtenerJornadaVigente(db);

    if (productoId === null || cantidad === null || cantidad < 1) {
      res.status(400).send('Datos de demostración no válidos');
      return;
    }

    if (!jornada) {
      res.status(400).send('No hay una jornada con disponibilidad cargada');
      return;
    }

    const resultado = db
      .prepare(
        `UPDATE existencia
         SET unidades_consumidas = unidades_consumidas + ?,
             fecha_hora_actualizacion = ?
         WHERE jornada_id = ? AND producto_id = ?
           AND unidades_asignadas - unidades_reservadas - unidades_consumidas >= ?`,
      )
      .run(cantidad, fechaHoraLocal(), jornada.id, productoId, cantidad);

    if (resultado.changes === 0) {
      res.status(400).send('El producto no tiene unidades disponibles para consumir');
      return;
    }

    res.redirect('/pedido');
  });

  return router;
}
