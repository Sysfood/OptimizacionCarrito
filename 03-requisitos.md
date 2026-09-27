# Clasificación de requisitos revisada

[← Índice](./README.md)

## Base y estado de validación

Revisión del 25/09/2026 basada en la entrevista y las cinco respuestas del grupo focal del 22/09/2026, documentadas en [05-elicitacion.md](./05-elicitacion.md). Es una propuesta para validar según RY-04; la entrevista no equivale a aprobación del TO-BE.

Se conservan RP-01…RP-20 y HU-01…HU-09 para mantener trazabilidad. H2 confirma software existente de ventas, stock, ingresos y gastos; sus interfaces y capacidades públicas son desconocidas. H11 no respalda faltantes frecuentes. H13 favorece reducir la fila: el código de pedido identifica una compra, no asigna una cita ni garantiza atención inmediata. H6 informa 5–10 minutos según afluencia, no tiempos medidos por producto ni una garantía de entrega. Las respuestas originales abarcan **15–60 minutos** disponibles (Nicolás declara una hora), aunque H9 resume 15–45.

Las actividades AC conservan sus identificadores como referencias propuestas: AC-01 selección; AC-02 consulta y validación de disponibilidad; AC-03 pago; AC-04 registro y reserva/consumo de stock; AC-05 identificación y estimación informativa; AC-06 cola de preparación; AC-07 estado y aviso; AC-08 validación de entrega. Los documentos AS-IS/TO-BE y diagramas anteriores requieren las correcciones descritas en [la revisión](./07-revision-elicitacion.md).

## Requisitos de producto — Funcionales

“Propuesto” significa decisión de diseño pendiente de validar, aunque su necesidad se apoye en hallazgos.

| ID | Comportamiento verificable | Actividad | Fuente y estado |
|---|---|---|---|
| RP-01 | Mostrar nombre, precio, disponibilidad vendible y fecha/hora de actualización por producto. Indicar agotado o disponibilidad no verificable; no presentar datos vencidos como actuales. | AC-02 | H2, H3, H11; propuesto, condicionado a fuente de stock |
| RP-02 | Permitir agregar, modificar y eliminar productos y cantidades; recalcular el subtotal y el total antes del pago. | AC-01 | H10, H12; propuesto |
| RP-03 | Revalidar y reservar disponibilidad antes del pago; impedir cantidades superiores a las vendibles, identificar los productos afectados y ofrecer alternativas disponibles sin sustituir automáticamente el pedido. | AC-02 | H3; derivado de RP-16 |
| RP-04 | Iniciar el pago del total aceptado y confirmar el pedido solo tras verificar el resultado con la pasarela y asegurar su stock. Mostrar pago pendiente, rechazado o confirmado; procesar respuestas repetidas sin duplicar pedidos ni ventas. | AC-03 | H12; propuesto |
| RP-05 | Reservar unidades al iniciar el pago; convertir la reserva en consumo una sola vez al confirmar. Liberar exclusivamente reservas pendientes ante rechazo, cancelación del pago o vencimiento; no sumar unidades nunca descontadas ni restituir automáticamente productos preparados. | AC-04 | Derivado de RP-04 y RP-16 |
| RP-06 | Registrar cada venta digital confirmada una sola vez, con código de pedido, productos, cantidades, subtotal, cargos aplicados, total, fecha/hora y referencia del pago. Definir conciliación con el software existente antes de integrar, evitando doble contabilización. | AC-04 | H2; propuesta condicionada a validación técnica |
| RP-07 | Asignar un código único a cada pedido confirmado, mostrar su estado y una estimación informativa de preparación cuando existan datos vigentes para calcularla. Aclarar que no es una cita ni una garantía; actualizarla ante cambios de carga e indicar si no puede estimarse. | AC-05 | H1, H6, H13, H14; propuesto |
| RP-08 | Mostrar al vendedor los pedidos confirmados ordenados por fecha/hora de confirmación, con código, productos, cantidades, estado y estimación disponible; mostrar pendientes y listos separados del historial de entregados. | AC-06 | H12, H13; orden FIFO propuesto |
| RP-09 | Permitir al vendedor avanzar de confirmado a en preparación y luego a listo para retiro; registrar las fechas/horas e impedir transiciones incompatibles. | AC-07 | H12; propuesto |
| RP-10 | Avisar al estudiante cuando el pedido esté listo y mantener su estado consultable aunque el aviso no llegue. Comunicar cambios de estimación o atraso sin cancelar automáticamente por superar el tiempo estimado. | AC-07 | H12, H14; propuesto |
| RP-11 | Permitir al vendedor validar el código y detalle de un pedido listo y registrar su entrega una sola vez; impedir entregar pedidos pendientes de pago o ya entregados. | AC-08 | H12; propuesto |
| RP-12 | Permitir al vendedor autorizado abrir/cerrar la recepción de pedidos y reconciliar la disponibilidad del canal digital con el inventario existente, registrando origen, fecha/hora y motivo de ajustes. Rechazar ajustes que comprometan reservas o pedidos confirmados y señalar la discrepancia para resolverla. | AC-02 | H2, H5; mecanismo pendiente |
| RP-13 | Mostrar por jornada y franja horaria ventas digitales, unidades, ingresos y rechazos digitales por falta de stock, deduplicados por intento. Identificar el alcance del reporte; no inferir abandono presencial ni ventas totales del negocio sin integración validada. | AC-04 | H2, H4, H5, H10, H11; propuesto |
| RP-21 | Si el vendedor acuerda aplicar un cargo de empaque, permitir configurarlo, mostrarlo separado del subtotal y obtener aceptación del total antes del pago. Guardar el cargo aceptado en el pedido; los cambios posteriores no alteran pedidos pagados. | AC-01, AC-03 | H7; candidato, pendiente de monto y regla de aplicación |

## Requisitos de producto — No funcionales

Los valores de la versión anterior se conservan como **metas técnicas propuestas**, no como compromisos obtenidos de la elicitación. Deben acordarse condiciones y factibilidad antes de aceptar el producto.

| ID | Propiedad y verificación | Actividad | Estado |
|---|---|---|---|
| RP-14 | Con conexión y fuente de stock operativa, reflejar eventos de venta, reserva, liberación y ajuste en el catálogo en ≤5 s desde su registro en la fuente acordada. Si no puede verificarse actualidad, marcar disponibilidad no verificable y bloquear nuevos pagos. Medir extremo a extremo, incluyendo ventas presenciales si existe integración. | AC-02 | Meta propuesta; depende de H2 |
| RP-15 | Medir latencia y errores durante el pico de almuerzo con una carga obtenida de observación real. Objetivo preliminar: p95 ≤2 s para operaciones propias del sistema, excluyendo interacción humana y latencia de la pasarela; informar esta última por separado. Volumen, duración y concurrencia de la prueba pendientes. | AC-01, AC-03, AC-06 | Pendiente; se retiran 300 pedidos/15 min y expansión multicarrio como compromisos sin evidencia |
| RP-16 | Ante reservas concurrentes, impedir comprometer una unidad más de una vez o producir disponibilidad negativa. Verificar carreras por última unidad, reintentos, vencimientos y respuestas repetidas de pago. | AC-04 | Restricción de integridad derivada |
| RP-17 | Meta propuesta: en el escenario de un producto, una unidad, catálogo cargado y sin errores, llegar a la pantalla de pago en ≤6 acciones deliberadas dentro de la app (toques/clics). Medir por separado acciones y duración de la pasarela. Validar con estudiantes con distintas ventanas de tiempo. | AC-01, AC-03 | Propuesta de usabilidad; no mide ni garantiza duración de preparación |
| RP-18 | Delegar captura y procesamiento de tarjetas a la pasarela; no persistir número completo, CVV ni credenciales en base de datos o registros. Conservar solo referencias y resultado del pago necesarios para el pedido y conciliación. | AC-03 | Restricción de seguridad propuesta; H12 añade cumplimiento operativo vía RP-07/RP-10 |
| RP-19 | Meta propuesta: con vendedor conectado, canal habilitado y dispositivo receptor conectado, entregar aviso de listo en ≤10 s desde que el servidor acepta el cambio. Medir aceptación y recepción; registrar fallos y mantener consulta de estado. No garantizar recepción sin conexión o permisos. | AC-07 | Pendiente de validar canal |
| RP-20 | Ante desconexión, conservar visible la última cola con indicador de datos desactualizados. Guardar marcas de preparación/listo pendientes y sincronizarlas idempotentemente, validando estado vigente. No confirmar pagos, disponibilidad ni entrega definitiva fuera de línea; advertir conflictos al vendedor. | AC-06, AC-07, AC-08 | Propuesta de resiliencia; aviso RP-19 inicia al aceptar el servidor |

## Requisitos de proyecto

Son restricciones del trabajo del equipo, no propiedades del producto; se conserva su origen académico, sin atribuirlo a la entrevista.

| ID | Requisito |
|---|---|
| RY-01 | Desarrollar dentro de la organización GitHub del equipo, con repositorio y GitHub Project. |
| RY-02 | Entregar Markdown enlazado desde el documento maestro. La fecha original indicada era jueves 24 de septiembre, 10:00 AM; confirmar con el curso cualquier nueva fecha, sin asumir prórroga. |
| RY-03 | Entregar diagramas BPMN 2.0 en PNG y fuente .bpmn, elaborados con Camunda Modeler o bpmn.io. |
| RY-04 | Validar el TO-BE y el alcance con el vendedor antes de comprometer desarrollo, incluyendo software existente, cola, empaque y operación presencial. Registrar decisiones y pendientes. |
| RY-05 | Usar tecnologías conocidas por el equipo y evaluar despliegue en capa gratuita; comprobar compatibilidad con las metas acordadas. |
| RY-06 | Usar integración continua y revisión por pares de cada PR antes de integrar a la rama principal. |
| RY-07 | Distribuir trabajo con contribuciones verificables por integrante para evaluación de pares. |

## Requisitos derivados

### Derivación 1 — Reserva transitoria y conciliación del pago

Origen: RP-04, RP-05 y RP-16. Reservar de forma atómica antes del pago; disponibilidad vendible = existencias no consumidas menos reservas activas. Se propone un vencimiento de **3 minutos**, configurable y pendiente de validar con la pasarela. Fallo o vencimiento libera una sola vez la reserva, no incrementa existencias físicas.

Un pago exitoso recibido después del vencimiento no confirma automáticamente un pedido sin stock. Se registra para conciliación, se intenta obtener disponibilidad de forma atómica y, si no existe, se informa al estudiante que el pago está en resolución y se tramita reversa/reembolso según mecanismo por acordar. No se envía a preparación hasta asegurar stock y pago. Se debe acordar responsable, plazo y mecanismo antes de habilitar pagos reales. Este caso técnico es distinto de un pedido pagado y no retirado.

### Derivación 2 — Identificación y estimación informativa

Origen: RP-07 y RP-08. Usar un identificador persistente sin colisiones; un código corto debe validarse junto con su jornada para no confundir pedidos antiguos. No reiniciar ni borrar pedidos abiertos al cierre.

Estimar usando carga pendiente y parámetros operativos que el vendedor debe validar (capacidad, preparación en paralelo y duración). El rango declarado de 5–10 min es contextual; no puede multiplicarse mecánicamente por productos ni aplicarse como SLA. Mostrar estimación no disponible cuando no haya parámetros fiables.

### Derivación 3 — Fuente de inventario y coexistencia

Origen: H2, RP-01, RP-05, RP-06, RP-12 y RP-16. Acordar una fuente autorizada para disponibilidad y ventas de ambos canales. Investigar API/exportación del software existente. Si no hay integración viable, validar una asignación exclusiva de unidades al canal digital y conciliación controlada antes de aceptar pagos. La carga manual de un inventario duplicado sin coordinación no satisface RP-16.

## Fuera de alcance y decisiones pendientes

- Política formal para pedidos pagados y no retirados: fuera de esta iteración según el acta. No cancelar, ceder o reembolsar automáticamente por atraso o inasistencia.
- Escalamiento a varios carritos y promesa de duplicar ventas sin personal: sin validación. La preparación y el empaque siguen requiriendo trabajo humano.
- Cargo de empaque RP-21: candidato; no asumir cobro ni monto.
- Las metas 5 s, 2 s, 6 acciones, 10 s y reserva de 3 min requieren validación; la entrevista no las establece.
