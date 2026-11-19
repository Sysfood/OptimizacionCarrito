CREATE TABLE pago (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL REFERENCES pedido(id),
  referencia_pasarela TEXT UNIQUE,
  monto INTEGER NOT NULL CHECK (monto >= 0),
  resultado TEXT NOT NULL DEFAULT 'pendiente' CHECK (
    resultado IN ('pendiente', 'rechazado', 'confirmado')
  ),
  fecha_hora TEXT NOT NULL
);

CREATE TABLE reserva (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL REFERENCES pedido(id),
  fecha_hora_inicio TEXT NOT NULL,
  fecha_hora_vencimiento TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (
    estado IN ('activa', 'consumida', 'liberada')
  )
);

CREATE INDEX idx_pago_pedido ON pago(pedido_id);
CREATE INDEX idx_reserva_pedido ON reserva(pedido_id);
