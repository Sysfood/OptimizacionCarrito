# Atributos de calidad

[← Volver al documento maestro](IngReq-Entrega%201.md)

Este documento identifica y prioriza los atributos de calidad del sistema **TurnoCarrito**, derivados directamente de las iniciativas de rediseño y las actividades TO-BE definidas en [`02-rediseno-to-be.md`](02-rediseno-to-be.md). Cada atributo está asociado a la(s) actividad(es) del proceso que lo motivan y cuenta con al menos una métrica concreta que permite verificarlo.

---

## Criterios de priorización

Los atributos se priorizaron según dos ejes:

1. **Frecuencia de impacto:** cuántas actividades del TO-BE dependen de ese atributo para cumplir su propósito.
2. **Consecuencia de falla:** qué problema del AS-IS vuelve a ocurrir si el atributo no se satisface.

La escala usada es: **Alta — Media — Baja**.

---

## Tabla de atributos priorizados

| # | Atributo de calidad | Prioridad | Actividades TO-BE asociadas | Problema AS-IS que previene |
|---|---|---|---|---|
| AQ-01 | Disponibilidad | Alta | AC-02, AC-03, AC-04, AC-05, AC-06, AC-07 | P1, P2, P3 |
| AQ-02 | Rendimiento (tiempo de respuesta) | Alta | AC-02, AC-03, AC-05, AC-07 | P1, P5 |
| AQ-03 | Confiabilidad (consistencia de datos) | Alta | AC-04 | P3, P4 |
| AQ-04 | Usabilidad | Media | AC-01, AC-03, AC-08 | P1, P5 |
| AQ-05 | Seguridad | Media | AC-03, AC-04 | P4 |
| AQ-06 | Escalabilidad | Media | Transversal (Iniciativa 6) | P6 |
| AQ-07 | Mantenibilidad | Baja | Transversal | P6 |

---

## Descripción de cada atributo

### AQ-01 — Disponibilidad

**Definición:** El sistema debe estar operativo durante toda la ventana de demanda (bloques de clases y cambios de bloque), que es exactamente cuando los estudiantes realizan pedidos y el vendedor atiende la cola.

**Por qué es prioritario:** Si el sistema cae durante el cambio de bloque, ninguna de las actividades automatizadas del TO-BE funciona: no se verifica stock (AC-02), no se reciben pedidos (AC-03), no se descuenta inventario (AC-04) y el vendedor no recibe la cola (AC-06). El proceso entero revierte al AS-IS.

**Actividades asociadas:** AC-02, AC-03, AC-04, AC-05, AC-06, AC-07

**Métricas:**

| Métrica | Valor objetivo |
|---|---|
| Tiempo de actividad durante ventana de demanda (07:30–18:00 días hábiles) | ≥ 99 % |
| Tiempo máximo de recuperación ante caída (RTO) | ≤ 5 minutos |
| Pérdida máxima de datos ante falla (RPO) | 0 pedidos confirmados perdidos |

---

### AQ-02 — Rendimiento (tiempo de respuesta)

**Definición:** El sistema debe responder en tiempos que permitan al estudiante completar su pedido dentro de la clase, sin que la espera digital reemplace a la espera en fila.

**Por qué es prioritario:** La propuesta de valor central del sistema (Iniciativa 2 y 4) es que el pedido se realice durante la clase. Si la app tarda varios segundos en verificar stock o confirmar el pago, el estudiante percibe el sistema como lento y lo abandona, reproduciendo el problema P1.

**Actividades asociadas:** AC-02, AC-03, AC-05, AC-07

**Métricas:**

| Métrica | Valor objetivo |
|---|---|
| Tiempo de respuesta de verificación de stock (AC-02) | ≤ 2 segundos (percentil 95) |
| Tiempo de confirmación del pedido tras pago exitoso (AC-03 → AC-05) | ≤ 3 segundos |
| Tiempo de notificación push al estudiante tras marcar como listo (AC-07) | ≤ 5 segundos |
| Tiempo de carga del catálogo de productos en la app | ≤ 2 segundos en red móvil 4G |

---

### AQ-03 — Confiabilidad (consistencia de datos)

**Definición:** El stock mostrado al estudiante debe ser siempre coherente con el stock real disponible; no puede haber pedidos confirmados para unidades que no existen.

**Por qué es prioritario:** La Iniciativa 1 (knock-out anticipado) y la Iniciativa 3 (automatización del registro) solo tienen valor si el inventario es confiable. Si dos estudiantes pueden confirmar el mismo ítem al mismo tiempo (race condition), o si un pago fallido no libera las unidades reservadas, se vuelve al problema P2 (quiebre de stock al llegar) y P4 (datos de venta incorrectos). La Iniciativa 3 explícitamente señala que las unidades deben reservarse durante el pago y liberarse si este falla.

**Actividades asociadas:** AC-04 (Registrar el pedido y descontar el stock + Liberar unidades reservadas)

**Métricas:**

| Métrica | Valor objetivo |
|---|---|
| Diferencia entre stock en sistema y stock físico al cierre de jornada | 0 unidades |
| Pedidos confirmados con stock insuficiente por condición de carrera | 0 casos |
| Tiempo máximo para liberar unidades reservadas tras pago fallido o expirado | ≤ 3 minutos (tiempo de expiración del pago definido en AC-03) |

---

### AQ-04 — Usabilidad

**Definición:** La app debe poder ser usada por un estudiante universitario sin capacitación previa, en el tiempo que dura una pausa entre clases, y desde un teléfono móvil.

**Por qué es prioritario:** El éxito de las Iniciativas 2 y 4 depende de que el estudiante prefiera pedir por la app en vez de ir directamente al carrito. Si la interfaz es difícil de usar, el rediseño no se adopta y el proceso AS-IS se mantiene por inercia. La Iniciativa 5 también requiere que la notificación sea accionable con un gesto simple.

**Actividades asociadas:** AC-01 (selección de productos), AC-03 (confirmación y pago), AC-08 (retiro con turno)

**Métricas:**

| Métrica | Valor objetivo |
|---|---|
| Tiempo para completar un pedido desde inicio hasta confirmación (nuevo usuario) | ≤ 90 segundos |
| Tasa de abandono del flujo de pedido antes de confirmar | ≤ 15 % |
| Errores de navegación cometidos por un usuario nuevo en prueba de usabilidad | ≤ 2 errores críticos en el flujo principal |

---

### AQ-05 — Seguridad

**Definición:** Los datos de pago y los pedidos deben procesarse de forma que no expongan información sensible del estudiante ni permitan alteraciones no autorizadas de la cola o el inventario.

**Por qué es prioritario:** AC-03 involucra un pago en línea (pasarela de pago). AC-04 registra la venta y modifica el inventario; una alteración maliciosa de este registro puede comprometer la integridad de los datos que el encargado usa para la reposición (objetivo del encargado descrito en el TO-BE).

**Actividades asociadas:** AC-03 (pago en línea), AC-04 (registro de venta y stock)

**Métricas:**

| Métrica | Valor objetivo |
|---|---|
| Datos de tarjeta o medio de pago almacenados en el sistema propio | 0 (toda la transacción se delega a la pasarela) |
| Acceso al panel de inventario y cola por parte de usuarios no autenticados | 0 incidentes permitidos |
| Modificación de órdenes confirmadas sin registro de auditoría | 0 casos |

---

### AQ-06 — Escalabilidad

**Definición:** El sistema debe soportar múltiples puntos de venta y aumentos de volumen de pedidos sin requerir cambios de arquitectura ni contratación de personal adicional.

**Por qué es prioritario:** La Iniciativa 6 (Tecnología integral) tiene como objetivo explícito que el crecimiento lo absorba el sistema y no más vendedores (P6). La tabla de trazabilidad del TO-BE asocia los requisitos RP-15 y RP-20 a esta iniciativa, e identifica la configuración por punto de venta como una capacidad requerida.

**Actividades asociadas:** Transversal — especialmente AC-05 (cálculo de turnos por cola) y AC-06 (cola del vendedor)

**Métricas:**

| Métrica | Valor objetivo |
|---|---|
| Número de puntos de venta soportados sin cambio de código | ≥ 3 (configuración) |
| Degradación de tiempo de respuesta al duplicar el volumen de pedidos concurrentes | ≤ 20 % respecto al valor base de AQ-02 |
| Tiempo para habilitar un nuevo punto de venta | ≤ 30 minutos (configuración, sin despliegue de código) |

---

### AQ-07 — Mantenibilidad

**Definición:** El sistema debe poder ser modificado o corregido por el equipo de desarrollo con un esfuerzo razonable, en particular para ajustar parámetros de negocio (tiempos de preparación, catálogo de productos, horarios de jornada).

**Por qué es prioritario:** La actividad de soporte "Configurar el tiempo estándar de preparación de cada producto" (AC-05) y "Abrir la jornada declarando el stock inicial" son realizadas por el vendedor o encargado, no por el equipo de desarrollo. Si esos parámetros son difíciles de modificar, el sistema genera turnos con horas estimadas incorrectas, afectando la confianza del estudiante.

**Actividades asociadas:** Transversal — habilita las actividades de soporte del encargado descritas en el TO-BE

**Métricas:**

| Métrica | Valor objetivo |
|---|---|
| Tiempo para actualizar el catálogo de productos (agregar/quitar ítem) | ≤ 10 minutos por el encargado sin asistencia técnica |
| Tiempo para corregir un defecto de severidad media y desplegarlo | ≤ 2 días hábiles |
| Cobertura de pruebas automatizadas en módulos de cálculo de turnos y descuento de stock | ≥ 80 % |

---

## Resumen de priorización

```
Alta        AQ-01 Disponibilidad
            AQ-02 Rendimiento
            AQ-03 Confiabilidad

Media       AQ-04 Usabilidad
            AQ-05 Seguridad
            AQ-06 Escalabilidad

Baja        AQ-07 Mantenibilidad
```

Los tres atributos de prioridad alta son condición necesaria para que el rediseño cumpla su propósito: si el sistema no está disponible, no responde rápido o su inventario es inconsistente, los problemas P1, P2 y P4 del AS-IS reaparecen aunque el proceso esté bien diseñado.

---

 
