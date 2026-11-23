# 12 — Trazabilidad de requisitos y artefactos

## 1. Propósito

La matriz de trazabilidad relaciona cada requisito de producto (RP) con los artefactos de análisis que lo desarrollan: historias de usuario (HU), casos de uso (CU), diagramas de secuencia (DSS), diagramas de estado (EST) y clases del modelo de dominio.


## 2. Matriz de trazabilidad

| Requisito | Historia(s) | Caso(s) de uso | Secuencia | Estado | Clase(s) del dominio |
|---|---|---|---|---|---|
| RP-01 | HU-01, HU-08 | CU-01, CU-06 | — | — | Producto, Existencia, Jornada |
| RP-02 | HU-02 | CU-02 | — | — | Producto, DetallePedido, Pedido |
| RP-03 | HU-02 | CU-02 | DSS-01 | EST-02 | Pedido, DetallePedido, Producto, Existencia, Reserva |
| RP-04 | HU-03 | CU-02 | DSS-01 | EST-01, EST-02 | Pedido, Pago, Reserva |
| RP-05 | HU-04 | CU-02 | DSS-01 | EST-01, EST-02 | Pedido, Reserva, Existencia, Pago, Conciliacion |
| RP-06 | HU-09 | CU-05 | — | — | Pedido, DetallePedido, Pago, Jornada |
| RP-07 | HU-03, HU-07 | CU-02, CU-04, CU-07 | DSS-01 | EST-01 | Pedido, Cliente |
| RP-08 | HU-05 | CU-03 | — | EST-01 | Pedido, DetallePedido, Jornada |
| RP-09 | HU-06 | CU-03 | DSS-02 | EST-01 | Pedido |
| RP-10 | HU-03, HU-06, HU-07 | CU-03, CU-04, CU-07 | DSS-02 | EST-01 | Pedido, Aviso, Cliente |
| RP-11 | HU-07 | CU-04 | — | EST-01 | Pedido, Cliente |
| RP-12 | HU-08 | CU-06 | — | EST-02 | Jornada, Existencia, AjusteExistencia, Reserva |
| RP-13 | HU-09 | CU-05 | — | — | Jornada, Pedido, DetallePedido, Pago |
| RP-14 | HU-01, HU-08 | CU-01, CU-06 | — | — | Producto, Existencia, Jornada, Reserva |
| RP-15 | HU-05 | CU-03 | — | EST-01 | Pedido, DetallePedido, Jornada |
| RP-16 | HU-04, HU-08 | CU-02, CU-06 | DSS-01 | EST-02 | Reserva, Existencia, Pedido, Pago |
| RP-17 | HU-02 | CU-02 | — | — | Pedido, DetallePedido, Producto |
| RP-18 | HU-03 | CU-02 | DSS-01 | EST-01 | Pago, Pedido |
| RP-19 | HU-06 | CU-03 | DSS-02 | EST-01 | Aviso, Pedido, Cliente |
| RP-20 | HU-05, HU-06, HU-07 | CU-03, CU-04 | DSS-02* | EST-01 | Pedido, Aviso, Jornada |
| RP-21 | HU-10 (candidata) | —** | — | — | Pedido, DetallePedido |

## 3. Trazabilidad de atributos de calidad

| Atributo / propiedad | Requisito | Historia principal | Caso de uso |
|---|---|---|---|
| Actualización / frescura de disponibilidad | RP-14 | HU-01, HU-08 | CU-01, CU-06 |
| Rendimiento | RP-15 | HU-05 | CU-03 |
| Integridad / concurrencia de reservas | RP-16 | HU-04, HU-08 | CU-02, CU-06 |
| Usabilidad | RP-17 | HU-02 | CU-02 |
| Seguridad del pago | RP-18 | HU-03 | CU-02 |
| Tiempo de aviso | RP-19 | HU-06 | CU-03 |
| Resiliencia / desconexión | RP-20 | HU-05, HU-06, HU-07 | CU-03, CU-04 |

## 4. Relaciones clave

### RP-15 — Rendimiento

**RP-15 → HU-05 → CU-03 → EST-01 → Pedido/DetallePedido/Jornada**

### RP-16 — Integridad de reservas

**RP-16 → HU-04/HU-08 → CU-02/CU-06 → DSS-01 → EST-02 → Reserva/Existencia**

### RP-18 — Seguridad

**RP-18 → HU-03 → CU-02 → DSS-01 → EST-01 → Pago**

### RP-19 — Aviso

**RP-19 → HU-06 → CU-03 → DSS-02 → EST-01 → Aviso/Pedido/Cliente**

## 5. Trazabilidad de historias a código y pruebas

Relaciona cada historia implementada con su cambio de OpenSpec archivado, el código que la realiza y las pruebas automáticas de sus escenarios Gherkin. Las pruebas de aceptación llevan el nombre del escenario de [07-criterios-aceptacion.md](./07-criterios-aceptacion.md).

| Historia | CU · DSS · EST | Cambio de OpenSpec (archivado) | Spec vigente | Código principal | Pruebas |
|---|---|---|---|---|---|
| HU-01 | CU-01 · — · — | [`2026-11-18-hu-01-consultar-disponibilidad`](./openspec/changes/archive/2026-11-18-hu-01-consultar-disponibilidad/) | [`catalogo-disponibilidad`](./openspec/specs/catalogo-disponibilidad/spec.md) | [`src/rutas/catalogo.ts`](./src/rutas/catalogo.ts), [`src/servicios/catalogo.ts`](./src/servicios/catalogo.ts), [`src/dominio/existencia.ts`](./src/dominio/existencia.ts), [`src/integraciones/fuente-inventario.ts`](./src/integraciones/fuente-inventario.ts), `src/vistas/catalogo.ejs`, `src/vistas/no-disponible.ejs` | [`tests/hu-01-consultar-disponibilidad.test.ts`](./tests/hu-01-consultar-disponibilidad.test.ts), [`tests/catalogo-unidad.test.ts`](./tests/catalogo-unidad.test.ts) |
| HU-02 | CU-02 · DSS-01 · EST-01 | [`2026-11-18-hu-02-armar-pedido-total`](./openspec/changes/archive/2026-11-18-hu-02-armar-pedido-total/) | [`armado-pedido`](./openspec/specs/armado-pedido/spec.md) | [`src/rutas/pedido.ts`](./src/rutas/pedido.ts), [`src/servicios/pedido.ts`](./src/servicios/pedido.ts), [`src/dominio/pedido.ts`](./src/dominio/pedido.ts), `src/vistas/pedido.ejs`, `src/vistas/pedido-cambios.ejs`, `src/vistas/pedido-listo.ejs` | [`tests/hu-02-armar-pedido-total.test.ts`](./tests/hu-02-armar-pedido-total.test.ts), [`tests/pedido-unidad.test.ts`](./tests/pedido-unidad.test.ts) |
| HU-03 | CU-02, CU-07 · DSS-01 · EST-01 | [`2026-11-19-hu-03-pagar-consultar-pedido`](./openspec/changes/archive/2026-11-19-hu-03-pagar-consultar-pedido/), ajuste [`2026-11-19-ajuste-hu-03-resultado-pasarela`](./openspec/changes/archive/2026-11-19-ajuste-hu-03-resultado-pasarela/) | [`pago-pedido`](./openspec/specs/pago-pedido/spec.md), [`consulta-pedido`](./openspec/specs/consulta-pedido/spec.md) | [`src/servicios/pago.ts`](./src/servicios/pago.ts) (`iniciarPago`, `procesarResultadoPago`, `obtenerPedidoPorCodigo`), [`src/integraciones/pasarela-pago.ts`](./src/integraciones/pasarela-pago.ts), [`src/dominio/pago.ts`](./src/dominio/pago.ts), `src/rutas/pedido.ts`, `src/vistas/pasarela.ejs`, `src/vistas/pasarela-resultado.ejs`, `src/vistas/pedido-confirmado.ejs`, `src/vistas/pago-no-realizado.ejs`, `src/vistas/consultar-pedido.ejs`, `src/db/migrations/003_pagos_reservas.sql` | [`tests/hu-03-pagar-consultar-pedido.test.ts`](./tests/hu-03-pagar-consultar-pedido.test.ts), [`tests/pago-unidad.test.ts`](./tests/pago-unidad.test.ts) |
| HU-04 | CU-02 · DSS-01 · EST-02, EST-01 | [`2026-11-22-hu-04-reservar-unidades`](./openspec/changes/archive/2026-11-22-hu-04-reservar-unidades/) | [`pago-pedido`](./openspec/specs/pago-pedido/spec.md) | [`src/servicios/reserva.ts`](./src/servicios/reserva.ts) (`aplicarTransicionReserva`), [`src/servicios/pago.ts`](./src/servicios/pago.ts) (`vencerReservasExpiradas`, `vencerReservaActiva`, conciliación en `procesarResultadoPago`), [`src/dominio/reserva.ts`](./src/dominio/reserva.ts), [`src/integraciones/reversa-pago.ts`](./src/integraciones/reversa-pago.ts), `src/vistas/conciliacion.ejs`, `src/db/migrations/004_conciliacion.sql` | [`tests/hu-04-reservar-unidades.test.ts`](./tests/hu-04-reservar-unidades.test.ts) |

### Estados y clases en el código

| Diagrama / clase | Dónde se implementa |
|---|---|
| EST-01 (Pedido) | Valores permitidos en el `CHECK` de `pedido.estado` (`src/db/migrations/002_pedidos.sql`); transiciones con guarda en `src/servicios/pedido.ts` y `src/servicios/pago.ts` (`UPDATE … WHERE estado = …`). |
| EST-02 (Reserva) | `CHECK` de `reserva.estado` (`003_pagos_reservas.sql`); transiciones en `aplicarTransicionReserva` (`src/servicios/reserva.ts`), que rechaza una transición desde un estado final. |
| Modelo de dominio | Una tabla por clase en `src/db/migrations/` (Carrito, Jornada, Producto, Existencia, Cliente, Pedido, DetallePedido, Pago, Reserva, Conciliacion) y su tipo en `src/dominio/`. La clase Conciliacion (HU-04) corresponde a la tabla `conciliacion` de `004_conciliacion.sql`. |
