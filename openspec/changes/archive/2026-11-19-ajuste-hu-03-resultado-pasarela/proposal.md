# Proposal — Ajuste HU-03: emisor del resultado del pago

## Why

La validación de HU-03 (informe `.cin324/validaciones/VAL-HU-03-1.md`, OBS-1) detectó que la interfaz presenta en una sola pantalla el envío del pago por el estudiante y los botones «Aprobar / Rechazar / Cancelar pago», de modo que parece que el estudiante aprueba su propio pago. Los artefactos ya aclararon que el resultado lo informa la Pasarela de pago (sistema externo) y que el servidor lo verifica antes de confirmar (CA1); el código debe reflejar esa separación.

## What Changes

- Separar en dos pasos el flujo de pago: el estudiante **envía el pago** a la pasarela y, después, un control identificado como **«Pasarela de pago (simulada)»** **emite el resultado** (aprobado, rechazado o cancelado).
- Verificar en el servidor que el envío ocurrió antes de aceptar el resultado, además de la verificación ya existente del resultado contra el intento registrado (CA1).
- Mantener los tres resultados, la idempotencia por referencia, la liberación de la reserva en rechazo/cancelación y el reintento: no cambian las reglas de negocio.
- Actualizar la vista de la pasarela y las rutas de demostración, y ajustar las pruebas de HU-03 para que recorran el nuevo paso de envío.
- **BREAKING** para las pruebas: las peticiones directas a `POST /demo/pasarela/:pagoId/resultado` sin el envío previo dejan de ser válidas.

## Capabilities

### New Capabilities

- (ninguna; el comportamiento pertenece a una capacidad existente del cambio de HU-03)

### Modified Capabilities

- `pago-pedido`: se modifica el requisito «Confirmación de un pago aprobado» y se agrega el requisito «Envío del pago y emisión del resultado» para dejar explícito que el resultado lo emite la pasarela simulada, nunca una acción del estudiante, y que el servidor verifica el orden de los pasos.

## Impact

- historia: **HU-03 — Pagar y consultar el progreso del pedido**; actividades del TO-BE **AC-03** (confirmar y pagar en línea) y **AC-05** (asignar código y estimación); casos de uso **CU-02** (Crear y pagar pedido, con la Pasarela de pago como sistema externo) y **CU-07** (Consultar estado).
- Código: `src/vistas/pasarela.ejs` (nueva vista de respuesta de la pasarela), `src/rutas/pedido.ts` (rutas de envío y de resultado), `src/integraciones/pasarela-pago.ts` (interfaz `ServicioPago` y versión simulada), `src/servicios/pago.ts` (verificación del orden de los pasos) y `tests/hu-03-pagar-consultar-pedido.test.ts` (pruebas por escenario Gherkin).
- Sin cambios en base de datos: la reserva, el pago y la referencia de pasarela ya existen. Sin autenticación real; se mantiene el selector de rol de demostración.
- Fuera de alcance: HU-04 (concurrencia, vencimiento y conciliación), HU-05 a HU-10, pasarela real, captura de datos de tarjeta, requisitos no funcionales y cambios en `openspec/specs/consulta-pedido`.
