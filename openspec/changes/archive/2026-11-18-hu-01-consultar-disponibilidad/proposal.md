# Proposal — HU-01 Consultar disponibilidad antes de desplazarse

## Why

En el proceso AS-IS el estudiante conoce la disponibilidad recién cuando llega al mesón, después de caminar y hacer fila (problema P2). La Iniciativa 1 del TO-BE mueve esa verificación al inicio del proceso: el sistema consulta el stock antes de que el estudiante se desplace. HU-01 entrega la primera capacidad observable de TurnoCarrito y es la base de las historias de pedido, reserva y pago.

## What Changes

- Se crea el catálogo público del carrito: nombre, precio, unidades vendibles y fecha/hora de la última actualización de cada producto de la jornada vigente.
- Un producto sin unidades vendibles se muestra **Agotado** y no ofrece acción para incorporarse a un pedido.
- Si la fuente de inventario no responde o sus datos no son verificables, se muestra el aviso **«Disponibilidad no verificable»** y se bloquea el inicio de pago con esa información.
- El catálogo refleja los cambios de inventario en la vista mediante refresco automático cada 5 segundos (meta propuesta de RP-14).
- Se agrega `fechaHoraActualizacion` a la entidad **Existencia** del modelo de dominio para poder informar la frescura de la disponibilidad (RP-01).
- Se crea la base de la aplicación (TypeScript + Express + EJS + SQLite), las migraciones y los datos de ejemplo de un carrito, una jornada abierta, productos y existencias.

## Capabilities

### New Capabilities
- `catalogo-disponibilidad`: consulta del catálogo con nombre, precio, unidades vendibles y frescura; identificación de productos agotados; aviso y bloqueo cuando la disponibilidad no puede verificarse.

### Modified Capabilities
- Ninguna: no existen especificaciones principales todavía.

## Impact

- **Código nuevo:** estructura `src/` (dominio, servicios, integraciones, rutas, vistas), migraciones en `src/db/migrations`, datos de ejemplo y `README.md`.
- **Base de datos:** tablas derivadas del modelo de dominio `Carrito`, `Jornada`, `Producto` y `Existencia` (con `fechaHoraActualizacion`).
- **Integración simulada:** fuente de inventario (la integración real con el software de ventas del vendedor no está acordada — Derivación 3), con un control de demostración para forzar «fuente no disponible».
- **Pantallas:** página del catálogo del estudiante; selector de rol de demostración para navegar entre roles.
- **Fuera del alcance:** armar el pedido y calcular totales (HU-02), pago y consulta de estado (HU-03), reserva de unidades (HU-04), carga/ajuste/cierre de disponibilidad (HU-08), cargo de empaque (HU-10) y requisitos no funcionales distintos del refresco visible. No se implementa autenticación real.
