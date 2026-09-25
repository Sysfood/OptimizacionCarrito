# OptimizacionCarrito

## Ingeniería de Requisitos · Entrega 1

**Asignatura:** CIN 324 — Ingeniería de Requisitos  
**Rama:** `IngReq-Entrega-1`  
**Propósito:** organizar la documentación del proceso de atención del carrito de comida universitario, su propuesta de rediseño y la especificación de requisitos e historias de usuario.

Este README funciona como guía de lectura de la entrega. Cada apartado enlaza al documento donde se desarrolla su contenido, y los diagramas incluyen acceso tanto a la imagen como al archivo editable.

> **Alcance de la rama:** el aporte central corresponde a la [clasificación de requisitos](./03-requisitos.md) y las [historias de usuario](./04-historias-usuario.md). Se incluyen el [proceso AS-IS](./01-proceso-as-is.md) y la [propuesta TO-BE](./02-rediseno-to-be.md) como antecedentes para comprender y seguir la trazabilidad del análisis.

## Índice de navegación

| Apartado | Acceso |
|---|---|
| Contexto, participantes y problemas del proceso actual | [Proceso AS-IS](./01-proceso-as-is.md) |
| Mejoras e iniciativas de rediseño | [Propuesta TO-BE](./02-rediseno-to-be.md) |
| Requisitos del producto y del proyecto | [Clasificación de requisitos](./03-requisitos.md) |
| Necesidades de los usuarios y criterios de aceptación | [Historias de usuario](./04-historias-usuario.md) |
| Representación gráfica del proceso actual | [Imagen AS-IS](./diagramas/as-is.png) · [Fuente BPMN](./diagramas/as-is.bpmn) |
| Representación gráfica del proceso propuesto | [Imagen TO-BE](./diagramas/to-be.png) · [Fuente BPMN](./diagramas/to-be.bpmn) |

## 1. Contexto y objetivo del proyecto

El proyecto analiza la atención y venta de alimentos en un carrito universitario, considerando el tiempo disponible de los estudiantes, la disponibilidad de productos y la organización del trabajo del vendedor. El contexto, los límites del proceso y los objetivos de sus participantes se desarrollan en el [análisis AS-IS](./01-proceso-as-is.md).

La propuesta busca apoyar la selección de productos, el pedido, el pago, la preparación y el retiro mediante un flujo digital. Las mejoras esperadas y su relación con los problemas identificados se explican en el [rediseño TO-BE](./02-rediseno-to-be.md).

La especificación se presenta mediante [requisitos](./03-requisitos.md) e [historias con criterios de aceptación](./04-historias-usuario.md). Estos documentos describen el comportamiento esperado; su inclusión en la entrega no demuestra que el sistema esté implementado o validado.

## 2. Participantes del proceso

| Participante | Perspectiva considerada | Documento de referencia |
|---|---|---|
| Estudiante | Consultar productos, realizar su compra y retirar el pedido dentro de su tiempo disponible. | [Objetivos en el AS-IS](./01-proceso-as-is.md) · [Historias del estudiante](./04-historias-usuario.md) |
| Vendedor | Organizar la atención, preparar pedidos, mantener la disponibilidad y registrar entregas. | [Proceso de atención](./01-proceso-as-is.md) · [Historias del vendedor](./04-historias-usuario.md) |
| Encargado o dueño | Consultar información de ventas y apoyar las decisiones de reposición y operación. | [Objetivos del negocio](./01-proceso-as-is.md) · [Historia de reportes](./04-historias-usuario.md) |
| Universidad | Considerar los efectos de la atención sobre aglomeraciones y tiempos de los estudiantes. | [Participante externo en el AS-IS](./01-proceso-as-is.md) · [Mejoras consideradas](./02-rediseno-to-be.md) |

## 3. Proceso actual — AS-IS

El [documento AS-IS](./01-proceso-as-is.md) establece el punto de partida del análisis: qué proceso se estudia, quiénes participan, qué actividades lo componen y qué problemas motivan el rediseño.

| Contenido | Qué permite revisar | Acceso |
|---|---|---|
| Macroproceso y proceso específico | Alcance de la operación estudiada y comienzo y término del flujo. | [Consultar AS-IS](./01-proceso-as-is.md) |
| Objetivo del proceso | Resultado que se busca desde la perspectiva del negocio y del estudiante. | [Consultar objetivos](./01-proceso-as-is.md) |
| Participantes y objetivos | Roles involucrados y necesidades que orientan el análisis. | [Consultar participantes](./01-proceso-as-is.md) |
| Actividades y tipos de tarea | Acciones del proceso y su clasificación en la representación BPMN. | [Consultar actividades](./01-proceso-as-is.md) |
| Problemas P1–P6 | Diagnóstico que sirve de base para proponer mejoras. | [Consultar problemas](./01-proceso-as-is.md) |
| Diagrama del proceso actual | Secuencia y decisiones representadas gráficamente. | [Ver PNG](./diagramas/as-is.png) · [Abrir BPMN](./diagramas/as-is.bpmn) |

## 4. Rediseño del proceso — TO-BE

El [documento TO-BE](./02-rediseno-to-be.md) describe las mejoras propuestas, las heurísticas de rediseño utilizadas y las actividades que cambian respecto del proceso actual.

| Área del rediseño | Contenido que se analiza | Acceso |
|---|---|---|
| Disponibilidad de productos | Consulta de stock antes del desplazamiento del estudiante. | [Iniciativa 1](./02-rediseno-to-be.md) |
| Selección y pago | Participación del estudiante en el ingreso y pago de su pedido. | [Iniciativa 2](./02-rediseno-to-be.md) |
| Registro y stock | Relación entre la confirmación de la venta y la actualización del inventario. | [Iniciativa 3](./02-rediseno-to-be.md) |
| Preparación y retiro | Organización del pedido y del momento de retiro. | [Iniciativa 4](./02-rediseno-to-be.md) |
| Comunicación del estado | Aviso al estudiante cuando el pedido está listo. | [Iniciativa 5](./02-rediseno-to-be.md) |
| Soporte tecnológico | Plataforma propuesta para apoyar el proceso. | [Iniciativa 6](./02-rediseno-to-be.md) |
| Comparación de actividades | Correspondencia AC-01–AC-08 entre el proceso actual y el propuesto. | [Tabla de actividades](./02-rediseno-to-be.md) |
| Diagrama del proceso propuesto | Flujo previsto de interacción entre estudiante, vendedor y sistema. | [Ver PNG](./diagramas/to-be.png) · [Abrir BPMN](./diagramas/to-be.bpmn) |

## 5. Clasificación de requisitos

Los [requisitos](./03-requisitos.md) definen las capacidades y restricciones que orientan el desarrollo. El documento distingue los requisitos del producto de las condiciones del proyecto y separa comportamientos funcionales de propiedades de calidad.

| Categoría | Contenido | Acceso |
|---|---|---|
| Producto — funcionales | Catálogo, selección de productos, validación de stock, pago, registro, seguimiento, preparación, entrega y reportes. | [Requisitos funcionales](./03-requisitos.md) |
| Producto — no funcionales | Actualización de disponibilidad, rendimiento, concurrencia, usabilidad, protección de datos de pago, notificaciones y conectividad. | [Requisitos no funcionales](./03-requisitos.md) |
| Proyecto | Organización del repositorio, documentación, modelado BPMN, validación, tecnologías, revisión y contribuciones del equipo. | [Requisitos de proyecto](./03-requisitos.md) |
| Derivados | Necesidades deducidas a partir de otros requisitos, con su origen y justificación. | [Requisitos derivados](./03-requisitos.md) |

Los identificadores **RP** permiten referenciar los requisitos del producto y los identificadores **RY**, las restricciones del proyecto. Su redacción y condiciones de cumplimiento deben consultarse en la [especificación de requisitos](./03-requisitos.md).

## 6. Historias de usuario

Las [historias de usuario](./04-historias-usuario.md) expresan las necesidades desde la perspectiva de cada rol. Cada historia identifica el beneficio esperado, las actividades relacionadas, los requisitos asociados y los criterios de aceptación que permiten evaluar su cumplimiento.

### Estudiante

| ID | Necesidad abordada | Acceso |
|---|---|---|
| HU-01 | Consultar la disponibilidad antes de desplazarse al carrito. | [Ver historia y criterios](./04-historias-usuario.md) |
| HU-02 | Seleccionar productos y cantidades para formar un pedido. | [Ver historia y criterios](./04-historias-usuario.md) |
| HU-03 | Pagar el pedido y consultar la información necesaria para su retiro. | [Ver historia y criterios](./04-historias-usuario.md) |
| HU-04 | Reservar unidades durante el pago y evitar conflictos entre compras simultáneas. | [Ver historia y criterios](./04-historias-usuario.md) |
| HU-07 | Identificar y retirar el pedido, con validación de la entrega. | [Ver historia y criterios](./04-historias-usuario.md) |

### Vendedor

| ID | Necesidad abordada | Acceso |
|---|---|---|
| HU-05 | Consultar y organizar los pedidos pendientes de preparación. | [Ver historia y criterios](./04-historias-usuario.md) |
| HU-06 | Marcar el pedido como listo y comunicarlo al estudiante. | [Ver historia y criterios](./04-historias-usuario.md) |
| HU-08 | Gestionar y ajustar la disponibilidad de productos durante la jornada. | [Ver historia y criterios](./04-historias-usuario.md) |

### Encargado

| ID | Necesidad abordada | Acceso |
|---|---|---|
| HU-09 | Consultar ventas e información de disponibilidad para apoyar la reposición. | [Ver historia y criterios](./04-historias-usuario.md) |

Los criterios de aceptación de cada historia deben interpretarse junto con los [requisitos asociados](./03-requisitos.md). Las casillas del documento sirven para presentar los criterios; no sustituyen evidencia de pruebas ni seguimiento de implementación.

## 7. Trazabilidad de la entrega

La lectura conjunta permite seguir cómo un problema del proceso da origen a una mejora, cómo esa mejora se expresa en requisitos y cómo se traduce en necesidades verificables de los usuarios.

| Elemento | Identificación | Dónde consultarlo |
|---|---|---|
| Problemas del proceso actual | P1–P6 | [Proceso AS-IS](./01-proceso-as-is.md) |
| Iniciativas de mejora | Iniciativas 1–6 | [Rediseño TO-BE](./02-rediseno-to-be.md) |
| Actividades que cambian | AC-01–AC-08 | [Comparación AS-IS / TO-BE](./02-rediseno-to-be.md) |
| Requisitos del producto | RP | [Clasificación de requisitos](./03-requisitos.md) |
| Restricciones del proyecto | RY | [Requisitos de proyecto](./03-requisitos.md) |
| Historias y criterios de aceptación | HU | [Historias de usuario](./04-historias-usuario.md) |

Para revisar una historia, consultar primero sus requisitos asociados y luego las actividades del TO-BE que justifican el cambio. Cuando se modifica una necesidad, revisar también sus efectos sobre el [proceso propuesto](./02-rediseno-to-be.md), la [especificación](./03-requisitos.md) y los [criterios de aceptación](./04-historias-usuario.md).

## 8. Diagramas y archivos editables

| Modelo | Vista para revisión | Fuente editable | Explicación |
|---|---|---|---|
| AS-IS | [Abrir as-is.png](./diagramas/as-is.png) | [Abrir as-is.bpmn](./diagramas/as-is.bpmn) | [Leer proceso actual](./01-proceso-as-is.md) |
| TO-BE | [Abrir to-be.png](./diagramas/to-be.png) | [Abrir to-be.bpmn](./diagramas/to-be.bpmn) | [Leer rediseño](./02-rediseno-to-be.md) |

Las imágenes permiten consultar los modelos desde GitHub. Los archivos BPMN conservan la fuente editable; al modificar un modelo, debe actualizarse también su imagen para mantener la misma versión en ambos formatos.

## 9. Orden de lectura recomendado

1. Leer el [AS-IS](./01-proceso-as-is.md) para comprender el contexto, los participantes y los problemas.
2. Revisar el [diagrama actual](./diagramas/as-is.png) para visualizar el flujo estudiado.
3. Leer el [TO-BE](./02-rediseno-to-be.md) y consultar el [diagrama propuesto](./diagramas/to-be.png) para entender las mejoras.
4. Revisar los [requisitos](./03-requisitos.md) para conocer capacidades, restricciones y condiciones de calidad.
5. Leer las [historias de usuario](./04-historias-usuario.md) para relacionar esas capacidades con necesidades y criterios de aceptación.
6. Contrastar las [actividades del rediseño](./02-rediseno-to-be.md), los [requisitos](./03-requisitos.md) y las [historias](./04-historias-usuario.md) para comprobar su coherencia.

## 10. Estado documental y revisión de la entrega

Este índice organiza los archivos disponibles en la rama revisada. La evidencia de elicitación aportada por separado debe incorporarse a la rama antes de añadir aquí un enlace a ella. También debe comprobarse que sus hallazgos estén reflejados en los documentos y diagramas; este README no certifica que esa actualización ya esté realizada.

| Revisión necesaria | Archivos involucrados |
|---|---|
| Contrastar el diagnóstico con la elicitación y corregir supuestos. | [AS-IS](./01-proceso-as-is.md) · [Fuente del diagrama](./diagramas/as-is.bpmn) |
| Comprobar que las mejoras respondan a necesidades respaldadas. | [TO-BE](./02-rediseno-to-be.md) · [Fuente del diagrama](./diagramas/to-be.bpmn) |
| Distinguir decisiones confirmadas de propuestas pendientes de validación. | [Requisitos](./03-requisitos.md) |
| Mantener correspondencia entre requisitos, historias y criterios. | [Requisitos](./03-requisitos.md) · [Historias](./04-historias-usuario.md) |
| Mantener sincronizadas las imágenes y sus fuentes editables. | [PNG AS-IS](./diagramas/as-is.png) · [BPMN AS-IS](./diagramas/as-is.bpmn) · [PNG TO-BE](./diagramas/to-be.png) · [BPMN TO-BE](./diagramas/to-be.bpmn) |

---

**Accesos principales:** [AS-IS](./01-proceso-as-is.md) · [TO-BE](./02-rediseno-to-be.md) · [Requisitos](./03-requisitos.md) · [Historias de usuario](./04-historias-usuario.md)
