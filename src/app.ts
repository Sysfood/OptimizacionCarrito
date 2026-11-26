import path from 'node:path';
import express from 'express';
import type { Db } from './db/conexion';
import { crearFuenteInventarioSimulada } from './integraciones/fuente-inventario';
import { crearPasarelaPagoSimulada } from './integraciones/pasarela-pago';
import { crearPoliticaDeudaSimulada } from './integraciones/politica-deuda';
import { crearRutasCatalogo, formatoPrecio } from './rutas/catalogo';
import { crearRutasDemo } from './rutas/demo';
import { crearRutasDeuda } from './rutas/deuda';
import { crearRutasPedido } from './rutas/pedido';
import { leerCookies } from './utiles/cookies';
import { CONTACTO_CLIENTE_VIP_DEMO } from './dominio/cliente';

const ROLES_VALIDOS = ['estudiante', 'vip', 'vendedor', 'encargado'];

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

    // La banda del cliente VIP muestra su deuda actual en todas las pantallas.
    res.locals.deudaVipFormateada = '';
    if (rol === 'vip') {
      const fila = db
        .prepare('SELECT deuda FROM cliente WHERE contacto = ?')
        .get(CONTACTO_CLIENTE_VIP_DEMO) as { deuda: number } | undefined;
      res.locals.deudaVipFormateada = formatoPrecio.format(fila?.deuda ?? 0);
    }

    next();
  });

  const fuente = crearFuenteInventarioSimulada(db);
  const pasarela = crearPasarelaPagoSimulada();
  const politicaDeuda = crearPoliticaDeudaSimulada(db);

  app.use(crearRutasCatalogo(db, fuente));
  app.use(crearRutasPedido(db, fuente, pasarela, politicaDeuda));
  app.use(crearRutasDeuda(db));
  app.use('/demo', crearRutasDemo(db));

  app.use((_req, res) => {
    res.status(404).send('Página no encontrada');
  });

  return app;
}
