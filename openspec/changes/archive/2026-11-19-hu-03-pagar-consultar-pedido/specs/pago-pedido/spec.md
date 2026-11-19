# Spec Delta — pago de pedido

## Purpose

Permitir que el estudiante pague por adelantado el total aceptado, con reserva de las unidades, confirmación única del pedido y manejo de rechazos, cancelaciones y reintentos.

## ADDED Requirements

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

El sistema SHALL verificar el resultado de la pasarela y, si el pago fue aprobado y la reserva está activa, confirmar el pedido una sola vez, consumir la reserva, registrar la venta y asignar un código de retiro único.

#### Scenario: Confirmar un pago aprobado
- **GIVEN** que las unidades del pedido están reservadas
- **AND** el estudiante aceptó el total informado
- **WHEN** la Pasarela de pago informa que el pago fue aprobado
- **THEN** se verifica el resultado del pago
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
