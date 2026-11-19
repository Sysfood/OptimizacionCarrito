# Design — HU-03 Pagar y consultar el progreso del pedido

## Context

HU-02 deja un pedido en **En edición**, con sus detalles, total y la cookie `pedido_id`. La pantalla «Pedido listo para pagar» es solo una confirmación de interfaz: no cambia el estado. El esquema ya tiene `pedido` con `codigo`, `estimacion_preparacion` y `fecha_hora_confirmacion`, `detalle_pedido`, `cliente`, `jornada` y `existencia` con `unidades_reservadas` y `unidades_consumidas`. La fuente de inventario es simulada y la pasarela de pago todavía no existe.

La aplicación es un monolito Express con vistas EJS, `better-sqlite3` y pruebas Vitest/supertest. No hay autenticación real: se usa el cliente de demostración y la cookie del pedido. Los sistemas externos se simulan mediante adaptadores.

Véase `proposal.md` para la motivación y `specs/pago-pedido/spec.md` y `specs/consulta-pedido/spec.md` para el comportamiento esperado.

## Goals / Non-Goals

**Goals:**

- Iniciar el pago desde un pedido en edición, revalidando precio y disponibilidad y reservando las unidades de forma transaccional.
- Procesar el resultado de la pasarela simulada y aplicar las transiciones de Pedido, Pago y Reserva de EST-01 y EST-02.
- Confirmar el pedido una sola vez, asignar el código de retiro y registrar la venta digital sobre el pedido confirmado.
- Permitir rechazo, cancelación y reintento sin perder la selección.
- Consultar el pedido actual y por código, con estado, detalle, estimación y aviso de atraso.
- Mantener la simulación de la pasarela separada de la lógica de negocio.

**Non-Goals:**

- Concurrencia explícita por la última unidad, vencimiento de la reserva a 3 minutos, pago aprobado tardío, conciliación y reembolsos (HU-04).
- Cola del vendedor (HU-05), marcar listo y aviso push (HU-06), entrega (HU-07), administración de disponibilidad (HU-08), reporte de ventas (HU-09) y cargo de empaque (HU-10).
- Pasarela real, captura o almacenamiento de datos de tarjeta, autenticación real y requisitos no funcionales.
- Cálculo real de la estimación de preparación: no hay parámetros vigentes ni historia que los configure.

## Decisions

### 1. Modelo de datos: dos tablas nuevas, sin `Venta` ni `Aviso`

Se agrega la migración `003_pagos_reservas.sql` con:

- `pago`: `pedido_id`, `referencia_pasarela` (única, nullable hasta que la pasarela responde), `monto`, `resultado` (`pendiente`, `rechazado`, `confirmado`) y `fecha_hora`. Asociación Pedido 1 – 0..* Pago.
- `reserva`: `pedido_id`, `fecha_hora_inicio`, `fecha_hora_vencimiento`, `estado` (`activa`, `consumida`, `liberada`). Asociación Pedido 1 – 0..* Reserva. El vencimiento se almacena para HU-04, pero no se aplica en esta historia.

No se crea una tabla `venta`: el pedido confirmado con su código, fecha de confirmación y detalles, junto con el pago aprobado, es el registro de la venta digital. No se crea una tabla `aviso`: el aviso push es HU-06; aquí el cambio de estimación se muestra en la consulta.

Las claves foráneas siguen las multiplicidades del modelo. No se usa `ON DELETE CASCADE` en `pago` ni en `reserva` porque no son composiciones; el pedido solo se elimina mientras está en edición y sin pagos.

### 2. Transiciones centralizadas en el servicio de pago

La función `procesarResultadoPago` concentra las transiciones de EST-01 y EST-02:

- Pedido: `En edición → Pendiente de pago` al iniciar; `Pendiente de pago → Confirmado` con pago aprobado y reserva activa; `Pendiente de pago → Pago no realizado` con rechazo o cancelación; `Pago no realizado → Pendiente de pago` al reintentar.
- Reserva: `(inicial) → Activa` al iniciar; `Activa → Consumida` al aprobar; `Activa → Liberada` al rechazar o cancelar.

La función verifica el estado actual antes de escribir y falla con un mensaje claro si el evento no corresponde. Las transiciones de HU-04 (`vencimiento`, `pago aprobado tardío`, `conciliación`) no se implementan.

### 3. Inicio del pago y reserva transaccional

El endpoint `POST /pedido/pagar` recibe el pedido de la cookie. Antes de reservar:

1. Reutiliza la revalidación de HU-02 (`revalidarPedido` / `aceptarNuevoTotal`). Si el precio o la disponibilidad cambiaron, muestra la pantalla de cambios y exige aceptar el nuevo total. Si la fuente no responde, muestra «Disponibilidad no verificable».
2. En una transacción, verifica que el pedido siga en **En edición** y que cada detalle tenga unidades vendibles suficientes.
3. Suma las cantidades a `existencia.unidades_reservadas`, actualiza `fecha_hora_actualizacion`, crea la `reserva` activa con vencimiento `ahora + 3 minutos`, deja el pedido en **Pendiente de pago** y crea el `pago` pendiente con el total.
4. Si cualquier actualización de existencia no afecta una fila, revierte toda la transacción y muestra los productos afectados.

La reserva se crea con una actualización condicional (`unidades_asignadas - unidades_reservadas - unidades_consumidas >= cantidad`) para no dejar disponibilidad negativa. La prueba explícita de dos pedidos compitiendo por la última unidad queda para HU-04.

### 4. Pasarela de pago simulada como adaptador

Se define `src/integraciones/pasarela-pago.ts`:

- Interfaz `ServicioPago` con `solicitarPago({ monto, referenciaIntento })`, que devuelve una `referenciaPasarela`, y `verificarResultado(referenciaPasarela)`, que devuelve el resultado registrado.
- Implementación `PasarelaPagoSimulada`: genera una referencia `SIM-<pagoId>-<marca>` y considera el resultado que el estudiante elige en la pantalla simulada. No recibe ni almacena datos de tarjeta (RP-18).
- La pantalla `GET /demo/pasarela/:pagoId` muestra el monto y tres acciones: **Aprobar pago**, **Rechazar pago** y **Cancelar pago**. Envía el resultado a `POST /demo/pasarela/:pagoId/resultado`.
- El servicio de pago no depende de la pantalla: recibe el resultado y la referencia, y aplica la transición. Una referencia que no corresponde al intento no confirma el pedido.

La pasarela se mantiene bajo `/demo` para que sea evidente que es una simulación; la lógica de negocio vive en `src/servicios/pago.ts`.

### 5. Confirmación única, código y venta

Al aprobar, dentro de una transacción:

- Verifica que el pago esté `pendiente`, que el pedido esté **Pendiente de pago** y que la reserva esté **Activa**.
- Marca el pago como `confirmado` y guarda la referencia.
- Marca la reserva como **Consumida** y actualiza la existencia: `unidades_reservadas -= cantidad`, `unidades_consumidas += cantidad`.
- Deja el pedido en **Confirmado**, asigna `codigo` y registra `fecha_hora_confirmacion`.
- No crea una tabla de venta: la venta queda representada por el pedido confirmado y el pago aprobado.

El código tiene el formato `TC-AAAAMMDD-NNNN`, con secuencia diaria. Se calcula dentro de la transacción a partir del último código del día; la columna `pedido.codigo` ya es `UNIQUE` y protege una colisión. Si la inserción del código falla por colisión, se reintenta una vez dentro de la misma transacción.

La pantalla de confirmación (`GET /pedido/confirmacion/:pedidoId`) muestra código, estado, detalle, total y estimación o **«Estimación no disponible»**, además de la aclaración de que el código no es una cita ni garantiza una hora de retiro. Incluye el botón **Repetir notificación aprobada**.

### 6. Idempotencia

`procesarResultadoPago` es idempotente por pago y por pedido:

- Si el pago ya está `confirmado` y el pedido está **Confirmado**, devuelve el mismo pedido sin crear otro pago, código, reserva ni venta.
- Si el pedido ya está **Confirmado**, cualquier notificación aprobada posterior se ignora.
- Si el pago ya está `rechazado`, no vuelve a liberar la reserva.
- La reserva solo se consume o libera si está **Activa**; una reserva ya finalizada no se modifica.

El botón **Repetir notificación aprobada** vuelve a enviar el mismo resultado y la misma referencia del pago confirmado; la pantalla debe mostrar la misma confirmación.

### 7. Rechazo, cancelación y reintento

- Rechazo y cancelación comparten el camino: el pago se registra como `rechazado` (el modelo no tiene un valor `cancelado`), la reserva pasa a **Liberada**, se descuentan las unidades reservadas y el pedido queda en **Pago no realizado**.
- La respuesta inmediata distingue «Pago rechazado» de «Pago cancelado»; el historial del pedido muestra **Pago no realizado**.
- La pantalla de resultado ofrece **Reintentar pago**. El reintento reutiliza la revalidación de HU-02: si el total cambió, exige aceptar el nuevo total; si hay disponibilidad, crea una reserva y un pago nuevos y deja el pedido en **Pendiente de pago**.
- El pedido conserva sus detalles y precios aceptados; los intentos anteriores quedan como historial.

### 8. Consulta del pedido y código de retiro

- `GET /pedido` sigue mostrando el pedido de la cookie. Si está **Pendiente de pago**, muestra el estado y un enlace para volver a la pasarela simulada; si está **Pago no realizado**, muestra el resultado y el reintento; si está **Confirmado**, muestra el código y un enlace a la confirmación.
- `GET /pedido/consultar` muestra el formulario de código; `POST /pedido/consultar` busca por `codigo` normalizado (sin espacios y en mayúsculas) y muestra el mismo detalle de la confirmación. Un código inexistente muestra un aviso y no revela otros pedidos.
- La consulta por código no exige autenticación; es una decisión de demostración ya confirmada.
- La consulta muestra la estimación si existe; si no, **«Estimación no disponible»** y la aclaración del código. El pedido sigue visible mientras no esté **Entregado**.

### 9. Control de demostración de estimación o atraso

`POST /demo/estimacion` recibe `pedidoId` y un texto; actualiza `pedido.estimacion_preparacion` solo si el pedido está **Confirmado**. La pantalla de confirmación y la consulta muestran el texto actualizado con la etiqueta «Estimación informativa». No se agrega un campo de atraso: el texto puede incluir el aviso de atraso. El pedido no se cancela por superar la estimación.

### 10. Rutas y pantallas

| Ruta | Método | Propósito |
|------|--------|-----------|
| `/pedido/pagar` | POST | Revalidar, reservar y crear el pago pendiente; redirige a la pasarela simulada |
| `/demo/pasarela/:pagoId` | GET | Pantalla de la pasarela simulada con los tres resultados |
| `/demo/pasarela/:pagoId/resultado` | POST | Procesar aprobado, rechazado o cancelado |
| `/pedido/confirmacion/:pedidoId` | GET | Confirmación con código, estado, detalle y estimación |
| `/pedido/confirmacion/:pedidoId/repetir` | POST | Repetir la notificación aprobada |
| `/pedido/pago-no-realizado/:pedidoId` | GET | Resultado del rechazo o cancelación y reintento |
| `/pedido/reintentar` | POST | Revalidar y crear una reserva y un pago nuevos |
| `/pedido/consultar` | GET/POST | Formulario y consulta por código |
| `/demo/estimacion` | POST | Fijar el texto de estimación o atraso |

`pedido-listo.ejs` reemplaza el texto «El pago se habilitará en HU-03» por el formulario **Pagar**. `pedido.ejs` conserva la edición solo en **En edición** y agrega los enlaces de pago, reintento, confirmación y consulta. El encabezado agrega el enlace **Consultar pedido**.

### 11. Pruebas

- Una prueba de integración por escenario Gherkin:
  - `HU-03 · Confirmar un pago aprobado`
  - `HU-03 · La Pasarela de pago rechaza el pago`
  - `HU-03 · La Pasarela de pago informa dos veces el mismo pago aprobado`
  - `HU-03 · Consultar un pedido confirmado`
  - `HU-03 · La estimación de preparación no está disponible`
  - `HU-03 · El pedido presenta un atraso`
- Pruebas adicionales para: iniciar pago sin disponibilidad, cancelación, reintento con y sin cambio de total, consulta por código inexistente y código único.
- Pruebas unitarias de las transiciones de Pedido/Pago/Reserva y de la idempotencia.
- Las pruebas usan una base SQLite en memoria, aplican las migraciones y ejecutan `sembrar`, como las de HU-01/HU-02.

### 12. Migración y datos de ejemplo

La migración es aditiva. No se reescriben `001_catalogo.sql` ni `002_pedidos.sql`. El seed actual sigue siendo suficiente: el cliente de demostración y los cuatro productos existen. Los pedidos existentes quedan en **En edición** y no tienen pagos ni reservas.

## Risks / Trade-offs

- **Sin vencimiento hasta HU-04:** un pago abandonado deja el pedido en **Pendiente de pago** y la reserva activa. Mitigación: la pantalla del pedido permite volver a la pasarela y cancelar; el vencimiento automático llega con HU-04 y la limitación queda documentada.
- **Cancelación registrada como `rechazado`:** el modelo de `Pago` no tiene un resultado `cancelado`. Mitigación: la respuesta inmediata distingue la cancelación y el pedido queda en **Pago no realizado**; no se inventa un valor de dominio.
- **Código público:** sin autenticación, cualquiera que conozca el código puede ver el pedido de demostración. Mitigación: es un alcance de curso, no hay datos personales reales y se documenta en la guía.
- **Colisión de código:** la secuencia diaria se calcula en transacción y `pedido.codigo` es único. Mitigación: reintento una vez y error claro si persiste.
- **Concurrencia limitada:** SQLite y `better-sqlite3` serializan las escrituras, pero la prueba explícita de la última unidad es HU-04. Mitigación: actualización condicional de existencias y transacción atómica.
- **Sin datos de tarjeta:** la pasarela simulada no captura datos; RP-18 se cumple por diseño, pero no se implementan controles de seguridad reales.

## Migration Plan

1. Agregar `src/db/migrations/003_pagos_reservas.sql`; se aplica al arrancar y queda registrada en `schema_migrations`.
2. Ejecutar `npm run db:seed` para confirmar que los datos de ejemplo siguen completos.
3. Implementar dominio, servicio, adaptador, rutas y vistas.
4. Ejecutar `npm test` y `npx tsc --noEmit`.
5. Si hay que revertir, restaurar `data/app.db` desde una copia; la migración es aditiva y no borra datos existentes.

## Open Questions

Ninguna que cambie las especificaciones, el enfoque o las tareas. La única limitación conocida (vencimiento de la reserva) está asignada a HU-04 y documentada.
