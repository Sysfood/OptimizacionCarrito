# Criterios de aceptación (Gherkin)

[← Documento maestro](./IngReq-Entrega%202.md)

Se especifican las historias **HU-01 a HU-09**, que son las usadas en los [casos de uso](./09-casos-de-uso.md) y en los [diagramas de secuencia](./10-diagramas-secuencia.md). HU-10 (cargo de empaque) no se incluye porque sigue siendo candidata y no está aprobada.

Cada historia tiene al menos un escenario principal y uno alternativo o de error. Los escenarios describen resultados observables con los términos del [modelo de dominio](./08-modelo-dominio.md) (Pedido, Producto, Inventario, Reserva, Pago, Notificación, código de retiro) y no mencionan pantallas ni detalles de implementación. Los tiempos y plazos marcados como «propuesto» son metas de la Entrega 1 aún no validadas.

## HU-01 — Consultar disponibilidad antes de desplazarse

Historia: Como estudiante, quiero ver productos, precios y disponibilidad actualizada, para decidir mi compra antes de ir al carrito.

Requisitos: RP-01, RP-14 · Caso de uso: CU-01

```gherkin
Característica: Consulta de catálogo y disponibilidad

  Escenario: Consultar productos disponibles
    Dado que el catálogo tiene información verificable de los productos
    Cuando el estudiante consulta el catálogo
    Entonces cada producto muestra su nombre, su precio y sus unidades vendibles
    Y se informa la fecha y hora de la última actualización de la disponibilidad

  Escenario: Consultar un producto agotado
    Dado que un producto no tiene unidades vendibles
    Cuando el estudiante consulta el catálogo
    Entonces el producto se identifica como agotado
    Y no puede incorporarse a un pedido

  Escenario: La disponibilidad no puede verificarse
    Dado que la fuente de inventario no responde o sus datos están desactualizados
    Cuando el estudiante consulta el catálogo
    Entonces se informa que la disponibilidad no puede verificarse
    Y no se permite iniciar un pago con esa información

  Escenario: El catálogo refleja un cambio de inventario
    Dado que un producto tiene 3 unidades vendibles
    Cuando se registra la venta de 1 unidad de ese producto
    Entonces el catálogo muestra 2 unidades vendibles en un máximo de 5 segundos (meta propuesta)
```

## HU-02 — Armar un pedido y conocer su total

Historia: Como estudiante, quiero elegir productos y cantidades y revisar el total, para comprar de acuerdo con mi presupuesto y tiempo disponible.

Requisitos: RP-02, RP-03, RP-17 · Caso de uso: CU-02 · Secuencia: DSS-01

```gherkin
Característica: Construcción y revisión de un pedido

  Escenario: Calcular el total de los productos seleccionados
    Dado que existen productos con unidades vendibles y precio informado
    Cuando el estudiante selecciona productos y define sus cantidades
    Entonces se calcula el subtotal de cada producto
    Y se presenta el total del pedido antes de iniciar el pago

  Escenario: Modificar o quitar productos del pedido
    Dado que el estudiante ya seleccionó uno o más productos
    Cuando modifica una cantidad o elimina un producto
    Entonces el subtotal y el total se recalculan según la selección vigente

  Escenario: Solicitar una cantidad superior a la disponible
    Dado que un producto tiene menos unidades vendibles que las solicitadas
    Cuando el estudiante intenta continuar con esa cantidad
    Entonces se rechaza la cantidad solicitada
    Y se informa la cantidad máxima que puede solicitar
    Y se muestran alternativas disponibles, si existen, sin reemplazar el producto sin su decisión

  Escenario: Cambia el precio o la disponibilidad antes del pago
    Dado que el estudiante tiene un pedido preparado
    Y el precio o la disponibilidad de uno de sus productos cambió
    Cuando se revalida el pedido antes del pago
    Entonces se informa qué producto o valor cambió
    Y no se inicia el pago hasta que el estudiante acepta el nuevo total
```

## HU-03 — Pagar y consultar el progreso del pedido

Historia: Como estudiante, quiero pagar por adelantado y consultar la confirmación, el estado y la estimación disponible de mi pedido, para organizar mi retiro y reducir la espera presencial.

Requisitos: RP-04, RP-07, RP-10, RP-18 · Casos de uso: CU-02, CU-07 · Secuencia: DSS-01

```gherkin
Característica: Pago y seguimiento de un pedido

  Escenario: Confirmar un pago aprobado
    Dado que las unidades del pedido están reservadas
    Y el estudiante aceptó el total informado
    Cuando la Pasarela de pago informa que el pago fue aprobado
    Entonces se verifica el resultado del pago
    Y el pedido queda confirmado una sola vez
    Y se le asigna un código de retiro único
    Y se registra la venta digital

  Escenario: La Pasarela de pago rechaza el pago
    Dado que el estudiante inició el pago de un pedido
    Cuando la Pasarela de pago informa que el pago fue rechazado
    Entonces el pedido no queda confirmado
    Y se informa al estudiante el resultado del pago
    Y se libera la reserva de las unidades
    Y se conserva su selección para reintentar después de revalidar precio y disponibilidad

  Escenario: La Pasarela de pago informa dos veces el mismo pago aprobado
    Dado que un pedido ya fue confirmado con un pago aprobado
    Cuando la Pasarela de pago repite la notificación de ese pago
    Entonces no se crea otro pedido
    Y no se registra otra venta

  Escenario: Consultar un pedido confirmado
    Dado que el pedido fue confirmado
    Cuando el estudiante consulta su pedido
    Entonces se muestran su código de retiro, su estado y su detalle
    Y el pedido sigue consultable hasta que sea entregado

  Escenario: La estimación de preparación no está disponible
    Dado que el pedido fue confirmado
    Y no existen parámetros vigentes para estimar su preparación
    Cuando el estudiante consulta el estado del pedido
    Entonces se muestra el estado actual
    Y se informa que la estimación no está disponible
    Y se aclara que el código identifica el pedido y no es una cita ni garantiza una hora de retiro

  Escenario: El pedido presenta un atraso
    Dado que el pedido fue confirmado y todavía no está listo
    Cuando se registra un atraso o cambia la estimación disponible
    Entonces se informa al estudiante el estado o la estimación actualizados
    Y el pedido no se cancela por superar la estimación
```

## HU-04 — Mantener reservadas las unidades durante el pago

Historia: Como estudiante, quiero que se reserven mis productos mientras pago, para evitar pagar por unidades comprometidas con otra compra.

Requisitos: RP-05, RP-16 · Caso de uso: CU-02 · Secuencia: DSS-01

```gherkin
Característica: Reserva temporal de unidades durante el pago

  Escenario: Dos pedidos compiten por la última unidad
    Dado que queda una sola unidad vendible de un producto
    Cuando dos estudiantes intentan reservar esa unidad al mismo tiempo
    Entonces solo uno obtiene la reserva
    Y el otro recibe la información de que el producto ya no está disponible

  Escenario: El pago se aprueba dentro del plazo de reserva
    Dado que existe una reserva vigente para el pedido
    Cuando la Pasarela de pago informa que el pago fue aprobado
    Entonces la reserva se convierte en consumo de inventario una sola vez
    Y el pedido pasa a la cola de preparación

  Escenario: La reserva vence sin pago aprobado
    Dado que existe una reserva pendiente de pago
    Cuando vence el plazo de reserva (propuesto: 3 minutos) sin un pago aprobado
    Entonces la reserva se libera una sola vez
    Y las unidades vuelven a estar vendibles si no existe otro compromiso
    Y un nuevo intento de pago exige una nueva reserva

  Escenario: Pago aprobado después del vencimiento, sin unidades disponibles
    Dado que la reserva del pedido ya venció
    Y las unidades del pedido ya no están disponibles
    Cuando la Pasarela de pago informa que el pago fue aprobado
    Entonces el pedido no se confirma ni pasa a preparación
    Y se informa al estudiante que su pago está en resolución
    Y se activa la reversa o el reembolso acordado

  Escenario: Pago aprobado después del vencimiento, con unidades disponibles
    Dado que la reserva del pedido ya venció
    Y las unidades del pedido siguen disponibles
    Cuando la Pasarela de pago informa que el pago fue aprobado
    Entonces se aseguran las unidades en una sola operación
    Y el pedido queda confirmado
```

## HU-05 — Organizar la preparación de pedidos digitales

Historia: Como vendedor, quiero ver los pedidos confirmados y sus detalles en una cola, para organizar la preparación antes de que el comprador llegue.

Requisitos: RP-08, RP-15, RP-20 · Caso de uso: CU-03 · Secuencia: DSS-02

```gherkin
Característica: Organización de pedidos digitales para preparación

  Escenario: Consultar los pedidos confirmados pendientes
    Dado que existen pedidos con pago confirmado
    Cuando el vendedor consulta la cola de preparación
    Entonces se muestran los pedidos confirmados pendientes ordenados por fecha y hora de confirmación
    Y cada pedido incluye su código de retiro, sus productos, sus cantidades y su estado

  Escenario: Un pedido sin pago confirmado no aparece en la cola
    Dado que existe un pedido pendiente de pago
    Cuando el vendedor consulta la cola de preparación
    Entonces ese pedido no aparece en la cola

  Escenario: Se repite la confirmación de un pedido
    Dado que un pedido confirmado ya figura en la cola
    Cuando se recibe nuevamente la confirmación de ese pedido
    Entonces el pedido aparece una sola vez en la cola

  Escenario: Consultar la cola sin conexión
    Dado que el vendedor perdió la conexión
    Y existe una última cola recibida
    Cuando consulta los pedidos
    Entonces se muestra la última cola recibida con una advertencia de que puede estar desactualizada
    Y los pedidos nuevos no se presentan como recibidos

  Escenario: Recuperar la conexión
    Dado que el vendedor estuvo sin conexión
    Cuando se restablece la conexión
    Entonces la cola se actualiza con la información vigente
    Y no se duplican los pedidos que ya figuraban
```

## HU-06 — Actualizar preparación y avisar que el pedido está listo

Historia: Como vendedor, quiero actualizar el progreso y avisar automáticamente al estudiante cuando esté listo, para facilitar el retiro y comunicar el cumplimiento del pedido.

Requisitos: RP-09, RP-10, RP-19, RP-20 · Caso de uso: CU-03 · Secuencia: DSS-02

```gherkin
Característica: Actualización del estado y aviso de pedido listo

  Escenario: Iniciar la preparación de un pedido
    Dado que existe un pedido confirmado y pendiente de preparación
    Cuando el vendedor inicia su preparación
    Entonces el pedido pasa al estado en preparación

  Escenario: Marcar un pedido como listo y avisar al estudiante
    Dado que el pedido está en preparación
    Cuando el vendedor informa que terminó de prepararlo
    Entonces el pedido pasa al estado listo para retiro una sola vez
    Y se registra la fecha y hora del cambio
    Y el estudiante recibe la notificación en un máximo de 10 segundos (meta propuesta)

  Escenario: Intentar marcar como listo un pedido sin pago confirmado
    Dado que un pedido no tiene el pago confirmado
    Cuando el vendedor intenta marcarlo como listo
    Entonces se rechaza el cambio de estado
    Y el pedido no queda listo para retiro

  Escenario: Falla el envío de la notificación
    Dado que el pedido pasó al estado listo para retiro
    Cuando el Servicio de notificaciones no logra entregar el aviso
    Entonces el pedido conserva el estado listo para retiro
    Y el estudiante puede consultarlo
    Y se registra que la notificación no pudo entregarse

  Escenario: El vendedor marca un pedido como listo sin conexión
    Dado que el vendedor está sin conexión
    Cuando marca un pedido como listo
    Entonces el cambio queda pendiente de sincronización
    Y al restablecerse la conexión se valida contra el estado vigente del pedido
    Y un pedido ya entregado no retrocede de estado
    Y los conflictos se informan al vendedor
```

## HU-07 — Retirar un pedido identificado

Historia: Como estudiante, quiero presentar el código de mi pedido listo, para recibir los productos pagados sin repetir la toma del pedido.

Requisitos: RP-07, RP-11, RP-20 · Caso de uso: CU-04

```gherkin
Característica: Retiro y entrega de un pedido

  Escenario: Entregar un pedido listo y pagado
    Dado que el estudiante presenta el código de retiro de un pedido
    Y el pedido tiene el pago confirmado y está listo para retiro
    Cuando el vendedor valida el código y confirma la entrega
    Entonces el pedido pasa al estado entregado
    Y se registra la fecha y hora del retiro
    Y el pedido sale de los pendientes y queda en el historial

  Escenario: Presentar un código inexistente
    Dado que el código presentado no corresponde a ningún pedido
    Cuando el vendedor intenta validarlo
    Entonces se informa que el pedido no existe
    Y no se registra ninguna entrega

  Escenario: Intentar retirar un pedido que no está listo o no está pagado
    Dado que el pedido no tiene el pago confirmado o no está listo para retiro
    Cuando el vendedor intenta confirmar la entrega
    Entonces se rechaza la entrega
    Y el pedido conserva su estado

  Escenario: Intentar entregar dos veces el mismo pedido
    Dado que el pedido ya fue registrado como entregado
    Cuando se presenta nuevamente su código de retiro
    Entonces se informa que el pedido ya fue entregado
    Y no se registra una segunda entrega

  Escenario: Confirmar una entrega sin conexión
    Dado que el vendedor está sin conexión
    Cuando intenta confirmar la entrega de un pedido
    Entonces no se registra una entrega definitiva
    Y se informa la limitación al vendedor
```

## HU-08 — Mantener disponibilidad compatible con el software existente

Historia: Como vendedor, quiero controlar la disponibilidad del canal digital sin duplicar incorrectamente el inventario, para vender unidades que realmente puedo entregar.

Requisitos: RP-12, RP-14, RP-16 · Caso de uso: CU-06

```gherkin
Característica: Control de disponibilidad del canal digital

  Escenario: Cerrar la recepción de pedidos digitales
    Dado que el vendedor está autorizado para administrar el canal digital
    Cuando cierra la recepción de pedidos digitales
    Entonces se registra el nuevo estado del canal
    Y no se admiten nuevos pagos mientras esté cerrado

  Escenario: Registrar un ajuste de disponibilidad válido
    Dado que el vendedor está autorizado para ajustar la disponibilidad
    Y el ajuste no afecta unidades reservadas ni pedidos confirmados
    Cuando registra el producto, la cantidad, el origen y el motivo del ajuste
    Entonces el Inventario se actualiza con la nueva disponibilidad
    Y se registran el responsable y la fecha y hora del ajuste

  Escenario: Rechazar un ajuste incompatible con unidades comprometidas
    Dado que existen unidades comprometidas por reservas o pedidos confirmados
    Cuando el vendedor registra un ajuste que contradice esos compromisos
    Entonces se rechaza el ajuste
    Y se muestra la discrepancia que debe revisar

  Escenario: Cerrar la jornada con pedidos abiertos
    Dado que existen pedidos pagados que aún no fueron entregados
    Cuando el vendedor cierra la jornada
    Entonces los pedidos abiertos se conservan
    Y los productos pagados no se liberan automáticamente

  Escenario: No existe un mecanismo de inventario validado
    Dado que aún no se acordó con el vendedor cómo coexistirá el canal digital con su software de ventas
    Cuando se intenta habilitar la recepción de pagos reales
    Entonces no se habilitan los pagos reales
```

## HU-09 — Consultar ventas digitales para apoyar la reposición

Historia: Como encargado, quiero consultar ventas e intentos digitales rechazados por falta de stock, para complementar la demanda reciente que ya uso al decidir la reposición.

Requisitos: RP-06, RP-13 · Caso de uso: CU-05

```gherkin
Característica: Consulta de ventas digitales y falta de stock

  Escenario: Consultar las ventas digitales de una jornada
    Dado que existen ventas digitales registradas en una jornada
    Cuando el encargado consulta el reporte de esa jornada
    Entonces se muestran las unidades vendidas y los ingresos digitales
    Y se muestra la distribución de las ventas por franja horaria

  Escenario: Consultar intentos rechazados por falta de stock
    Dado que existen intentos de compra rechazados por falta de unidades
    Cuando el encargado consulta el reporte
    Entonces los rechazos se agrupan por producto
    Y un mismo intento no se cuenta otra vez por refrescar o reintentar

  Escenario: Excluir operaciones que no son ventas confirmadas
    Dado que existen pagos rechazados, reservas vencidas y transacciones en conciliación
    Cuando el encargado consulta el total de ventas confirmadas
    Entonces los pagos rechazados y las reservas vencidas no se cuentan como ventas
    Y las transacciones en conciliación se presentan por separado

  Escenario: No existe conciliación con las ventas presenciales
    Dado que las ventas del software existente no están conciliadas con el canal digital
    Cuando el encargado consulta el reporte
    Entonces el reporte declara que cubre solo el canal digital
    Y no lo presenta como el total de ventas del negocio
```
