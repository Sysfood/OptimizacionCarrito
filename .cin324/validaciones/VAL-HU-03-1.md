# Informe de validación — HU-03 · Pagar y consultar el progreso del pedido
**Fecha:** 2026-11-19 · **Cambio de OpenSpec validado:** `hu-03-pagar-consultar-pedido` y `ajuste-hu-03-resultado-pasarela` · **Estado:** verificado en el sistema — el estudiante probó como estudiante los seis escenarios Gherkin más el caso «resultado sin envío previo» y confirmó que todo funcionó correctamente, incluida la separación entre el envío del pago y la respuesta de la pasarela simulada (OBS-1)

## Resumen
| Obs. | Lo que observaste | Tipo | Artefacto principal a modificar | También revisar |
|------|-------------------|------|----------------------------------|-----------------|
| OBS-1 | «A la hora de confirmar el pago, esto lo pueda hacer el mismo estudiante» | B — brecha de especificación | `04-historias-usuario.md`, HU-03, CA1 | `10-diagramas-secuencia.md` + `diagramas/dss-01.puml`, `07-criterios-aceptacion.md`, `09-casos-de-uso.md` |

**Lo que sí funcionó:** confirmación única, reserva consumida o liberada según el resultado, notificación repetida sin duplicar pedido ni venta, consulta por código con estado y estimación, y 46 pruebas en verde.

## Detalle por observación

### OBS-1 — Quien emite el resultado del pago en la demostración
- **Lo que dijiste:** te incomoda que el mismo estudiante pueda aprobar su propio pago al confirmar.
- **Qué dicen hoy los artefactos:**
  - `diagramas/dss-01.puml`: `EST -> PAS : ingresar datos de pago` y `PAS --> SIS : resultado del pago`. El estudiante no aprueba.
  - `07-criterios-aceptacion.md`, HU-03: «Cuando la Pasarela de pago informa que el pago fue aprobado…».
  - `09-casos-de-uso.md`: Pasarela de pago = sistema externo; actor principal de CU-02 = Estudiante.
  - `04-historias-usuario.md`, HU-03, CA1: «Solo se muestra confirmado cuando el servidor verifica el pago y asegura las unidades».
  - Ficha `.cin324/historias/HU-03.md`: la pasarela simulada ofrece tres resultados, pero no define quién los emite en la demostración.
- **Diagnóstico:** tipo **B**, no D. El servidor verifica el resultado contra el intento registrado (CA1) y las pruebas lo cubren; el código cumple lo escrito. La laguna está en los artefactos: definen que la pasarela informa el resultado, pero no cómo se simula ese paso, y la implementación resolvió la laguna poniendo los tres botones en la pantalla del estudiante. No es un tema de seguridad real (E): autenticación real y captura de tarjeta están descartadas en los artefactos (RP-18, selector de rol de demostración).
- **Decisión acordada (2026-11-19):** conservar los tres resultados para poder probar aprobación, rechazo, cancelación e idempotencia, pero presentarlos como respuesta de la **Pasarela de pago (simulada)**, separada de la acción con la que el estudiante envía el pago. Sin autenticación real ni rol falso de pasarela.

## Orden sugerido de edición
1. `04-historias-usuario.md` (HU-03, CA1)
2. `10-diagramas-secuencia.md` (DSS-01) y `diagramas/dss-01.puml` — exportar de nuevo el PNG
3. `07-criterios-aceptacion.md` (HU-03, nota de demostración)
4. `09-casos-de-uso.md` (CU-02, Pasarela de pago)
5. `12-trazabilidad.md` — solo si se agrega un criterio nuevo con ID

## Cómo trabajamos los cambios
Opción **B**: el estudiante propone cada cambio por separado y el estudiante aprueba, modifica o descarta cada uno. El asistente no toca código ni aplica cambios sin aprobación explícita.

## Cómo sabrás que terminaste
- [ ] Se actualizó el artefacto principal de OBS-1.
- [ ] Se revisaron los artefactos afectados de la lista.
- [ ] El diagrama editado tiene su fuente y su imagen exportada actualizadas.
- [ ] Se revisó la consistencia final y todo quedó ✔.

## Siguiente paso
Con los artefactos actualizados y commiteados, ejecutar `/cin324-generar-app` para generar el ajuste `ajuste-hu-03-resultado-pasarela` (sin repetir el stack) y después volver a ejecutar `/cin324-validar-sistema`.
