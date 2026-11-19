# Proposal — HU-03 Pagar y consultar el progreso del pedido

## Why

El estudiante ya puede armar un pedido y conocer su total, pero todavía no puede pagarlo ni seguir su progreso. Sin pago no se confirma el pedido, no se descuenta el stock, no se asigna un código de retiro y el estudiante no tiene forma de consultar cuándo retirarlo. Esta historia cierra ese tramo del proceso TO-BE y habilita el retiro con un código único.

## What Changes

- Agregar el **inicio del pago** desde un pedido listo: revalidar precio y disponibilidad, crear una reserva activa, dejar el pedido en **Pendiente de pago** y registrar un intento de pago.
- Implementar la **pasarela de pago simulada** con tres resultados: aprobado, rechazado y cancelado.
- Al aprobar: verificar el resultado, consumir la reserva, registrar la venta, asignar un **código de retiro único**, dejar el pedido en **Confirmado** y mostrar la confirmación.
- Al rechazar o cancelar: liberar la reserva, dejar el pedido en **Pago no realizado**, informar el resultado y conservar la selección para reintentar.
- Permitir **reintentar el pago** después de revalidar precio y disponibilidad; si el total cambió, exigir la aceptación del nuevo total.
- Hacer **idempotente** la notificación aprobada: una referencia repetida no crea otro pago, pedido, código ni venta.
- Agregar la **consulta del pedido** actual y por **código de retiro**, con estado, detalle, total, estimación disponible y la aclaración de que el código no es una cita.
- Mostrar **«Estimación no disponible»** cuando no haya parámetros vigentes, y actualizar la estimación o el aviso de atraso sin cancelar el pedido.
- Agregar controles de demostración: resultados de la pasarela, repetición de la notificación aprobada y fijación de un texto de estimación o atraso.

**Fuera de alcance:**

- **HU-04:** concurrencia por la última unidad, vencimiento de la reserva a 3 minutos, pago aprobado tardío, conciliación y reembolsos.
- **HU-05:** cola de preparación del vendedor.
- **HU-06:** marcar el pedido como en preparación o listo y enviar el aviso push.
- **HU-07:** validación del código en el retiro y registro de la entrega.
- **HU-08:** administración de disponibilidad y ajustes de existencias.
- **HU-09:** reporte de ventas digitales.
- **HU-10:** cargo de empaque.
- Pasarela de pago real, captura o almacenamiento de datos de tarjeta, y autenticación real.
- Requisitos no funcionales RP-14, RP-15, RP-16, RP-19 y RP-20. RP-18 se considera solo como restricción de diseño: la pasarela simulada no captura datos de tarjeta.

## Capabilities

### New Capabilities

- `pago-pedido`: inicio del pago con reserva de unidades, procesamiento del resultado de la pasarela, confirmación única, rechazo/cancelación, reintento e idempotencia.
- `consulta-pedido`: consulta del pedido actual y por código de retiro, visualización de estado, detalle, estimación y cambios por atraso.

### Modified Capabilities

- Ninguna. Las capacidades existentes `catalogo-disponibilidad` y `armado-pedido` no cambian sus requisitos; el pago reutiliza la revalidación y el cálculo del total ya definidos.

## Impact

- **Base de datos:** migración `003_pagos_reservas.sql` con las tablas `pago` y `reserva`. La tabla `pedido` ya tiene `codigo`, `estimacion_preparacion` y `fecha_hora_confirmacion`; `existencia` ya tiene `unidades_reservadas` y `unidades_consumidas`.
- **Dominio y servicios:** nuevos tipos y transiciones de `Pago` y `Reserva`; servicio de pago que crea la reserva, procesa el resultado, confirma una sola vez y libera al rechazar; extensión de la vista del pedido con código, estimación y fecha de confirmación.
- **Rutas y pantallas:** inicio del pago, pasarela simulada, resultado, confirmación y consulta por código; actualización de la pantalla «Pedido listo para pagar» y del encabezado.
- **Pruebas:** una prueba de integración por escenario Gherkin, más pruebas unitarias de transiciones, idempotencia y liberación de reservas.
- **Integración externa:** interfaz `ServicioPago` con implementación `PasarelaPagoSimulada`; no se guardan datos de tarjeta.
- **Documentación:** `README.md` y `.cin324/proyecto.md`.
