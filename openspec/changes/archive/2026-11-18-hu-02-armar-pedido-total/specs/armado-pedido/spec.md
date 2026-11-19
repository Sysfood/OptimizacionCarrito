# Spec Delta — armado de pedido

## Purpose

Permitir que el estudiante seleccione productos y cantidades, conozca el subtotal y el total de su pedido y lo revise antes de pagar, con cantidades limitadas por la disponibilidad vendible.

## ADDED Requirements

### Requirement: Cálculo del total del pedido

El sistema SHALL calcular el subtotal de cada producto como la cantidad por su precio unitario y SHALL presentar el total del pedido antes de iniciar el pago.

#### Scenario: Calcular el total de los productos seleccionados
- **GIVEN** que existen productos con unidades vendibles y precio informado
- **WHEN** el estudiante selecciona productos y define sus cantidades
- **THEN** se calcula el subtotal de cada producto
- **AND** se presenta el total del pedido antes de iniciar el pago

### Requirement: Modificación del pedido

El sistema SHALL permitir modificar la cantidad de un producto o eliminarlo del pedido y SHALL recalcular el subtotal y el total con la selección vigente.

#### Scenario: Modificar o quitar productos del pedido
- **GIVEN** que el estudiante ya seleccionó uno o más productos
- **WHEN** modifica una cantidad o elimina un producto
- **THEN** el subtotal y el total se recalculan según la selección vigente

### Requirement: Cantidad superior a la disponible

El sistema SHALL rechazar una cantidad superior a las unidades vendibles, SHALL informar la cantidad máxima que puede solicitarse y SHALL mostrar alternativas disponibles sin reemplazar el producto sin decisión del estudiante.

#### Scenario: Solicitar una cantidad superior a la disponible
- **GIVEN** que un producto tiene menos unidades vendibles que las solicitadas
- **WHEN** el estudiante intenta continuar con esa cantidad
- **THEN** se rechaza la cantidad solicitada
- **AND** se informa la cantidad máxima que puede solicitar
- **AND** se muestran alternativas disponibles, si existen, sin reemplazar el producto sin su decisión

### Requirement: Revalidación antes del pago

El sistema SHALL revalidar el precio y la disponibilidad de los productos del pedido antes de iniciar el pago; si alguno cambió, SHALL informar el producto o valor afectado y SHALL impedir el inicio del pago hasta que el estudiante acepte el nuevo total.

#### Scenario: Cambia el precio o la disponibilidad antes del pago
- **GIVEN** que el estudiante tiene un pedido preparado
- **AND** el precio o la disponibilidad de uno de sus productos cambió
- **WHEN** se revalida el pedido antes del pago
- **THEN** se informa qué producto o valor cambió
- **AND** no se inicia el pago hasta que el estudiante acepta el nuevo total
