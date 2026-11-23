import { Router, type Request, type Response } from 'express';
import type { Db } from '../db/conexion';
import {
  fuenteEstaDisponible,
  type FuenteInventario,
} from '../integraciones/fuente-inventario';
import type {
  ResultadoPasarela,
  ServicioPago,
} from '../integraciones/pasarela-pago';
import {
  aceptarNuevoTotal,
  agregarProducto,
  actualizarCantidad,
  eliminarDetalle,
  obtenerPedido,
  revalidarPedido,
  type CambioDisponibilidad,
  type CambioPrecio,
  type PedidoVista,
} from '../servicios/pedido';
import {
  actualizarEstimacion,
  iniciarPago,
  obtenerPago,
  obtenerPagoConfirmado,
  obtenerPagoPendiente,
  obtenerPedidoPorCodigo,
  procesarResultadoPago,
  vencerReservaActiva,
} from '../servicios/pago';
import { leerCookie } from '../utiles/cookies';
import {
  alternativasParaVista,
  formatoPrecio,
  formatearFechaHora,
  renderizarCatalogo,
  type ErrorPedidoVista,
} from './catalogo';

const COOKIE_PEDIDO = 'pedido_id';

interface AvisoVista {
  titulo: string;
  mensaje: string;
  alternativas: ReturnType<typeof alternativasParaVista>;
}

interface ProductoDemo {
  id: number;
  nombre: string;
}

function leerPedidoId(req: Request): number | null {
  const valor = leerCookie(req.headers.cookie, COOKIE_PEDIDO);
  if (!valor) return null;

  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
}

function leerCantidad(valor: unknown): number | null {
  const texto = String(valor ?? '').trim();
  if (!/^\d+$/.test(texto)) return null;

  const cantidad = Number(texto);
  return Number.isSafeInteger(cantidad) && cantidad >= 1 ? cantidad : null;
}

function leerProductoId(valor: unknown): number | null {
  const texto = String(valor ?? '').trim();
  if (!/^\d+$/.test(texto)) return null;

  const productoId = Number(texto);
  return Number.isSafeInteger(productoId) && productoId > 0 ? productoId : null;
}

function prepararPedido(pedido: PedidoVista) {
  return {
    ...pedido,
    editable: pedido.estado === 'En edición',
    totalFormateado: formatoPrecio.format(pedido.total),
    codigo: pedido.codigo,
    estimacionTexto:
      pedido.estimacionPreparacion?.trim() || 'Estimación no disponible',
    fechaHoraConfirmacionFormateada: pedido.fechaHoraConfirmacion
      ? formatearFechaHora(pedido.fechaHoraConfirmacion)
      : null,
    detalles: pedido.detalles.map((detalle) => ({
      ...detalle,
      precioFormateado: formatoPrecio.format(detalle.precioUnitario),
      subtotalFormateado: formatoPrecio.format(detalle.subtotal),
    })),
  };
}

function productosDemo(db: Db): ProductoDemo[] {
  return db
    .prepare('SELECT id, nombre FROM producto ORDER BY nombre')
    .all() as ProductoDemo[];
}

function mostrarPedido(
  db: Db,
  res: Response,
  pedido: PedidoVista | null,
  aviso: AvisoVista | null = null,
  pagoPendienteId: number | null = null,
): void {
  res.status(200).render('pedido', {
    titulo: 'Mi pedido',
    pedido: pedido ? prepararPedido(pedido) : null,
    fuenteDisponible: fuenteEstaDisponible(db),
    aviso,
    productosDemo: productosDemo(db),
    pagoPendienteId,
  });
}

interface DatosCambios {
  precios: CambioPrecio[];
  disponibilidad: CambioDisponibilidad[];
  totalAnterior: number;
  totalNuevo: number;
  puedeAceptar: boolean;
}

function renderizarCambios(res: Response, datos: DatosCambios): void {
  res.status(200).render('pedido-cambios', {
    titulo: 'Revisa los cambios',
    precios: datos.precios.map((cambio) => ({
      nombre: cambio.nombre,
      anterior: formatoPrecio.format(cambio.precioAnterior),
      nuevo: formatoPrecio.format(cambio.precioNuevo),
    })),
    disponibilidad: datos.disponibilidad,
    totalAnterior: datos.totalAnterior,
    totalNuevo: datos.totalNuevo,
    totalAnteriorFormateado: formatoPrecio.format(datos.totalAnterior),
    totalNuevoFormateado: formatoPrecio.format(datos.totalNuevo),
    puedeAceptar: datos.puedeAceptar,
  });
}

function leerEnteroPositivo(valor: unknown): number | null {
  const texto = String(valor ?? '').trim();
  if (!/^\d+$/.test(texto)) return null;

  const numero = Number(texto);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
}

function esResultadoPasarela(valor: string): valor is ResultadoPasarela {
  return valor === 'aprobado' || valor === 'rechazado' || valor === 'cancelado';
}

function mostrarNoDisponible(db: Db, res: Response, motivo: string): void {
  res.status(200).render('no-disponible', {
    titulo: 'Catálogo',
    motivo,
    fuenteDisponible: fuenteEstaDisponible(db),
  });
}

function avisoCantidad(
  nombre: string,
  cantidadSolicitada: number,
  maximo: number,
  alternativas: ReturnType<typeof alternativasParaVista>,
): AvisoVista {
  return {
    titulo: 'Cantidad no disponible',
    mensaje:
      maximo === 0
        ? `${nombre} está agotado y no puede agregarse al pedido.`
        : `No puedes pedir ${cantidadSolicitada} ${
            cantidadSolicitada === 1 ? 'unidad' : 'unidades'
          } de ${nombre}: el máximo disponible es ${maximo}.`,
    alternativas,
  };
}

export function crearRutasPedido(
  db: Db,
  fuente: FuenteInventario,
  pasarela: ServicioPago,
): Router {
  const router = Router();

  router.get('/pedido', (req, res) => {
    const pedidoId = leerPedidoId(req);
    const pedido = pedidoId !== null ? obtenerPedido(db, pedidoId) : null;

    if (pedidoId !== null && !pedido) {
      res.clearCookie(COOKIE_PEDIDO, { path: '/' });
    }

    const pagoPendiente =
      pedido?.estado === 'Pendiente de pago'
        ? obtenerPagoPendiente(db, pedido.id)
        : null;

    mostrarPedido(db, res, pedido, null, pagoPendiente?.id ?? null);
  });

  router.post('/pedido/agregar', (req, res) => {
    const productoId = leerProductoId(req.body?.productoId);
    const cantidad = leerCantidad(req.body?.cantidad);

    if (productoId === null || cantidad === null) {
      renderizarCatalogo(db, fuente, res, {
        titulo: 'Datos incompletos',
        mensaje: 'Selecciona un producto e ingresa una cantidad entera mayor o igual a 1.',
        alternativas: [],
      });
      return;
    }

    const resultado = agregarProducto(db, fuente, {
      pedidoId: leerPedidoId(req),
      productoId,
      cantidad,
    });

    switch (resultado.tipo) {
      case 'ok':
        res.cookie(COOKIE_PEDIDO, String(resultado.pedidoId), {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        });
        res.redirect('/pedido');
        return;
      case 'noDisponible':
        mostrarNoDisponible(db, res, resultado.motivo);
        return;
      case 'cantidadInvalida':
        renderizarCatalogo(db, fuente, res, {
          titulo: 'Cantidad no válida',
          mensaje: 'La cantidad debe ser un número entero mayor o igual a 1.',
          alternativas: [],
        });
        return;
      case 'productoNoEncontrado':
        renderizarCatalogo(db, fuente, res, {
          titulo: 'Producto no disponible',
          mensaje: 'El producto seleccionado ya no está disponible en la jornada vigente.',
          alternativas: [],
        });
        return;
      case 'excedeDisponible':
        renderizarCatalogo(
          db,
          fuente,
          res,
          avisoCantidad(
            resultado.nombre,
            resultado.cantidadSolicitada,
            resultado.maximo,
            alternativasParaVista(resultado.alternativas),
          ),
        );
        return;
    }
  });

  router.post('/pedido/detalle/:productoId/actualizar', (req, res) => {
    const pedidoId = leerPedidoId(req);
    const productoId = leerProductoId(req.params.productoId);
    const cantidad = leerCantidad(req.body?.cantidad);

    if (pedidoId === null) {
      res.redirect('/pedido');
      return;
    }

    if (productoId === null || cantidad === null) {
      mostrarPedido(db, res, obtenerPedido(db, pedidoId), {
        titulo: 'Cantidad no válida',
        mensaje: 'La cantidad debe ser un número entero mayor o igual a 1.',
        alternativas: [],
      });
      return;
    }

    const resultado = actualizarCantidad(db, fuente, {
      pedidoId,
      productoId,
      cantidad,
    });

    switch (resultado.tipo) {
      case 'ok':
        res.redirect('/pedido');
        return;
      case 'sinPedido':
        res.clearCookie(COOKIE_PEDIDO, { path: '/' });
        res.redirect('/pedido');
        return;
      case 'detalleNoEncontrado':
        mostrarPedido(db, res, obtenerPedido(db, pedidoId), {
          titulo: 'Producto no encontrado',
          mensaje: 'El producto ya no forma parte del pedido.',
          alternativas: [],
        });
        return;
      case 'noDisponible':
        mostrarNoDisponible(db, res, resultado.motivo);
        return;
      case 'productoNoEncontrado':
        mostrarPedido(db, res, obtenerPedido(db, pedidoId), {
          titulo: 'Producto no disponible',
          mensaje: 'El producto ya no está disponible en la jornada vigente.',
          alternativas: [],
        });
        return;
      case 'cantidadInvalida':
        mostrarPedido(db, res, obtenerPedido(db, pedidoId), {
          titulo: 'Cantidad no válida',
          mensaje: 'La cantidad debe ser un número entero mayor o igual a 1.',
          alternativas: [],
        });
        return;
      case 'excedeDisponible':
        mostrarPedido(
          db,
          res,
          obtenerPedido(db, pedidoId),
          avisoCantidad(
            resultado.nombre,
            resultado.cantidadSolicitada,
            resultado.maximo,
            alternativasParaVista(resultado.alternativas),
          ),
        );
        return;
    }
  });

  router.post('/pedido/detalle/:productoId/eliminar', (req, res) => {
    const pedidoId = leerPedidoId(req);
    const productoId = leerProductoId(req.params.productoId);

    if (pedidoId === null || productoId === null) {
      res.redirect('/pedido');
      return;
    }

    const resultado = eliminarDetalle(db, pedidoId, productoId);

    if (resultado.tipo === 'ok' && resultado.pedidoEliminado) {
      res.clearCookie(COOKIE_PEDIDO, { path: '/' });
    }

    res.redirect('/pedido');
  });

  router.post('/pedido/revalidar', (req, res) => {
    const pedidoId = leerPedidoId(req);

    if (pedidoId === null) {
      res.redirect('/pedido');
      return;
    }

    const resultado = revalidarPedido(db, fuente, pedidoId);

    switch (resultado.tipo) {
      case 'listo':
        res.status(200).render('pedido-listo', {
          titulo: 'Pedido listo para pagar',
          pedido: prepararPedido(resultado.pedido),
        });
        return;
      case 'cambios':
        renderizarCambios(res, {
          precios: resultado.precios,
          disponibilidad: resultado.disponibilidad,
          totalAnterior: resultado.totalAnterior,
          totalNuevo: resultado.totalNuevo,
          puedeAceptar: resultado.disponibilidad.length === 0,
        });
        return;
      case 'sinPedido':
        res.clearCookie(COOKIE_PEDIDO, { path: '/' });
        res.redirect('/pedido');
        return;
      case 'noDisponible':
        mostrarNoDisponible(db, res, resultado.motivo);
        return;
    }
  });

  router.post('/pedido/aceptar-total', (req, res) => {
    const pedidoId = leerPedidoId(req);

    if (pedidoId === null) {
      res.redirect('/pedido');
      return;
    }

    const resultado = aceptarNuevoTotal(db, fuente, pedidoId);

    switch (resultado.tipo) {
      case 'listo':
        res.status(200).render('pedido-listo', {
          titulo: 'Pedido listo para pagar',
          pedido: prepararPedido(resultado.pedido),
        });
        return;
      case 'disponibilidad':
        renderizarCambios(res, {
          precios: [],
          disponibilidad: resultado.disponibilidad,
          totalAnterior: resultado.pedido.total,
          totalNuevo: resultado.pedido.total,
          puedeAceptar: false,
        });
        return;
      case 'sinPedido':
        res.clearCookie(COOKIE_PEDIDO, { path: '/' });
        res.redirect('/pedido');
        return;
      case 'noDisponible':
        mostrarNoDisponible(db, res, resultado.motivo);
        return;
    }
  });

  router.post('/pedido/pagar', (req, res) => {
    const pedidoId = leerPedidoId(req);

    if (pedidoId === null) {
      res.redirect('/pedido');
      return;
    }

    const resultado = iniciarPago(db, fuente, pasarela, pedidoId);

    switch (resultado.tipo) {
      case 'ok':
        res.redirect(`/demo/pasarela/${resultado.pagoId}`);
        return;
      case 'cambios':
        renderizarCambios(res, {
          precios: resultado.precios,
          disponibilidad: resultado.disponibilidad,
          totalAnterior: resultado.totalAnterior,
          totalNuevo: resultado.totalNuevo,
          puedeAceptar: resultado.disponibilidad.length === 0,
        });
        return;
      case 'disponibilidad':
        renderizarCambios(res, {
          precios: [],
          disponibilidad: resultado.disponibilidad,
          totalAnterior: resultado.pedido.total,
          totalNuevo: resultado.pedido.total,
          puedeAceptar: false,
        });
        return;
      case 'noDisponible':
        mostrarNoDisponible(db, res, resultado.motivo);
        return;
      case 'sinPedido':
        res.clearCookie(COOKIE_PEDIDO, { path: '/' });
        res.redirect('/pedido');
        return;
    }
  });

  router.post('/pedido/reintentar', (req, res) => {
    const pedidoId = leerPedidoId(req);

    if (pedidoId === null) {
      res.redirect('/pedido');
      return;
    }

    const resultado = iniciarPago(db, fuente, pasarela, pedidoId);

    switch (resultado.tipo) {
      case 'ok':
        res.redirect(`/demo/pasarela/${resultado.pagoId}`);
        return;
      case 'cambios':
        renderizarCambios(res, {
          precios: resultado.precios,
          disponibilidad: resultado.disponibilidad,
          totalAnterior: resultado.totalAnterior,
          totalNuevo: resultado.totalNuevo,
          puedeAceptar: resultado.disponibilidad.length === 0,
        });
        return;
      case 'disponibilidad':
        renderizarCambios(res, {
          precios: [],
          disponibilidad: resultado.disponibilidad,
          totalAnterior: resultado.pedido.total,
          totalNuevo: resultado.pedido.total,
          puedeAceptar: false,
        });
        return;
      case 'noDisponible':
        mostrarNoDisponible(db, res, resultado.motivo);
        return;
      case 'sinPedido':
        res.redirect('/pedido');
        return;
    }
  });

  router.get('/demo/pasarela/:pagoId', (req, res) => {
    const pagoId = leerEnteroPositivo(req.params.pagoId);
    if (pagoId === null) {
      res.status(404).send('Pago no encontrado');
      return;
    }

    const pago = obtenerPago(db, pagoId);
    if (!pago) {
      res.status(404).send('Pago no encontrado');
      return;
    }

    if (pago.resultado === 'confirmado') {
      res.redirect(`/pedido/confirmacion/${pago.pedidoId}`);
      return;
    }

    if (pago.resultado === 'rechazado') {
      res.redirect(`/pedido/pago-no-realizado/${pago.pedidoId}?motivo=rechazado`);
      return;
    }

    const pedidoActual = obtenerPedido(db, pago.pedidoId);
    if (
      pedidoActual?.estado === 'En conciliación' ||
      pedidoActual?.estado === 'Reembolsado'
    ) {
      res.redirect(`/pedido/conciliacion/${pago.pedidoId}`);
      return;
    }

    if (!pago.referenciaPasarela) {
      res.status(409).send('El pago no tiene una referencia de pasarela');
      return;
    }

    res.status(200).render('pasarela', {
      titulo: 'Pasarela de pago simulada',
      pagoId: pago.id,
      pedidoId: pago.pedidoId,
      monto: pago.monto,
      montoFormateado: formatoPrecio.format(pago.monto),
      referencia: pago.referenciaPasarela,
    });
  });

  router.post('/demo/pasarela/:pagoId/enviar', (req, res) => {
    const pagoId = leerEnteroPositivo(req.params.pagoId);
    const referencia = String(req.body?.referencia ?? '').trim();

    if (pagoId === null || !referencia) {
      res.status(400).send('Envío de pago no válido');
      return;
    }

    const pago = obtenerPago(db, pagoId);
    if (!pago) {
      res.status(404).send('Pago no encontrado');
      return;
    }
    if (pago.resultado !== 'pendiente') {
      res.status(409).send('El pago ya fue procesado');
      return;
    }
    if (pago.referenciaPasarela !== referencia) {
      res.status(400).send('La referencia no corresponde a este pago');
      return;
    }

    pasarela.registrarEnvio(referencia);
    res.status(200).render('pasarela-resultado', {
      titulo: 'Pasarela de pago (simulada)',
      pagoId: pago.id,
      pedidoId: pago.pedidoId,
      monto: pago.monto,
      montoFormateado: formatoPrecio.format(pago.monto),
      referencia: pago.referenciaPasarela,
    });
  });

  router.post('/demo/pasarela/:pagoId/resultado', (req, res) => {
    const pagoId = leerEnteroPositivo(req.params.pagoId);
    const resultado = String(req.body?.resultado ?? '').trim();
    const referencia = String(req.body?.referencia ?? '').trim();

    if (pagoId === null || !esResultadoPasarela(resultado) || !referencia) {
      res.status(400).send('Resultado de pago no válido');
      return;
    }

    const pago = obtenerPago(db, pagoId);
    if (!pago) {
      res.status(404).send('Pago no encontrado');
      return;
    }

    if (!pasarela.verificarEnvio(referencia)) {
      res.status(409).send('El pago aún no fue enviado a la pasarela');
      return;
    }

    pasarela.registrarResultado(referencia, resultado);
    const verificado = pasarela.verificarResultado(referencia) ?? resultado;
    const proceso = procesarResultadoPago(db, {
      pagoId,
      referencia,
      resultado: verificado,
    });

    switch (proceso.tipo) {
      case 'confirmado':
        res.redirect(`/pedido/confirmacion/${pago.pedidoId}`);
        return;
      case 'noRealizado':
        res.redirect(
          `/pedido/pago-no-realizado/${pago.pedidoId}?motivo=${proceso.resultado}`,
        );
        return;
      case 'enConciliacion':
      case 'reembolsado':
        res.redirect(`/pedido/conciliacion/${pago.pedidoId}`);
        return;
      case 'pagoNoEncontrado':
        res.status(404).send('Pago no encontrado');
        return;
      case 'referenciaInvalida':
        res.status(400).send('La referencia no corresponde a este pago');
        return;
      case 'sinReservaActiva':
        res.status(409).send('La reserva ya no está activa. Vuelve a iniciar el pago.');
        return;
      case 'estadoInesperado':
        res.status(409).send('El pago no se puede procesar en el estado actual.');
        return;
    }
  });

  router.get('/pedido/pago-no-realizado/:pedidoId', (req, res) => {
    const pedidoId = leerEnteroPositivo(req.params.pedidoId);
    const pedido = pedidoId !== null ? obtenerPedido(db, pedidoId) : null;

    if (!pedido) {
      res.status(404).send('Pedido no encontrado');
      return;
    }

    if (pedido.estado !== 'Pago no realizado') {
      res.redirect('/pedido');
      return;
    }

    const motivo = req.query.motivo === 'cancelado' ? 'cancelado' : 'rechazado';

    res.status(200).render('pago-no-realizado', {
      titulo: motivo === 'cancelado' ? 'Pago cancelado' : 'Pago rechazado',
      motivo,
      pedido: prepararPedido(pedido),
    });
  });

  router.post('/demo/reserva/:pedidoId/vencer', (req, res) => {
    const pedidoId = leerEnteroPositivo(req.params.pedidoId);
    if (pedidoId === null) {
      res.status(400).send('Pedido no válido');
      return;
    }

    vencerReservaActiva(db, pedidoId);
    res.redirect('/pedido');
  });

  router.get('/pedido/conciliacion/:pedidoId', (req, res) => {
    const pedidoId = leerEnteroPositivo(req.params.pedidoId);
    const pedido = pedidoId !== null ? obtenerPedido(db, pedidoId) : null;

    if (!pedido) {
      res.status(404).send('Pedido no encontrado');
      return;
    }
    if (
      pedido.estado !== 'En conciliación' &&
      pedido.estado !== 'Reembolsado'
    ) {
      res.redirect('/pedido');
      return;
    }

    const conciliacion = db
      .prepare(
        `SELECT c.estado AS estado, c.motivo AS motivo,
                c.referencia_reversa AS referenciaReversa, c.fecha_hora AS fechaHora
         FROM conciliacion c JOIN pago p ON p.id = c.pago_id
         WHERE p.pedido_id = ? ORDER BY c.id DESC LIMIT 1`,
      )
      .get(pedido.id) as
      | {
          estado: string;
          motivo: string;
          referenciaReversa: string | null;
          fechaHora: string;
        }
      | undefined;

    res.status(200).render('conciliacion', {
      titulo:
        pedido.estado === 'Reembolsado'
          ? 'Pago en resolución — reembolsado'
          : 'Pago en resolución',
      pedido: prepararPedido(pedido),
      estadoPedido: pedido.estado,
      motivo: conciliacion?.motivo ?? 'pago aprobado tardío',
      referenciaReversa: conciliacion?.referenciaReversa ?? null,
      fechaHora: conciliacion?.fechaHora ?? null,
    });
  });

  router.get('/pedido/confirmacion/:pedidoId', (req, res) => {
    const pedidoId = leerEnteroPositivo(req.params.pedidoId);
    const pedido = pedidoId !== null ? obtenerPedido(db, pedidoId) : null;

    if (!pedido) {
      res.status(404).send('Pedido no encontrado');
      return;
    }

    if (pedido.estado !== 'Confirmado') {
      res.redirect('/pedido');
      return;
    }

    res.status(200).render('pedido-confirmado', {
      titulo: 'Pedido confirmado',
      pedido: prepararPedido(pedido),
    });
  });

  router.post('/pedido/confirmacion/:pedidoId/repetir', (req, res) => {
    const pedidoId = leerEnteroPositivo(req.params.pedidoId);
    const pedido = pedidoId !== null ? obtenerPedido(db, pedidoId) : null;

    if (!pedido || pedido.estado !== 'Confirmado') {
      res.redirect('/pedido');
      return;
    }

    const pago = obtenerPagoConfirmado(db, pedido.id);
    if (!pago) {
      res.redirect(`/pedido/confirmacion/${pedido.id}`);
      return;
    }

    const verificado =
      pasarela.verificarResultado(pago.referenciaPasarela) ?? 'aprobado';

    procesarResultadoPago(db, {
      pagoId: pago.id,
      referencia: pago.referenciaPasarela,
      resultado: verificado,
    });

    res.redirect(`/pedido/confirmacion/${pedido.id}`);
  });

  router.get('/pedido/consultar', (_req, res) => {
    res.status(200).render('consultar-pedido', {
      titulo: 'Consultar pedido',
      codigo: '',
      pedido: null,
      error: null,
    });
  });

  router.post('/pedido/consultar', (req, res) => {
    const codigo = String(req.body?.codigo ?? '').trim();
    const pedido = codigo ? obtenerPedidoPorCodigo(db, codigo) : null;

    res.status(200).render('consultar-pedido', {
      titulo: 'Consultar pedido',
      codigo,
      pedido: pedido ? prepararPedido(pedido) : null,
      error: pedido
        ? null
        : codigo
          ? 'No se encontró un pedido con ese código.'
          : 'Ingresa un código de retiro.',
    });
  });

  router.post('/demo/estimacion', (req, res) => {
    const pedidoId = leerEnteroPositivo(req.body?.pedidoId);
    const texto = String(req.body?.texto ?? '').trim();

    if (pedidoId === null || !texto) {
      res.status(400).send('Datos de demostración no válidos');
      return;
    }

    if (!actualizarEstimacion(db, pedidoId, texto)) {
      res.status(400).send('El pedido debe estar confirmado para fijar la estimación');
      return;
    }

    res.redirect(`/pedido/confirmacion/${pedidoId}`);
  });

  return router;
}
