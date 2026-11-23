# Proposal

## Why

HU-04 cierra la brecha que HU-03 dejó abierta en la reserva transitoria: hoy `reserva.fechaHoraVencimiento` se guarda pero nunca se evalúa, así que una reserva activa no expira y un pago aprobado tardío podría confirmar un pedido aunque las unidades ya se comprometieron con otra compra. Sin vencimiento ni conciliación, el sistema no cumple RP-05, RP-16 ni la Derivación 1.

## What Changes

- Implementar el **vencimiento automático de la reserva** a los 3 minutos (plazo propuesto y configurable), liberando las unidades una sola vez y devolviendo el pedido a «Pago no realizado».
- Rechazar un pago aprobado después del vencimiento: dejar el pedido en **«En conciliación»** e informar **«pago en resolución»**, sin pasarlo a preparación.
- En conciliación: si hay disponibilidad, asegurar las unidades en una sola operación y confirmar; si no, tramitar la **reversa/reembolso simulado** y dejar el pedido en **«Reembolsado»**.
- Exigir una **nueva validación y una reserva nueva** en cada reintento; nunca reutilizar una reserva vencida.
- Conservar la reserva atómica por la última unidad (el `UPDATE` condicional actual ya la garantiza) y la idempotencia de consumo y liberación, derivadas de los estados finales `consumida` y `liberada` de EST-02.

Fuera del alcance: cola de preparación y aviso de listo (HU-05/HU-06), retiro (HU-07), administración de disponibilidad (HU-08), reporte (HU-09), cargo de empaque (HU-10), pagos reales, autenticación y requisitos no funcionales (RP-14, RP-15, RP-19, RP-20). La reversa/reembolso se **simula**: responsable, plazo y mecanismo con la pasarela quedan por acordar (Derivación 1, RY-04).

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `pago-pedido`: se agregan los requisitos de vencimiento de la reserva y de pago aprobado tardío en conciliación con reembolso simulado, y se ajusta el requisito de confirmación para exigir que la reserva esté **vigente** (no vencida).

## Impact

- **Código:** `src/servicios/pago.ts` (evaluación de vigencia, vencimiento y rama de conciliación), `src/dominio/reserva.ts` (guarda de vigencia), `src/rutas/pedido.ts` (mensajes «pago en resolución» y resultado del reembolso) y un adaptador simulado nuevo en `src/integraciones/` para la reversa.
- **Datos:** nueva migración `004_conciliacion.sql` con una tabla de conciliación por pago; no se reescriben las migraciones 001 a 003 (`pedido.estado` ya admite «En conciliación» y «Reembolsado»).
- **Pruebas:** una prueba de integración por cada uno de los cinco escenarios Gherkin de HU-04, más idempotencia de consumo y liberación.
- **Artefactos del curso:** sin cambios. La fuente es la ficha confirmada `.cin324/historias/HU-04.md` (HU-04, actividad AC-04, caso de uso CU-02, DSS-01, EST-01 y EST-02).
