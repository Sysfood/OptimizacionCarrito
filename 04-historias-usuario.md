# Historias de usuario revisadas

[← Índice](./README.md) · [Requisitos](./03-requisitos.md) · [Elicitación](./05-elicitacion.md)

Propuesta posterior a la elicitación del 22/09/2026. Los criterios son verificables, pero no representan funcionalidades implementadas ni acuerdos ya aprobados. Las metas numéricas heredan el estado **propuesto** de los requisitos. Las AC corresponden a las definiciones revisadas de 03-requisitos.md; los modelos previos deben actualizarse según 07-revision-elicitacion.md.

## HU-01: Consultar disponibilidad antes de desplazarse

Como **estudiante**, quiero **ver productos, precios y disponibilidad actualizada**, para **decidir mi compra antes de ir al carrito**.

**Actividad:** AC-02. **Requisitos:** RP-01, RP-14. **Evidencia:** H2, H3, H11.

- [ ] CA1. Dado un catálogo verificable, muestra nombre, precio, unidades vendibles y hora de actualización.
- [ ] CA2. Dado un producto sin disponibilidad, aparece agotado y no puede agregarse.
- [ ] CA3. Dado un evento registrado de venta, reserva, liberación o ajuste, el catálogo conectado se actualiza en ≤5 s, bajo las condiciones propuestas de RP-14.
- [ ] CA4. Si la fuente no puede verificarse, se advierte que los datos no están actualizados y se bloquea el inicio de pagos.

## HU-02: Armar un pedido y conocer su total

Como **estudiante**, quiero **elegir productos y cantidades y revisar el total**, para **comprar de acuerdo con mi presupuesto y tiempo disponible**.

**Actividad:** AC-01, AC-02. **Requisitos:** RP-02, RP-03, RP-17; RP-21 solo si se aprueba. **Evidencia:** H3, H9, H10.

- [ ] CA1. Agregar, modificar o eliminar productos recalcula subtotal y total.
- [ ] CA2. Una cantidad superior a la vendible se rechaza, indicando el máximo disponible.
- [ ] CA3. Antes del pago se revalida disponibilidad; cualquier cambio de precio o total requiere aceptación.
- [ ] CA4. Si un producto se agota, se informa y se muestran alternativas disponibles, si existen; ningún reemplazo se acepta sin decisión del estudiante.
- [ ] CA5. En el escenario de un producto y una unidad sin errores, se llega a la pantalla de pago en ≤6 acciones dentro de la app; se miden por separado las acciones externas de la pasarela.

## HU-03: Pagar y consultar el progreso del pedido

Como **estudiante**, quiero **pagar por adelantado y consultar la confirmación, el estado y la estimación disponible de mi pedido**, para **organizar mi retiro y reducir la espera presencial**.

**Actividad:** AC-03, AC-05, AC-07. **Requisitos:** RP-04, RP-07, RP-10, RP-18. **Evidencia:** H1, H6, H12, H13, H14.

- [ ] CA1. Solo se muestra confirmado cuando el servidor verifica el pago y asegura las unidades; una respuesta repetida no crea otro pedido.
- [ ] CA2. El pedido confirmado muestra código único y estado; la estimación se rotula informativa, sin exigir reservar una franja de retiro.
- [ ] CA3. Sin parámetros vigentes se muestra “estimación no disponible”; no se promete entrega en 5–10 min por defecto.
- [ ] CA4. Si falla o se cancela el pago, se informa el resultado y se conserva la selección para reintentar, revalidando precio y stock.
- [ ] CA5. Si hay atraso, se informa el nuevo estado/estimación cuando esté disponible; no se cancela automáticamente ni se presume que el estudiante abandona.
- [ ] CA6. Código y detalle permanecen consultables hasta la entrega. La captura de tarjeta ocurre en la pasarela; no queda número completo ni CVV en almacenamiento o registros propios.

## HU-04: Mantener reservadas las unidades durante el pago

Como **estudiante**, quiero **que se reserven mis productos mientras pago**, para **evitar pagar por unidades comprometidas con otra compra**.

**Actividad:** AC-04. **Requisitos:** RP-05, RP-16; [Derivación 1](./03-requisitos.md#derivación-1--reserva-transitoria-y-conciliación-del-pago).

- [ ] CA1. Dos intentos simultáneos por la última unidad producen una sola reserva; el otro recibe aviso de falta de disponibilidad.
- [ ] CA2. La confirmación consume la reserva una vez; notificaciones repetidas no descuentan nuevamente stock.
- [ ] CA3. Rechazo, cancelación del pago o vencimiento liberan la reserva una vez. El plazo inicial propuesto es 3 min, configurable; no se incrementan existencias físicas.
- [ ] CA4. Un pago exitoso tardío entra en conciliación: solo confirma si se obtiene stock atómicamente; sin stock, informa pago en resolución y activa la reversa/reembolso acordada, sin enviarlo a preparar.
- [ ] CA5. Un reintento requiere una nueva validación y no reutiliza una reserva vencida.

## HU-05: Organizar la preparación de pedidos digitales

Como **vendedor**, quiero **ver los pedidos confirmados y sus detalles en una cola**, para **organizar la preparación antes de que el comprador llegue**.

**Actividad:** AC-06. **Requisitos:** RP-08, RP-15, RP-20. **Evidencia:** H1, H7, H12, H13.

- [ ] CA1. Los pedidos confirmados aparecen una sola vez, ordenados por fecha/hora de confirmación; un desempate usa el identificador persistente.
- [ ] CA2. Cada entrada muestra código, productos, cantidades, estado y estimación cuando exista.
- [ ] CA3. Pendientes y listos se distinguen del historial de entregados. No se promete absorber más trabajo físico sin personal.
- [ ] CA4. Sin conexión se conserva la última cola con advertencia de desactualización; los nuevos pedidos remotos no se presentan como recibidos.
- [ ] CA5. Al reconectar se actualiza la cola sin duplicados. La organización conjunta con ventas presenciales debe validarse antes del piloto.

## HU-06: Actualizar preparación y avisar que el pedido está listo

Como **vendedor**, quiero **actualizar el progreso y avisar automáticamente al estudiante cuando esté listo**, para **facilitar el retiro y comunicar el cumplimiento del pedido**.

**Actividad:** AC-07. **Requisitos:** RP-09, RP-10, RP-19, RP-20. **Evidencia:** H12, H14.

- [ ] CA1. Un pedido confirmado pasa a en preparación y después a listo; no se puede marcar listo uno pendiente de pago.
- [ ] CA2. Marcar listo requiere una acción en el panel; el servidor registra la transición una sola vez.
- [ ] CA3. Bajo las condiciones de conexión y permisos de RP-19, el aviso se recibe en ≤10 s desde la aceptación del servidor.
- [ ] CA4. Si el aviso falla, el estado aceptado permanece consultable; se registra el fallo.
- [ ] CA5. Una marca hecha fuera de línea aparece pendiente de sincronización. Al reconectar se valida contra el estado vigente, sin retroceder un pedido entregado; se muestran los conflictos.

## HU-07: Retirar un pedido identificado

Como **estudiante**, quiero **presentar el código de mi pedido listo**, para **recibir los productos pagados sin repetir la toma del pedido**.

**Actividad:** AC-08. **Requisitos:** RP-07, RP-11, RP-20. **Evidencia:** H12, H13.

- [ ] CA1. La pantalla de retiro muestra código, jornada, estado y detalle.
- [ ] CA2. El vendedor valida el pedido listo y confirma entrega; se registra fecha/hora.
- [ ] CA3. Un código inexistente, un pedido sin pago confirmado o uno ya entregado no permite otra entrega.
- [ ] CA4. La confirmación retira el pedido de pendientes y lo conserva en el historial.
- [ ] CA5. Sin conexión no se confirma entrega definitiva en el sistema; se informa la limitación. El protocolo presencial de contingencia queda por acordar.

## HU-08: Mantener disponibilidad compatible con el software existente

Como **vendedor**, quiero **controlar la disponibilidad del canal digital sin duplicar incorrectamente el inventario**, para **vender unidades que realmente puedo entregar**.

**Actividad:** AC-02, AC-04. **Requisitos:** RP-12, RP-14, RP-16; [Derivación 3](./03-requisitos.md#derivación-3--fuente-de-inventario-y-coexistencia). **Evidencia:** H2, H5, H11.

- [ ] CA1. El vendedor autorizado puede abrir/cerrar la recepción digital; cerrada, no admite nuevos pagos.
- [ ] CA2. Cada ajuste registra producto, cantidad, origen, motivo, responsable y fecha/hora.
- [ ] CA3. Un ajuste incompatible con reservas o compromisos confirmados se rechaza y muestra la discrepancia.
- [ ] CA4. El modo acordado de integración o asignación exclusiva impide que una venta presencial y una digital comprometan la misma unidad.
- [ ] CA5. Cerrar la jornada no borra pedidos abiertos ni libera automáticamente productos pagados; los códigos antiguos no identifican pedidos nuevos.
- [ ] CA6. No se habilitan pagos reales hasta validar el mecanismo de fuente de inventario y conciliación con el vendedor.

## HU-09: Consultar ventas digitales para apoyar la reposición

Como **encargado**, quiero **consultar ventas e intentos digitales rechazados por falta de stock**, para **complementar la demanda reciente que ya uso al decidir la reposición**.

**Actividad:** AC-04. **Requisitos:** RP-06, RP-13. **Evidencia:** H2, H4, H5, H10, H11.

- [ ] CA1. El reporte por jornada muestra unidades, ingresos digitales y distribución por franja horaria; cargos de empaque, si se aprueban, aparecen separados.
- [ ] CA2. Los rechazos por stock se agrupan por producto e intento único; refrescar o reintentar el mismo evento no aumenta el contador.
- [ ] CA3. Pagos rechazados y reservas vencidas no cuentan como ventas confirmadas; transacciones en conciliación se identifican por separado.
- [ ] CA4. El reporte declara su cobertura digital y no llama “ventas perdidas totales” a rechazos registrados; no infiere personas que vieron la fila y se fueron.
- [ ] CA5. Ventas presenciales solo se incorporan mediante conciliación validada, sin duplicar ventas ya registradas en el software existente.

## HU-10: Conocer el cargo de empaque — candidata

Como **estudiante**, quiero **conocer cualquier cargo de empaque antes de pagar**, para **decidir conociendo el precio final**.

**Actividad:** AC-01, AC-03. **Requisito:** RP-21. **Evidencia:** H7, H10. **Estado:** pendiente de validar si existe cargo y cómo se aplica.

- [ ] CA1. Si se acuerda un cargo, el vendedor autorizado configura su monto y regla aprobada; no se aplica una regla implícita.
- [ ] CA2. Antes de pagar aparecen subtotal, empaque y total; el total enviado a la pasarela coincide con el aceptado.
- [ ] CA3. Si no hay cargo acordado, no se agrega uno automáticamente.
- [ ] CA4. Cambiar la configuración no modifica el cargo de pedidos ya pagados.

## Cobertura de requisitos

| Historia | Requisitos |
|---|---|
| HU-01 | RP-01, RP-14 |
| HU-02 | RP-02, RP-03, RP-17; RP-21 condicionado |
| HU-03 | RP-04, RP-07, RP-10, RP-18 |
| HU-04 | RP-05, RP-16 |
| HU-05 | RP-08, RP-15, RP-20 |
| HU-06 | RP-09, RP-10, RP-19, RP-20 |
| HU-07 | RP-07, RP-11, RP-20 |
| HU-08 | RP-12, RP-14, RP-16 |
| HU-09 | RP-06, RP-13 |
| HU-10 candidata | RP-21 |

RP-15 se verifica con una prueba de carga transversal, una vez acordado su perfil. Los checkboxes documentan criterios; no indican pruebas ejecutadas. No se define política automática de pedidos pagados y no retirados.
