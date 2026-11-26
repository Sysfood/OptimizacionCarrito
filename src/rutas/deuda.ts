import { Router } from 'express';
import type { Db } from '../db/conexion';
import { CLAVE_DEUDA_MAXIMA } from '../integraciones/politica-deuda';
import { clienteDelRol, consultarDeuda } from '../servicios/deuda';
import { formatearFechaHora, formatoPrecio } from './catalogo';

/** HU-12: consulta de la deuda del cliente VIP. */
export function crearRutasDeuda(db: Db): Router {
  const router = Router();

  router.get('/deuda', (_req, res) => {
    const rol = String(res.locals.rol ?? 'estudiante');
    const cliente = clienteDelRol(db, rol);
    const resultado = consultarDeuda(db, cliente.id);

    if (resultado.tipo !== 'ok') {
      res.status(403).render('no-vip', {
        titulo: 'Deuda',
        mensaje: 'La consulta de deuda es exclusiva de los clientes VIP.',
      });
      return;
    }

    const maxima = db
      .prepare('SELECT valor FROM configuracion WHERE clave = ?')
      .get(CLAVE_DEUDA_MAXIMA) as { valor: string } | undefined;

    res.status(200).render('deuda', {
      titulo: 'Mi deuda',
      deuda: resultado.deuda,
      deudaFormateada: formatoPrecio.format(resultado.deuda),
      deudaMaximaFormateada: maxima ? formatoPrecio.format(Number(maxima.valor)) : null,
      movimientos: resultado.movimientos.map((movimiento) => ({
        tipo: movimiento.tipo,
        pedidoId: movimiento.pedidoId,
        montoFormateado: formatoPrecio.format(movimiento.monto),
        fechaHoraFormateada: formatearFechaHora(movimiento.fechaHora),
      })),
    });
  });

  return router;
}
