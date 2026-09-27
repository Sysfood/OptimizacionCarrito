# Elicitación de requisitos

[← Volver al documento maestro](./IngReq-Entrega%201.md)

## Técnica 1: Entrevista semiestructurada

- **Participante(s):** Denis Alballay — Vendedor y encargado del carrito de comida ubicado en General Cruz 222.
- **Fecha y modalidad:** 22/09/2026 — presencial, en el lugar de operación del carrito.
- **Duración:** 10 a 15 minutos.
- **Entrevistadores:** Joaquín Rojas Toledo.
- **Evidencia:** [`./evidencia/entrevista-vendedor.jpg`](./evidencia/entrevista-vendedor.jpg)

### Guion de la entrevista

1. ¿Cómo es un día normal de trabajo en el carrito, desde que llega hasta que se va?
2. ¿En qué momentos del día se forma fila y cuánto dura?
3. ¿Cómo sabe qué le queda de cada producto mientras está atendiendo?
4. ¿Qué pasa cuando un estudiante pide algo que ya se acabó?
5. ¿Cómo registra lo que vende? ¿Para qué usa ese registro?
6. ¿Cómo decide cuánto traer al día siguiente?
7. ¿Cuánto se demora en preparar cada producto?
8. ¿Ha visto estudiantes que llegan, ven la fila y se van?
9. ¿Qué haría si pudiera atender al doble de estudiantes?
10. ¿Qué le preocuparía de recibir pedidos por una aplicación?

### Respuestas del entrevistado

| Pregunta | Respuesta de Denis |
|---|---|
| 1. ¿Cómo es un día normal? | Las ventas son parejas día a día, los números se mantienen equilibrados. |
| 2. ¿Cuándo se forma fila? | El momento con más público es el almuerzo. |
| 3. ¿Cómo sabe el stock mientras atiende? | Tiene un software de ventas que mide el stock de cada producto. |
| 4. ¿Qué pasa si algo se acabó? | Ofrece una alternativa; el cliente generalmente cambia el pedido y se lleva otra cosa. |
| 5. ¿Cómo registra las ventas? | A través del mismo software de ventas, que usa para medir ingresos y gastos del local. |
| 6. ¿Cómo decide cuánto traer? | El stock del día se decide el día anterior en base a la demanda reciente, dejando una reserva para no quedar sin stock. |
| 7. ¿Cuánto tarda en preparar? | Productos rápidos, no más de 5 a 10 minutos, según la afluencia de público. |
| 8. ¿Ve gente que llega, ve la fila y se va? | En esta ubicación no suele pasar; sí ocurre en algunas ocasiones, como eventos. |
| 9. ¿Qué haría con el doble de demanda? | Ampliaría el personal para abarcar esa cantidad de clientes. |
| 10. ¿Qué le preocuparía de una app de pedidos? | El tema del empaque: necesitaría cajas o implementos extra, lo que subiría el costo del producto final. |

### Hallazgos principales

- **H1.** Las ventas son parejas día a día según el propio vendedor, y el momento de mayor afluencia dentro del día es el horario de almuerzo. *(Matiza la Iniciativa 4: el pico de demanda está más marcado en el bloque de almuerzo que en cada cambio de clase por igual — coincide con H9 del grupo focal, donde varios estudiantes compran justo en ese horario.)*
- **H2 — Hallazgo crítico, contradice un supuesto central del AS-IS.** El vendedor ya usa un software de ventas para registrar cada venta y medir el stock, los ingresos y los gastos del local — no anota en un cuaderno de papel como se había asumido en el problema P4 y en la actividad "Anotar la venta en el cuaderno" del diagrama AS-IS. *(Pendiente de revisión urgente con Persona 1: falta confirmar si ese software muestra el stock al público, si permite pedidos anticipados o pagos en línea, o si es solo un registro contable interno. De la respuesta depende si el AS-IS necesita corregirse antes de la entrega.)*
- **H3.** Cuando un producto se agota, el vendedor ofrece una alternativa y la mayoría de los clientes acepta cambiar su pedido en el momento. *(Valida algo que ya está contemplado en HU-02, CA4 — sugerir productos disponibles cuando algo se agota.)*
- **H4.** Desde la perspectiva del vendedor, en esta ubicación no suele ver estudiantes que lleguen, vean la fila y se retiren sin comprar; dice que ocurre solo en ocasiones puntuales, como eventos. *(Contrasta con H10 del grupo focal, donde los estudiantes sí reportan desistir antes de sumarse a la fila. No es necesariamente una contradicción: ese abandono ocurre a distancia, antes de que el vendedor pueda notarlo — confirma que el problema P3 se ve mejor desde el lado del estudiante que desde el del vendedor.)*
- **H5.** El stock del día siguiente se decide el día anterior en función de la demanda reciente, dejando un margen de reserva para no quedarse sin stock. *(No es una decisión "a ojo" sin ningún criterio: hay una lógica informal detrás. Ajusta el problema P5.)*
- **H6.** La preparación de los productos toma entre 5 y 10 minutos, dependiendo de la afluencia de público. *(Da un rango concreto para la Derivación 2 — tiempo estándar de preparación por producto.)*
- **H7 — Contradice el supuesto inicial del equipo.** Ante una eventual duplicación de la demanda, la primera reacción del vendedor es pensar en ampliar personal, no en que un sistema absorba el volumen. Su principal preocupación frente a una app de pedidos no es la tecnología, sino el costo adicional de empaque (cajas o envases) que exigiría entregar pedidos anticipados. *(Reemplaza un hallazgo anterior que era una suposición sin respaldo real. Es información valiosa para el problema P6 — conviene mostrarle al vendedor que el sistema es una alternativa a contratar más personal — y deja pendiente un posible requisito nuevo sobre costos de empaque, que hoy no está contemplado en `03-requisitos.md`.)*

## Técnica 2: Grupo focal con estudiantes

- **Participante(s):** 5 estudiantes, compradores habituales del carrito — Celsi, Nicolás, Joaquín, Walter y Gonzalo U.
- **Fecha y modalidad:** 22/09/2026 — en línea, por chat grupal de WhatsApp (grupo de amigos de la universidad). Las 6 preguntas se enviaron al grupo y cada participante respondió de forma asincrónica entre las 21:54 y las 22:13.
- **Duración:** ~20 minutos (ventana en que llegaron las respuestas).
- **Moderador:** Joaquín Rojas Toledo.
- **Evidencia:** capturas de pantalla del chat grupal — [`./evidencia/grupo-focal-estudiantes-1.png`](./evidencia/grupo-focal-estudiantes-1.png) (Celsi), [`./evidencia/grupo-focal-estudiantes-2.png`](./evidencia/grupo-focal-estudiantes-2.png) (Nicolás), [`./evidencia/grupo-focal-estudiantes-3.png`](./evidencia/grupo-focal-estudiantes-3.png) (Joaquín), [`./evidencia/grupo-focal-estudiantes-4.png`](./evidencia/grupo-focal-estudiantes-4.png) (Walter y Gonzalo U.)

### Preguntas guía

1. ¿Cuándo compran en el carrito y cuánto tiempo tienen realmente disponible?
2. ¿Qué los hace desistir de comprar?
3. ¿Qué tan seguido llegan y ya no queda lo que querían?
4. ¿Pagarían por adelantado desde el teléfono? ¿Qué les daría desconfianza?
5. ¿Qué preferirían: un turno con hora estimada o una fila más corta?
6. ¿Qué harían si su pedido se atrasa y tienen clase?

### Respuestas por participante

| Pregunta | Celsi | Nicolás | Joaquín | Walter | Gonzalo U. |
|---|---|---|---|---|---|
| 1. Tiempo disponible | ~30 min | 1 hora (almuerzo) | 15 min en recreos cortos, hasta 30 en almuerzo | 45 min | 25 min |
| 2. Qué hace desistir | No tener plata suficiente | Mucha gente o falta de empanadas | Cantidad de gente esperando | Que no haya stock | Tiempo y dinero |
| 3. ¿Llega y no queda lo que quería? | Casi nunca | Pasa pocas veces | Normalmente hay todo, salvo cerca del cierre | Casi nunca | Nunca |
| 4. ¿Pagaría adelantado? ¿Desconfianza? | Sí, para ahorrar tiempo — desconfía de que no sepan manejar pedidos online | Sí, si incluye toma de pedidos — desconfía de que no cumplan el pedido | Sí, confía en el trato de los vendedores — desconfiaría si el trato es malo o no cumplen | Sí, para hacer todo más rápido — desconfía de que no cumplan los plazos | Sí — menciona las reseñas como factor de confianza |
| 5. ¿Turno con hora o fila más corta? | Fila más corta | Turno con hora estimada | Fila más corta (un negocio de comida al paso no calza con turnos) | Fila más corta | Fila más corta |
| 6. ¿Qué hace si se atrasa y tiene clase? | Espera el pedido y llega tarde | Le pasó de verdad: llegó atrasado a la clase | Hablaría con el vendedor para que se lo guarde o se lo ceda a otro | Espera el pedido y llega más tarde | Esperaría el pedido |

### Hallazgos principales

- **H9.** El tiempo disponible declarado varía bastante entre estudiantes (entre 15 y 60 minutos), dependiendo de si es un receso corto o el horario de almuerzo. *(Matiza RP-17: el sistema debe funcionar tanto en ventanas de 10-15 minutos como de 45-60.)*
- **H10.** El motivo para desistir de comprar no es único: aparecen la falta de dinero, la cantidad de gente y el tiempo disponible, no solo la fila larga en sí. *(Matiza el problema P3.)*
- **H11 — Contradice el supuesto inicial del equipo.** El quiebre de stock es reportado como poco frecuente por la mayoría ("casi nunca", "nunca", "pocas veces"), salvo cerca del horario de cierre. *(Pendiente de revisar con la Persona 1: el problema P2 puede ser real solo en productos puntuales o en horario de cierre, no de forma generalizada como se planteó en el AS-IS.)*
- **H12.** Hay disposición generalizada a pagar por adelantado, pero la desconfianza principal no es la seguridad del pago sino que el pedido se cumpla tal como se ofreció (plazos, trato, que no fallen en la entrega). *(Ajusta el énfasis de RP-18: además de proteger el pago, hay que comunicar garantía de cumplimiento.)*
- **H13 — Contradice el supuesto inicial del equipo.** 4 de 5 participantes prefieren una fila más corta antes que un turno con hora estimada; uno de ellos señala explícitamente que un sistema de turnos no calza con un negocio de comida rápida al paso. *(Cuestiona directamente la Iniciativa 4 y el requisito RP-07 tal como están planteados.)*
- **H14.** Ante un atraso con clase encima, la reacción más común es esperar el pedido y llegar tarde a clase, o negociar con el vendedor para que lo guarde o se lo ceda a otro comprador — no abandonar la compra de inmediato como se había supuesto. *(Reemplaza el supuesto de abandono automático del pedido.)*
