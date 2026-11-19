# Tasks — HU-02 Armar un pedido y conocer su total

## 1. Modelo y base de datos

- [x] 1.1 Crear `src/db/migrations/002_pedidos.sql` con las tablas `cliente`, `pedido` y `detalle_pedido`, sus claves foráneas, el único (`pedido_id`, `producto_id`), `cantidad > 0` y los estados de EST-01; verificar con una consulta que las columnas y restricciones existen.
- [x] 1.2 Agregar al seed un `Cliente` de demostración idempotente y verificar ejecutando `npm run db:seed` dos veces que no duplica filas.
- [x] 1.3 Crear `src/dominio/pedido.ts` con los tipos `EstadoPedido`, `Pedido`, `DetallePedido` y la función que calcula subtotales y total; verificar con pruebas unitarias de cantidades y precios.

## 2. Servicio de pedido

- [x] 2.1 Extraer `obtenerJornadaVigente(db)` del servicio de catálogo y reutilizarla en `obtenerCatalogo`; verificar que las pruebas de HU-01 siguen pasando.
- [x] 2.2 Implementar en `src/servicios/pedido.ts` la creación y lectura de un pedido en edición asociado al cliente de demostración y a la jornada vigente; verificar con prueba unitaria que el pedido nace en estado «En edición».
- [x] 2.3 Implementar `agregarProducto` con validación de cantidad contra las unidades vendibles, máximo solicitable y alternativas disponibles; verificar con pruebas unitarias de cantidad válida, cantidad excedida y producto agotado.
- [x] 2.4 Implementar la actualización de cantidad y la eliminación de un detalle, incluyendo el borrado del pedido cuando se quita el último producto; verificar con pruebas unitarias de recálculo y de pedido vacío.
- [x] 2.5 Implementar `revalidarPedido` y `aceptarNuevoTotal` comparando precio y disponibilidad; verificar con pruebas unitarias de cambio de precio, disponibilidad insuficiente y aceptación exitosa.

## 3. Armado del pedido en pantalla

- [x] 3.1 Agregar el formulario de cantidad y el botón **Agregar** en el catálogo solo para productos no agotados, y el enlace **Mi pedido** en el encabezado; verificar que el producto agotado no muestra la acción.
- [x] 3.2 Crear `GET /pedido` y su vista con detalles, subtotales, total y estado vacío; verificar con supertest que responde 200 y muestra el total correcto.
- [x] 3.3 Crear `POST /pedido/agregar` con la cookie `pedido_id` y la creación del pedido en edición; verificar con la prueba del escenario «Calcular el total de los productos seleccionados».
- [x] 3.4 Crear las rutas de actualización y eliminación de detalles; verificar con la prueba del escenario «Modificar o quitar productos del pedido».
- [x] 3.5 Completar el rechazo de cantidades excedidas con el máximo y las alternativas; verificar con la prueba del escenario «Solicitar una cantidad superior a la disponible».

## 4. Revalidación y demostración

- [x] 4.1 Crear `POST /pedido/revalidar` y `POST /pedido/aceptar-total` con las vistas de cambios y de pedido listo; verificar con la prueba del escenario «Cambia el precio o la disponibilidad antes del pago».
- [x] 4.2 Agregar los controles de demostración para cambiar un precio y consumir unidades, actualizando `producto.precio`, `existencia.unidades_consumidas` y `fecha_hora_actualizacion`; verificar que el cambio se refleja en la revalidación.
- [x] 4.3 Cubrir con una prueba adicional la disponibilidad que ya no alcanza para la cantidad pedida, comprobando que no se acepta el total y se pide ajustar o eliminar.

## 5. Integración y documentación

- [x] 5.1 Ejecutar `npx tsc --noEmit` y `npm test`; verificar que las pruebas de HU-01 y HU-02 pasan y que el arranque con `npm run dev` responde en `/catalogo` y `/pedido`.
- [x] 5.2 Actualizar el `README.md` con el recorrido de HU-02, los controles de demostración y las pruebas; verificar que cada comando documentado funciona tal como está escrito.

## Workflow follow-up

- Archivar el cambio después de que el estudiante valide el sistema y confirme que funciona como esperaba.
- Actualizar `.cin324/proyecto.md` con el estado de HU-02 y el nombre del cambio.
