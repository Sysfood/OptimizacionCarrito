# Proceso de negocio — AS-IS

[← Volver al documento maestro](./IngReq-Entrega%201.md)

## Macro-proceso y proceso específico

**Macro-proceso:** Operación comercial del carrito de comida universitario → abastecimiento del día → **atención y venta** → cierre de caja y reposición.

**Proceso específico que se modela:** Atención y venta de un pedido en el carrito, desde que el estudiante termina su clase y decide comprar hasta que recibe su pedido (*Pedido entregado*) o se va sin él (*Venta no concretada*).

**Momento que se modela:** las ventanas de mayor afluencia al término de los bloques de clases, en particular la del **horario de almuerzo**, que el vendedor identifica como el momento con más público ([H1](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)). En esas ventanas el tiempo libre de los estudiantes va desde unos 15 minutos en recesos cortos hasta 45–60 minutos en el almuerzo ([H9](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales-1)).

**Fuera del alcance del modelo:** el abastecimiento previo y el cierre de caja. Hoy el vendedor decide el stock del día anterior según la demanda reciente, dejando una reserva ([H5](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)). Esa decisión depende del registro de ventas que se genera dentro del proceso modelado (ver P3 y P4).

## Objetivo de negocio del proceso

Vender la mayor cantidad posible de productos preparados durante las ventanas de alta demanda, con el stock limitado que el carrito transporta cada día, manteniendo un tiempo de atención por estudiante que la fila tolere y un registro de ventas suficiente para decidir la reposición del día siguiente.

El proceso se considera exitoso cuando el estudiante recibe el producto que quería dentro de su tiempo disponible entre clases, y el vendedor termina la jornada con el stock vendido y registrado.

## Participantes y sus objetivos

| Participante | Objetivo en el proceso | Presencia en el diagrama |
|---|---|---|
| Estudiante | Comprar el producto que quiere y retirarlo dentro del tiempo libre que tiene entre clases, sin llegar tarde al siguiente bloque ni quedarse sin almuerzo. | Carril *Estudiante* |
| Vendedor del carrito | Atender a la mayor cantidad de estudiantes por ventana de demanda, vender todo el stock del día y saber qué se vendió para reponer. | Carril *Vendedor del carrito* |
| Encargado/dueño del carrito | Maximizar las ventas por jornada, reducir las ventas perdidas y decidir la reposición con información confiable. | No ejecuta tareas en la ventana modelada; usa el registro del software de ventas. |
| Universidad (participante externo) | Evitar aglomeraciones en el acceso al campus y atrasos de estudiantes al bloque siguiente. | No ejecuta tareas; recibe el efecto de la fila. |

En el carrito entrevistado, **vendedor y encargado son la misma persona** (Denis Alballay, [entrevista](./05-elicitacion%20%28Real%20correjida%29.md#técnica-1-entrevista-semiestructurada)). Se mantienen como dos participantes porque persiguen objetivos distintos: uno atiende durante la ventana de demanda y el otro decide la reposición y el crecimiento del negocio. El encargado y la universidad no tienen carril propio porque no ejecutan actividades dentro del proceso modelado, pero sus objetivos originan los problemas P3, P4 y P6.

## Diagrama AS-IS

![Proceso AS-IS](./diagramas/as-is.png)

Archivo fuente: [`./diagramas/as-is.bpmn`](./diagramas/as-is.bpmn)

### Descripción del flujo

1. El proceso comienza cuando **termina la clase y el estudiante quiere comprar** (evento de inicio).
2. El estudiante **camina hasta el carrito**, **espera en la fila** y, cuando llega su turno, **indica el pedido al vendedor** de forma verbal.
3. Recién entonces el vendedor **revisa el stock en el software de ventas**.
4. Compuerta exclusiva **¿Hay stock del producto?**
   - **Sí:** el vendedor **prepara el pedido**, **cobra el pedido (efectivo o POS)** y **registra la venta en el software de ventas**. El estudiante **recibe el pedido** y el proceso termina en **Pedido entregado**.
   - **No:** el vendedor **informa que está agotado y ofrece una alternativa** ([H3](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)). En la compuerta **¿Acepta la alternativa?**, si el estudiante acepta, el flujo vuelve a **Preparar el pedido**; si no, termina en **Venta no concretada**.

Todas las actividades del vendedor ocurren con el estudiante frente al mesón, **una venta a la vez**: mientras se prepara, se cobra y se registra una venta, el resto de la fila espera.

### Tipos de tarea usados en el diagrama

| Tarea | Carril | Tipo BPMN | Por qué |
|---|---|---|---|
| Caminar hasta el carrito | Estudiante | Manual Task | La ejecuta una persona sin apoyo de ningún sistema. |
| Esperar en la fila | Estudiante | Manual Task | Espera física del estudiante, sin sistema de apoyo. |
| Indicar el pedido al vendedor | Estudiante | Manual Task | Comunicación verbal, sin soporte de sistema. |
| Revisar el stock en el software de ventas | Vendedor | User Task | El vendedor consulta el stock en su software de ventas ([H2](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)). |
| Informar que está agotado y ofrecer una alternativa | Vendedor | Manual Task | Conversación con el estudiante, sin sistema. |
| Preparar el pedido | Vendedor | Manual Task | Trabajo físico del vendedor sin apoyo de sistema. |
| Cobrar el pedido (efectivo o POS) | Vendedor | User Task | El vendedor cobra con apoyo de un sistema externo (máquina POS o app de transferencias). |
| Registrar la venta en el software de ventas | Vendedor | User Task | El vendedor ingresa cada venta en su software, que usa para medir stock, ingresos y gastos ([H2](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)). |
| Recibir el pedido | Estudiante | Manual Task | Entrega en mano, sin sistema. |

El carrito **sí usa tecnología** (el software de ventas y el POS), pero en el AS-IS **no existe ninguna Service Task**: ningún sistema ejecuta una actividad por sí solo. Todas las tareas con sistema son User Tasks que el vendedor realiza venta a venta, y el estudiante no tiene acceso a ninguna de esas herramientas. Ese es el diagnóstico del proceso: la información existe, pero queda dentro del mesón y cada venta sigue ocupando al vendedor de principio a fin.

## Problemas identificados

- **P1 — La espera en fila consume el tiempo libre del estudiante.** Asociado al objetivo del *Estudiante* y, de forma indirecta, al de la *Universidad*. La demanda se concentra en pocos minutos, sobre todo al almuerzo, y la atención es estrictamente secuencial: cada estudiante ocupa al vendedor durante el pedido, la preparación, el cobro y el registro. Cuando el pedido se atrasa, los estudiantes prefieren esperar y **llegar tarde a clase** antes que irse sin comer ([H14](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales-1)).
- **P2 — El estudiante conoce la disponibilidad recién en el mesón.** Asociado a los objetivos del *Estudiante* y del *Encargado*. El stock está registrado en el software del vendedor, pero el estudiante no puede consultarlo: se entera después de caminar y esperar. El quiebre es poco frecuente y se concentra cerca del cierre o en productos puntuales ([H11](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales-1)). Cuando ocurre, el vendedor ofrece una alternativa y el estudiante termina llevándose algo distinto de lo que quería o se va sin comprar ([H3](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)).
- **P3 — Se pierde demanda que nadie registra.** Asociado al objetivo del *Encargado*. Hay estudiantes que desisten antes de llegar al mesón por la cantidad de gente, el tiempo o el dinero ([H10](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales-1)). Ese abandono ocurre a distancia, por lo que el vendedor casi no lo percibe ([H4](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)). El software solo registra las ventas concretadas, no los rechazos ni las compras que no se intentaron.
- **P4 — El registro de ventas depende del vendedor y se hace venta a venta.** Asociado a los objetivos del *Vendedor* y del *Encargado*. El vendedor ya usa un software de ventas ([H2](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)), pero cada venta debe ingresarla él, después de cobrar y con el siguiente estudiante esperando. Esto agrega una tarea más dentro de la ventana crítica, y la información queda solo dentro del mesón: sirve para la contabilidad, pero no para que el estudiante vea la disponibilidad.
- **P5 — El vendedor no conoce la demanda antes de que ocurra.** Asociado al objetivo del *Vendedor*. La preparación, que toma entre 5 y 10 minutos según la afluencia ([H6](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)), empieza recién cuando el estudiante llega al mesón. Aunque la demanda del día es pareja y previsible ([H1](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales), [H5](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)), no hay forma de adelantar trabajo pedido a pedido.
- **P6 — El proceso no es escalable.** Asociado al objetivo del *Encargado*. Atender más estudiantes exige más personas en el carrito, y así lo confirma el propio vendedor: ante el doble de demanda, ampliaría el personal ([H7](./05-elicitacion%20%28Real%20correjida%29.md#hallazgos-principales)). Ninguna tarea del proceso puede absorber volumen sin agregar trabajo humano.

### Dónde se origina cada problema en el modelo

| Problema | Participante afectado | Actividad(es) o elemento del AS-IS donde se origina |
|---|---|---|
| P1 | Estudiante, Universidad | Esperar en la fila; secuencia Preparar → Cobrar → Registrar con el estudiante presente |
| P2 | Estudiante, Encargado | Revisar el stock en el software de ventas, ubicada después de Caminar y Esperar; compuerta ¿Hay stock del producto? |
| P3 | Encargado | Esperar en la fila (demanda que no entra al proceso); Venta no concretada sin registro |
| P4 | Vendedor, Encargado | Registrar la venta en el software de ventas |
| P5 | Vendedor | Preparar el pedido, que solo puede iniciarse después de Indicar el pedido al vendedor |
| P6 | Encargado | Todo el carril del vendedor: solo tareas manuales o de usuario, sin tareas de servicio |

## Ajustes al AS-IS a partir de la elicitación

La primera versión del AS-IS se construyó con supuestos del equipo. La [elicitación](./05-elicitacion%20%28Real%20correjida%29.md) del 22/09/2026 (entrevista al vendedor y grupo focal con estudiantes) corrigió algunos de ellos:

| Supuesto inicial | Hallazgo | Cambio en el AS-IS |
|---|---|---|
| El vendedor anota cada venta en un cuaderno. | H2: usa un software de ventas para registrar ventas y medir stock, ingresos y gastos. | "Anotar la venta en el cuaderno" (Manual) pasa a "Registrar la venta en el software de ventas" (User). P4 se redefine. |
| El vendedor revisa el stock mirando la bandeja. | H2: el software mide el stock de cada producto. | "Revisar visualmente el stock" (Manual) pasa a "Revisar el stock en el software de ventas" (User). |
| Sin stock, la venta se pierde. | H3: el vendedor ofrece una alternativa y la mayoría la acepta. | Se agregan la tarea de ofrecer alternativa y la compuerta "¿Acepta la alternativa?". |
| El quiebre de stock es frecuente. | H11: es poco frecuente, salvo cerca del cierre. | P2 se acota a esos casos. |
| La demanda se concentra por igual en cada cambio de bloque. | H1: el mayor pico es el almuerzo. | Se precisa el momento que se modela. |
| Los estudiantes abandonan la fila y el vendedor lo nota. | H4 y H10: el abandono ocurre a distancia y por varios motivos. | P3 se reformula como demanda no registrada. |

**Pendiente de validar con el vendedor:** si el software de ventas puede mostrar el stock al público o recibir pedidos. Según la entrevista, hoy lo usa como registro interno (ventas, ingresos y gastos), y así se modeló.

Estos problemas son el punto de partida de las mejoras e iniciativas de [`02-rediseno-to-be.md`](./02-rediseno-to-be.md).
