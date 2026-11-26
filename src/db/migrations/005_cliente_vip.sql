ALTER TABLE cliente ADD COLUMN es_vip INTEGER NOT NULL DEFAULT 0 CHECK (es_vip IN (0, 1));
ALTER TABLE cliente ADD COLUMN deuda INTEGER NOT NULL DEFAULT 0 CHECK (deuda >= 0);

CREATE TABLE movimiento_deuda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL REFERENCES cliente(id),
  pedido_id INTEGER REFERENCES pedido(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('cargo', 'abono')),
  monto INTEGER NOT NULL CHECK (monto > 0),
  fecha_hora TEXT NOT NULL
);

CREATE INDEX idx_movimiento_deuda_cliente ON movimiento_deuda(cliente_id);

-- Un pedido solo puede cargarse una vez a la deuda (HU-11, solicitud repetida).
CREATE UNIQUE INDEX idx_movimiento_deuda_cargo_pedido
  ON movimiento_deuda(pedido_id) WHERE tipo = 'cargo';
