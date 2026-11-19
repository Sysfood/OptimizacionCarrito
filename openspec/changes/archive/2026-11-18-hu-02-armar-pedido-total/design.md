# Design — HU-02 Armar un pedido y conocer su total

## Context

Ver `proposal.md` para la motivación. La aplicación de HU-01 ya tiene Express + EJS, SQLite con migraciones numeradas, un catálogo de solo lectura y pruebas con Vitest/supertest. Este cambio agrega la primera escritura del dominio: un pedido en edición con sus detalles.

La fuente funcional es `.cin324/historias/HU-02.md` y la especificación `specs/armado-pedido/spec.md`. No existe un DSS del armado del pedido: el flujo se reconstruye desde el Gherkin y CU-02. DSS-01 describe el pago con reserva y se usará en HU-03/HU-04. EST-01 ya incluye el estado inicial **En edición** agregado en la validación de la historia.

## Goals / Non-Goals

**Goals:**
- Persistir un pedido en edición con cliente, jornada y detalles.
- Permitir agregar, modificar y eliminar productos, calculando subtotales y total.
- Validar cada cantidad contra las unidades vendibles y ofrecer alternativas sin reemplazos automáticos.
- Revalidar precio y disponibilidad antes de dejar el pedido listo para pagar.
- Dejar rutas, servicios y pruebas listos para que HU-03 agregue el pago.

**Non-Goals:**
- Pago, pasarela, reserva de unidades, código de retiro, confirmación y estimación (HU-03/HU-04).
- Concurrencia entre compradores, bloqueo de stock y reservas atómicas (HU-04).
- Cargo de empaque (HU-10), administración de disponibilidad (HU-08) y autenticación real.
- Requisitos no funcionales de rendimiento, seguridad y disponibilidad; RP-17 se usa solo como guía de diseño.

## Decisions

### 1. Módulos y reutilización

Se mantiene la arquitectura de HU-01: una app Express con renderizado en servidor y servicios que reciben `Db`.

```text
src/
  dominio/pedido.ts          # tipos EstadoPedido, Pedido, DetallePedido y cálculo de totales
  servicios/pedido.ts        # crear/leer pedido, agregar/modificar/eliminar, revalidar
  servicios/catalogo.ts      # se extrae obtenerJornadaVigente para compartirla
  rutas/pedido.ts            # pantallas y acciones del pedido
  rutas/demo.ts              # controles de precio y consumo de unidades
  utiles/cookies.ts          # lectura de cookies compartida con app.ts
  vistas/pedido.ejs
  vistas/pedido-cambios.ejs
  vistas/pedido-listo.ejs
tests/
  hu-02-armar-pedido-total.test.ts
  pedido-unidad.test.ts
```

`obtenerCatalogo` y el nuevo servicio de pedido deben usar la misma jornada vigente: la más reciente con existencias cargadas. Para eso se extrae `obtenerJornadaVigente(db)` del servicio de catálogo y se reutiliza. Alternativa descartada: duplicar la consulta de jornada en el servicio de pedido, porque las dos pantallas podrían mostrar jornadas distintas.

### 2. Tablas derivadas del modelo de dominio

Migración `src/db/migrations/002_pedidos.sql`:

| Clase del modelo | Tabla | Columnas | Notas |
|---|---|---|---|
| Cliente | `cliente` | `id`, `nombre`, `contacto` | Datos de ejemplo con un cliente de demostración |
| Pedido | `pedido` | `id`, `cliente_id`, `jornada_id`, `estado`, `codigo`, `estimacion_preparacion`, `fecha_hora_confirmacion`, `fecha_hora_listo`, `fecha_hora_entrega` | FK a `cliente` y `jornada`; `codigo` único y nullable; `estado` con los valores de EST-01 |
| DetallePedido | `detalle_pedido` | `id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario` | FK a `pedido` (borrado en cascada) y `producto`; único (`pedido_id`, `producto_id`); `cantidad > 0`; `precio_unitario >= 0` |

- `/subtotal` y `/total` no se almacenan: se calculan como `cantidad × precio_unitario` y la suma de los subtotales, tal como define el modelo.
- Las columnas `codigo`, `estimacion_preparacion` y las fechas quedan nulas hasta HU-03; se crean ahora porque pertenecen a la clase Pedido y evitarán otra migración.
- `estado` acepta los valores de EST-01: `En edición`, `Pendiente de pago`, `Confirmado`, `Pago no realizado`, `En conciliación`, `En preparación`, `Listo para retiro`, `Entregado` y `Reembolsado`.
- No se crean `pago` ni `reserva`; llegan con HU-03/HU-04.
- El seed agrega un `Cliente` de demostración (`Estudiante de demostración`) de forma idempotente.

Alternativa descartada: guardar el pedido solo en una cookie o en memoria. El modelo define Pedido desde que se arma y el Gherkin habla de un pedido preparado; persistirlo permite modificarlo entre pantallas y deja la base para HU-03.

### 3. Ciclo de vida del pedido en edición

- Al agregar el primer producto se crea un `Pedido` con estado **En edición**, asociado al cliente de demostración y a la jornada vigente.
- La cookie `pedido_id` (HttpOnly, SameSite=Lax, Path=/) identifica el pedido en edición de ese navegador.
- Si la cookie falta, apunta a un pedido inexistente o a un pedido que ya no está en edición, la siguiente acción de agregar crea uno nuevo.
- Si se elimina el último detalle, se elimina el pedido y se borra la cookie, porque el modelo exige `Pedido 1 – 1..* DetallePedido`. La pantalla muestra un pedido vacío.
- Sin jornada con existencias, se aplica el mismo aviso de disponibilidad no verificable de HU-01 y no se crea el pedido.
- Un solo cliente de demostración: no hay autenticación real y el selector de rol sigue siendo la forma de demostrar roles. Alternativa descartada: crear un cliente por sesión, porque agrega complejidad sin un requisito que lo pida.

### 4. Validación de cantidades y alternativas

- Unidades disponibles = `/unidadesVendibles` de la existencia de la jornada vigente.
- Si la cantidad solicitada supera lo disponible, se rechaza la operación y se informa el máximo. La cantidad anterior del detalle no se modifica.
- Si el producto ya está en el pedido, la nueva cantidad se suma a la existente y se valida el total resultante. El detalle conserva el `precio_unitario` con el que se agregó; la revalidación se encarga de los cambios de precio.
- Las alternativas son otros productos con unidades vendibles mayores que cero, excluyendo el producto afectado. No se incorporan ni se reemplazan sin una acción del estudiante.
- La cantidad mínima es 1. Para quitar un producto se usa la acción **Eliminar**.
- El catálogo muestra un formulario de cantidad y el botón **Agregar** solo para productos no agotados; el producto agotado conserva la etiqueta de HU-01.

### 5. Revalidación antes del pago

Al pulsar **Continuar al pago**, el servicio recorre los detalles y compara:

1. `precio_unitario` con el precio actual del producto.
2. `cantidad` con las unidades vendibles actuales.

- Si el precio cambió, se informa el producto, el precio anterior y el nuevo, y se muestra el nuevo total.
- Si la disponibilidad ya no cubre la cantidad (incluido el caso de 0 unidades), se informa cuántas unidades quedan y se pide ajustar la cantidad o eliminar el producto. No se reduce la cantidad automáticamente.
- Si no hay cambios, el pedido queda **listo para pagar**. La pantalla lo indica y aclara que el pago se implementa en HU-03.
- Si hay cambios, no se habilita el pago; se muestra `pedido-cambios.ejs` con el detalle y el botón **Aceptar nuevo total**.
- **Aceptar nuevo total** actualiza `precio_unitario` a los precios vigentes y vuelve a validar disponibilidad. Si la disponibilidad no alcanza, no se acepta y se pide ajustar. Si todo es válido, el pedido queda listo para pagar.
- Un cambio de disponibilidad que todavía cubre la cantidad pedida no bloquea el pedido, porque no altera el total ni la selección. La revalidación se enfoca en los cambios que afectan lo que el estudiante va a pagar.
- La aceptación no cambia el estado del pedido: sigue en **En edición**. La transición a **Pendiente de pago** ocurre en HU-03 al iniciar el pago, según EST-01.

Alternativa descartada: ajustar automáticamente la cantidad al máximo disponible. El Gherkin pide que el estudiante decida y no acepta reemplazos ni cambios sin su decisión.

### 6. Rutas y flujo reconstruido

No hay DSS del armado; las rutas se derivan del Gherkin y de CU-02.

| Ruta | Uso | Respuesta |
|---|---|---|
| `GET /pedido` | Ver el pedido en edición | HTML con detalles, subtotales, total y estado vacío |
| `POST /pedido/agregar` | Agregar un producto con cantidad | Redirige a `/pedido` o vuelve con error, máximo y alternativas |
| `POST /pedido/detalle/:productoId/actualizar` | Cambiar la cantidad | Redirige a `/pedido` o vuelve con error |
| `POST /pedido/detalle/:productoId/eliminar` | Quitar un producto | Redirige a `/pedido`; si era el último, borra el pedido |
| `POST /pedido/revalidar` | Revisar antes del pago | `pedido-cambios` o `pedido-listo` |
| `POST /pedido/aceptar-total` | Aceptar precios nuevos | Vuelve a validar y muestra `pedido-listo` o el error |

El encabezado agrega un enlace **Mi pedido**. La vista del catálogo conserva el refresco de 5 segundos y el panel de la fuente de inventario.

### 7. Controles de demostración

En la pantalla del pedido se agrega un panel de demostración con dos acciones, separadas de la operación normal:

- **Cambiar precio:** selecciona un producto y fija un nuevo precio, actualizando `producto.precio`.
- **Consumir unidades:** selecciona un producto y suma 1 a `unidades_consumidas` (sin superar las unidades asignadas), actualizando `fecha_hora_actualizacion`.

Ambas acciones existen solo para reproducir el escenario de revalidación y se rotulan como demostración. No representan funciones del vendedor; los ajustes reales son HU-08. Alternativa descartada: depender solo de cambios manuales en SQLite, porque el estudiante necesita probar el escenario desde la interfaz.

### 8. Pruebas

`tests/hu-02-armar-pedido-total.test.ts` tendrá una prueba por escenario Gherkin, usando `request.agent(app)` para conservar la cookie del pedido y SQLite en memoria:

1. Calcular subtotal y total de dos productos.
2. Modificar una cantidad y eliminar un producto, comprobando el recálculo.
3. Intentar una cantidad superior a la disponible, comprobando el rechazo, el máximo y las alternativas.
4. Cambiar un precio o consumir unidades, comprobar que la revalidación informa el cambio y que solo después de aceptar se llega a «listo para pagar».

`tests/pedido-unidad.test.ts` cubrirá el cálculo de totales, el rechazo de cantidades, las alternativas, el borrado del pedido al quitar el último detalle y la revalidación con cambio de precio y de disponibilidad.

### 9. Riesgos / Trade-offs

- **Pedido ligado a una cookie** → si el estudiante borra la cookie pierde el pedido en edición; es aceptable para una demostración y no afecta pedidos ya confirmados.
- **Cliente de demostración único** → varias sesiones comparten cliente, pero cada navegador conserva su propio pedido por cookie. No se implementa autenticación real.
- **Sin control de concurrencia** → dos pestañas podrían modificar el mismo pedido; la concurrencia de unidades se aborda en HU-04 y no hay pago en esta historia.
- **Disponibilidad que cambia sin afectar la cantidad** → no se bloquea el pedido; se documenta como interpretación del Gherkin.
- **Borrar el pedido al quitar el último detalle** → mantiene la multiplicidad 1..* del modelo, pero no conserva borradores abandonados. Es una decisión de demostración.
- **Pantalla de pago inexistente** → «Continuar al pago» termina en una pantalla que indica que el pago llega en HU-03; se evita simular un pago que no corresponde a esta historia.
- **PNG de EST-01 desactualizado** → el `.puml` es la fuente vigente; se regenerará cuando haya PlantUML disponible.

## Migration Plan

1. `npm run db:seed` aplica `002_pedidos.sql` y agrega el cliente de demostración sin duplicar datos.
2. `npm run dev` sirve el catálogo en `http://localhost:3000/catalogo` y el pedido en `http://localhost:3000/pedido`.
3. Para reiniciar la demostración: borrar `data/app.db` y volver a ejecutar `npm run db:seed`.
4. `npm test` ejecuta las pruebas de HU-01 y HU-02.

## Open Questions

Ninguna que afecte esta historia. La forma exacta de la pantalla de pago y la reserva de unidades se definirán en HU-03/HU-04.
