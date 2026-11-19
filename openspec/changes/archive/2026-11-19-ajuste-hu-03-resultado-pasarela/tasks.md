# Tasks

## 1. Integración simulada: registro del envío

- [x] 1.1 Ampliar `ServicioPago` y `crearPasarelaPagoSimulada()` en `src/integraciones/pasarela-pago.ts` con `registrarEnvio(referencia)` y `verificarEnvio(referencia): boolean`, guardando los envíos en un `Map` como los resultados; verificar con `npm test -- pago-unidad` que la interfaz compila y que una referencia registrada se consulta como enviada y una no registrada como no enviada.
- [x] 1.2 Ajustar el comentario de la pasarela simulada para describir que registra el envío del estudiante y el resultado emitido por la pasarela, sin capturar tarjeta (RP-18); verificar que el comentario quede en el archivo y que no haya cambios en la base de datos.

## 2. Pantallas separadas

- [x] 2.1 Convertir `src/vistas/pasarela.ejs` en el paso «Enviar pago a la pasarela», con un solo botón «Enviar pago» y texto que indique que la aprobación, el rechazo y la cancelación los emitirá la pasarela; verificar con una prueba de integración que `GET /demo/pasarela/:pagoId` ya no contenga «Aprobar pago».
- [x] 2.2 Crear `src/vistas/pasarela-resultado.ejs` con los tres resultados rotulados como respuesta de la «Pasarela de pago (simulada)» y sin solicitar datos de tarjeta; verificar con una prueba que la vista se renderiza con la referencia y el monto del pago.

## 3. Rutas y verificación en servidor

- [x] 3.1 Agregar `POST /demo/pasarela/:pagoId/enviar` en `src/rutas/pedido.ts`: validar pago pendiente y referencia, llamar a `registrarEnvio` y renderizar la vista de respuesta; verificar con una prueba que el envío queda registrado y que un pago inexistente o sin referencia devuelve error.
- [x] 3.2 Exigir `verificarEnvio` en `POST /demo/pasarela/:pagoId/resultado` antes de `registrarResultado` y `procesarResultadoPago`; verificar con la prueba del escenario «Resultado emitido sin el envío previo» que se rechaza y que el pedido sigue en «Pendiente de pago» con su reserva activa.
- [x] 3.3 Mantener `procesarResultadoPago` sin cambios; verificar que las pruebas de confirmación única, idempotencia por referencia, rechazo, cancelación y reintento siguen pasando después de adaptar las peticiones de prueba.

## 4. Pruebas por escenario Gherkin

- [x] 4.1 Actualizar el helper de `tests/hu-03-pagar-consultar-pedido.test.ts` para enviar el pago antes de publicar el resultado; verificar que las 11 pruebas existentes vuelven a estar en verde.
- [x] 4.2 Agregar la prueba del nuevo escenario «Resultado emitido sin el envío previo del estudiante» nombrada `HU-03 · Resultado sin envío previo`; verificar que falla si se elimina la comprobación de `verificarEnvio`.
- [x] 4.3 Comprobar que se conserva una prueba por cada uno de los seis escenarios Gherkin de HU-03 y que `npm test` terminó con todos los archivos en verde; verificar el número final de pruebas en la salida de Vitest.

## 5. Datos de ejemplo y verificación final

- [x] 5.1 Ejecutar `npm run db:seed` dos veces y verificar que sigue siendo idempotente y que el catálogo conserva los cuatro productos de ejemplo (sin cambios en datos ni migraciones).
- [x] 5.2 Ejecutar `npm test` completo y revisar a mano el recorrido «Pagar» → «Enviar pago» → «Respuesta de la pasarela» aprobando, rechazando y repitiendo la notificación; verificar que no aparece la aprobación como acción del estudiante.
- [x] 5.3 Actualizar `README.md`: en el recorrido de HU-03 describir los dos pasos separados, el nuevo botón de envío, la prueba del resultado sin envío y el número final de pruebas; verificar que los comandos de instalar, preparar, ejecutar y probar siguen siendo correctos.

## Workflow follow-up

- Archivar primero `hu-03-pagar-consultar-pedido` para que `pago-pedido` exista en `openspec/specs/`, y después archivar este ajuste.
- Actualizar `.cin324/proyecto.md` y el estado del informe `.cin324/validaciones/VAL-HU-03-1.md` a «verificado en el sistema».
