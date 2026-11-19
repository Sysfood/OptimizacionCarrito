# Estado del proyecto — generación de la aplicación

## Proyecto
- Nombre: TurnoCarrito (OptimizaciónCarrito — CIN 324)
- Repositorio de documentación: esta carpeta
- Última auditoría: 2026-11-18 — resultado: completo, con supuestos

## Mapa de artefactos (rutas detectadas)
| Artefacto | Ruta(s) | Estado |
|-----------|---------|--------|
| BPMN AS-IS | `01-proceso-as-is.md`, `diagramas/as-is.bpmn`, `diagramas/as-is.png` | completo |
| BPMN TO-BE | `02-rediseno-to-be.md`, `diagramas/to-be.bpmn`, `diagramas/to-be.png` | completo |
| Historias de usuario | `04-historias-usuario.md` (HU-01…HU-10) | completo (HU-10 candidata) |
| Criterios Gherkin | `07-criterios-aceptacion.md` (HU-01…HU-09) | completo |
| Modelo de dominio | `08-modelo-dominio.md`, `diagramas/modelo-dominio.puml` | completo |
| Casos de uso | `09-casos-de-uso.md`, `diagramas/09-casos-de-uso.puml` | completo |
| Diagramas de estado | `11-diagramas-estado.md`, `diagramas/est-01.puml`, `diagramas/est-02.puml` | completo |
| Diagramas de secuencia | `10-diagramas-secuencia.md`, `diagramas/dss-01.puml`, `diagramas/dss-02.puml` | completo (ver supuesto 1) |
| Requisitos y atributos de calidad | `03-requisitos.md`, `06-atributos-calidad.md`, `12-trazabilidad.md` | completo |

## Supuestos acordados (por elementos faltantes o dudosos)
- 2026-11-18 — **Mapeo de casos de uso en los DSS:** se asume el de `09-casos-de-uso.md` y `12-trazabilidad.md`: DSS-01 corresponde a CU-02 (crear y pagar pedido) y DSS-02 a CU-03 (gestionar preparación y avisar pedido listo). Los encabezados de `10-diagramas-secuencia.md` y de los `.puml` citan CU-03 y CU-06 respectivamente; no se modifican sin permiso del estudiante. Confirmado por el estudiante.
- 2026-11-18 — **Vocabulario:** en el código se usa `Existencia` como concepto interno y «disponibilidad» en la interfaz; el identificador visible del pedido se llama `código de retiro` (equivale a «turno» del TO-BE y «código de pedido» de otros documentos). Confirmado por el estudiante.
- 2026-11-18 — **HU-10 (cargo de empaque)** queda fuera del alcance: es candidata, sin Gherkin ni caso de uso. No se implementa mientras no se apruebe. Confirmado por el estudiante.
- 2026-11-18 — **Enlaces internos rotos** (`IngReq-Entrega 1.md`, `IngReq-Entrega 2.md`, `07-revision-elicitacion.md`): no afectan la generación; el índice real es `README.md`. Confirmado por el estudiante.
- 2026-11-18 — **Sin prioridad MoSCoW** registrada: el orden de las historias se decide por dependencias del proceso TO-BE. Confirmado por el estudiante.

## Stack (se define una sola vez)
- Lenguaje y framework: TypeScript + Express + EJS
- Base de datos: SQLite con `better-sqlite3` — archivo `data/app.db` (alternativa `node:sqlite` si falla la instalación nativa en Node 26)
- Pruebas: Vitest + supertest
- Cómo instalar: `npm install`
- Cómo ejecutar: `npm run db:seed` y `npm run dev` — URL: http://localhost:3000
- Cómo probar: `npm test`
- Decisión confirmada por el estudiante: 2026-11-18

## Historias
| Historia | Estado | Cambio de OpenSpec | Fecha | Observaciones |
|----------|--------|--------------------|-------|----------------|
| HU-01 | hecha | `archive/2026-11-18-hu-01-consultar-disponibilidad` | 2026-11-18 | Validada por el estudiante; 11 pruebas en verde; spec principal en `openspec/specs/catalogo-disponibilidad/spec.md` |
| HU-02 | hecha | `archive/2026-11-18-hu-02-armar-pedido-total` | 2026-11-18 | Validada por el estudiante; 27 pruebas en verde; spec principal en `openspec/specs/armado-pedido/spec.md` |
| HU-03 | hecha | `archive/2026-11-19-hu-03-pagar-consultar-pedido`, `archive/2026-11-19-ajuste-hu-03-resultado-pasarela` | 2026-11-19 | Validada por el estudiante; OBS-1 resuelta en artefactos y regenerada. 48 pruebas en verde; specs principales `pago-pedido` y `consulta-pedido`. Pendiente: exportar de nuevo `diagramas/dss-01.png` |
| HU-04 | pendiente | — | — | Reserva de unidades durante el pago |
| HU-05 | pendiente | — | — | Cola de preparación del vendedor |
| HU-06 | pendiente | — | — | Preparación y aviso de pedido listo |
| HU-07 | pendiente | — | — | Retiro y entrega |
| HU-08 | pendiente | — | — | Disponibilidad del canal digital |
| HU-09 | pendiente | — | — | Reporte de ventas digitales |
| HU-10 | fuera de alcance | — | — | Candidata, sin aprobar |

## Validaciones
| Historia | Informe | Estado | Fecha |
|----------|---------|--------|-------|
| HU-01 | Confirmación del estudiante: probada y funcionando | validada | 2026-11-18 |
| HU-02 | Confirmación del estudiante: probada y funcionando | validada | 2026-11-18 |
| HU-03 | Informe `.cin324/validaciones/VAL-HU-03-1.md`: OBS-1 resuelta en artefactos y verificada en el sistema; el estudiante probó los seis escenarios Gherkin más el caso «resultado sin envío previo» sin observaciones | validada | 2026-11-19 |

## Cambios posteriores
| Cambio | Historia afectada | Motivo | Fecha |
|--------|-------------------|--------|-------|
| `11-diagramas-estado.md` | HU-03 | Se agregó HU-03 a la línea «Historias» de EST-02, con autorización del estudiante | 2026-11-18 |
| `04-historias-usuario.md`, `07-criterios-aceptacion.md`, `09-casos-de-uso.md`, `10-diagramas-secuencia.md`, `diagramas/dss-01.puml` | HU-03 | OBS-1: aclarar que el resultado del pago lo emite la pasarela simulada, separada de la acción del estudiante; ver `.cin324/validaciones/VAL-HU-03-1.md` | 2026-11-19 |
| `src/integraciones/pasarela-pago.ts`, `src/rutas/pedido.ts`, `src/vistas/pasarela.ejs`, `src/vistas/pasarela-resultado.ejs`, `tests/*`, `README.md` | HU-03 | Ajuste generado desde los artefactos: envío del pago y emisión del resultado separados; 48 pruebas en verde | 2026-11-19 |
