# Spec Delta

## MODIFIED Requirements

### Requirement: Confirmación de un pago aprobado

El sistema SHALL verificar que el estudiante envió el pago y que la Pasarela de pago emitió el resultado; si el pago fue aprobado y la reserva está **vigente** (activa y no vencida), SHALL confirmar el pedido una sola vez, consumir la reserva, registrar la venta y asignar un código de retiro único. El estudiante SHALL NOT confirmar el pedido por su propia acción.

#### Scenario: Confirmar un pago aprobado

- **GIVEN** que las unidades del pedido están reservadas y el estudiante envió el pago
- **AND** el estudiante aceptó el total informado
- **WHEN** la Pasarela de pago (simulada) informa que el pago fue aprobado
- **THEN** el servidor verifica el envío y el resultado contra el intento registrado
- **AND** verifica que la reserva esté vigente antes de confirmar
- **AND** el pedido queda confirmado una sola vez
- **AND** se le asigna un código de retiro único
- **AND** se registra la venta digital

#### Scenario: El pago se aprueba dentro del plazo de reserva

- **GIVEN** existe una reserva vigente para el pedido
- **WHEN** la Pasarela de pago informa que el pago fue aprobado
- **THEN** la reserva se convierte en consumo de inventario una sola vez
- **AND** el pedido pasa a la cola de preparación

## ADDED Requirements

### Requirement: Reserva atómica de la última unidad

El sistema SHALL permitir que un solo pedido obtenga la reserva cuando quede una sola unidad vendible, rechazando los intentos simultáneos restantes con un aviso de falta de disponibilidad.

#### Scenario: Dos pedidos compiten por la última unidad

- **GIVEN** queda una sola unidad vendible de un producto
- **WHEN** dos estudiantes intentan reservar esa unidad al mismo tiempo
- **THEN** solo uno obtiene la reserva
- **AND** el otro recibe la información de que el producto ya no está disponible

### Requirement: Vencimiento y liberación de la reserva

El sistema SHALL liberar una sola vez la reserva cuando venza el plazo propuesto de 3 minutos sin un pago aprobado, devolviendo las unidades a la disponibilidad solo si no existe otro compromiso.

#### Scenario: La reserva vence sin pago aprobado

- **GIVEN** existe una reserva pendiente de pago
- **WHEN** vence el plazo de reserva (propuesto: 3 minutos) sin un pago aprobado
- **THEN** la reserva se libera una sola vez
- **AND** las unidades vuelven a estar vendibles si no existe otro compromiso
- **AND** el pedido pasa a «Pago no realizado»

### Requirement: Reintento después del vencimiento

El sistema SHALL exigir una nueva validación de precio y disponibilidad y crear una reserva nueva en cada reintento, sin reutilizar una reserva vencida.

#### Scenario: Un nuevo intento de pago exige una nueva reserva

- **GIVEN** la reserva del pedido ya venció y quedó liberada
- **WHEN** el estudiante intenta pagar nuevamente
- **THEN** el sistema revalida precio y disponibilidad
- **AND** crea una reserva nueva
- **AND** no reutiliza la reserva vencida

### Requirement: Pago aprobado tardío sin disponibilidad

El sistema SHALL NO confirmar ni enviar a preparación un pedido cuyo pago fue aprobado después del vencimiento si ya no hay unidades disponibles; SHALL dejarlo en «En conciliación», informar «pago en resolución» y activar la reversa o reembolso simulado.

#### Scenario: Pago aprobado después del vencimiento, sin unidades disponibles

- **GIVEN** la reserva del pedido ya venció
- **AND** las unidades del pedido ya no están disponibles
- **WHEN** la Pasarela de pago informa que el pago fue aprobado
- **THEN** el pedido no se confirma ni pasa a preparación
- **AND** se informa al estudiante que su pago está en resolución
- **AND** se activa la reversa o el reembolso acordado

### Requirement: Pago aprobado tardío con disponibilidad

El sistema SHALL asegurar las unidades en una sola operación y confirmar el pedido cuando un pago aprobado llegue después del vencimiento pero aún exista disponibilidad.

#### Scenario: Pago aprobado después del vencimiento, con unidades disponibles

- **GIVEN** la reserva del pedido ya venció
- **AND** las unidades del pedido siguen disponibles
- **WHEN** la Pasarela de pago informa que el pago fue aprobado
- **THEN** se aseguran las unidades en una sola operación
- **AND** el pedido queda confirmado

### Requirement: Idempotencia del consumo y la liberación

El sistema SHALL consumir o liberar una reserva como máximo una vez, de modo que una notificación repetida de la pasarela no descuente ni devuelva stock dos veces.

#### Scenario: Notificación repetida no descuenta ni libera dos veces

- **GIVEN** una reserva ya fue consumida o liberada
- **WHEN** la Pasarela de pago repite la notificación del resultado
- **THEN** no se descuentan ni se devuelven unidades adicionales
- **AND** el estado de la reserva permanece igual
