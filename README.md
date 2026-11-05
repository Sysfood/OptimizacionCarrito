# OptimizacionCarrito

## Ingeniería de Requisitos · Entrega 2

**Asignatura:** CIN 324 — Ingeniería de Requisitos  
**Rama:** `IngReq-Entrega-2`

Esta rama contiene la especificación de **TurnoCarrito**, un sistema de pedidos anticipados para el carrito de comida universitario: criterios de aceptación en Gherkin, modelo de dominio, casos de uso, diagramas de secuencia de sistema, diagramas de estado y la matriz de trazabilidad. Parte de los documentos de la Entrega 1, que se mantienen en la rama con su ubicación y nombre originales.

## Integrantes y aportes

| Integrante | Entrega 2 | Entrega 1 |
|---|---|---|
| Martín Méndez | [Diagramas de secuencia](./10-diagramas-secuencia.md) · [Diagramas de estado](./11-diagramas-estado.md) | [Proceso AS-IS](./01-proceso-as-is.md) · [Rediseño TO-BE](./02-rediseno-to-be.md) · Diagramas BPMN |
| Joaquín López | [Criterios de aceptación](./07-criterios-aceptacion.md) · [Casos de uso](./09-casos-de-uso.md) | [Requisitos](./03-requisitos.md) · [Historias de usuario](./04-historias-usuario.md) |
| Joaquín Rojas | [Modelo de dominio](./08-modelo-dominio.md) | [Elicitación](./05-Elicitacion.md) · [Evidencias](./Evidencias) |
| Vicente Fernández Simonetti | [Trazabilidad](./12-trazabilidad.md) | [Atributos de calidad](./06-atributos-calidad.md) |

## Entrega 2 — Especificación del sistema

| N.° | Documento | Contenido | Diagramas |
|---|---|---|---|
| 07 | [Criterios de aceptación](./07-criterios-aceptacion.md) | Escenarios Gherkin de HU-01 a HU-09, con escenario principal y alternativo o de error. | — |
| 08 | [Modelo de dominio](./08-modelo-dominio.md) | Clases del negocio, atributos, asociaciones con multiplicidades y decisiones de modelado. | [PNG](./diagramas/modelo-dominio.png) · [PUML](./diagramas/modelo-dominio.puml) |
| 09 | [Casos de uso](./09-casos-de-uso.md) | Actores, CU-01 a CU-07 y su historia de origen. | [PNG](./diagramas/09-casos-de-uso.png) · [PUML](./diagramas/09-casos-de-uso.puml) |
| 10 | [Diagramas de secuencia](./10-diagramas-secuencia.md) | DSS-01 (pagar un pedido, con la pasarela de pago) y DSS-02 (avisar pedido listo, con el servicio de notificaciones). | [DSS-01](./diagramas/dss-01.png) · [DSS-02](./diagramas/dss-02.png) |
| 11 | [Diagramas de estado](./11-diagramas-estado.md) | EST-01 (ciclo de vida de Pedido) y EST-02 (ciclo de vida de Reserva), con sus tablas de transiciones. | [EST-01](./diagramas/est-01.png) · [EST-02](./diagramas/est-02.png) |
| 12 | [Trazabilidad](./12-trazabilidad.md) | Matriz que une cada requisito con su historia, caso de uso, secuencia, estado y clases del dominio. | — |

Todos los diagramas UML están en la carpeta [`diagramas`](./diagramas), como imagen PNG y como fuente PlantUML (`.puml`).

## Entrega 1 — Análisis del proceso y requisitos

| N.° | Documento | Contenido |
|---|---|---|
| 01 | [Proceso AS-IS](./01-proceso-as-is.md) | Proceso actual, participantes y problemas P1–P6. Diagrama: [PNG](./diagramas/as-is.png) · [BPMN](./diagramas/as-is.bpmn) |
| 02 | [Rediseño TO-BE](./02-rediseno-to-be.md) | Iniciativas de rediseño y actividades AC-01–AC-08. Diagrama: [PNG](./diagramas/to-be.png) · [BPMN](./diagramas/to-be.bpmn) |
| 03 | [Requisitos](./03-requisitos.md) | Requisitos de producto (RP), de proyecto (RY) y derivados. |
| 04 | [Historias de usuario](./04-historias-usuario.md) | HU-01 a HU-10 con sus criterios de aceptación. |
| 05 | [Elicitación](./05-Elicitacion.md) | Entrevista al vendedor, grupo focal y hallazgos H1–H14. |
| 06 | [Atributos de calidad](./06-atributos-calidad.md) | Atributos de calidad AQ y su relación con los requisitos. |

Versión original de la Entrega 1: rama [`IngReq-Entrega-1`](https://github.com/Sysfood/OptimizacionCarrito/tree/IngReq-Entrega-1).

## Cómo seguir la trazabilidad

Un problema del proceso actual (P) origina una iniciativa del TO-BE y una actividad que cambia (AC). Esa actividad se expresa en requisitos (RP) e historias (HU), y cada historia se especifica en un caso de uso (CU), sus criterios Gherkin, un diagrama de secuencia (DSS) y los estados de las clases que modifica (EST). La [matriz de trazabilidad](./12-trazabilidad.md) reúne esas relaciones por requisito.

Orden de lectura recomendado:

1. [Rediseño TO-BE](./02-rediseno-to-be.md), para entender el proceso que se especifica.
2. [Modelo de dominio](./08-modelo-dominio.md), para conocer el vocabulario que usan los demás documentos.
3. [Casos de uso](./09-casos-de-uso.md) y [criterios de aceptación](./07-criterios-aceptacion.md).
4. [Diagramas de secuencia](./10-diagramas-secuencia.md) y [de estado](./11-diagramas-estado.md).
5. [Trazabilidad](./12-trazabilidad.md), para comprobar la coherencia entre artefactos.
