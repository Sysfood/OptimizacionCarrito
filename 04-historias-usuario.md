# 🧑‍💻 Historias de usuario

[← Volver al documento maestro](./IngReq-Entrega%201.md)

Cada historia está asociada a una actividad que cambia del AS-IS al TO-BE (ver [`02-rediseno-to-be.md`](./02-rediseno-to-be.md#actividades-que-cambian-del-as-is-al-to-be)) y a los requisitos de [`03-requisitos.md`](./03-requisitos.md).

---

### 🎓 Estudiante

<details open>
<summary><strong>HU-01 · Ver la disponibilidad real antes de salir de clase</strong></summary>

> Como **estudiante**, quiero **ver qué productos tiene disponibles el carrito y cuántas unidades quedan**, para **decidir si me conviene comprar sin caminar hasta allá a averiguarlo**.

**Actividad TO-BE:** AC-02 — Verificar stock disponible en tiempo real
**Requisitos:** `RP-01` `RP-14`

- [ ] Al abrir el catálogo, cada producto muestra nombre, precio y unidades disponibles en ese momento.
- [ ] Un producto con cero unidades se muestra marcado como agotado y no se puede agregar al pedido.
- [ ] Si otro estudiante confirma una compra, la disponibilidad se actualiza dentro de 5 segundos sin recargar manualmente.
- [ ] Si el carrito no ha abierto su jornada, el catálogo indica que el punto de venta está cerrado.

</details>

<details open>
<summary><strong>HU-02 · Armar el pedido desde la sala de clases</strong></summary>

> Como **estudiante**, quiero **seleccionar varios productos con sus cantidades en la app**, para **dejar mi pedido listo mientras todavía estoy en clase**.

**Actividad TO-BE:** AC-01 — Seleccionar productos en la app
**Requisitos:** `RP-02` `RP-03` `RP-17`

- [ ] Puedo agregar, modificar la cantidad y eliminar productos antes de confirmar.
- [ ] El pedido muestra en todo momento el total a pagar actualizado.
- [ ] Si intento pedir más unidades de las disponibles, el sistema lo impide e indica el máximo permitido.
- [ ] Si un producto de mi pedido se agota mientras lo armo, el sistema avisa y sugiere alternativas de la misma categoría.
- [ ] El flujo completo, desde abrir la app hasta llegar a pago, no supera las 6 interacciones.

</details>

<details open>
<summary><strong>HU-03 · Pagar en línea y recibir un turno</strong></summary>

> Como **estudiante**, quiero **pagar mi pedido en línea y recibir un número de turno con hora estimada de retiro**, para **saber cuándo pasar a buscarlo sin hacer fila**.

**Actividad TO-BE:** AC-03 y AC-05 — Confirmar el pedido y pagar en línea; asignar turno y hora
**Requisitos:** `RP-04` `RP-07` `RP-18`

- [ ] El pedido solo queda confirmado cuando la pasarela devuelve una transacción exitosa.
- [ ] Al confirmarse el pago, se muestra un número de turno y una hora estimada de retiro.
- [ ] Si el pago falla o se cancela, el pedido no se confirma, las unidades vuelven a estar disponibles y puedo reintentar sin rearmar el pedido.
- [ ] El número de turno queda accesible en la app hasta que el pedido es retirado.
- [ ] El sistema no almacena datos de la tarjeta usada.

</details>

<details open>
<summary><strong>HU-04 · No perder una unidad ya pagada por otro pedido simultáneo</strong></summary>

> Como **estudiante**, quiero **que las unidades de mi pedido queden reservadas mientras completo el pago**, para **no perder el producto frente a otro pedido hecho al mismo tiempo**.

**Actividad TO-BE:** AC-04 — Registrar el pedido y descontar el stock
**Requisitos:** `RP-05` `RP-16` · [Derivación 1](./03-requisitos.md#derivación-1)

- [ ] Al iniciar el pago, las unidades dejan de estar disponibles para otros estudiantes.
- [ ] Si el pago no se confirma dentro de 3 minutos, la reserva se libera y las unidades vuelven al stock.
- [ ] Dos pedidos concurrentes sobre la última unidad de un producto no pueden confirmarse ambos: uno se confirma, el otro recibe aviso de producto agotado.

</details>

<details open>
<summary><strong>HU-07 · Retirar el pedido presentando el turno</strong></summary>

> Como **estudiante**, quiero **retirar mi pedido mostrando mi número de turno**, para **llevarme lo que pagué sin repetir el pedido ni volver a hacer fila**.

**Actividad TO-BE:** AC-08 — Retirar el pedido / Confirmar la entrega en el sistema
**Requisitos:** `RP-11`

- [ ] La app muestra el número de turno y el detalle del pedido en la pantalla de retiro.
- [ ] El vendedor puede validar el turno y confirmar la entrega en una sola acción.
- [ ] Un turno ya entregado no puede volver a confirmarse.
- [ ] Al confirmarse la entrega, el pedido queda cerrado y desaparece de la cola de pendientes.

</details>

---

### 🧑‍🍳 Vendedor del carrito

<details open>
<summary><strong>HU-05 · Recibir los pedidos en una cola ordenada</strong></summary>

> Como **vendedor**, quiero **ver los pedidos pagados en una cola ordenada por turno con su detalle**, para **preparar por adelantado y no depender de que el estudiante esté frente a mí**.

**Actividad TO-BE:** AC-06 — Enviar el pedido a la cola / Preparar según la cola de turnos
**Requisitos:** `RP-08` `RP-20`

- [ ] Un pedido pagado aparece en la cola dentro de 10 segundos desde su confirmación.
- [ ] La cola se ordena por turno e indica productos, cantidades y hora estimada de retiro.
- [ ] La cola distingue visualmente pendientes, listos para retiro y entregados.
- [ ] Si el dispositivo pierde conexión, el vendedor sigue viendo la cola cargada y los cambios se sincronizan al recuperarla.

</details>

<details open>
<summary><strong>HU-06 · Avisar al estudiante que su pedido está listo</strong></summary>

> Como **vendedor**, quiero **marcar un pedido como listo y que el estudiante sea notificado automáticamente**, para **no tener gente esperando en el mesón mientras preparo**.

**Actividad TO-BE:** AC-07 — Marcar como listo / Notificar al estudiante
**Requisitos:** `RP-09` `RP-10` `RP-19`

- [ ] Marcar un pedido como listo requiere una sola acción en el panel.
- [ ] El estudiante recibe la notificación dentro de 10 segundos desde esa acción.
- [ ] El estado cambia a "listo para retiro" tanto en la app del estudiante como en la cola del vendedor.
- [ ] Si la notificación no puede entregarse, el estado sigue visible en la app al abrirla.

</details>

<details open>
<summary><strong>HU-08 · Cargar el stock de la jornada</strong></summary>

> Como **vendedor**, quiero **cargar al inicio del día las unidades que traigo de cada producto y poder corregirlas durante la jornada**, para **que lo que ven los estudiantes sea lo que realmente tengo**.

**Actividad TO-BE:** AC-02 — Verificar stock disponible en tiempo real
**Requisitos:** `RP-12` `RP-14`

- [ ] El vendedor puede abrir la jornada declarando las unidades iniciales por producto.
- [ ] El vendedor puede ajustar el stock durante la jornada indicando el motivo del ajuste.
- [ ] Un ajuste que deja el stock por debajo de lo ya comprometido por pedidos pagados es rechazado, con el detalle de los pedidos afectados.
- [ ] Al cerrar la jornada, los turnos se reinician para el día siguiente.

</details>

---

### 📊 Encargado del carrito

<details open>
<summary><strong>HU-09 · Saber qué se vendió y qué no se pudo vender</strong></summary>

> Como **encargado**, quiero **un reporte de la jornada con las ventas por producto y los pedidos rechazados por falta de stock**, para **decidir cuánto reponer al día siguiente**.

**Actividad TO-BE:** AC-04 — Registrar el pedido y descontar el stock
**Requisitos:** `RP-06` `RP-13`

- [ ] El reporte muestra, por producto, las unidades vendidas y el ingreso generado.
- [ ] El reporte incluye la cantidad de pedidos no confirmados por falta de stock, desglosada por producto.
- [ ] El reporte indica la distribución de pedidos por franja horaria.
- [ ] El reporte puede consultarse por jornada y por punto de venta.

</details>

---

<sub>💡 Los checkboxes son de referencia visual en este documento — no reemplazan el seguimiento en GitHub Issues/Project durante el desarrollo (ver nota en el README sobre por qué las historias no viven directamente como issues en esta entrega).</sub>
