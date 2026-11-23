# Tasks

## 1. Datos y adaptadores simulados

- [x] 1.1 Crear `src/db/migrations/004_conciliacion.sql` con la tabla `conciliacion` (id, pago_id, estado en_resolucion/confirmada/reembolsada, motivo, fecha_hora) y su índice por pago_id; verificar que `npm run db:seed` aplica la migración y que la tabla aparece en `schema_migrations`.
- [x] 1.2 Crear la interfaz `ServicioReversa` y `ReversaPagoSimulada` en `src/integraciones/reversa-pago.ts`, con `solicitarReversa(referencia, monto)` que registra la llamada y devuelve una referencia de reversa; verificar con una prueba unitaria que devuelve la referencia y que no persiste datos de tarjeta.

## 2. Vigencia y transiciones de Reserva (EST-02)

- [x] 2.1 Agregar en `src/dominio/reserva.ts` la función `reservaVigente(reserva, ahora)` que compara `fechaHoraVencimiento` con la hora del servidor; verificar con pruebas unitarias de los casos vigente y vencida.
- [x] 2.2 Crear `src/servicios/reserva.ts` con una sola función `aplicarTransicionReserva` (eventos `pagoAprobado`, `pagoRechazado`, `vencimiento`), guardas de vigencia y estados finales `consumida`/`liberada`; verificar que una segunda transición sobre un estado final falla con mensaje claro.

## 3. Vencimiento, liberación y concurrencia

- [x] 3.1 Implementar en `src/servicios/pago.ts` la liberación de reservas activas vencidas (devolver `unidadesReservadas`, marcar `liberada`, pedido a «Pago no realizado»); verificar con la prueba del escenario «La reserva vence sin pago aprobado».
- [x] 3.2 Agregar un control de demostración para forzar el vencimiento de la reserva vigente; verificar con supertest que al usarlo la reserva queda `liberada` y las unidades vuelven a `unidadesVendibles`.
- [x] 3.3 Verificar la reserva atómica de la última unidad con la prueba del escenario «Dos pedidos compiten por la última unidad», comprobando que solo un pedido obtiene la reserva.

## 4. Confirmación, reintento e idempotencia

- [x] 4.1 Ajustar `confirmarPago` para exigir reserva vigente antes de consumir; verificar con la prueba del escenario «El pago se aprueba dentro del plazo de reserva» y con la regresión de «Confirmar un pago aprobado».
- [x] 4.2 Exigir que el reintento revalide precio/disponibilidad y cree una reserva nueva, sin reutilizar la vencida; verificar con la prueba «Un nuevo intento de pago exige una nueva reserva».
- [x] 4.3 Garantizar que una notificación repetida no descuente ni libera unidades dos veces; verificar con la prueba «Notificación repetida no descuenta ni libera dos veces» y la regresión de respuesta repetida de HU-03.

## 5. Pago aprobado tardío: conciliación y reembolso simulado

- [x] 5.1 Registrar el pago aprobado tardío sin stock en `conciliacion` con estado `en_resolucion`, dejar el pedido en «En conciliación» sin enviarlo a preparación; verificar con la prueba del escenario «Pago aprobado después del vencimiento, sin unidades disponibles».
- [x] 5.2 Si hay disponibilidad, asegurar las unidades en una sola operación y confirmar el pedido; verificar con la prueba del escenario «Pago aprobado después del vencimiento, con unidades disponibles».
- [x] 5.3 Llamar a `ReversaPagoSimulada`, registrar el estado `reembolsada` y dejar el pedido en «Reembolsado»; verificar que la vista informa «reversa simulada» y que el pedido no aparece como confirmado.

## 6. Interfaz derivada de DSS-01

- [x] 6.1 Ampliar `src/rutas/pedido.ts` y la vista correspondiente para mostrar «pago en resolución» y el resultado de la reversa simulada; verificar con supertest que la respuesta contiene esos textos exactos y que no muestra un pedido confirmado.

## 7. Regresión y cierre

- [x] 7.1 Ejecutar `npm test` y verificar que las pruebas previas de HU-01 a HU-03 siguen en verde junto con las nuevas de HU-04.
- [x] 7.2 Actualizar `README.md` con cómo instalar, ejecutar, sembrar la base y recorrer los cinco escenarios Gherkin de HU-04, incluido el control de vencimiento; verificar que cada comando documentado se ejecuta tal cual.

## Workflow follow-up

- Validar el sistema con `cin324-validar-sistema` antes de archivar.
- Archivar el cambio con `openspec-archive-change` y actualizar `.cin324/proyecto.md` (HU-04 hecha, nombre del cambio, fecha y observaciones).
