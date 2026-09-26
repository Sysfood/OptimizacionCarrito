# Análisis de rediseño y propuesta TO-BE

[← Volver al documento maestro](./IngReq-Entrega%201.md)

Este documento parte de los problemas **P1–P6** identificados en [`01-proceso-as-is.md`](./01-proceso-as-is.md#problemas-identificados). Propone seis iniciativas de rediseño y las concreta en el proceso TO-BE soportado por **TurnoCarrito**, un sistema de pedidos anticipados y turnos para el carrito.

## Mejoras identificadas por participante

| Participante | Objetivo | Problema | Mejora deseada |
|---|---|---|---|
| Estudiante | Comer dentro del tiempo libre entre clases | P1 — La fila consume casi todo el tiempo disponible | Poder pedir y pagar antes de salir de clase y solo pasar a retirar |
| Estudiante | Comprar el producto que quiere | P2 — Descubre el quiebre de stock al llegar al mesón | Ver la disponibilidad real antes de desplazarse |
| Vendedor | Atender a más estudiantes por ventana de demanda | P1, P5 — Atención secuencial y sin anticipación de la demanda | Conocer los pedidos antes del término del bloque y preparar por cola |
| Vendedor | Saber qué se vendió para reponer | P4 — El registro en cuaderno es lento y se omite en peak | Que la venta quede registrada sola al confirmarse el pedido |
| Encargado/dueño | Reducir las ventas perdidas | P2, P3 — Abandono de fila y quiebres que no quedan registrados | Capturar la demanda que hoy no se materializa y medirla, incluidos los pedidos rechazados por falta de stock |
| Encargado/dueño | Decidir la reposición con información confiable | P4 — Sin datos de venta confiables | Contar con un reporte de la jornada por producto y por franja horaria |
| Encargado/dueño | Crecer sin multiplicar el personal | P6 — El proceso no escala | Que el volumen adicional lo absorba el sistema, no más vendedores |
| Universidad | Evitar aglomeraciones en el acceso | P1 — Fila en la vereda de entrada | Distribuir los retiros en el tiempo mediante turnos |

## Iniciativas de rediseño

Las heurísticas citadas corresponden al catálogo de mejores prácticas de rediseño de procesos de negocio de Reijers & Liman Mansar. Entre paréntesis se indica el nombre original en inglés.

### Iniciativa 1 — Verificar el stock antes de que el estudiante se desplace

- **Actividad(es) del AS-IS que afecta:** "Revisar visualmente el stock disponible" e "Informar que el producto está agotado" (Vendedor), y "Esperar en la fila" (Estudiante).
- **Heurística aplicada:** *Knock-out* (reordenar los puntos de descarte: ejecutar primero la condición que descarta más casos y que tiene menor costo de ejecución).
- **Objetivo o mejora que resuelve:** P2 — el estudiante descubre el quiebre de stock recién al llegar al mesón, después de haber caminado y esperado.
- **Efecto esperado:** **Tiempo** — elimina el desplazamiento y la espera en los casos que terminan en quiebre. **Calidad** — el estudiante nunca recorre el proceso completo para recibir un "no hay", y recibe alternativas en lugar de un rechazo. El chequeo lo ejecuta el sistema; el único trabajo humano que requiere es que el vendedor declare el stock al abrir la jornada.
- **Actividades TO-BE resultantes:** AC-02.

### Iniciativa 2 — Que el propio estudiante ingrese y pague su pedido

- **Actividad(es) del AS-IS que afecta:** "Indicar el pedido al vendedor" (Estudiante) y "Cobrar el pedido (efectivo o POS)" (Vendedor).
- **Heurística aplicada:** *Integración con el cliente* (*Integration*: el cliente ejecuta parte del proceso que antes ejecutaba la organización), combinada con *Reducción de contactos* (*Contact reduction*: menos interacciones entre cliente y organización).
- **Objetivo o mejora que resuelve:** P1 y P5 — la toma de pedido y el cobro ocupan al vendedor dentro de la ventana crítica, uno por uno.
- **Efecto esperado:** **Tiempo** — saca del mesón dos de las cuatro actividades que hoy ocupan al vendedor en cada venta. **Costo** — más ventas por vendedor sin contratar personal. **Calidad** — el pedido queda escrito por quien lo hace, lo que elimina los errores de comunicación verbal en un entorno ruidoso.
- **Actividades TO-BE resultantes:** AC-01 y AC-03.

### Iniciativa 3 — Automatizar el registro de la venta y el descuento de stock

- **Actividad(es) del AS-IS que afecta:** "Anotar la venta en el cuaderno" y "Revisar visualmente el stock disponible" (Vendedor).
- **Heurística aplicada:** *Automatización de tareas* (*Task automation*: dejar que un sistema ejecute las tareas que no requieren juicio humano).
- **Objetivo o mejora que resuelve:** P4 — el registro manual es lento, se omite en horas peak y deja al encargado sin datos de reposición; y P3 — la demanda que no se concreta hoy no queda registrada.
- **Efecto esperado:** **Tiempo** — elimina una actividad completa del camino crítico del vendedor. **Calidad** — el inventario queda siempre consistente con lo vendido, que es la condición para que la Iniciativa 1 sea confiable. Esto incluye reservar las unidades mientras el pago está en curso y liberarlas si el pago no se confirma, para que dos pedidos simultáneos no comprometan la misma unidad. **Flexibilidad** — habilita el reporte de la jornada (ventas, ingresos y pedidos rechazados por falta de stock) para decidir la reposición.
- **Actividades TO-BE resultantes:** AC-04.

### Iniciativa 4 — Desacoplar el pedido del retiro mediante turnos

- **Actividad(es) del AS-IS que afecta:** "Esperar en la fila" (Estudiante), "Preparar el pedido" (Vendedor) y "Recibir el pedido" (Estudiante).
- **Heurística aplicada:** *Resecuenciación* (*Resequencing*: mover actividades a un punto más conveniente del proceso) y *Paralelismo* (*Parallelism*: ejecutar en paralelo actividades que hoy son secuenciales).
- **Objetivo o mejora que resuelve:** P1 y P5 — hoy la preparación solo puede empezar cuando el estudiante ya está en el mesón.
- **Efecto esperado:** **Tiempo** — la preparación ocurre mientras el estudiante todavía está en clase y mientras camina; el tiempo de ciclo que percibe el estudiante se reduce al tiempo de retiro. **Flexibilidad** — los retiros se distribuyen en el tiempo en lugar de concentrarse en el minuto de salida. **Calidad** — la entrega se valida contra un turno, lo que evita entregar un pedido dos veces o a la persona equivocada.
- **Actividades TO-BE resultantes:** AC-05, AC-06 y AC-08.

### Iniciativa 5 — Notificar el turno en lugar de hacer que el estudiante consulte

- **Actividad(es) del AS-IS que afecta:** "Esperar en la fila" (Estudiante); la espera presencial es, en el fondo, un mecanismo de consulta continua del estado del pedido.
- **Heurística aplicada:** *Buffering* (suscribirse a la información en lugar de solicitarla cada vez).
- **Objetivo o mejora que resuelve:** P1 y el objetivo de la Universidad de evitar aglomeraciones.
- **Efecto esperado:** **Tiempo** — el estudiante no gasta tiempo esperando para saber si su pedido está listo. **Calidad** — la espera deja de ocurrir en la vereda de acceso.
- **Actividades TO-BE resultantes:** AC-07.

### Iniciativa 6 — Soportar el proceso con una plataforma única

- **Actividad(es) del AS-IS que afecta:** todo el proceso, en particular las actividades que hoy no tienen soporte de sistema.
- **Heurística aplicada:** *Tecnología integral* (*Integral technology*: introducir tecnología que habilita nuevas formas de ejecutar el proceso, no solo que acelera las existentes).
- **Objetivo o mejora que resuelve:** P6 — el proceso no escala porque todo su volumen se apoya en trabajo humano.
- **Efecto esperado:** **Flexibilidad** — el mismo proceso soporta uno o varios puntos de venta agregando configuración y no personas; el vendedor puede operar desde su celular aunque la conexión sea intermitente. **Costo** — el costo marginal de cada pedido adicional tiende a cero en las actividades automatizadas.
- **Actividades TO-BE resultantes:** transversal. Es la plataforma que soporta AC-01 a AC-08; su carril en el diagrama es *Sistema de turnos*.

## Diagrama TO-BE

![Proceso TO-BE](./diagramas/to-be.png)

Archivo fuente: [`./diagramas/to-be.bpmn`](./diagramas/to-be.bpmn)

### Descripción del flujo

1. El proceso comienza cuando el estudiante **decide comprar durante la clase** y **selecciona productos en la app**.
2. El sistema **verifica el stock disponible en tiempo real**. Si no hay stock suficiente, **informa los productos sin stock y sugiere alternativas**, y el estudiante vuelve a seleccionar (*Reintentar*).
3. Con stock suficiente, el estudiante **confirma el pedido y paga en línea**. Mientras el pago está en curso, las unidades quedan reservadas para ese pedido.
4. Compuerta **¿Pago confirmado?**
   - **No / expira 3 min:** el sistema **libera las unidades reservadas** y el estudiante puede reintentar el pago sin rearmar el pedido.
   - **Sí:** el sistema **registra el pedido y descuenta el stock**, **asigna número de turno y hora estimada** y **envía el pedido a la cola del vendedor**.
5. El vendedor **prepara el pedido según la cola de turnos** y lo **marca como listo**; el sistema **notifica al estudiante que su turno está listo**.
6. El estudiante **retira el pedido mostrando su turno**, el vendedor **confirma la entrega en el sistema** y el proceso termina en **Pedido entregado sin fila**.

Comparado con el AS-IS, el vendedor deja de ejecutar la verificación de stock, la toma del pedido, el cobro y el registro. Solo conserva la preparación y dos acciones breves en el panel (marcar como listo y confirmar la entrega).

### Tipos de tarea usados en el diagrama

| Tarea | Carril | Tipo BPMN | Por qué |
|---|---|---|---|
| Seleccionar productos en la app | Estudiante | User Task | La ejecuta el estudiante con apoyo del sistema. |
| Verificar stock disponible en tiempo real | Sistema de turnos | Service Task | La ejecuta el sistema automáticamente contra el inventario. |
| Informar productos sin stock y sugerir alternativas | Sistema de turnos | Service Task | Respuesta automática del sistema. |
| Confirmar el pedido y pagar en línea | Estudiante | User Task | La ejecuta el estudiante con apoyo del sistema y de la pasarela de pago. |
| Liberar las unidades reservadas | Sistema de turnos | Service Task | Si el pago falla o expira, el sistema devuelve automáticamente las unidades al stock. |
| Registrar el pedido y descontar el stock | Sistema de turnos | Service Task | Transacción automática, sin intervención humana. |
| Asignar número de turno y hora estimada | Sistema de turnos | Service Task | Cálculo automático a partir de la cola vigente y de los tiempos de preparación. |
| Enviar el pedido a la cola del vendedor | Sistema de turnos | Service Task | Notificación automática al panel del vendedor. |
| Preparar el pedido según la cola de turnos | Vendedor | Manual Task | Trabajo físico del vendedor; el sistema le indica el orden, pero no lo asiste en la preparación. |
| Marcar el pedido como listo | Vendedor | User Task | La ejecuta el vendedor en el panel del sistema. |
| Notificar al estudiante que su turno está listo | Sistema de turnos | Service Task | Envío automático de la notificación. |
| Retirar el pedido mostrando su turno | Estudiante | User Task | El estudiante presenta su turno desde la app. |
| Confirmar la entrega en el sistema | Vendedor | User Task | La ejecuta el vendedor cerrando el pedido en el sistema. |

A diferencia del AS-IS, que no tenía ninguna Service Task, el TO-BE concentra en el carril *Sistema de turnos* todas las actividades que no requieren juicio humano. Solo queda una Manual Task: la preparación física del pedido.

### Actividades de soporte fuera del flujo modelado

El diagrama modela un pedido individual. Algunas actividades ocurren una vez por jornada y no forman parte de ese flujo, pero son condición para que funcione:

| Actividad de soporte | Quién la realiza | Actividad del TO-BE que habilita |
|---|---|---|
| Abrir la jornada declarando el stock inicial por producto y ajustarlo durante el día | Vendedor | AC-02 — sin stock cargado no hay disponibilidad que verificar |
| Configurar el tiempo estándar de preparación de cada producto | Encargado | AC-05 — sin ese parámetro no se puede calcular la hora estimada |
| Consultar el reporte de la jornada (ventas, ingresos, pedidos rechazados y franjas horarias) | Encargado | AC-04 — el reporte se construye con lo que el sistema registra en cada venta |

## Actividades que cambian del AS-IS al TO-BE

| ID | Actividad en el AS-IS | Actividad en el TO-BE | Qué cambia |
|---|---|---|---|
| AC-01 | Esperar en la fila *(Manual, Estudiante)* | Seleccionar productos en la app *(User, Estudiante)* | La espera presencial se reemplaza por la selección remota del pedido durante la clase. El estudiante deja de ocupar tiempo físico en la fila. |
| AC-02 | Revisar visualmente el stock disponible *(Manual, Vendedor)* + Informar que el producto está agotado *(Manual, Vendedor)* | Verificar stock disponible en tiempo real *(Service, Sistema)* + Informar productos sin stock y sugerir alternativas *(Service, Sistema)* | La verificación deja de ser un vistazo del vendedor al final del recorrido y pasa a ser una consulta automática al inicio, antes de que el estudiante se desplace. El "no hay" se convierte en un aviso con alternativas. |
| AC-03 | Indicar el pedido al vendedor *(Manual, Estudiante)* + Cobrar el pedido *(User, Vendedor)* | Confirmar el pedido y pagar en línea *(User, Estudiante)* | La toma de pedido y el cobro dejan de ocupar al vendedor y se trasladan al estudiante, en un solo paso digital. |
| AC-04 | Anotar la venta en el cuaderno *(Manual, Vendedor)* | Registrar el pedido y descontar el stock *(Service, Sistema)* + Liberar las unidades reservadas *(Service, Sistema)* | El registro en papel se reemplaza por una transacción automática que actualiza el inventario en el momento de la venta. Si el pago falla o expira, las unidades reservadas vuelven al stock. |
| AC-05 | *(no existe en el AS-IS)* | Asignar número de turno y hora estimada *(Service, Sistema)* | Se introduce un turno con hora estimada que desacopla el momento del pedido del momento del retiro. |
| AC-06 | Preparar el pedido *(Manual, Vendedor)* | Enviar el pedido a la cola del vendedor *(Service, Sistema)* + Preparar el pedido según la cola de turnos *(Manual, Vendedor)* | La preparación deja de iniciarse con el estudiante presente y pasa a ordenarse por una cola que el vendedor recibe antes del término del bloque. |
| AC-07 | *(no existe en el AS-IS)* | Marcar el pedido como listo *(User, Vendedor)* + Notificar al estudiante que su turno está listo *(Service, Sistema)* | Se introduce un aviso push: el estudiante ya no consulta presencialmente el estado de su pedido. |
| AC-08 | Recibir el pedido *(Manual, Estudiante)* | Retirar el pedido mostrando su turno *(User, Estudiante)* + Confirmar la entrega en el sistema *(User, Vendedor)* | La entrega pasa a estar verificada contra un turno y queda cerrada en el sistema, lo que permite trazar el pedido y detectar pedidos no retirados. |

**Actividad del AS-IS que se mantiene sin cambio:** "Caminar hasta el carrito" sigue existiendo, pero ocurre solo después de la notificación y ya no termina en una fila. Por eso no se modela como tarea en el TO-BE ni origina requisitos.

Esta tabla es la que se usa en [`03-requisitos.md`](./03-requisitos.md) y [`04-historias-usuario.md`](./04-historias-usuario.md) para asociar cada requisito e historia a la actividad que cambia.

### Trazabilidad: problema → iniciativa → actividad → requisitos → historias

| Actividad | Iniciativa | Problemas que ataca | Requisitos asociados | Historias asociadas |
|---|---|---|---|---|
| AC-01 | 2 | P1 | `RP-02` `RP-15` `RP-17` | HU-02 |
| AC-02 | 1 | P2 | `RP-01` `RP-03` `RP-12` `RP-14` | HU-01, HU-08 |
| AC-03 | 2 | P1, P5 | `RP-04` `RP-15` `RP-18` | HU-03 |
| AC-04 | 3 | P3, P4 | `RP-05` `RP-06` `RP-13` `RP-16` · Derivación 1 | HU-04, HU-09 |
| AC-05 | 4 | P1, P5 | `RP-07` · Derivación 2 | HU-03 |
| AC-06 | 4 | P1, P5 | `RP-08` `RP-20` | HU-05 |
| AC-07 | 5 | P1 | `RP-09` `RP-10` `RP-19` | HU-06 |
| AC-08 | 4 | P1, P4 | `RP-11` | HU-07 |
| Transversal | 6 | P6 | `RP-15` `RP-20` · Derivación 2 (turnos por punto de venta) | HU-09 (consulta por punto de venta) |
