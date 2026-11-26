 # 12 — Trazabilidad de requisitos y artefactos

## 1. Propósito

La matriz de trazabilidad relaciona cada requisito de producto (RP) con los artefactos de análisis que lo desarrollan: historias de usuario (HU), casos de uso (CU), diagramas de secuencia (DSS), diagramas de estado (EST) y clases del modelo de dominio.

En la Entrega 3 se incorpora el **cliente VIP** (compra sin pago previo y con deuda acumulada): se agregan RP-22 y RP-23, HU-11 y HU-12, CU-08 y CU-09, DSS-03 y los diagramas de estado EST-03 (pedido VIP) y EST-04 (reserva VIP). La sección 6 detalla esa trazabilidad hasta el nivel de criterio de aceptación.

## 2. Matriz de trazabilidad

| Requisito | Historia(s) | Caso(s) de uso | Secuencia | Estado | Clase(s) del dominio |
| --- | --- | --- | --- | --- | --- |
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
| RP-16 | HU-04, HU-08, **HU-11** | CU-02, CU-06, **CU-08** | DSS-01, **DSS-03** | EST-02, **EST-04**† | Reserva, Existencia, Pedido, Pago |
| RP-17 | HU-02 | CU-02 | — | — | Pedido, DetallePedido, Producto |
| RP-18 | HU-03 | CU-02 | DSS-01 | EST-01 | Pago, Pedido |
| RP-19 | HU-06 | CU-03 | DSS-02 | EST-01 | Aviso, Pedido, Cliente |
| RP-20 | HU-05, HU-06, HU-07 | CU-03, CU-04 | DSS-02* | EST-01 | Pedido, Aviso, Jornada |
| RP-21 | HU-10 (candidata) | —** | — | — | Pedido, DetallePedido |
| **RP-22 (propuesto)** | **HU-11** | **CU-08** | **DSS-03** | **EST-03, EST-04**† | **Pedido, DetallePedido, Existencia, ClienteVIP**‡ |
| **RP-23 (propuesto)** | **HU-12** | **CU-09** | **DSS-03** | — | **ClienteVIP**‡ |

† EST-04 (reserva VIP) depende de que el pedido VIP cree una reserva; queda sujeto a esa definición.

‡ ClienteVIP es una especialización de Cliente con el atributo deuda (propuesta). Falta reflejarla en el modelo de dominio.

## 3. Trazabilidad de atributos de calidad

| Atributo / propiedad | Requisito | Historia principal | Caso de uso |
| --- | --- | --- | --- |
| Actualización / frescura de disponibilidad | RP-14 | HU-01, HU-08 | CU-01, CU-06 |
| Rendimiento | RP-15 | HU-05 | CU-03 |
| Integridad / concurrencia de reservas | RP-16 | HU-04, HU-08, **HU-11** | CU-02, CU-06, **CU-08** |
| Usabilidad | RP-17 | HU-02 | CU-02 |
| Seguridad del pago | RP-18 | HU-03 | CU-02 |
| Tiempo de aviso | RP-19 | HU-06 | CU-03 |
| Resiliencia / desconexión | RP-20 | HU-05, HU-06, HU-07 | CU-03, CU-04 |

## 4. Relaciones clave

### RP-15 — Rendimiento

**RP-15 → HU-05 → CU-03 → EST-01 → Pedido/DetallePedido/Jornada**

### RP-16 — Integridad de reservas

**RP-16 → HU-04/HU-08/HU-11 → CU-02/CU-06/CU-08 → DSS-01/DSS-03 → EST-02/EST-04 → Reserva/Existencia**

### RP-18 — Seguridad

**RP-18 → HU-03 → CU-02 → DSS-01 → EST-01 → Pago**

### RP-19 — Aviso

**RP-19 → HU-06 → CU-03 → DSS-02 → EST-01 → Aviso/Pedido/Cliente**

### RP-22 — Pedido VIP sin pago previo (propuesto)

**RP-22 → HU-11 → CU-08 → DSS-03 → EST-03/EST-04 → Pedido/DetallePedido/Existencia/ClienteVIP**

### RP-23 — Consulta de deuda (propuesto)

**RP-23 → HU-12 → CU-09 → DSS-03 → ClienteVIP**

## 5. Trazabilidad de historias a código y pruebas

Relaciona cada historia implementada con su cambio de OpenSpec archivado, el código que la realiza y las pruebas automáticas de sus escenarios Gherkin. Las pruebas de aceptación llevan el nombre del escenario de [07-criterios-aceptacion.md](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/07-criterios-aceptacion.md).

| Historia | CU · DSS · EST | Cambio de OpenSpec (archivado) | Spec vigente | Código principal | Pruebas |
| --- | --- | --- | --- | --- | --- |
| HU-01 | CU-01 · — · — | [`2026-11-18-hu-01-consultar-disponibilidad`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/openspec/changes/archive/2026-11-18-hu-01-consultar-disponibilidad) | [`catalogo-disponibilidad`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/openspec/specs/catalogo-disponibilidad/spec.md) | [`src/rutas/catalogo.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/rutas/catalogo.ts), [`src/servicios/catalogo.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/servicios/catalogo.ts), [`src/dominio/existencia.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/dominio/existencia.ts), [`src/integraciones/fuente-inventario.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/integraciones/fuente-inventario.ts), `src/vistas/catalogo.ejs`, `src/vistas/no-disponible.ejs` | [`tests/hu-01-consultar-disponibilidad.test.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/tests/hu-01-consultar-disponibilidad.test.ts), [`tests/catalogo-unidad.test.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/tests/catalogo-unidad.test.ts) |
| HU-02 | CU-02 · DSS-01 · EST-01 | [`2026-11-18-hu-02-armar-pedido-total`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/openspec/changes/archive/2026-11-18-hu-02-armar-pedido-total) | [`armado-pedido`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/openspec/specs/armado-pedido/spec.md) | [`src/rutas/pedido.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/rutas/pedido.ts), [`src/servicios/pedido.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/servicios/pedido.ts), [`src/dominio/pedido.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/dominio/pedido.ts), `src/vistas/pedido.ejs`, `src/vistas/pedido-cambios.ejs`, `src/vistas/pedido-listo.ejs` | [`tests/hu-02-armar-pedido-total.test.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/tests/hu-02-armar-pedido-total.test.ts), [`tests/pedido-unidad.test.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/tests/pedido-unidad.test.ts) |
| HU-03 | CU-02, CU-07 · DSS-01 · EST-01 | [`2026-11-19-hu-03-pagar-consultar-pedido`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/openspec/changes/archive/2026-11-19-hu-03-pagar-consultar-pedido), ajuste [`2026-11-19-ajuste-hu-03-resultado-pasarela`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/openspec/changes/archive/2026-11-19-ajuste-hu-03-resultado-pasarela) | [`pago-pedido`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/openspec/specs/pago-pedido/spec.md), [`consulta-pedido`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/openspec/specs/consulta-pedido/spec.md) | [`src/servicios/pago.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/servicios/pago.ts) (`iniciarPago`, `procesarResultadoPago`, `obtenerPedidoPorCodigo`), [`src/integraciones/pasarela-pago.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/integraciones/pasarela-pago.ts), [`src/dominio/pago.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/dominio/pago.ts), `src/rutas/pedido.ts`, `src/vistas/pasarela.ejs`, `src/vistas/pasarela-resultado.ejs`, `src/vistas/pedido-confirmado.ejs`, `src/vistas/pago-no-realizado.ejs`, `src/vistas/consultar-pedido.ejs`, `src/db/migrations/003_pagos_reservas.sql` | [`tests/hu-03-pagar-consultar-pedido.test.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/tests/hu-03-pagar-consultar-pedido.test.ts), [`tests/pago-unidad.test.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/tests/pago-unidad.test.ts) |
| HU-04 | CU-02 · DSS-01 · EST-02, EST-01 | [`2026-11-22-hu-04-reservar-unidades`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/openspec/changes/archive/2026-11-22-hu-04-reservar-unidades) | [`pago-pedido`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/openspec/specs/pago-pedido/spec.md) | [`src/servicios/reserva.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/servicios/reserva.ts) (`aplicarTransicionReserva`), [`src/servicios/pago.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/servicios/pago.ts) (`vencerReservasExpiradas`, `vencerReservaActiva`, conciliación en `procesarResultadoPago`), [`src/dominio/reserva.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/dominio/reserva.ts), [`src/integraciones/reversa-pago.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/src/integraciones/reversa-pago.ts), `src/vistas/conciliacion.ejs`, `src/db/migrations/004_conciliacion.sql` | [`tests/hu-04-reservar-unidades.test.ts`](https://github.com/Sysfood/OptimizacionCarrito/blob/IngReq-Entrega-3/tests/hu-04-reservar-unidades.test.ts) |

### Estados y clases en el código

| Diagrama / clase | Dónde se implementa |
| --- | --- |
| EST-01 (Pedido) | Valores permitidos en el `CHECK` de `pedido.estado` (`src/db/migrations/002_pedidos.sql`); transiciones con guarda en `src/servicios/pedido.ts` y `src/servicios/pago.ts` (`UPDATE … WHERE estado = …`). |
| EST-02 (Reserva) | `CHECK` de `reserva.estado` (`003_pagos_reservas.sql`); transiciones en `aplicarTransicionReserva` (`src/servicios/reserva.ts`), que rechaza una transición desde un estado final. |
| Modelo de dominio | Una tabla por clase en `src/db/migrations/` (Carrito, Jornada, Producto, Existencia, Cliente, Pedido, DetallePedido, Pago, Reserva, Conciliacion) y su tipo en `src/dominio/`. La clase Conciliacion (HU-04) corresponde a la tabla `conciliacion` de `004_conciliacion.sql`. |

HU-11 y HU-12 aún no tienen cambio de OpenSpec, código ni pruebas; se agregarán a esta sección cuando se implementen.

## 6. Trazabilidad del cliente VIP (Entrega 3)

Detalla cómo HU-11 y HU-12 llegan hasta los casos de uso y los diagramas, criterio por criterio. EST-03 es el ciclo de vida del pedido VIP y EST-04 el de su reserva.

### 6.1 Criterios de aceptación → casos de uso y diagramas

| Criterio | Qué exige | Caso de uso | Secuencia (DSS-03) | Estado |
| --- | --- | --- | --- | --- |
| HU-11 CA1 | Confirmación automática, sin pago ni Pasarela, con código de retiro | CU-08, flujo principal | Rama «cliente VIP con deuda bajo el máximo» → pedido confirmado | EST-03: Revisión de deuda → Confirmado; EST-04: Activa → Consumida† |
| HU-11 CA2 | El total del pedido se suma a la deuda | CU-08, flujo principal | Mensaje «sumar total del pedido a la deuda» | EST-03: acción «aumentar deuda» (caja negra) |
| HU-11 CA3 | Sin unidades: no se aprueba y la deuda no cambia | CU-08, alternativa | `alt` «algún producto sin disponibilidad» | No aplica: el pedido no llega a crearse |
| HU-11 CA4 | Quien no es VIP debe pagar por la Pasarela de pago | CU-08, alternativa | `alt` «el cliente no es VIP» | No aplica: precondición del ciclo |
| HU-11 CA5 | Con la deuda máxima alcanzada no se realiza el pedido hasta saldarla | CU-08, alternativa | `alt` «la deuda alcanzó el máximo permitido» | EST-03: Revisión de deuda → Bloqueado por deuda; EST-04: Activa → Liberada† |
| HU-11 CA6 | Solicitud repetida: sin otro pedido ni doble suma a la deuda | CU-08, alternativa | `alt` «solicitud repetida» | No aplica: no cambia el estado |
| HU-12 CA1–CA3 | Ver el monto total de la deuda; $0 si aún no hay pedidos | CU-09 | `opt` «el cliente VIP consulta su deuda» | No aplica |
| HU-12 CA4 | Quien no es VIP no accede a la deuda | CU-09, alternativa | Por representar | No aplica |

### 6.2 EST-03 (pedido VIP): transiciones

| Transición | Evento / guarda / acción | Historia | Caso de uso | Secuencia |
| --- | --- | --- | --- | --- |
| Inicio → Revisión de deuda | realizar pedido / consultar deuda actual [caja negra: deuda máxima] | HU-11 CA1, CA5 | CU-08 | DSS-03 |
| Revisión de deuda → Confirmado | deuda + monto ≤ máximo / aumentar deuda, consumir reserva, registrar venta, asignar código | HU-11 CA1, CA2 | CU-08 | DSS-03 |
| Revisión de deuda → Bloqueado por deuda | deuda + monto > máximo / liberar reserva | HU-11 CA5 | CU-08 | DSS-03 |
| Bloqueado por deuda → Pago de deuda | abonar deuda / registrar saldo | HU-11 CA5 | Por definir | Por definir |
| Pago de deuda → Confirmado | deuda saldada / consumir reserva, registrar venta, asignar código | HU-11 CA5 | Por definir | Por definir |
| Bloqueado por deuda → Cancelado | descartar pedido [no abona deuda] | Por definir | Por definir | Por definir |
| Confirmado → En preparación | iniciar preparación | HU-05, HU-06 | CU-03 | — |
| En preparación → Listo para retiro | marcar pedido listo / enviar aviso | HU-06 | CU-03 | DSS-02 |
| Listo para retiro → Entregado | confirmar entrega [código válido] / registrar fecha y hora | HU-07 | CU-04 | — |

La etapa final (Confirmado → Entregado) es idéntica a EST-01, por lo que el cliente VIP reutiliza HU-05, HU-06 y HU-07, CU-03 y CU-04, y DSS-02.

### 6.3 EST-04 (reserva VIP)

| Transición | Condición | Historia | Caso de uso | Secuencia |
| --- | --- | --- | --- | --- |
| Inicio → Activa | pedido VIP iniciado | HU-11 | CU-08 | DSS-03 |
| Activa → Liberada | posee deuda (alcanzó el máximo): no pasa a aprobado | HU-11 CA5 | CU-08 | DSS-03 |
| Activa → Consumida | no posee deuda: pasa a aprobado | HU-11 CA1 | CU-08 | DSS-03 |
