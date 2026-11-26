# Cambios — Evaluación 2 · Equipo 9 · TurnoCarrito

Rama: `IngReq-Entrega-3` · Origen del cambio: [`EVALUACION2.md`](./EVALUACION2.md)

## El cambio solicitado

TurnoCarrito ahora tiene un **cliente VIP**: un estudiante que puede pedir sin pagar en el momento. Su pedido se confirma de inmediato con código de retiro y el total se suma a una deuda que él mismo puede consultar.

Reglas nuevas:

- Si no hay unidades disponibles, el pedido no se aprueba y la deuda no cambia.
- Si la deuda llegó al máximo permitido, el cliente no puede seguir pidiendo hasta saldarla. El monto máximo queda por validar con el vendedor.
- Un cliente que no es VIP no puede pedir sin pagar.
- Una solicitud repetida no crea otro pedido ni suma la deuda dos veces.
- El cliente VIP puede ver su deuda; si aún no ha comprado nada, es $0.

## Resumen por artefacto

| Artefacto | ¿Cambió? | Qué cambió | Responsable | Veredicto |
|---|---|---|---|---|
| HU y Gherkin | Sí | HU-11 y HU-12 nuevas con 10 CA y 9 escenarios; «código» → «código de retiro»; «reversa/reembolso» → «reembolso acordado» | Joaquín López | Faltó algo |
| Modelo de dominio | Sí | Cliente suma `tipo` y `deuda`; nueva enumeración TipoCliente (estándar o VIP) | Joaquín Rojas | Faltó algo |
| Casos de uso | Sí | Actor Cliente VIP (especializa a Estudiante); nuevos CU-08 y CU-09; ajustes en CU-03 y CU-04 | Joaquín Rojas | Faltó algo |
| Diagramas de secuencia | Sí | Nuevo DSS-03 en PlantUML; DSS-01 y DSS-02 sin cambios | Martín Méndez | Estaba mal |
| Diagramas de estado | Sí | Nuevo ciclo de vida del Pedido VIP, sin estados de pago | Vicente Fernández Simonetti | Faltó algo |

---

## 1. Historias de usuario y Gherkin · Joaquín López

Archivos: `04-historias-usuario.md`, `07-criterios-aceptacion.md`

### Antes → después

- **HU-11 · Cliente VIP crea pedido con confirmación automática.** El martes solo existía el enunciado («Como cliente VIP, quiero…»). Ahora tiene 6 criterios: confirmación automática con código de retiro, suma a la deuda, sin unidades no se aprueba, un no VIP debe pagar, deuda máxima y solicitud repetida. Tiene además 5 escenarios Gherkin.
- **HU-12 · Cliente VIP consulta y gestiona su deuda.** Igual que HU-11: el martes solo estaba el enunciado. Ahora tiene 4 criterios (ver la deuda, suma de los pedidos, $0 sin compras, un no VIP no accede) y 4 escenarios Gherkin.
- **HU-03 CA2 y CA6:** «código» → «código de retiro».
- **HU-04 CA4:** «activa la reversa/reembolso acordada» → «activa el reembolso acordado». El mismo cambio se hizo en el escenario Gherkin de pago tardío.
- **Gherkin de HU-03 y HU-07:** «código» → «código de retiro» en los pasos de estimación no disponible, entrega y código inexistente.
- **Cobertura de requisitos:** se agregan HU-11 → RP-22 (propuesto), RP-16 y HU-12 → RP-23 (propuesto).

### Propuestos y todavía no subidos al repo

- HU-05 CA2, HU-07 (historia, CA1 y CA3) y HU-08 CA5: «código» → «código de retiro».
- Introducción de `07-criterios-aceptacion.md`: mencionar HU-10, HU-11 y HU-12.
- Gherkin de HU-10 (cargo de empaque, candidata).

### Por qué

El cliente VIP es un comportamiento nuevo. Sin criterios ni escenarios no hay cómo probarlo ni implementarlo.

### Veredicto y evidencia

**Faltó algo.** En el commit `92916ad` (24/11), HU-11 y HU-12 quedaron solo con el enunciado. Los criterios y el Gherkin se agregaron el 25/11 en `78950c2` y `3ad98e3`. HU-12 dice «gestiona», pero ningún criterio cubre cómo se salda la deuda.

**Qué haríamos distinto:** escribir los criterios y escenarios junto con la historia y definir cómo se salda la deuda.

---

## 2. Modelo de dominio · Joaquín Rojas

Archivos: `08-modelo-dominio.md`, `diagramas/modelo-dominio.puml`, `diagramas/modelo-dominio.png`

### Antes → después

| Antes | Después |
|---|---|
| `Cliente {nombre, contacto}` | `Cliente {nombre, contacto, tipo : TipoCliente, deuda}` |
| — | `enum TipoCliente {estándar, VIP}` |

- `tipo` distingue al cliente estándar del VIP; todo cliente parte como estándar.
- `deuda` parte en $0 y sube cada vez que se confirma un pedido VIP. Para un cliente estándar siempre vale $0.
- Se agrega la decisión de modelado «Cliente VIP» y se ajusta la decisión de roles: el VIP no es subclase.
- El PNG se regeneró e incluye Conciliacion, que faltaba en la versión anterior.

### Por qué

Solo había que guardar la deuda y saber quién es VIP. Se eligió un atributo y no una subclase ClienteVIP porque el VIP no tiene otros datos propios. Sus reglas (pedir sin pago, deuda máxima, consultar deuda) son pasos de CU-08 y CU-09, no estructura del dominio. Un pedido VIP no tiene Pago, algo que la multiplicidad 0..* de Pedido – Pago ya permite. La deuda máxima no es un atributo porque su monto sigue por validar. En SQLite equivale a dos columnas nuevas en la tabla `cliente` (`002_pedidos.sql`).

### Veredicto y evidencia

**Faltó algo.** El boceto del martes ya decía «deuda es un atributo de cliente vip», pero el modelo no se actualizó ese día. DSS-03 también usaba la deuda antes de que existiera en el modelo.

**Qué haríamos distinto:** actualizar el modelo el mismo día que se acuerda el cambio, junto con su migración en SQLite.

---

## 3. Casos de uso · Joaquín Rojas

Archivos: `09-casos-de-uso.md`, `diagramas/09-casos-de-uso.puml`, `diagramas/09-casos-de-uso.png`

### Antes → después

- **Actores:** se agrega el **Cliente VIP** como especialización del Estudiante (generalización UML). Hereda CU-01, CU-02, CU-04 y CU-07 y recibe el aviso de CU-03.
- **Diagrama:** dentro de TurnoCarrito se agrega un apartado «Cliente VIP» con los casos nuevos.
- **CU-08 · Crear pedido VIP sin pago previo** (de HU-11): flujo principal y alternativas (sin unidades, cambio de precio, deuda máxima, cliente no VIP, solicitud repetida).
- **CU-09 · Consultar deuda** (de HU-12): monto total; $0 si no hay compras; un no VIP no accede.
- **CU-03:** «un pedido sin pago confirmado no puede marcarse como listo» → «un pedido que no está confirmado…» (confirmado = pago aprobado o pedido VIP aprobado).
- **CU-04:** «verifica que esté pagado y listo» → «verifica que esté confirmado y listo». El pedido VIP se entrega aunque no esté pagado.
- **Pasarela de pago:** no participa en CU-08. El VIP solo la usa si decide pagar por CU-02.
- **Servicio de notificaciones:** el aviso de pedido listo también llega al cliente VIP.
- **Decisiones de modelado:** seis puntos nuevos (especialización, apartado VIP, CU-08 separado de CU-02, Pasarela sin CU-08, saldar deuda sin CU propio, deuda máxima como regla interna).

### Por qué

El VIP es un actor nuevo con dos objetivos propios. Además, CU-03 y CU-04 exigían un pedido «pagado», lo que impedía preparar y entregar un pedido VIP.

### Veredicto y evidencia

**Faltó algo.** El martes solo había un boceto (`diagrama_de_esdado_cambios.jpg`, subido con nombre de estado). Ahí «Análisis de deuda» aparecía como caso de uso, cuando en realidad es un paso del sistema, y no había nada para HU-12.

**Qué haríamos distinto:** partir del Gherkin, modelar objetivos del actor y no pasos, y cruzar el resultado con la secuencia antes de subirlo.

---

## 4. Diagramas de secuencia · Martín Méndez

Archivos: `10-diagramas-secuencia.md`, `diagramas/dss-03.puml`, `diagramas/dss-03.png`

### Antes → después

| # | Antes (martes, draw.io sin fuente) | Después (PlantUML) |
|---|---|---|
| 1 | Se rechazaba al VIP si **tenía cualquier deuda** | Se rechaza solo si la deuda **alcanzó el máximo** (HU-11 CA5) |
| 2 | Reservaba unidades y las liberaba si había deuda | Primero verifica la deuda; si está bajo el máximo revalida disponibilidad y descuenta existencias. El pedido VIP no crea Reserva |
| 3 | Solo dos caminos: «pago aprobado» y «pago rechazado» | `alt` no es VIP, solicitud repetida, deuda máxima, sin disponibilidad |
| 4 | No se sumaba el total a la deuda | Mensaje «sumar total del pedido a la deuda» al confirmar (HU-11 CA2) |
| 5 | No había consulta de deuda | `opt` consultar deuda, con $0 si no hay pedidos (HU-12) |
| 6 | `EVALUACION2.md` decía que se modificaba DSS-02 | Se crea DSS-03; DSS-01 y DSS-02 no cambian |

### Veredicto y evidencia

**Estaba mal.** La versión del martes contradecía HU-11 CA2 y CA5 y no tenía archivo fuente. Se corrigió en el commit `63d591e`.

**Qué haríamos distinto:** leer los criterios de HU-11 y HU-12 antes de dibujar y hacer el diagrama directo en PlantUML.

---

## 5. Diagramas de estado · Vicente Fernández Simonetti

Archivos: `11-diagramas-estado.md`, `diagramas/diagrama_de_estado_cambio.png`

### Antes → después

- **Antes:** boceto del martes (`casos_de_usos_cambios.png`, subido con nombre de casos de uso) con «Revisar deuda → Pago rechazado».
- **Después:** nuevo ciclo de vida del Pedido VIP.
  - Se quitan los estados de pago: Pendiente de pago, Pago no realizado, En conciliación y Reembolsado.
  - Revisión de deuda → **Confirmado** con la guarda [deuda + monto ≤ deuda máxima]. Acciones: aumentar deuda, registrar venta y asignar código.
  - Revisión de deuda → **Bloqueado por deuda** con la guarda [deuda + monto > deuda máxima]. Desde ahí pasa a Pago de deuda → Confirmado, o a Cancelado.
  - Desde Confirmado el ciclo es igual a EST-01: En preparación → Listo para retiro → Entregado.

### Por qué

El pedido VIP no pasa por pago ni conciliación. La deuda máxima es la que decide si el pedido se confirma.

### Veredicto y evidencia

**Faltó algo.** El boceto del martes llamaba «pago rechazado» a la deuda.

**Qué haríamos distinto:** alinear el diagrama con DSS-03 y HU-11 CA5 antes de cerrarlo y usar un ID nuevo (EST-03).

---

## Inconsistencias pendientes

| Tema | Detalle | Artefactos |
|---|---|---|
| Reserva del pedido VIP | DSS-03 descuenta existencias sin Reserva; CU-08 y el diagrama de estado consumen o liberan una reserva. Proponemos tomar DSS-03 como referencia | CU-08, DSS-03, estado |
| Pedido bloqueado por deuda | HU-11 CA5 dice que el pedido «no se realiza»; el diagrama de estado lo deja como «Bloqueado por deuda». Hay que elegir una lectura | HU-11, estado |
| Saldar la deuda | HU-12 dice «gestiona», pero ningún criterio, caso de uso ni diagrama define cómo se paga | HU-12, CU, estado |
| ID del diagrama de estado | El diagrama VIP se llama EST-02, pero ese ID ya es el ciclo de vida de Reserva | Estado |
| Pedido «sin pago confirmado» | HU-07 CA3 sigue exigiendo pago confirmado para entregar; con el VIP debería decir «no confirmado» (CU-04 ya está ajustado) | HU-07, CU-04 |
| Referencias de DSS-01 y DSS-02 | DSS-01 apunta a CU-03 y DSS-02 a CU-06; deberían ser CU-02 y CU-03 | `10-diagramas-secuencia.md` |
| Requisitos nuevos | RP-22 y RP-23 se nombran en las HU, pero no existen en `03-requisitos.md` | Requisitos, trazabilidad |
| Trazabilidad | Faltan filas para HU-11 → CU-08 → DSS-03 y HU-12 → CU-09 | `12-trazabilidad.md` |
| Archivos con nombre cruzado | `diagrama_de_esdado_cambios.jpg` es el boceto de casos de uso y `casos_de_usos_cambios.png` el de estado | `diagramas/` |
| Código | El cliente VIP todavía no está implementado en `src/` ni en `tests/`; falta la migración SQLite con las columnas `tipo` y `deuda` | Aplicación |
| Etiquetas | `base-eval2`, `cambio-validado` y `entrega-eval2` todavía no existen en el repositorio | Repositorio |
