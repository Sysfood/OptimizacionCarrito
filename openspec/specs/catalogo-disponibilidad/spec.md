# catalogo-disponibilidad Specification

## Purpose

Permitir que el estudiante consulte, antes de desplazarse, qué productos ofrece el carrito, a qué precio y con cuántas unidades vendibles, para decidir su compra con información actualizada.

## Requirements

### Requirement: Consulta de productos con disponibilidad verificable

El sistema SHALL mostrar, para cada producto de la jornada vigente, su nombre, su precio y sus unidades vendibles, junto con la fecha y hora de la última actualización de la disponibilidad.

#### Scenario: Consultar productos disponibles
- **GIVEN** que el catálogo tiene información verificable de los productos
- **WHEN** el estudiante consulta el catálogo
- **THEN** cada producto muestra su nombre, su precio y sus unidades vendibles
- **AND** se informa la fecha y hora de la última actualización de la disponibilidad

### Requirement: Producto agotado

El sistema SHALL identificar como agotado todo producto cuyas unidades vendibles sean cero y SHALL impedir que ese producto se incorpore a un pedido.

#### Scenario: Consultar un producto agotado
- **GIVEN** que un producto no tiene unidades vendibles
- **WHEN** el estudiante consulta el catálogo
- **THEN** el producto se identifica como agotado
- **AND** no puede incorporarse a un pedido

### Requirement: Disponibilidad no verificable

Cuando la fuente de inventario no responde o sus datos están desactualizados, el sistema SHALL informar que la disponibilidad no puede verificarse y SHALL impedir el inicio de un pago con esa información.

#### Scenario: La disponibilidad no puede verificarse
- **GIVEN** que la fuente de inventario no responde o sus datos están desactualizados
- **WHEN** el estudiante consulta el catálogo
- **THEN** se informa que la disponibilidad no puede verificarse
- **AND** no se permite iniciar un pago con esa información

### Requirement: Actualización del catálogo ante cambios de inventario

El sistema SHALL reflejar en el catálogo los cambios registrados de inventario en un máximo de 5 segundos (meta propuesta de RP-14).

#### Scenario: El catálogo refleja un cambio de inventario
- **GIVEN** que un producto tiene 3 unidades vendibles
- **WHEN** se registra la venta de 1 unidad de ese producto
- **THEN** el catálogo muestra 2 unidades vendibles en un máximo de 5 segundos (meta propuesta)
