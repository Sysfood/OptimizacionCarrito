# Design — HU-01 Consultar disponibilidad antes de desplazarse

## Context

Ver `proposal.md` para la motivación. El repositorio no tiene aplicación todavía: este cambio crea la base del proyecto TypeScript + Express + EJS + SQLite confirmada en `.cin324/proyecto.md`. La única fuente de verdad funcional es la ficha `.cin324/historias/HU-01.md` y la especificación `specs/catalogo-disponibilidad/spec.md`.

## Goals / Non-Goals

**Goals:**
- Servir el catálogo del estudiante con nombre, precio, unidades vendibles y fecha/hora de actualización.
- Calcular las unidades vendibles a partir de `Existencia`, sin duplicar el dato.
- Simular la fuente de inventario para poder demostrar el estado «no verificable».
- Dejar la estructura y las pruebas listas para las historias siguientes (HU-02 en adelante).

**Non-Goals:**
- Carrito, pedidos, pagos, reservas y avisos (HU-02 a HU-07).
- Cargar, ajustar o cerrar la disponibilidad (HU-08) y el reporte de ventas (HU-09).
- Autenticación real, requisitos no funcionales distintos del refresco visible y la integración real con el software de ventas.

## Decisions

### 1. Arquitectura y estructura

Aplicación única Express con renderizado en el servidor mediante EJS. `src/app.ts` crea la app (sin escuchar el puerto, para las pruebas) y `src/server.ts` la arranca. Estructura:

```text
src/
  app.ts                  # crea la app Express y registra rutas y middleware
  server.ts               # arranca el servidor en el puerto 3000
  db/
    conexion.ts           # abre SQLite, aplica migraciones y expone prepare/run/all/get
    migrations/001_inicial.sql
    seed.ts               # datos de ejemplo idempotentes
  dominio/
    existencia.ts         # tipo Existencia y cálculo de unidadesVendibles
    producto.ts, jornada.ts, carrito.ts
  servicios/
    catalogo.ts           # consulta de catálogo y estado de disponibilidad
  integraciones/
    fuente-inventario.ts  # interfaz FuenteInventario + versión simulada
  rutas/
    catalogo.ts           # GET /catalogo
    demo.ts               # POST /demo/rol, POST /demo/fuente-inventario
  vistas/
    layout.ejs, catalogo.ejs, no-disponible.ejs
tests/
  hu-01-consultar-disponibilidad.test.ts
```

Alternativa descartada: SPA con API JSON. El curso pide una aplicación web sencilla y el renderizado en servidor simplifica formularios, pruebas y despliegue local.

### 2. Tablas derivadas del modelo de dominio

Solo se crean las entidades que esta historia necesita. Las demás clases del modelo (`Cliente`, `Pedido`, `DetallePedido`, `Pago`, `Reserva`, `Aviso`, `AjusteExistencia`) se agregarán en las migraciones de sus historias.

| Clase del modelo | Tabla | Columnas | Notas |
|---|---|---|---|
| Carrito | `carrito` | `id`, `nombre`, `ubicacion` | — |
| Jornada | `jornada` | `id`, `carrito_id`, `fecha`, `hora_apertura`, `hora_cierre`, `recepcion_digital` | FK a `carrito`; `recepcion_digital` 0/1 |
| Producto | `producto` | `id`, `nombre`, `precio` | `precio` entero en CLP, sin decimales |
| Existencia | `existencia` | `id`, `jornada_id`, `producto_id`, `unidades_asignadas`, `unidades_reservadas`, `unidades_consumidas`, `fecha_hora_actualizacion` | FK a `jornada` y `producto`; único (`jornada_id`, `producto_id`) |
| — | `schema_migrations` | `version`, `aplicada_en` | Control de migraciones |

`/unidadesVendibles` no se almacena: se calcula como `unidades_asignadas - unidades_reservadas - unidades_consumidas` en la consulta, tal como define el modelo de dominio.

### 3. Jornada vigente y disponibilidad

El catálogo muestra las existencias de la jornada más reciente del carrito (mayor `fecha`). Los datos de ejemplo crean una jornada abierta para la fecha actual con cuatro productos: tres con unidades y uno con `unidades_asignadas = 0`.

Si no hay jornada con existencias, se trata como disponibilidad no verificable. La recepción cerrada (`recepcion_digital = 0`) no se evalúa en esta historia: bloquear nuevos pagos es comportamiento de HU-08.

### 4. Fuente de inventario simulada

La interfaz `FuenteInventario` expone `consultarExistencias(jornadaId): ResultadoDisponibilidad`, donde el resultado es `{ tipo: 'ok', existencias }` o `{ tipo: 'noDisponible' }`.

La versión simulada lee la tabla `existencia` y consulta una tabla `configuracion` con la clave `fuente_inventario_disponible` (1 por defecto). El control de demostración `POST /demo/fuente-inventario` alterna ese valor; cuando es 0, la fuente responde `noDisponible`. Esto representa la integración pendiente con el software de ventas (Derivación 3) sin inventar una API real.

Alternativa descartada: usar un parámetro de URL (`?simularCaida=1`), porque no persiste y no permite que el escenario sea reproducible al navegar.

### 5. Rutas y flujo

El flujo se reconstruyó desde el Gherkin (no existe DSS de CU-01).

| Ruta | Uso | Respuesta |
|---|---|---|
| `GET /catalogo` | Consultar catálogo (CU-01) | HTML con productos, unidades vendibles, fecha/hora de actualización y aviso si no es verificable |
| `POST /demo/rol` | Selector de rol de demostración | Guarda el rol en una cookie y redirige |
| `POST /demo/fuente-inventario` | Alternar fuente simulada | Cambia `configuracion` y redirige al catálogo |

La vista se refresca con un `setTimeout` de 5 segundos que recarga la página, para hacer observable la meta de RP-14. No se implementa una API JSON ni websockets.

### 6. Presentación de la disponibilidad

- Producto con unidades vendibles > 0: muestra nombre, precio formateado, «N unidades vendibles» y la fecha/hora (`dd/mm/aaaa hh:mm`).
- Producto con 0 unidades: etiqueta **Agotado** y sin enlace ni botón para agregarlo. La acción de agregar llega en HU-02.
- Fuente no disponible: banner **«Disponibilidad no verificable»**, la lista no se muestra como vigente y no aparece ninguna acción de pago (el pago llega en HU-03).

### 7. Pruebas

Una prueba por escenario Gherkin en `tests/hu-01-consultar-disponibilidad.test.ts`, con SQLite en memoria y `supertest`:

1. Catálogo con productos: nombres, precios, unidades vendibles y fecha/hora.
2. Producto agotado: etiqueta «Agotado» y sin acción de agregar.
3. Fuente no disponible: banner «Disponibilidad no verificable».
4. Cambio de inventario: se actualiza `unidades_consumidas` directamente en la base y la siguiente consulta muestra 2 unidades vendibles (se usa el refresco de 5 s como comportamiento observable, sin medir el SLA).

### 8. Riesgos de instalación

`better-sqlite3` es un módulo nativo y Node 26 es muy reciente. Si falla la compilación, `src/db/conexion.ts` usará el módulo integrado `node:sqlite` (`DatabaseSync`) detrás de la misma interfaz `prepare/run/all/get`; el resto del código y las pruebas no cambian.

## Risks / Trade-offs

- **Datos de ejemplo con precios y nombres inventados** → se documentan en el `README.md` y en el `seed`; no representan un acuerdo con el vendedor.
- **El refresco de 5 s recarga la página completa** → es simple y suficiente para una demostración; si más adelante molesta, se puede cambiar por una consulta parcial sin afectar la especificación.
- **La fuente simulada no valida una integración real** → está declarada como simulación y la Derivación 3 sigue pendiente en los requisitos.
- **El PNG del modelo de dominio no incluye aún `fechaHoraActualizacion`** → el fuente `.puml` es el vigente; se regenerará cuando haya PlantUML disponible.

## Migration Plan

1. `npm install`.
2. `npm run db:seed` crea `data/app.db`, aplica `001_inicial.sql` y carga los datos de ejemplo.
3. `npm run dev` sirve `http://localhost:3000/catalogo`.
4. Reversión de la demostración: borrar `data/app.db` y volver a ejecutar `npm run db:seed`.

## Open Questions

Ninguna que afecte esta historia. La relación entre recepción cerrada y catálogo se definirá en HU-08.
