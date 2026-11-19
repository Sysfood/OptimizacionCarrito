# Proposal — HU-02 Armar un pedido y conocer su total

## Why

El catálogo de HU-01 ya permite consultar productos, precios y disponibilidad, pero el estudiante todavía no puede seleccionar qué quiere comprar ni saber cuánto gastará. HU-02 cubre **AC-01 — Seleccionar productos en la app** y la parte de **AC-02** que valida disponibilidad y ofrece alternativas, para que el estudiante arme su pedido y revise el total antes de pagar.

La historia se apoya en **CU-02 — Crear y pagar pedido**, pero esta entrega implementa solo la primera parte del caso de uso: la creación y revisión del pedido. El pago, la reserva de unidades y la confirmación pertenecen a HU-03 y HU-04.

## What Changes

- Persistir un **pedido en edición** asociado a un cliente de demostración y a la jornada vigente.
- Permitir **agregar productos y cantidades**, **modificar cantidades** y **eliminar productos** del pedido.
- Calcular y mostrar el **subtotal de cada detalle** y el **total del pedido** antes de pagar.
- **Rechazar cantidades superiores a las unidades vendibles**, informar el máximo disponible y mostrar otros productos disponibles como alternativas, sin reemplazar el producto sin decisión del estudiante.
- **Revalidar precio y disponibilidad** al continuar al pago: si algo cambió, informar qué producto o valor cambió y exigir la aceptación del nuevo total antes de dejar el pedido listo.
- Agregar controles de demostración para cambiar un precio o consumir unidades y poder reproducir el último escenario Gherkin.
- Mantener el pedido en estado **En edición**; no se inicia el pago ni se invoca la Pasarela de pago en esta historia.

**Fuera de alcance:**

- Pago, pasarela, reserva de unidades, código de retiro, confirmación del pedido y estimación de preparación (HU-03 y HU-04).
- Cargo de empaque y sus reglas (RP-21 / HU-10).
- Administración de disponibilidad y ajustes de stock (HU-08).
- Autenticación real; se mantiene el selector de rol de demostración.
- Requisitos no funcionales de rendimiento, concurrencia y seguridad (RP-15, RP-16, RP-18). RP-17 se usa solo como guía de usabilidad.
- Reemplazo automático de productos agotados por alternativas.

## Capabilities

### New Capabilities

- `armado-pedido`: permite crear y editar un pedido en edición, calcular subtotales y total, validar cantidades contra las unidades vendibles y revalidar precio y disponibilidad antes de iniciar el pago.

### Modified Capabilities

Ninguna. La especificación `catalogo-disponibilidad` de HU-01 no cambia: el catálogo sigue mostrando productos, precios y disponibilidad; HU-02 agrega la acción de incorporarlos a un pedido.

## Impact

- **Base de datos:** nuevas tablas `cliente`, `pedido` y `detalle_pedido` en una migración `002_pedidos.sql`; datos de ejemplo con un cliente de demostración.
- **Dominio y servicios:** tipos de pedido y detalle, cálculo de subtotales y total, validación de cantidades, alternativas y revalidación antes del pago.
- **Rutas y vistas:** acción «Agregar» en el catálogo, pantalla del pedido, actualización y eliminación de detalles, revisión de cambios y aceptación del nuevo total, con un enlace «Mi pedido» en el encabezado.
- **Demostración:** controles para cambiar el precio de un producto y consumir unidades, además del control existente de la fuente de inventario.
- **Pruebas:** una prueba automática por cada escenario Gherkin de HU-02 y pruebas unitarias del cálculo y la validación.
- **Sistemas externos:** ninguno en esta historia; la Pasarela de pago se simulará en HU-03.
