# Tasks — HU-03 Pagar y consultar el progreso del pedido

## 1. Datos y tipos del dominio

- [x] 1.1 Crear `src/db/migrations/003_pagos_reservas.sql` con las tablas `pago` y `reserva`, sus claves foráneas y restricciones de estado; verificar que `npm test` aplique la migración en una base en memoria y que `PRAGMA table_info` muestre las columnas esperadas.
- [x] 1.2 Agregar los tipos `EstadoPago`, `Pago`, `EstadoReserva` y `Reserva` en `src/dominio/pago.ts` y `src/dominio/reserva.ts`; verificar con `npx tsc --noEmit`.
- [x] 1.3 Extender `PedidoVista` y `obtenerPedido` con `codigo`, `estimacionPreparacion` y `fechaHoraConfirmacion`; verificar que las pruebas existentes de HU-02 sigan pasando.

## 2. Lógica de pago y reserva

- [x] 2.1 Implementar `iniciarPago` en `src/servicios/pago.ts`: revalidar precio y disponibilidad, crear la reserva activa, actualizar `existencia.unidades_reservadas`, dejar el pedido en **Pendiente de pago** y registrar el pago pendiente; verificar con una prueba unitaria que el pedido, la reserva y las existencias quedan en el estado esperado.
- [x] 2.2 Implementar el camino de pago aprobado en `procesarResultadoPago`: confirmar una sola vez, consumir la reserva, actualizar existencias, asignar el código y registrar `fecha_hora_confirmacion`; verificar con una prueba unitaria que el pedido queda **Confirmado**, la reserva **Consumida** y la venta representada por el pedido y su pago.
- [x] 2.3 Implementar el camino de rechazo y cancelación: liberar la reserva, descontar `unidades_reservadas`, dejar el pedido en **Pago no realizado** y conservar los detalles; verificar con una prueba unitaria que no se confirma el pedido y que la reserva queda **Liberada**.
- [x] 2.4 Implementar el reintento del pago: revalidar, exigir la aceptación del nuevo total si cambió y crear una reserva y un pago nuevos; verificar con pruebas unitarias de reintento con y sin cambio de total.
- [x] 2.5 Implementar la idempotencia por pago y por pedido: una referencia repetida o un pedido ya confirmado no crean otro pago, código, reserva ni venta; verificar con una prueba unitaria que el segundo procesamiento devuelve el mismo pedido y no altera existencias.
- [x] 2.6 Implementar la generación del código `TC-AAAAMMDD-NNNN` con secuencia diaria y restricción única; verificar con una prueba unitaria que dos confirmaciones del mismo día producen códigos consecutivos y que el formato es correcto.

## 3. Pasarela simulada y pantallas de pago

- [x] 3.1 Crear `src/integraciones/pasarela-pago.ts` con la interfaz `ServicioPago` y la implementación `PasarelaPagoSimulada`; verificar con una prueba unitaria que genera una referencia y devuelve el resultado registrado sin datos de tarjeta.
- [x] 3.2 Agregar las rutas `POST /pedido/pagar`, `GET /demo/pasarela/:pagoId`, `POST /demo/pasarela/:pagoId/resultado`, `GET /pedido/pago-no-realizado/:pedidoId` y `POST /pedido/reintentar`; verificar con supertest que un pedido puede pasar de **En edición** a **Pendiente de pago** y luego a **Confirmado** o **Pago no realizado**.
- [x] 3.3 Crear las vistas `pasarela.ejs`, `pago-no-realizado.ejs` y `pedido-confirmado.ejs`, y actualizar `pedido-listo.ejs` y `pedido.ejs` para mostrar **Pagar**, el estado pendiente, el reintento y la confirmación; verificar que las pruebas de integración encuentren los textos y formularios esperados.
- [x] 3.4 Agregar una prueba de integración por escenario Gherkin de pago: **Confirmar un pago aprobado**, **La Pasarela de pago rechaza el pago** y **La Pasarela de pago informa dos veces el mismo pago aprobado**; ejecutar `npm test` y confirmar que las tres pasan.
- [x] 3.5 Agregar pruebas de integración para iniciar el pago sin disponibilidad, cancelar el pago y reintentar con un total distinto; verificar que no se reserve ni se cobre cuando corresponde y que el reintento exija aceptar el nuevo total.

## 4. Consulta del pedido, código y estimación

- [x] 4.1 Implementar `obtenerPedidoPorCodigo` y las rutas `GET /pedido/consultar` y `POST /pedido/consultar`, además de los estados de pago en `GET /pedido`; verificar con supertest que la consulta por código muestra código, estado y detalle, y que un código inexistente no muestra otro pedido.
- [x] 4.2 Mostrar en la confirmación y en la consulta la estimación disponible o **«Estimación no disponible»**, junto con la aclaración de que el código no es una cita; verificar con las pruebas de integración de consulta.
- [x] 4.3 Agregar `POST /demo/estimacion` y el control de demostración para fijar un texto de estimación o atraso; verificar que el texto actualizado aparece al consultar el pedido y que el pedido no se cancela.
- [x] 4.4 Agregar una prueba de integración por escenario Gherkin de consulta: **Consultar un pedido confirmado**, **La estimación de preparación no está disponible** y **El pedido presenta un atraso**; ejecutar `npm test` y confirmar que las tres pasan.
- [x] 4.5 Agregar una prueba de integración para consultar por código y otra para un código inexistente; verificar que la primera muestra el pedido correcto y la segunda un aviso sin datos de otros pedidos.

## 5. Integración y documentación

- [x] 5.1 Ejecutar `npm test` y `npx tsc --noEmit`; verificar que todas las pruebas pasan y que no hay errores de tipos.
- [x] 5.2 Ejecutar `npm run db:seed` dos veces y un smoke test con `npm run dev` sobre `/catalogo`, `/pedido`, `/pedido/consultar` y una compra de prueba; verificar respuestas 200, ausencia de duplicados y el recorrido completo de pago.
- [x] 5.3 Actualizar `README.md` con el recorrido de HU-03, la pasarela simulada, los controles de demostración, los comandos de ejecución y el número de pruebas; verificar que las instrucciones coincidan con lo ejecutado.
- [x] 5.4 Actualizar `.cin324/proyecto.md` con el cambio `hu-03-pagar-consultar-pedido`, el estado de la historia y las observaciones de implementación; verificar que la tabla de historias y la de validaciones queden coherentes.

## Workflow follow-up

- Validar el sistema con el estudiante mediante `cin324-validar-sistema`.
- Archivar el cambio y sincronizar las especificaciones principales cuando el estudiante confirme que funciona como esperaba.
