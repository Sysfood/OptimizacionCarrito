import path from 'node:path';
import express from 'express';
import type { Db } from './db/conexion';
import { crearFuenteInventarioSimulada } from './integraciones/fuente-inventario';
import { crearPasarelaPagoSimulada } from './integraciones/pasarela-pago';
import { crearRutasCatalogo } from './rutas/catalogo';
import { crearRutasDemo } from './rutas/demo';
import { crearRutasPedido } from './rutas/pedido';
import { leerCookies } from './utiles/cookies';

const ROLES_VALIDOS = ['estudiante', 'vendedor', 'encargado'];

export function crearApp(db: Db) {
  const app = express();

  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', path.join(process.cwd(), 'src', 'vistas'));

  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const cookies = leerCookies(req.headers.cookie);
    const rol = ROLES_VALIDOS.includes(cookies.rol ?? '') ? cookies.rol : 'estudiante';
    res.locals.rol = rol;
    next();
  });

  const fuente = crearFuenteInventarioSimulada(db);
  const pasarela = crearPasarelaPagoSimulada();

  app.use(crearRutasCatalogo(db, fuente));
  app.use(crearRutasPedido(db, fuente, pasarela));
  app.use('/demo', crearRutasDemo(db));

  app.use((_req, res) => {
    res.status(404).send('Página no encontrada');
  });

  return app;
}
