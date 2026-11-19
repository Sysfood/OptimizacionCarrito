# consulta-pedido Specification

## Purpose

Permitir que el estudiante consulte su pedido confirmado, conozca su estado, detalle y estimación informativa, y vea los cambios por atraso sin que el pedido se cancele.

## Requirements

### Requirement: Consulta de un pedido confirmado

El sistema SHALL mostrar el código de retiro, el estado y el detalle de un pedido confirmado, y SHALL mantenerlo consultable hasta que sea entregado.

#### Scenario: Consultar un pedido confirmado
- **GIVEN** que el pedido fue confirmado
- **WHEN** el estudiante consulta su pedido
- **THEN** se muestran su código de retiro, su estado y su detalle
- **AND** el pedido sigue consultable hasta que sea entregado

### Requirement: Consulta por código de retiro

El sistema SHALL permitir consultar un pedido confirmado ingresando su código de retiro y SHALL informar cuando el código no corresponde a ningún pedido.

#### Scenario: Consultar por código de retiro
- **GIVEN** un pedido confirmado con un código de retiro
- **WHEN** el estudiante ingresa ese código
- **THEN** se muestran el estado y el detalle del pedido

#### Scenario: Código de retiro inexistente
- **GIVEN** un código que no corresponde a ningún pedido
- **WHEN** el estudiante lo ingresa
- **THEN** se informa que no se encontró un pedido con ese código
- **AND** no se muestran datos de otro pedido

### Requirement: Estimación de preparación no disponible

El sistema SHALL mostrar el estado actual y el mensaje «Estimación no disponible» cuando no existan parámetros vigentes para estimar la preparación, y SHALL aclarar que el código no es una cita ni garantiza una hora de retiro.

#### Scenario: La estimación de preparación no está disponible
- **GIVEN** que el pedido fue confirmado
- **AND** no existen parámetros vigentes para estimar su preparación
- **WHEN** el estudiante consulta el estado del pedido
- **THEN** se muestra el estado actual
- **AND** se informa que la estimación no está disponible
- **AND** se aclara que el código identifica el pedido y no es una cita ni garantiza una hora de retiro

### Requirement: Actualización por atraso o cambio de estimación

El sistema SHALL mostrar el estado o la estimación actualizados cuando se registre un atraso o cambie la estimación, y SHALL NOT cancelar el pedido por superar la estimación.

#### Scenario: El pedido presenta un atraso
- **GIVEN** que el pedido fue confirmado y todavía no está listo
- **WHEN** se registra un atraso o cambia la estimación disponible
- **THEN** se informa al estudiante el estado o la estimación actualizados
- **AND** el pedido no se cancela por superar la estimación
