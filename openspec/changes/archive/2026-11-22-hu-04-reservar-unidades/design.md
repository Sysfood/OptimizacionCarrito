# Design

## Context

La declaración de `reserva.fechaHoraVencimiento` ya existe desde HU-03 (migración `003_pagos_reservas.sql`) y `pedido.estado` ya admite «En conciliación» y «Reembolsado» (migración `002_pedidos.sql`), pero ninguno de los dos se evalúa: `src/servicios/pago.ts` solo consume o libera la reserva según el resultado inmediato de la pasarela. Ver `proposal.md` para la motivación y `specs/pago-pedido/spec.md` para el contrato de comportamiento.

## Goals / Non-Goals

**Goals:**
- Evaluar la vigencia de la reserva usando `fechaHoraVencimiento` y el reloj del servidor.
- Centralizar las transiciones de Reserva (EST-02) en una sola función con guardas y estados finales.
- Registrar el pago aprobado tardío en una conciliación y simular la reversa/reembolso.
- Mantener la atomicidad de la última unidad y la idempotencia actuales.

**Non-Goals:**
- No se crea un caso de uso ni un DSS nuevos: todo ocurre dentro de CU-02 / DSS-01.
- No se implementa un proceso en segundo plano ni un temporizador por reserva.
- No se integra con una pasarela real ni se define el mecanismo de reembolso (Derivación 1).
- No se tocan las migraciones 001 a 003.

## Decisions

1. **Vencimiento evaluado en el momento de uso, no con un job.** Al iniciar pago, confirmar, liberar o consultar, se compara `fechaHoraVencimiento` contra `fechaHoraLocal()`; si venció y la reserva sigue `activa`, primero se libera. *Alternativa descartada:* un `setInterval` por reserva, que exigiría infraestructura y reintroduciría carreras. *Consecuencia:* el cambio se observa cuando el usuario vuelve a interactuar; se agrega un control de demostración para forzar el vencimiento y probarlo de inmediato.

2. **Una sola función de transición de Reserva**, derivada de EST-02: recibe `(evento, reserva)`, valida que el estado origen permita el evento, evalúa la guarda (`reserva vigente` o `3 min sin pago aprobado`), ejecuta la acción sobre `existencia` y guarda el estado destino. Esto reproduce el modelo: `Activa → Consumida` y `Activa → Liberada` son finales, por lo que una segunda notificación no puede repetir el efecto. *Alternativa descartada:* dispersar los `UPDATE` en cada ruta, que ya causó la laguna actual.

3. **Conciliación en una tabla nueva** `conciliacion` (migración `004_conciliacion.sql`): `id`, `pago_id`, `estado` (`en_resolucion`, `confirmada`, `reembolsada`), `motivo`, `fecha_hora`. *Alternativa descartada:* ampliar el `CHECK` de `pago.resultado`, que en SQLite obligaría a reconstruir la tabla y a migrar datos.

4. **Adaptador simulado de reversa.** Interfaz `ServicioReversa` con `solicitarReversa(referencia, monto)` e implementación `ReversaPagoSimulada` en `src/integraciones/`, seleccionada por configuración como los adaptadores existentes. Registra la llamada en consola y devuelve una referencia de reversa. La interfaz se usa solo en la rama «sin disponibilidad»; el mensaje de interfaz dice explícitamente que es una simulación.

5. **Rutas derivadas de DSS-01.** Se amplían las rutas ya existentes en `src/rutas/pedido.ts` con: (a) mensaje «pago en resolución» cuando el pago tardío entra en conciliación, (b) resultado del reembolso simulado, y (c) control de demostración para forzar vencimiento. No se crea una pantalla nueva de «cola», que pertenece a HU-05.

6. **Idempotencia y concurrencia.** Se reutilizan los `UPDATE` condicionales actuales (`WHERE estado = 'activa'`, `WHERE resultado = 'pendiente'`, `WHERE unidades_asignadas - unidades_reservadas - unidades_consumidas >= ?`) dentro de una sola transacción `db.transaction`. Para el reintento se exige que no exista reserva activa; la vencida queda `liberada`, así que nunca se reutiliza.

## Risks / Trade-offs

- **[Reloj del servidor]** Si el proceso está detenido cuando vence el plazo, la liberación ocurre al reanudar → Mitigación: la vigencia se calcula siempre contra la fecha guardada, no con un contador en memoria.
- **[Cambios en código de HU-03]** `pago.ts` es del ciclo anterior y tiene 48 pruebas en verde → Mitigación: agregar la rama nueva sin reescribir `confirmarPago` ni `rechazarPago` y correr toda la suite como regresión.
- **[Reembolso simulado]** Puede interpretarse como integración real → Mitigación: texto visible «reversa simulada» y alcance declarado fuera de OpenSpec y en la ficha.
- **[Concurrencia SQLite]** better-sqlite3 es síncrono → Mitigación: una transacción por operación y el `UPDATE` condicional ya probado en HU-03.

## Migration Plan

1. Agregar `src/db/migrations/004_conciliacion.sql` con la tabla `conciliacion` y su índice por `pago_id`; el cargador de migraciones la aplica en orden y la registra en `schema_migrations`.
2. No cambiar el `seed`: los datos de ejemplo de HU-01 a HU-03 siguen siendo válidos.
3. Rollback: eliminar la tabla `conciliacion` y retirar el archivo; las tablas anteriores no se alteran.
