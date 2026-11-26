# OptimizacionCarrito

## Ingeniería de Requisitos — Entrega 3

**Asignatura:** CIN 324 — Ingeniería de Requisitos  
**Rama de entrega:** `IngReq-Entrega-3`

Esta entrega presenta **TurnoCarrito** con cuatro historias implementadas mediante OpenCode y OpenSpec. El pago usa una pasarela simulada.

| Historia | Qué se puede demostrar |
|---|---|
| HU-01 | Consultar disponibilidad y ver productos agotados. |
| HU-02 | Armar un pedido, revisar el total y revalidar precio y stock antes del pago. |
| HU-03 | Simular un pago, obtener un código de retiro y consultar el estado del pedido. |
| HU-04 | Reservar unidades durante el pago y resolver pagos tardios con una reversa simulada cuando no hay stock. |

Consulta [cómo ejecutar la aplicación](#aplicación-turnocarrito--cómo-ejecutarla) para instalarla y probar los recorridos. La documentación que sigue conserva los antecedentes de las entregas anteriores.

La Entrega 2 contiene la especificación de **TurnoCarrito**, un sistema de pedidos anticipados para el carrito de comida universitario: criterios de aceptación en Gherkin, modelo de dominio, casos de uso, diagramas de secuencia de sistema, diagramas de estado y la matriz de trazabilidad. Parte de los documentos de la Entrega 1, que se mantienen en la rama con su ubicación y nombre originales.

## Integrantes y aportes

| Integrante | Entrega 2 | Entrega 1 |
|---|---|---|
| Martín Méndez | [Diagramas de secuencia](./10-diagramas-secuencia.md) · [Diagramas de estado](./11-diagramas-estado.md) | [Proceso AS-IS](./01-proceso-as-is.md) · [Rediseño TO-BE](./02-rediseno-to-be.md) · Diagramas BPMN |
| Joaquín López | [Criterios de aceptación](./07-criterios-aceptacion.md) · [Casos de uso](./09-casos-de-uso.md) | [Requisitos](./03-requisitos.md) · [Historias de usuario](./04-historias-usuario.md) |
| Joaquín Rojas | [Modelo de dominio](./08-modelo-dominio.md) | [Elicitación](./05-Elicitacion.md) · [Evidencias](./Evidencias) |
| Vicente Fernández Simonetti | [Trazabilidad](./12-trazabilidad.md) | [Atributos de calidad](./06-atributos-calidad.md) |

## Entrega 2 — Especificación del sistema

| N.° | Documento | Contenido | Diagramas |
|---|---|---|---|
| 07 | [Criterios de aceptación](./07-criterios-aceptacion.md) | Escenarios Gherkin de HU-01 a HU-09, con escenario principal y alternativo o de error. | — |
| 08 | [Modelo de dominio](./08-modelo-dominio.md) | Clases del negocio, atributos, asociaciones con multiplicidades y decisiones de modelado. | [PNG](./diagramas/modelo-dominio.png) · [PUML](./diagramas/modelo-dominio.puml) |
| 09 | [Casos de uso](./09-casos-de-uso.md) | Actores, CU-01 a CU-07 y su historia de origen. | [PNG](./diagramas/09-casos-de-uso.png) · [PUML](./diagramas/09-casos-de-uso.puml) |
| 10 | [Diagramas de secuencia](./10-diagramas-secuencia.md) | DSS-01 (pagar un pedido, con la pasarela de pago) y DSS-02 (avisar pedido listo, con el servicio de notificaciones). | [DSS-01](./diagramas/dss-01.png) · [DSS-02](./diagramas/dss-02.png) |
| 11 | [Diagramas de estado](./11-diagramas-estado.md) | EST-01 (ciclo de vida de Pedido) y EST-02 (ciclo de vida de Reserva), con sus tablas de transiciones. | [EST-01](./diagramas/est-01.png) · [EST-02](./diagramas/est-02.png) |
| 12 | [Trazabilidad](./12-trazabilidad.md) | Matriz que une cada requisito con su historia, caso de uso, secuencia, estado y clases del dominio. | — |

Todos los diagramas UML están en la carpeta [`diagramas`](./diagramas), como imagen PNG y como fuente PlantUML (`.puml`).

Para la Entrega 3, consulta los fuentes PlantUML actualizados de [DSS-01](./diagramas/dss-01.puml), [EST-01](./diagramas/est-01.puml) y [modelo de dominio](./diagramas/modelo-dominio.puml). Sus PNG corresponden a la Entrega 2.

## Entrega 1 — Análisis del proceso y requisitos

| N.° | Documento | Contenido |
|---|---|---|
| 01 | [Proceso AS-IS](./01-proceso-as-is.md) | Proceso actual, participantes y problemas P1–P6. Diagrama: [PNG](./diagramas/as-is.png) · [BPMN](./diagramas/as-is.bpmn) |
| 02 | [Rediseño TO-BE](./02-rediseno-to-be.md) | Iniciativas de rediseño y actividades AC-01–AC-08. Diagrama: [PNG](./diagramas/to-be.png) · [BPMN](./diagramas/to-be.bpmn) |
| 03 | [Requisitos](./03-requisitos.md) | Requisitos de producto (RP), de proyecto (RY) y derivados. |
| 04 | [Historias de usuario](./04-historias-usuario.md) | HU-01 a HU-10 con sus criterios de aceptación. |
| 05 | [Elicitación](./05-Elicitacion.md) | Entrevista al vendedor, grupo focal y hallazgos H1–H14. |
| 06 | [Atributos de calidad](./06-atributos-calidad.md) | Atributos de calidad AQ y su relación con los requisitos. |

Versión original de la Entrega 1: rama [`IngReq-Entrega-1`](https://github.com/Sysfood/OptimizacionCarrito/tree/IngReq-Entrega-1).

## Cómo seguir la trazabilidad

Un problema del proceso actual (P) origina una iniciativa del TO-BE y una actividad que cambia (AC). Esa actividad se expresa en requisitos (RP) e historias (HU), y cada historia se especifica en un caso de uso (CU), sus criterios Gherkin, un diagrama de secuencia (DSS) y los estados de las clases que modifica (EST). La [matriz de trazabilidad](./12-trazabilidad.md) reúne esas relaciones por requisito.

Orden de lectura recomendado:

1. [Rediseño TO-BE](./02-rediseno-to-be.md), para entender el proceso que se especifica.
2. [Modelo de dominio](./08-modelo-dominio.md), para conocer el vocabulario que usan los demás documentos.
3. [Casos de uso](./09-casos-de-uso.md) y [criterios de aceptación](./07-criterios-aceptacion.md).
4. [Diagramas de secuencia](./10-diagramas-secuencia.md) y [de estado](./11-diagramas-estado.md).
5. [Trazabilidad](./12-trazabilidad.md), para comprobar la coherencia entre artefactos.

## Aplicación TurnoCarrito — cómo ejecutarla

La aplicación se genera historia por historia desde esta documentación. Las historias implementadas son **HU-01 — Consultar disponibilidad antes de desplazarse** (cambio archivado en `openspec/changes/archive/2026-11-18-hu-01-consultar-disponibilidad/`), **HU-02 — Armar un pedido y conocer su total** (cambio archivado en `openspec/changes/archive/2026-11-18-hu-02-armar-pedido-total/`) y **HU-03 — Pagar y consultar el progreso del pedido** (cambio archivado en `openspec/changes/archive/2026-11-19-hu-03-pagar-consultar-pedido/` y ajuste archivado en `openspec/changes/archive/2026-11-19-ajuste-hu-03-resultado-pasarela/`). Las fichas confirmadas están en `.cin324/historias/`.

**Stack:** TypeScript + Express + EJS + SQLite (`better-sqlite3`) + Vitest/supertest.

### Instalación y arranque

```bash
npm install
npm run db:seed
npm run dev
```

Abre http://localhost:3000/ o http://localhost:3000/catalogo.

### Datos de ejemplo

`npm run db:seed` crea `data/app.db` con un carrito, una jornada abierta de la fecha actual, un cliente de demostración y cuatro productos: Sándwich de pollo (10 unidades), Empanada de carne (8), Jugo natural (5) y Café (agotado). El seed es idempotente: ejecutarlo de nuevo no duplica datos.

### Recorrido de HU-01

1. Abre el catálogo: cada producto muestra nombre, precio, unidades vendibles y fecha/hora de la última actualización.
2. El Café aparece como **Agotado** y no ofrece ninguna acción para agregarlo a un pedido.
3. En el **Panel de demostración**, pulsa «Simular fuente no disponible»: el catálogo muestra **«Disponibilidad no verificable»** y no se ofrece pago.
4. Pulsa «Restaurar fuente de inventario» para volver al catálogo normal.
5. La página se recarga automáticamente cada 5 segundos para reflejar cambios de inventario.

El selector de rol de la barra superior es de demostración (`estudiante`, `vip`, `vendedor`, `encargado`). `estudiante` y `vip` actúan como clientes distintos (el segundo con `es_vip = 1`); las pantallas de vendedor y encargado llegan en las historias siguientes.

### Recorrido de HU-11 y HU-12 (cliente VIP)

1. En el selector de rol elige **Cliente VIP**. Aparece el enlace **Mi deuda**, que arranca en **$0**.
2. Agrega productos desde el catálogo y pulsa **Revisar y confirmar**. En lugar de «Pagar» aparece **Confirmar pedido sin pago previo**: el pedido queda **Confirmado** de inmediato, con su **código de retiro**, sin pasar por la pasarela y sin crear un pago. Su total se suma a la deuda.
3. Si ya no hay unidades, el pedido no se aprueba y la deuda no cambia. Repetir la solicitud no crea otro pedido ni suma la deuda otra vez.
4. Con el rol **Estudiante**, `POST /pedido/confirmar-vip` y `GET /deuda` responden 403: un cliente que no es VIP debe pagar por la pasarela.
5. En **Mi deuda**, el **Panel de demostración** permite fijar una **deuda máxima** (regla externa simulada, sin valor por defecto) y **registrar el pago de la deuda completa**. Con la deuda en el máximo, un nuevo pedido no se realiza hasta saldarla; la reserva se activa y se libera sin consumir unidades.

### Recorrido de HU-02

1. En el catálogo, elige una cantidad y pulsa **Agregar** en un producto con unidades vendibles. El encabezado tiene el enlace **Mi pedido**.
2. **Mi pedido** muestra cada producto con su precio unitario, cantidad, subtotal y el total del pedido. El pedido queda en estado **En edición**.
3. Modifica una cantidad con **Actualizar** o quita un producto con **Eliminar**; el subtotal y el total se recalculan. Si quitas el último producto, el pedido se elimina.
4. Intenta agregar más unidades de las vendibles: la operación se rechaza, se informa el máximo disponible y se listan otras alternativas sin reemplazar tu selección.
5. Pulsa **Continuar al pago**. Si nada cambió, verás **Pedido listo para pagar**.
6. Para probar la revalidación, usa el **Panel de demostración** de la pantalla del pedido: **Cambiar precio** o **Consumir unidades**. Al continuar al pago, la pantalla informa qué producto o valor cambió y, si la disponibilidad aún alcanza, exige **Aceptar nuevo total** antes de dejar el pedido listo. Si la disponibilidad ya no alcanza, pide ajustar la cantidad o eliminar el producto.

### Recorrido de HU-03

1. Con un pedido en **Pedido listo para pagar**, pulsa **Pagar**. El sistema revalida precio y disponibilidad, reserva las unidades y deja el pedido en **Pendiente de pago**.
2. En **Enviar pago a la pasarela**, pulsa **Enviar pago**. No se solicitan ni almacenan datos de tarjeta: este paso solo registra que el estudiante envió el pago.
3. La **Pasarela de pago (simulada)** muestra el monto y emite uno de tres resultados: **Emitir resultado: aprobado**, **Emitir resultado: rechazado** o **Emitir resultado: cancelado**. La aprobación no es una acción del estudiante: la respuesta la emite la pasarela simulada. Si se intenta publicar un resultado sin el envío previo, el servidor lo rechaza.
4. Si la pasarela emite aprobado, el pedido queda **Confirmado**, la reserva se consume y se asigna un código de retiro único con formato `TC-AAAAMMDD-NNNN`. La pantalla de confirmación muestra el código, el estado, el detalle, el total y la estimación.
5. Si emite rechazado o cancelado, el pedido queda en **Pago no realizado** y la reserva se libera. La pantalla conserva la selección y ofrece **Reintentar pago**; al reintentar se revalidan precio y disponibilidad y, si el total cambió, debes aceptar el nuevo total antes de volver a pagar.
6. La confirmación incluye el botón **Repetir notificación aprobada**: vuelve a enviar el mismo resultado y no crea otro pago, pedido, código ni venta.
7. En el **Panel de demostración** de la confirmación puedes fijar un texto de estimación o un aviso de atraso, por ejemplo «Retraso de 10 minutos». El pedido no se cancela por superar la estimación.
8. El enlace **Consultar pedido** del encabezado abre el formulario de código. Un código inexistente muestra un aviso y no revela datos de otros pedidos.

La estimación aparece como **«Estimación no disponible»** mientras no se fije un texto: no hay parámetros reales de preparación en esta entrega.

### Recorrido de HU-04

HU-04 agrega el ciclo de vida completo de la reserva de unidades. Para probarlo:

1. Arma un pedido y pulsa **Pagar**. Las unidades quedan **reservadas** por un plazo propuesto de 3 minutos y el pedido pasa a **Pendiente de pago**. Si dos estudiantes intentan tomar la última unidad, solo uno obtiene la reserva; el otro ve el producto como **agotado**.
2. Con la reserva vigente, envía el pago y emite **aprobado**: la reserva se consume **una sola vez**, el pedido queda **Confirmado** y se descuentan las unidades. Repetir la notificación aprobada no descuenta stock dos veces.
3. En **Mi pedido**, mientras el pago está pendiente, pulsa **Forzar vencimiento de la reserva (demo)**. La reserva se libera, las unidades vuelven a estar vendibles y el pedido pasa a **Pago no realizado** con la selección conservada.
4. Tras el vencimiento, pulsa **Reintentar pago**: se revalidan precio y disponibilidad y se crea una **reserva nueva**; la vencida nunca se reutiliza.
5. Para probar un **pago aprobado tardío**, fuerza el vencimiento y vuelve a la pasarela del pago original para emitir **aprobado**:
   - Si quedan unidades, se aseguran en una sola operación y el pedido queda **Confirmado** (se registra una conciliación `confirmada`).
   - Si no quedan unidades, el pedido queda en resolución y se activa la **reversa simulada**: la pantalla muestra **«Pago en resolución»** y **«reversa simulada»**, el pedido termina **Reembolsado** y **no pasa a preparación**.

La reversa/reembolso es una simulación: el proveedor, el responsable y el plazo reales quedan por acordar (Derivación 1). No se capturan datos de tarjeta.

### Pruebas

```bash
npm test
```

Las cuatro pruebas de `tests/hu-01-consultar-disponibilidad.test.ts` corresponden a los cuatro escenarios Gherkin de HU-01. Las cinco pruebas de `tests/hu-02-armar-pedido-total.test.ts` corresponden a los cuatro escenarios Gherkin de HU-02 más un caso adicional de disponibilidad insuficiente. Las doce pruebas de `tests/hu-03-pagar-consultar-pedido.test.ts` cubren los seis escenarios Gherkin de HU-03 y casos adicionales: cancelación, pago sin disponibilidad, reintento con total distinto, código inexistente, códigos consecutivos y el nuevo «Resultado sin envío previo» (el servidor rechaza un resultado antes de que el estudiante envíe el pago). `tests/pago-unidad.test.ts` cubre las transiciones del pago, la reserva, la idempotencia y la consulta por código; `tests/catalogo-unidad.test.ts` y `tests/pedido-unidad.test.ts` cubren el cálculo de unidades vendibles, la fuente simulada, el catálogo, los totales, la validación de cantidades, las alternativas, el borrado del pedido y la revalidación. Las pruebas de HU-04 se encuentran en `tests/hu-04-reservar-unidades.test.ts`. `tests/hu-11-pedido-vip-sin-pago.test.ts` y `tests/hu-12-consultar-deuda-vip.test.ts` cubren los escenarios Gherkin de HU-11 y HU-12 más casos adicionales (acumulación de deuda, saldar y volver a pedir, un estudiante que no puede confirmar un pedido VIP ajeno, sembración idempotente).

### Estructura de la aplicación

```text
src/
  app.ts, server.ts
  db/ (conexión, migraciones, seed)
  dominio/ (Carrito, Jornada, Producto, Existencia, Pedido, DetallePedido, Pago, Reserva, Cliente)
  servicios/ (catálogo, pedido, pago, deuda)
  integraciones/ (fuente de inventario simulada, pasarela de pago simulada, política de deuda máxima simulada)
  rutas/ (catálogo, pedido, pago/consulta, deuda VIP y controles de demostración)
  utiles/ (lectura de cookies)
  vistas/ (EJS)
tests/
data/app.db (se crea con npm run db:seed)
```
