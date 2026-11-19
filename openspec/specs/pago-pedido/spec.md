# pago-pedido Specification

## Purpose

Permitir que el estudiante pague por adelantado el total aceptado, con reserva de las unidades, confirmación única del pedido y manejo de rechazos, cancelaciones y reintentos.

## Requirements

### Requirement: Inicio del pago con reserva de unidades

El sistema SHALL revalidar el precio y la disponibilidad antes de iniciar el pago, crear una reserva activa de las unidades, dejar el pedido en «Pendiente de pago» y registrar un intento de pago con su monto. Si no hay disponibilidad, el sistema SHALL NOT reservar ni cobrar.

#### Scenario: Iniciar el pago de un pedido con disponibilidad
- **GIVEN** un pedido en edición con al menos un producto y el total aceptado
- **AND** hay unidades vendibles para todos sus productos
- **WHEN** el estudiante inicia el pago
- **THEN** el pedido pasa a «Pendiente de pago»
- **AND** las unidades quedan en una reserva activa
- **AND** se registra un intento de pago por el total del pedido

#### Scenario: Iniciar el pago sin disponibilidad
- **GIVEN** un pedido en edición
- **AND** uno de sus productos ya no tiene unidades vendibles suficientes
- **WHEN** el estudiante inicia el pago
- **THEN** no se crea la reserva ni el intento de pago
- **AND** se informan los productos afectados y las alternativas disponibles
- **AND** el pedido permanece en edición

### Requirement: Confirmación de un pago aprobado

El sistema SHALL verificar que el estudiante envió el pago y que la Pasarela de pago emitió el resultado; si el pago fue aprobado y la reserva está activa, SHALL confirmar el pedido una sola vez, consumir la reserva, registrar la venta y asignar un código de retiro único. El estudiante SHALL NOT confirmar el pedido por su propia acción.

#### Scenario: Confirmar un pago aprobado

- **GIVEN** que las unidades del pedido están reservadas y el estudiante envió el pago
- **AND** el estudiante aceptó el total informado
- **WHEN** la Pasarela de pago (simulada) informa que el pago fue aprobado
- **THEN** el servidor verifica el envío y el resultado contra el intento registrado
- **AND** el pedido queda confirmado una sola vez
- **AND** se le asigna un código de retiro único
- **AND** se registra la venta digital

### Requirement: Pago rechazado o cancelado

El sistema SHALL informar el resultado, liberar la reserva una sola vez, dejar el pedido en «Pago no realizado» y conservar la selección para reintentar después de revalidar precio y disponibilidad.

#### Scenario: La Pasarela de pago rechaza el pago
- **GIVEN** que el estudiante inició el pago de un pedido
- **WHEN** la Pasarela de pago informa que el pago fue rechazado
- **THEN** el pedido no queda confirmado
- **AND** se informa al estudiante el resultado del pago
- **AND** se libera la reserva de las unidades
- **AND** se conserva su selección para reintentar después de revalidar precio y disponibilidad

#### Scenario: La Pasarela de pago cancela el pago
- **GIVEN** que el estudiante inició el pago de un pedido
- **WHEN** la Pasarela de pago informa que el pago fue cancelado
- **THEN** el pedido no queda confirmado
- **AND** se informa al estudiante que el pago fue cancelado
- **AND** se libera la reserva de las unidades
- **AND** se conserva su selección para reintentar después de revalidar precio y disponibilidad

### Requirement: Reintento del pago

El sistema SHALL permitir reintentar el pago de un pedido en «Pago no realizado», revalidando precio y disponibilidad, exigiendo la aceptación del nuevo total si cambió y creando una reserva y un pago nuevos.

#### Scenario: Reintentar un pago rechazado
- **GIVEN** un pedido en «Pago no realizado» con su selección conservada
- **AND** hay disponibilidad y el total vigente coincide con el aceptado
- **WHEN** el estudiante reintenta el pago
- **THEN** se crea una reserva nueva
- **AND** se registra un intento de pago nuevo
- **AND** el pedido pasa a «Pendiente de pago»

#### Scenario: Reintentar con un total distinto
- **GIVEN** un pedido en «Pago no realizado»
- **AND** el precio de un producto cambió
- **WHEN** el estudiante reintenta el pago
- **THEN** se informa el nuevo total
- **AND** no se inicia el pago hasta que el estudiante acepte el nuevo total

### Requirement: Respuesta repetida de la pasarela

El sistema SHALL procesar una notificación repetida del mismo pago aprobado sin crear otro pago, pedido, código ni venta, y SHALL devolver la misma confirmación.

#### Scenario: La Pasarela de pago informa dos veces el mismo pago aprobado
- **GIVEN** que un pedido ya fue confirmado con un pago aprobado
- **WHEN** la Pasarela de pago repite la notificación de ese pago
- **THEN** no se crea otro pedido
- **AND** no se registra otra venta
- **AND** se conserva el mismo código de retiro

### Requirement: Envío del pago y emisión del resultado

El sistema SHALL presentar dos pasos diferenciados: el estudiante envía el pago a la pasarela y, después, un control identificado como «Pasarela de pago (simulada)» emite el resultado (aprobado, rechazado o cancelado). El sistema SHALL NOT aceptar un resultado antes del envío ni presentar la aprobación como una acción del estudiante.

#### Scenario: El estudiante envía el pago y la pasarela emite el resultado aprobado

- **GIVEN** un pedido en «Pendiente de pago» con su pago registrado y su reserva activa
- **WHEN** el estudiante envía el pago a la pasarela
- **THEN** el sistema presenta la respuesta de la Pasarela de pago (simulada), separada de la acción del estudiante
- **WHEN** la pasarela emite el resultado aprobado
- **THEN** el servidor verifica el envío y el resultado antes de confirmar el pedido

#### Scenario: La pasarela emite un resultado rechazado o cancelado

- **GIVEN** que el estudiante envió el pago de un pedido
- **WHEN** la Pasarela de pago (simulada) informa que el pago fue rechazado o cancelado
- **THEN** el pedido no queda confirmado
- **AND** se informa al estudiante el resultado
- **AND** se libera la reserva de las unidades
- **AND** se conserva su selección para reintentar después de revalidar precio y disponibilidad

#### Scenario: La pasarela emite dos veces el mismo resultado aprobado

- **GIVEN** que un pedido ya fue confirmado con un pago aprobado
- **WHEN** la Pasarela de pago (simulada) repite la notificación de ese pago
- **THEN** no se crea otro pedido
- **AND** no se registra otra venta
- **AND** se conserva el mismo código de retiro

#### Scenario: Resultado emitido sin el envío previo del estudiante

- **GIVEN** un pedido en «Pendiente de pago» cuyo pago aún no fue enviado
- **WHEN** se intenta registrar un resultado de la pasarela
- **THEN** el sistema rechaza el resultado
- **AND** el pedido permanece en «Pendiente de pago» con la reserva activa
