<div align="center">

# 📋 Requisitos & Historias de Usuario

### Aporte de esta rama a **OptimizacionCarrito**

*CIN 324 — Ingeniería de Requisitos · Entrega 1*

[![Requisitos](https://img.shields.io/badge/RP--01%20a%20RP--20-20%20requisitos-blue?style=flat-square)]()
[![Proyecto](https://img.shields.io/badge/RY--01%20a%20RY--07-7%20requisitos-lightblue?style=flat-square)]()
[![Historias](https://img.shields.io/badge/HU--01%20a%20HU--09-9%20historias-green?style=flat-square)]()

</div>

Esta rama contiene los **ítems 3 y 4** de la rúbrica de la Entrega 1: la clasificación de requisitos y las historias de usuario del sistema OptimizacionCarrito.

> 📎 Para el resto de la documentación (AS-IS, TO-BE, elicitación, atributos de calidad), ver el [documento maestro en `main`](../../blob/main/IngReq-Entrega%201.md).

---

## 📄 Archivos de esta rama

| Archivo | Contenido |
|---|---|
| [`03-requisitos.md`](./03-requisitos.md) | 20 requisitos de producto (funcionales / no funcionales) · 7 requisitos de proyecto · 2 derivaciones |
| [`04-historias-usuario.md`](./04-historias-usuario.md) | 9 historias de usuario con criterios de aceptación |

---

## 🧑‍💻 Índice de historias de usuario

Haz clic en cualquiera para ir directo a esa historia en [`04-historias-usuario.md`](./04-historias-usuario.md):

### 🎓 Estudiante

| Historia | Resumen | Requisitos |
|---|---|:-:|
| [**HU-01**](./04-historias-usuario.md#hu-01-ver-la-disponibilidad-real-antes-de-salir-de-clase) — Ver la disponibilidad real antes de salir de clase | Ver stock real antes de desplazarse | `RP-01` `RP-14` |
| [**HU-02**](./04-historias-usuario.md#hu-02-armar-el-pedido-desde-la-sala-de-clases) — Armar el pedido desde la sala de clases | Seleccionar productos y cantidades en la app | `RP-02` `RP-03` `RP-17` |
| [**HU-03**](./04-historias-usuario.md#hu-03-pagar-en-línea-y-recibir-un-turno) — Pagar en línea y recibir un turno | Pago en línea + número de turno con hora estimada | `RP-04` `RP-07` `RP-18` |
| [**HU-04**](./04-historias-usuario.md#hu-04-no-perder-una-unidad-ya-pagada-por-otro-pedido-simultáneo) — No perder una unidad ya pagada por otro pedido simultáneo | Reserva transitoria de stock durante el pago | `RP-05` `RP-16` |
| [**HU-07**](./04-historias-usuario.md#hu-07-retirar-el-pedido-presentando-el-turno) — Retirar el pedido presentando el turno | Retiro validado contra el turno | `RP-11` |

### 🧑‍🍳 Vendedor del carrito

| Historia | Resumen | Requisitos |
|---|---|:-:|
| [**HU-05**](./04-historias-usuario.md#hu-05-recibir-los-pedidos-en-una-cola-ordenada) — Recibir los pedidos en una cola ordenada | Cola de pedidos ordenada por turno | `RP-08` `RP-20` |
| [**HU-06**](./04-historias-usuario.md#hu-06-avisar-al-estudiante-que-su-pedido-está-listo) — Avisar al estudiante que su pedido está listo | Notificación push al marcar como listo | `RP-09` `RP-10` `RP-19` |
| [**HU-08**](./04-historias-usuario.md#hu-08-cargar-el-stock-de-la-jornada) — Cargar el stock de la jornada | Carga y ajuste de stock inicial | `RP-12` `RP-14` |

### 📊 Encargado del carrito

| Historia | Resumen | Requisitos |
|---|---|:-:|
| [**HU-09**](./04-historias-usuario.md#hu-09-saber-qué-se-vendió-y-qué-no-se-pudo-vender) — Saber qué se vendió y qué no se pudo vender | Reporte de ventas y pedidos rechazados | `RP-06` `RP-13` |

---

## 🔗 Trazabilidad

Cada requisito de producto está asociado a una actividad del TO-BE (`AC-01`...`AC-08`), y cada historia hereda esa misma asociación. El detalle completo está en la tabla de [`02-rediseno-to-be.md`](../../blob/main/02-rediseno-to-be.md#actividades-que-cambian-del-as-is-al-to-be).

---

<div align="center">
<sub>👤 Responsable de esta rama — ver <a href="../../blob/main/RESPONSABILIDADES.md">RESPONSABILIDADES.md</a></sub>
</div>
