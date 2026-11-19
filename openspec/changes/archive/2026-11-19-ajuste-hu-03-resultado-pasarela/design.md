# Design — Ajuste HU-03: emisor del resultado del pago

## Context

Ver `proposal.md` para la motivación (OBS-1). Hoy `src/vistas/pasarela.ejs` muestra en una sola pantalla el monto y los tres botones «Aprobar / Rechazar / Cancelar pago», y `POST /demo/pasarela/:pagoId/resultado` recibe el resultado, lo registra en la pasarela simulada y lo aplica. No hay registro de que el estudiante haya enviado el pago antes de emitir el resultado. Los artefactos ya separan ambos momentos: DSS-01 tiene `EST -> PAS : ingresar datos de pago` y `PAS --> SIS : resultado del pago`; la ficha HU-03 y CA1 exigen que el servidor verifique el resultado antes de confirmar. Sin autenticación real: se mantiene el selector de rol de demostración.

## Goals / Non-Goals

**Goals:**
- Hacer visible y verificable en el servidor la secuencia «el estudiante envía el pago» → «la pasarela simulada emite el resultado».
- Que la interfaz presente la emisión del resultado como una respuesta de la pasarela, no como una decisión del estudiante.
- Conservar el comportamiento de negocio ya validado (reserva, confirmación única, idempotencia, rechazo/cancelación y reintento).

**Non-Goals:**
- Pasarela real, captura de tarjeta o autenticación real.
- Cambiar tablas, columnas, estados ni reglas de HU-04 en adelante.
- Modificar `consulta-pedido` ni las especificaciones principales de HU-01/HU-02.

## Decisions

1. **Dos pantallas en lugar de una.** `pasarela.ejs` pasa a ser el paso «Enviar pago a la pasarela», con un solo formulario. Se agrega `pasarela-resultado.ejs` para la respuesta de la pasarela simulada, con los tres resultados rotulados como emitidos por la pasarela. Alternativa descartada: dos secciones en la misma página; no resuelve la percepción de que el estudiante elige la aprobación.
2. **Registro del envío en la integración simulada.** Se amplía `ServicioPago` con `registrarEnvio(referencia)` y `verificarEnvio(referencia): boolean`, guardados en un `Map` en memoria, igual que los resultados actuales. Alternativa descartada: un campo oculto en el formulario; es modificable por el cliente y no es verificable en el servidor.
3. **Rutas.** `GET /demo/pasarela/:pagoId` sigue mostrando el envío; nuevo `POST /demo/pasarela/:pagoId/enviar` valida que el pago esté pendiente y tenga referencia, registra el envío y muestra la respuesta de la pasarela; `POST /demo/pasarela/:pagoId/resultado` exige `verificarEnvio` antes de `registrarResultado` y de llamar a `procesarResultadoPago`. Alternativa descartada: cambiar la URL existente; rompería los enlaces y pruebas sin beneficio.
4. **Lógica de negocio intacta.** `procesarResultadoPago` no cambia: la verificación del resultado contra el intento registrado (CA1), la idempotencia por referencia y las transiciones de EST-01/EST-02 se mantienen. No hay migración SQL: Pedido, Pago, Reserva y Existencia ya tienen los atributos necesarios.
5. **Pruebas.** Se actualizan las pruebas de integración de HU-03 para enviar el pago antes de publicar el resultado, y se agrega una prueba del nuevo escenario «resultado sin envío previo». Se conserva una prueba por escenario Gherkin y se ajustan las pruebas unitarias de la pasarela simulada.

## Risks / Trade-offs

- **El registro de envíos en memoria se pierde al reiniciar** → aceptable en una demostración sin persistencia de integraciones; el pago sigue en «Pendiente de pago» y el estudiante puede enviarlo de nuevo.
- **Las pruebas existentes publican resultados directamente** → se actualizan en el mismo cambio; la ruta vieja sin envío pasa a responder error.
- **El cambio original de HU-03 aún no está archivado** → al cerrar, archivar primero `hu-03-pagar-consultar-pedido` (para que `pago-pedido` exista en `openspec/specs/`) y después este ajuste, de modo que el delta MODIFIED se aplique sobre una especificación presente.

## Migration Plan

1. Aplicar el cambio con `openspec-apply-change`: vista, rutas, adaptador simulado y pruebas.
2. Ejecutar `npm test`; las pruebas de HU-03 deben seguir cubriendo los seis escenarios Gherkin más el caso nuevo.
3. Verificar en la interfaz que el envío y la emisión del resultado son dos pasos separados.
4. Al cerrar el ciclo, archivar primero el cambio original de HU-03 y luego este ajuste; actualizar `.cin324/proyecto.md` y el informe `VAL-HU-03-1.md`.
