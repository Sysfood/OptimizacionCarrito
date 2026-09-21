# 📋 Clasificación de requisitos

[← Volver al documento maestro](./IngReq-Entrega%201.md)

> Los requisitos se clasifican en dos ejes: **producto vs. proyecto** y **funcional vs. no funcional**.
>
> - Los de **producto** describen lo que TurnoCarrito debe hacer o cumplir. Los de **proyecto** son restricciones sobre cómo el equipo desarrolla y entrega el sistema, y no son verificables sobre el producto en operación.
> - Los **funcionales** describen un comportamiento observable del sistema. Los **no funcionales** describen una propiedad de calidad con la que ese comportamiento debe cumplirse.

Cada requisito de producto se asocia a una actividad que cambia del AS-IS al TO-BE, según la tabla de [`02-rediseno-to-be.md`](./02-rediseno-to-be.md#actividades-que-cambian-del-as-is-al-to-be).

---

## 🧩 Requisitos de producto — Funcionales

| ID | Requisito | Actividad TO-BE asociada |
|---|---|---|
| `RP-01` | Mostrar al estudiante el catálogo de productos con la cantidad disponible de cada uno al momento de la consulta. | AC-02 — Verificar stock en tiempo real |
| `RP-02` | Permitir al estudiante armar un pedido con uno o más productos y sus cantidades antes de confirmarlo. | AC-01 — Seleccionar productos en la app |
| `RP-03` | Impedir confirmar un pedido cuyas cantidades superen el stock disponible, e informar qué productos no están disponibles y qué alternativas existen. | AC-02 — Verificar stock en tiempo real |
| `RP-04` | Permitir al estudiante pagar el pedido en línea y registrar el resultado del pago antes de darlo por confirmado. | AC-03 — Confirmar el pedido y pagar en línea |
| `RP-05` | Descontar del inventario las cantidades del pedido en el mismo momento en que el pago se confirma, y reponerlas si el pago falla o el pedido se anula. | AC-04 — Registrar el pedido y descontar el stock |
| `RP-06` | Registrar cada venta confirmada con producto, cantidad, monto, fecha y hora, sin intervención del vendedor. | AC-04 — Registrar el pedido y descontar el stock |
| `RP-07` | Asignar a cada pedido confirmado un número de turno único dentro de la jornada y una hora estimada de retiro, calculada a partir de la cola vigente y del tiempo de preparación de los productos pedidos. | AC-05 — Asignar número de turno y hora estimada |
| `RP-08` | Mostrar al vendedor la cola de pedidos pendientes ordenada por turno, con el detalle de cada pedido. | AC-06 — Enviar el pedido a la cola del vendedor |
| `RP-09` | Permitir al vendedor marcar un pedido como listo para retiro. | AC-07 — Marcar el pedido como listo |
| `RP-10` | Notificar al estudiante cuando su pedido queda listo para retiro. | AC-07 — Notificar al estudiante que su turno está listo |
| `RP-11` | Permitir al vendedor validar el turno presentado por el estudiante y confirmar la entrega, dejando el pedido cerrado. | AC-08 — Confirmar la entrega en el sistema |
| `RP-12` | Permitir al vendedor cargar y ajustar el stock inicial de la jornada por producto. | AC-02 — Verificar stock en tiempo real |
| `RP-13` | Entregar al encargado un reporte de la jornada con unidades vendidas por producto, ingresos y pedidos rechazados por falta de stock. | AC-04 — Registrar el pedido y descontar el stock |

## ⚙️ Requisitos de producto — No funcionales

| ID | Requisito | Actividad TO-BE asociada |
|---|---|---|
| `RP-14` | La disponibilidad mostrada al estudiante debe reflejar el inventario real con un desfase máximo de **5 segundos** respecto de la última venta confirmada. | AC-02 — Verificar stock en tiempo real |
| `RP-15` | El sistema debe sostener **300 pedidos confirmados** en una ventana de 15 minutos, con tiempo de respuesta bajo **2 segundos en el 95%** de las operaciones, y debe poder escalar a nuevos puntos de venta agregando instancias sin modificar código. | AC-01, AC-03 — Seleccionar productos y confirmar el pedido |
| `RP-16` | El sistema debe garantizar que dos pedidos concurrentes no puedan comprometer la misma unidad de stock. | AC-04 — Registrar el pedido y descontar el stock |
| `RP-17` | El estudiante debe poder completar el flujo de pedido y pago en un máximo de **6 interacciones** desde la apertura de la aplicación. | AC-01 — Seleccionar productos en la app |
| `RP-18` | El sistema no debe almacenar datos de tarjetas de pago: el pago se delega íntegramente a una pasarela externa, y solo se conserva el identificador y el resultado de la transacción. | AC-03 — Confirmar el pedido y pagar en línea |
| `RP-19` | La notificación de turno listo debe llegar al estudiante dentro de **10 segundos** desde que el vendedor marca el pedido como listo. | AC-07 — Notificar al estudiante que su turno está listo |
| `RP-20` | El vendedor debe poder operar el panel de cola en un dispositivo móvil con conexión intermitente, conservando localmente los cambios de estado y sincronizándolos al recuperar la conexión. | AC-06 — Preparar el pedido según la cola de turnos |

---

## 🛠️ Requisitos de proyecto

Restricciones sobre cómo se desarrolla y entrega el sistema — no se verifican en el producto en operación.

| ID | Requisito |
|---|---|
| `RY-01` | El desarrollo se realiza dentro de la organización de GitHub del equipo, con un repositorio asociado a un GitHub Project para el seguimiento de las tareas. |
| `RY-02` | La documentación de ingeniería de requisitos se entrega en archivos Markdown enlazados desde el documento maestro, antes del **jueves 24 de septiembre, 10:00 AM**. |
| `RY-03` | Los diagramas de proceso se modelan en notación **BPMN 2.0** con Camunda Modeler o bpmn.io, y se entregan como imagen PNG y como archivo fuente `.bpmn`. |
| `RY-04` | El equipo valida el proceso TO-BE con el vendedor del carrito antes de comprometer el alcance del desarrollo. |
| `RY-05` | El sistema se desarrolla con tecnologías que el equipo ya maneja y que permiten despliegue en un servicio cloud de capa gratuita. |
| `RY-06` | El equipo trabaja con integración continua sobre la rama principal, con revisión por pares de cada Pull Request antes de integrar. |
| `RY-07` | La carga de trabajo se distribuye de modo que cada integrante contribuya con commits verificables, dado que la nota individual se ajusta por evaluación de pares. |

---

## 🔍 Requisitos derivados

Requisitos que no salieron directamente de una entrevista o del TO-BE, sino que se dedujeron por necesidad lógica de otro requisito ya definido.

<details>
<summary><strong>Derivación 1 — Reserva transitoria de stock durante el pago</strong></summary>

**Origen:** `RP-05` — descontar el stock en el momento exacto en que el pago se confirma, y reponerlo si falla.

**Derivado:** El sistema debe **reservar transitoriamente** las unidades de un pedido mientras el pago está en curso, y liberar automáticamente esa reserva si el pago no se confirma dentro de **3 minutos**.

**Por qué:** entre que el estudiante inicia el pago y la pasarela responde pasa un tiempo no despreciable. Si las unidades siguen "disponibles" durante ese tramo, dos pedidos podrían comprometer la misma unidad — lo que rompería `RP-16`. Nadie mencionó "reservas" en las entrevistas; se dedujo de la necesidad de cumplir `RP-05` sin violar `RP-16`. El plazo de 3 minutos evita que una reserva eterna degrade la disponibilidad de `RP-14` y reintroduzca el problema P2 del AS-IS.

</details>

<details>
<summary><strong>Derivación 2 — Tiempo de preparación y numeración de turnos por jornada</strong></summary>

**Origen:** `RP-07` — asignar un turno único y una hora estimada de retiro.

**Derivado:** El sistema debe mantener, por producto, un **tiempo estándar de preparación** configurable por el encargado, y debe **reiniciar la numeración de turnos** al inicio de cada jornada por punto de venta.

**Por qué:** no se puede calcular una hora estimada sin un parámetro de tiempo de preparación por producto — nadie lo pidió como requisito, pero es una condición necesaria para que la estimación exista. La unicidad del turno solo tiene sentido acotada a una jornada y a un punto de venta: si fuera global, los turnos crecerían indefinidamente y dejarían de ser utilizables en el mesón. El alcance "por punto de venta" además se deriva de la exigencia de escalabilidad de `RP-15`.

</details>

---

<sub>📎 Estos requisitos se usan en [`04-historias-usuario.md`](./04-historias-usuario.md) para construir las historias de usuario, y en [`06-atributos-calidad.md`](./06-atributos-calidad.md) para las métricas de calidad.</sub>
