-cambios a casos de usos 

Metodología de análisis ( cambios casos de uso).



Modificar diagrama agregando un nuevo apartado con las especificaciones del cliente vip.
Agregar los casos de uso específicos del cliente vip
Modificar las decisiones de modelado 
Especialización de actores en UML
Agregar el actor VIP
Modificar pasarela de pagos para el actor vip
Modificar servicio de notificaciones para cliente VIP 
Modificar historias de usuario
Modificar descripción de casos de uso




-cambios a hu y gherkin



IDEA INHUMANIZADA
------------------
Historia Nuevas=

HU-11 y HU-12 con sus gherkin, donde el VIP crea el pedido, queda confirmado automaticamente con el codigo de retiro, como queda aprobado inmediatamente sin pagar anteriormente, el precio de lo comprado se le suma al total de la deuda si es que la tiene.
 -Si no hay unidades disponibles, no se aprueba el pedido (No se le suma a la deuda)
 -Un Usuario NO VIP no puede hacer un pedido sin pagar.
 -El Usuario VIP puede ver su deuda, y si no ha comprado nada al principio empieza en $0.

HU-04, CA4: cambiar (activ la reserva/reembolso acordada) por (activa el rembolso acordado)

HU-03, CA2,CA6: remplazar por (codigo de retiro)

--------------------

Criterios de Aceptacion=

HU-04: Cambiar Y si se activa la reversa o el rembolso acordado por Si se activa el reembolso acordado

usar el codigo de retiro, donde dice solamente codigo.







-cambio diagrama de secuencia y de estado 

en el diagrama de secuencia se va a agregar otro diagrama con otro participador en vez de estudiante en este caso se generara un diagrama para el cliente vip con sus respectivos cambios en este caso se este cliente podra comprar sin realizar una transaccion por lo tanto este acumulara una deuda que se guardara en la caja negra de la rama de sistema. la rama de pasarela de pago externo se eliminara ya que no sere  un participador en cambio la rama de sistema seguira existiendo con sus respectivas modificaciones
en el diagrama diagrama dss-2 se cambia el cliente estudiante por le vip ademas de que se eliminara la secuencia de transaccion fallida debido a que este no gerara un tipo de pago en cambio esta se sera remplazada por una secuencia que agragara deuda al cliente que serea de sistema a sistema 

en el diagrama de estado se tiene que generar uno nuevo debido a que el diagrama anterior contiene seccione de pagos y estos no son contemplados por el cliente vip a su vez se generar un nuevo diagrama el cual al hacer el pedido se verificara una deuda maxima que estara dentro de una caja negra, y de ser este caso anterior no se puede realizar el pedido hazta que la deuda sea saldada por otra parte la confirmacion preparacion lsita del retiro para la entrga seran iguales, en caso de que no exita deuda se hace un pago aprobado y aumenta la deuda que esto sera una caja negra 

el diagrama de ciclo de vida de la reserva se hara uno nuevo en el que se iniciara una activacion si posee deuda no pasa a aprovado y se libera y si no posee deuda pasa a consumida

-cambios trazabilidad

la trazanbilidad 
cambiara en funcion de los demas puntos y la matriz se ve afecatada partiendo de las bases desde las historias de usuarios hasta los diagramas mismos 