# 12 — Trazabilidad de requisitos y artefactos

## 1. Propósito

La matriz de trazabilidad relaciona cada requisito de producto (RP) con los artefactos de análisis que lo desarrollan: historias de usuario (HU), casos de uso (CU), diagramas de secuencia (DSS), diagramas de estado (EST) y clases del modelo de dominio.

> Una celda vacía significa que el artefacto no modela directamente ese requisito en la versión actual de la Entrega 2. No se agregan relaciones solo para completar la tabla.

## 2. Matriz de trazabilidad

| Requisito | Historia(s) | Caso(s) de uso | Secuencia | Estado | Clase(s) del dominio |
|---|---|---|---|---|---|
| RP-01 | HU-01, HU-08 | CU-01, CU-06 | — | — | Producto, Existencia, Jornada |
| RP-02 | HU-02 | CU-02 | — | — | Producto, DetallePedido, Pedido |
| RP-03 | HU-02 | CU-02 | DSS-01 | EST-02 | Pedido, DetallePedido, Producto, Existencia, Reserva |
| RP-04 | HU-03 | CU-02 | DSS-01 | EST-01, EST-02 | Pedido, Pago, Reserva |
| RP-05 | HU-04 | CU-02 | DSS-01 | EST-01, EST-02 | Pedido, Reserva, Existencia, Pago |
| RP-06 | HU-09 | CU-05 | — | — | Pedido, DetallePedido, Pago, Jornada |
| RP-07 | HU-03, HU-07 | CU-02, CU-04, CU-07 | DSS-01 | EST-01 | Pedido, Cliente |
| RP-08 | HU-05 | CU-03 | — | EST-01 | Pedido, DetallePedido, Jornada |
| RP-09 | HU-06 | CU-03 | DSS-02 | EST-01 | Pedido |
| RP-10 | HU-03, HU-06, HU-07 | CU-03, CU-04, CU-07 | DSS-02 | EST-01 | Pedido, Aviso, Cliente |
| RP-11 | HU-07 | CU-04 | — | EST-01 | Pedido, Cliente |
| RP-12 | HU-08 | CU-06 | — | EST-02 | Jornada, Existencia, AjusteExistencia, Reserva |
| RP-13 | HU-09 | CU-05 | — | — | Jornada, Pedido, DetallePedido, Pago |
| RP-14 | HU-01, HU-08 | CU-01, CU-06 | — | — | Producto, Existencia, Jornada, Reserva |
| RP-15 | HU-05 | CU-03 | — | EST-01 | Pedido, DetallePedido, Jornada |
| RP-16 | HU-04, HU-08 | CU-02, CU-06 | DSS-01 | EST-02 | Reserva, Existencia, Pedido, Pago |
| RP-17 | HU-02 | CU-02 | — | — | Pedido, DetallePedido, Producto |
| RP-18 | HU-03 | CU-02 | DSS-01 | EST-01 | Pago, Pedido |
| RP-19 | HU-06 | CU-03 | DSS-02 | EST-01 | Aviso, Pedido, Cliente |
| RP-20 | HU-05, HU-06, HU-07 | CU-03, CU-04 | DSS-02* | EST-01 | Pedido, Aviso, Jornada |
| RP-21 | HU-10 (candidata) | —** | — | — | Pedido, DetallePedido |

## 3. Trazabilidad de atributos de calidad

| Atributo / propiedad | Requisito | Historia principal | Caso de uso |
|---|---|---|---|
| Actualización / frescura de disponibilidad | RP-14 | HU-01, HU-08 | CU-01, CU-06 |
| Rendimiento | RP-15 | HU-05 | CU-03 |
| Integridad / concurrencia de reservas | RP-16 | HU-04, HU-08 | CU-02, CU-06 |
| Usabilidad | RP-17 | HU-02 | CU-02 |
| Seguridad del pago | RP-18 | HU-03 | CU-02 |
| Tiempo de aviso | RP-19 | HU-06 | CU-03 |
| Resiliencia / desconexión | RP-20 | HU-05, HU-06, HU-07 | CU-03, CU-04 |

## 4. Relaciones clave

### RP-15 — Rendimiento

**RP-15 → HU-05 → CU-03 → EST-01 → Pedido/DetallePedido/Jornada**

### RP-16 — Integridad de reservas

**RP-16 → HU-04/HU-08 → CU-02/CU-06 → DSS-01 → EST-02 → Reserva/Existencia**

### RP-18 — Seguridad

**RP-18 → HU-03 → CU-02 → DSS-01 → EST-01 → Pago**

### RP-19 — Aviso

**RP-19 → HU-06 → CU-03 → DSS-02 → EST-01 → Aviso/Pedido/Cliente**

 