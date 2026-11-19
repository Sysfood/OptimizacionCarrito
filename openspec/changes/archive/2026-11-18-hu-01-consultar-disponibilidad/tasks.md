# Tasks — HU-01 Consultar disponibilidad antes de desplazarse

## 1. Base del proyecto

- [x] 1.1 Crear `package.json`, `tsconfig.json` y la estructura `src/` (dominio, servicios, integraciones, rutas, vistas, db) y `tests/`; verificar que `npm install` termina sin errores.
- [x] 1.2 Configurar los scripts `dev` (tsx), `db:seed` (tsx) y `test` (vitest) y las dependencias Express, EJS, better-sqlite3, tsx, TypeScript, Vitest y supertest; verificar con `npm run` que los tres scripts aparecen.
- [x] 1.3 Crear `src/app.ts` (app Express con EJS y sin escuchar puerto) y `src/server.ts` (arranque en el puerto 3000); verificar que `npm run dev` responde 200 en `http://localhost:3000/`.

## 2. Base de datos y datos de ejemplo

- [x] 2.1 Implementar `src/db/conexion.ts` con apertura de SQLite, aplicación de migraciones numeradas y registro en `schema_migrations`; verificar que al ejecutar el seed existe la tabla `schema_migrations` con la versión aplicada.
- [x] 2.2 Crear `src/db/migrations/001_inicial.sql` con las tablas `carrito`, `jornada`, `producto`, `existencia` (con `fecha_hora_actualizacion` y único `jornada_id`+`producto_id`) y `configuracion`; verificar con una consulta que las columnas y la restricción existen.
- [x] 2.3 Implementar `src/db/seed.ts` idempotente con un carrito, una jornada abierta de la fecha actual, cuatro productos (tres con unidades y uno con 0) y `fuente_inventario_disponible = 1`; verificar ejecutándolo dos veces que no duplica filas.

## 3. Dominio y fuente de inventario simulada

- [x] 3.1 Crear los tipos `Carrito`, `Jornada`, `Producto` y `Existencia` y la función de cálculo de unidades vendibles (`asignadas − reservadas − consumidas`); verificar con una prueba unitaria que descuenta reservas y consumos.
- [x] 3.2 Implementar `src/integraciones/fuente-inventario.ts` con la interfaz `FuenteInventario` y su versión simulada que lee la base y responde `noDisponible` cuando la configuración está en 0; verificar con pruebas unitarias ambos resultados.

## 4. Servicio de catálogo

- [x] 4.1 Implementar `src/servicios/catalogo.ts`: obtiene la jornada más reciente con existencias y devuelve productos con nombre, precio, unidades vendibles y `fechaHoraActualizacion`, o un resultado `noDisponible`; verificar con prueba unitaria el caso con datos y el caso sin jornada.
- [x] 4.2 Marcar los productos con 0 unidades vendibles como agotados en el resultado del servicio; verificar con prueba unitaria que un producto sin unidades no se ofrece como disponible.

## 5. Rutas y pantallas

- [x] 5.1 Crear la ruta `GET /catalogo`, el layout y la vista del catálogo con nombre, precio formateado, unidades vendibles y fecha/hora; verificar con supertest que responde 200 y muestra los datos del primer escenario Gherkin.
- [x] 5.2 Renderizar la etiqueta **Agotado** y omitir la acción de agregar para productos sin unidades; verificar con supertest el segundo escenario Gherkin.
- [x] 5.3 Mostrar el aviso **«Disponibilidad no verificable»** cuando la fuente simulada responde `noDisponible`, sin acciones de pago; verificar con supertest el tercer escenario Gherkin.
- [x] 5.4 Agregar el selector de rol de demostración en una cookie (`estudiante`, `vendedor`, `encargado`) con `POST /demo/rol` y el control `POST /demo/fuente-inventario`; verificar que alternar la fuente cambia el catálogo y que el rol se conserva al recargar.

## 6. Actualización visible del catálogo

- [x] 6.1 Añadir el refresco automático de la vista cada 5 segundos; verificar que la página incluye el temporizador y que una consulta posterior refleja el cambio.
- [x] 6.2 Escribir la prueba del cuarto escenario Gherkin: con 3 unidades vendibles, actualizar `unidades_consumidas` en la base y comprobar que el catálogo muestra 2; verificar que `npx vitest run tests/hu-01-consultar-disponibilidad.test.ts` pasa.

## 7. Documentación y cierre

- [x] 7.1 Escribir el `README.md` con instalación, seed, ejecución en `http://localhost:3000/catalogo`, comando de pruebas, datos de ejemplo y control de demostración de la fuente; verificar que cada comando documentado funciona tal como está escrito.
- [x] 7.2 Ejecutar la suite completa (`npm test`) y confirmar que las cuatro pruebas de HU-01 pasan.

## Workflow follow-up

- Archivar el cambio después de que el estudiante valide el sistema y confirme que funciona como esperaba.
- Actualizar `.cin324/proyecto.md` con el estado de HU-01 y el nombre del cambio.
