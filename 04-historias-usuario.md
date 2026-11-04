# 04 · Historias de usuario y criterios de aceptación

[← Índice](./README.md) · [Requisitos](./03-requisitos.md) · [Elicitación](./05-elicitacion.md)

> [!IMPORTANT]
> **Estado del documento:** revisión de las historias propuestas después de la elicitación del **22/09/2026**. Los escenarios expresan comportamiento esperado del negocio; **no** significan que la funcionalidad esté implementada ni que las decisiones pendientes estén aprobadas. Las metas numéricas y las reglas marcadas como propuestas deben validarse con el equipo y el vendedor.

**10 historias** · **37 escenarios** · 3 roles (estudiante, vendedor, encargado)

## Resumen

| Historia | Título | Rol | Escenarios | Estado |
|:--|:--|:--|:-:|:--|
| [HU-01](#hu-01-consultar-disponibilidad-antes-de-desplazarse) | Consultar disponibilidad antes de desplazarse | estudiante | 3 | Propuesta |
| [HU-02](#hu-02-armar-un-pedido-y-conocer-su-total) | Armar un pedido y conocer su total | estudiante | 4 | Propuesta |
| [HU-03](#hu-03-pagar-y-consultar-el-progreso-del-pedido) | Pagar y consultar el progreso del pedido | estudiante | 4 | Propuesta |
| [HU-04](#hu-04-mantener-reservadas-las-unidades-durante-el-pago) | Mantener reservadas las unidades durante el pago | estudiante | 4 | Requiere validación |
| [HU-05](#hu-05-organizar-la-preparación-de-pedidos-digitales) | Organizar la preparación de pedidos digitales | vendedor | 4 | Propuesta |
| [HU-06](#hu-06-actualizar-preparación-y-avisar-que-el-pedido-está-listo) | Actualizar preparación y avisar que el pedido está listo | vendedor | 4 | Propuesta |
| [HU-07](#hu-07-retirar-un-pedido-identificado) | Retirar un pedido identificado | estudiante | 4 | Propuesta |
| [HU-08](#hu-08-mantener-disponibilidad-compatible-con-el-software-existente) | Mantener disponibilidad compatible con el software existente | vendedor | 4 | Requiere validación |
| [HU-09](#hu-09-consultar-ventas-digitales-para-apoyar-la-reposición) | Consultar ventas digitales para apoyar la reposición | encargado | 4 | Propuesta |
| [HU-10](#hu-10-conocer-el-cargo-de-empaque--candidata) | Conocer el cargo de empaque — candidata | estudiante | 2 | Candidata |

## Cómo leer los escenarios

| Palabra | Significado |
|:--|:--|
| **Característica** | Capacidad o comportamiento que se especifica |
| **Escenario** | Situación concreta que se puede verificar (`E1`, `E2`…) |
| **Dado** | Contexto o condición inicial |
| **Cuando** | Acción o evento que ocurre |
| **Entonces** | Resultado observable esperado |
| **Y** | Condición o resultado adicional |

> [!NOTE]
> Los escenarios se redactan desde el punto de vista del negocio, sin describir botones, pantallas, bases de datos ni tecnologías internas.

---

## HU-01: Consultar disponibilidad antes de desplazarse

> **Como** estudiante  
> **quiero** ver productos, precios y disponibilidad actualizada  
> **para** decidir mi compra antes de ir al carrito

**Actividad:** `AC-02`  ·  **Requisitos:** `RP-01` `RP-14`  ·  **Evidencia:** H2, H3, H11

*Consulta del catálogo y disponibilidad*

| ID | Escenario | Dado | Cuando | Entonces |
|:-:|:--|:--|:--|:--|
| `E1` | **Consultar productos disponibles** | que el catálogo contiene productos con información verificable | El estudiante consulta el catálogo | Se informa el nombre y precio de cada producto<br>**y** se muestra la cantidad de unidades vendibles<br>**y** se indica la fecha y hora de la última actualización de disponibilidad |
| `E2` | **Consultar un producto agotado** | que un producto no tiene unidades vendibles | El estudiante consulta el catálogo | El producto se identifica como agotado<br>**y** no puede incorporarse a un nuevo pedido |
| `E3` | **La disponibilidad no puede verificarse** | que la fuente de inventario no responde o sus datos están desactualizados | El estudiante consulta el catálogo | Se informa que la disponibilidad no puede verificarse<br>**y** no se permite iniciar un pago con información no validada |

---

## HU-02: Armar un pedido y conocer su total

> **Como** estudiante  
> **quiero** elegir productos y cantidades y revisar el total  
> **para** comprar de acuerdo con mi presupuesto y tiempo disponible

**Actividad:** `AC-01` `AC-02`  ·  **Requisitos:** `RP-02` `RP-03` `RP-17` · `RP-21` solo si se aprueba el cargo de empaque  ·  **Evidencia:** H3, H9, H10

*Construcción y revisión de un pedido*

| ID | Escenario | Dado | Cuando | Entonces |
|:-:|:--|:--|:--|:--|
| `E1` | **Calcular el total de los productos seleccionados** | que existen productos disponibles con precios informados | El estudiante selecciona productos y define sus cantidades | El sistema calcula el subtotal correspondiente<br>**y** presenta el total del pedido antes de iniciar el pago |
| `E2` | **Modificar o quitar productos del pedido** | que el estudiante ya seleccionó uno o más productos | Modifica una cantidad o elimina un producto | El subtotal y el total se recalculan según la selección vigente |
| `E3` | **Solicitar una cantidad superior a la disponible** | que un producto tiene menos unidades vendibles que las solicitadas | El estudiante intenta continuar con el pedido | Se rechaza la cantidad que supera la disponibilidad<br>**y** se informa la cantidad máxima que puede solicitar<br>**y** no se reemplaza el producto sin la decisión del estudiante |
| `E4` | **Cambia el precio o la disponibilidad antes del pago** | que el estudiante tiene un pedido preparado<br>**y** el precio o la disponibilidad de uno de sus productos cambió | Se revalida el pedido antes del pago | Se informa qué producto o valor cambió<br>**y** se solicita la aceptación del nuevo total antes de continuar |

---

## HU-03: Pagar y consultar el progreso del pedido

> **Como** estudiante  
> **quiero** pagar por adelantado y consultar la confirmación, el estado y la estimación disponible de mi pedido  
> **para** organizar mi retiro y reducir la espera presencial

**Actividad:** `AC-03` `AC-05` `AC-07`  ·  **Requisitos:** `RP-04` `RP-07` `RP-10` `RP-18`  ·  **Evidencia:** H1, H6, H12, H13, H14

*Pago y seguimiento de un pedido*

| ID | Escenario | Dado | Cuando | Entonces |
|:-:|:--|:--|:--|:--|
| `E1` | **Confirmar un pago aprobado** | que el pedido tiene disponibilidad asegurada<br>**y** el estudiante aceptó el total informado | La pasarela comunica que el pago fue aprobado | El sistema verifica el resultado del pago<br>**y** confirma el pedido una sola vez<br>**y** asigna un código único al pedido<br>**y** permite consultar su estado |
| `E2` | **La pasarela rechaza el pago** | que el estudiante inició el pago de un pedido | La pasarela comunica que el pago fue rechazado | El pedido no queda confirmado<br>**y** se informa al estudiante el resultado del pago<br>**y** se permite reintentar después de revalidar el precio y la disponibilidad |
| `E3` | **La estimación de preparación no está disponible** | que el pedido fue confirmado<br>**y** no existen parámetros vigentes para estimar su preparación | El estudiante consulta el estado del pedido | Se muestra el estado actual<br>**y** se informa que la estimación no está disponible<br>**y** se aclara que el código identifica el pedido y no garantiza una hora de retiro |
| `E4` | **Se registra un atraso en la preparación** | que el pedido fue confirmado y todavía no está listo | Se registra un atraso o cambia la estimación disponible | Se comunica el estado actualizado al estudiante cuando corresponda<br>**y** el pedido no se cancela automáticamente por superar la estimación |

---

## HU-04: Mantener reservadas las unidades durante el pago

> **Como** estudiante  
> **quiero** que se reserven mis productos mientras pago  
> **para** evitar pagar por unidades comprometidas con otra compra

**Actividad:** `AC-04`  ·  **Requisitos:** `RP-05` `RP-16`

**Estado:** Regla de reserva temporal propuesta; validar con el equipo. Derivación relacionada: `03-requisitos.md`.

*Reserva temporal de unidades durante el pago*

| ID | Escenario | Dado | Cuando | Entonces |
|:-:|:--|:--|:--|:--|
| `E1` | **Dos pedidos compiten por la última unidad** | que queda una sola unidad vendible de un producto | Dos estudiantes intentan reservar esa unidad al mismo tiempo | Solo uno obtiene la reserva<br>**y** el otro recibe información de que el producto ya no está disponible |
| `E2` | **El pago se confirma dentro del plazo de reserva** | que existe una reserva vigente para el pedido | La pasarela confirma el pago | La reserva se convierte en consumo de inventario una sola vez<br>**y** el pedido puede incorporarse a la cola de preparación |
| `E3` | **La reserva vence sin confirmación de pago** | que existe una reserva pendiente de pago | Vence el plazo configurado sin confirmación | La reserva se libera una sola vez<br>**y** las unidades vuelven a estar disponibles si no existe otro compromiso |
| `E4` | **El pago se informa después del vencimiento** | que la reserva del pedido ya venció | La pasarela informa que el pago fue aprobado | El pedido no se envía automáticamente a preparación<br>**y** el pago queda sujeto a conciliación de disponibilidad y a la resolución acordada |

---

## HU-05: Organizar la preparación de pedidos digitales

> **Como** vendedor  
> **quiero** ver los pedidos confirmados y sus detalles en una cola  
> **para** organizar la preparación antes de que el comprador llegue

**Actividad:** `AC-06`  ·  **Requisitos:** `RP-08` `RP-15` `RP-20`  ·  **Evidencia:** H1, H7, H12, H13

*Organización de pedidos digitales para preparación*

| ID | Escenario | Dado | Cuando | Entonces |
|:-:|:--|:--|:--|:--|
| `E1` | **Consultar pedidos confirmados pendientes** | que existen pedidos con pago confirmado | El vendedor consulta la cola de preparación | Se muestran los pedidos confirmados pendientes<br>**y** cada pedido incluye su código, productos, cantidades y estado<br>**y** los pedidos se ordenan por fecha y hora de confirmación |
| `E2` | **Evitar duplicados en la cola** | que un pedido confirmado ya está registrado en la cola | Se recibe nuevamente la misma confirmación | El pedido continúa apareciendo una sola vez |
| `E3` | **Consultar la cola sin conexión** | que el vendedor pierde la conexión<br>**y** existe una última cola previamente recibida | Consulta los pedidos disponibles localmente | Se muestra la última información recibida<br>**y** se advierte que puede estar desactualizada<br>**y** los pedidos remotos nuevos no se presentan como recibidos |
| `E4` | **Recuperar la conexión** | que existen cambios pendientes de sincronización | Se restablece la conexión | La cola se actualiza con la información vigente<br>**y** no se duplican los pedidos existentes |

---

## HU-06: Actualizar preparación y avisar que el pedido está listo

> **Como** vendedor  
> **quiero** actualizar el progreso y avisar automáticamente al estudiante cuando esté listo  
> **para** facilitar el retiro y comunicar el cumplimiento del pedido

**Actividad:** `AC-07`  ·  **Requisitos:** `RP-09` `RP-10` `RP-19` `RP-20`  ·  **Evidencia:** H12, H14

*Actualización del estado y aviso de pedido listo*

| ID | Escenario | Dado | Cuando | Entonces |
|:-:|:--|:--|:--|:--|
| `E1` | **Actualizar el pedido durante la preparación** | que existe un pedido confirmado y pendiente de preparación | El vendedor inicia su preparación | El pedido cambia al estado en preparación |
| `E2` | **Marcar un pedido como listo** | que el pedido se encuentra en preparación | El vendedor informa que terminó de prepararlo | El pedido cambia al estado listo<br>**y** el sistema registra la fecha y hora de la actualización<br>**y** solicita el envío de una notificación al estudiante |
| `E3` | **Intentar marcar listo un pedido no pagado** | que un pedido no tiene el pago confirmado | El vendedor intenta registrar que está listo | Se rechaza el cambio de estado<br>**y** el pedido no se incorpora como listo para retiro |
| `E4` | **Falla el envío de la notificación** | que el pedido cambió correctamente al estado listo | El servicio de notificaciones no puede entregar el aviso | El estado listo se conserva<br>**y** el pedido continúa siendo consultable<br>**y** se registra que la notificación no pudo entregarse |

---

## HU-07: Retirar un pedido identificado

> **Como** estudiante  
> **quiero** presentar el código de mi pedido listo  
> **para** recibir los productos pagados sin repetir la toma del pedido

**Actividad:** `AC-08`  ·  **Requisitos:** `RP-07` `RP-11` `RP-20`  ·  **Evidencia:** H12, H13

*Retiro y entrega de un pedido*

| ID | Escenario | Dado | Cuando | Entonces |
|:-:|:--|:--|:--|:--|
| `E1` | **Entregar un pedido listo y pagado** | que el estudiante presenta el código de un pedido<br>**y** el pedido tiene el pago confirmado y el estado listo | El vendedor valida el código y confirma la entrega | El sistema registra la entrega<br>**y** guarda la fecha y hora de retiro<br>**y** conserva el pedido en el historial |
| `E2` | **Presentar un código inexistente** | que el código presentado no corresponde a un pedido registrado | El vendedor intenta validarlo | El sistema informa que el pedido no existe<br>**y** no permite registrar la entrega |
| `E3` | **Intentar retirar un pedido que no está listo o pagado** | que el pedido no tiene pago confirmado o no está listo | El vendedor intenta confirmar la entrega | Se rechaza la entrega<br>**y** el pedido conserva su estado vigente |
| `E4` | **Intentar entregar dos veces el mismo pedido** | que el pedido ya fue registrado como entregado | Se presenta nuevamente su código | El sistema informa que el pedido ya fue entregado<br>**y** no registra una segunda entrega |

---

## HU-08: Mantener disponibilidad compatible con el software existente

> **Como** vendedor  
> **quiero** controlar la disponibilidad del canal digital sin duplicar incorrectamente el inventario  
> **para** vender unidades que realmente puedo entregar

**Actividad:** `AC-02` `AC-04`  ·  **Requisitos:** `RP-12` `RP-14` `RP-16`  ·  **Evidencia:** H2, H5, H11

**Estado:** El mecanismo de integración o asignación exclusiva de inventario debe validarse con el vendedor.

*Control de disponibilidad del canal digital*

| ID | Escenario | Dado | Cuando | Entonces |
|:-:|:--|:--|:--|:--|
| `E1` | **Habilitar o cerrar la recepción de pedidos digitales** | que el vendedor está autorizado para gestionar el canal digital | Cambia la recepción digital a abierta o cerrada | El sistema registra el nuevo estado del canal<br>**y** si el canal está cerrado no admite nuevos pagos |
| `E2` | **Registrar un ajuste de disponibilidad válido** | que el vendedor está autorizado para ajustar la disponibilidad<br>**y** el ajuste no afecta unidades reservadas ni pedidos confirmados | Registra el producto, cantidad, origen y motivo del ajuste | El sistema registra el responsable y la fecha y hora<br>**y** actualiza la disponibilidad del canal digital |
| `E3` | **Rechazar un ajuste que compromete unidades reservadas** | que existen unidades comprometidas por reservas o pedidos confirmados | Se intenta realizar un ajuste incompatible con esos compromisos | El sistema rechaza el ajuste<br>**y** comunica la discrepancia que debe revisar el vendedor |
| `E4` | **No existe un mecanismo de inventario validado** | que todavía no se ha acordado cómo coexistirá el canal digital con el software de ventas existente | Se intenta habilitar la recepción de pagos reales | El sistema no habilita los pagos reales<br>**y** se requiere validar previamente la fuente de inventario y su conciliación |

---

## HU-09: Consultar ventas digitales para apoyar la reposición

> **Como** encargado  
> **quiero** consultar ventas e intentos digitales rechazados por falta de stock  
> **para** complementar la demanda reciente que ya uso al decidir la reposición

**Actividad:** `AC-04`  ·  **Requisitos:** `RP-06` `RP-13`  ·  **Evidencia:** H2, H4, H5, H10, H11

*Consulta de ventas digitales y falta de stock*

| ID | Escenario | Dado | Cuando | Entonces |
|:-:|:--|:--|:--|:--|
| `E1` | **Consultar el resumen de ventas digitales de una jornada** | que existen ventas digitales registradas para una jornada | El encargado consulta el reporte de esa jornada | El reporte muestra las unidades vendidas y los ingresos digitales<br>**y** presenta la distribución por franja horaria disponible |
| `E2` | **Consultar intentos rechazados por falta de stock** | que existen intentos de compra rechazados por falta de disponibilidad | El encargado consulta el reporte | Los rechazos se agrupan por producto e intento único<br>**y** un mismo evento no se contabiliza nuevamente por ser consultado o reintentado |
| `E3` | **Excluir operaciones que no son ventas confirmadas** | que existen pagos rechazados, reservas vencidas o transacciones en conciliación | El encargado consulta el total de ventas confirmadas | Los pagos rechazados y las reservas vencidas no se cuentan como ventas<br>**y** las transacciones en conciliación se identifican por separado |
| `E4` | **No existe conciliación con las ventas presenciales** | que el software de ventas existente no está conciliado con el canal digital | El encargado consulta el reporte | El reporte identifica que sus datos corresponden al canal digital<br>**y** no presenta esos datos como el total de ventas del negocio |

---

## HU-10: Conocer el cargo de empaque — candidata

> **Como** estudiante  
> **quiero** conocer cualquier cargo de empaque antes de pagar  
> **para** decidir conociendo el precio final

**Actividad:** `AC-01` `AC-03`  ·  **Requisitos:** `RP-21`  ·  **Evidencia:** H7, H10

**Estado:** Candidata; solo incluir como historia comprometida si el equipo confirma que existe un cargo de empaque y define su aplicación.

*Información del cargo de empaque (candidata)*

| ID | Escenario | Dado | Cuando | Entonces |
|:-:|:--|:--|:--|:--|
| `E1` | **Informar un cargo de empaque aprobado** | que el equipo y el vendedor aprobaron un cargo y su regla de aplicación<br>**y** el pedido está compuesto por productos sujetos a esa regla | El estudiante revisa el total antes de pagar | Se informa el subtotal de los productos<br>**y** se informa el cargo de empaque por separado<br>**y** se presenta el total que se enviará a la pasarela |
| `E2` | **No existe un cargo de empaque aprobado** | que no se ha aprobado un cargo de empaque | El estudiante revisa el total del pedido | No se agrega un cargo de empaque automáticamente |

---

## Cobertura de requisitos

| Historia | Requisitos relacionados |
|:--|:--|
| **HU-01** | `RP-01` `RP-14` |
| **HU-02** | `RP-02` `RP-03` `RP-17` · `RP-21` condicionado |
| **HU-03** | `RP-04` `RP-07` `RP-10` `RP-18` |
| **HU-04** | `RP-05` `RP-16` |
| **HU-05** | `RP-08` `RP-15` `RP-20` |
| **HU-06** | `RP-09` `RP-10` `RP-19` `RP-20` |
| **HU-07** | `RP-07` `RP-11` `RP-20` |
| **HU-08** | `RP-12` `RP-14` `RP-16` |
| **HU-09** | `RP-06` `RP-13` |
| **HU-10 candidata** | `RP-21` |

## Observaciones para validación del equipo

> [!CAUTION]
> Puntos que dependen de decisiones aún no confirmadas.

| # | Observación |
|:-:|:--|
| 1 | HU-04 depende de aprobar la reserva temporal durante el pago y su plazo. El valor inicial de tres minutos es una propuesta, no un acuerdo confirmado. |
| 2 | HU-08 depende de definir con el vendedor la fuente autoritativa del inventario y la coexistencia con el software de ventas existente. |
| 3 | HU-03 y HU-06 dependen de validar la pasarela de pago y el canal de notificaciones, respectivamente; este documento no selecciona proveedores. |
| 4 | HU-10 y RP-21 son candidatos y no deben tratarse como alcance aprobado hasta confirmar la existencia y regla del cargo de empaque. |
| 5 | Las metas cuantitativas de requisitos no se convierten en compromisos operativos hasta que el equipo las valide. |
