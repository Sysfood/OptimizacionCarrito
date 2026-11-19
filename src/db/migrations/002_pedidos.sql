CREATE TABLE cliente (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  contacto TEXT NOT NULL
);

CREATE TABLE pedido (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL REFERENCES cliente(id),
  jornada_id INTEGER NOT NULL REFERENCES jornada(id),
  estado TEXT NOT NULL DEFAULT 'En edición' CHECK (
    estado IN (
      'En edición',
      'Pendiente de pago',
      'Confirmado',
      'Pago no realizado',
      'En conciliación',
      'En preparación',
      'Listo para retiro',
      'Entregado',
      'Reembolsado'
    )
  ),
  codigo TEXT UNIQUE,
  estimacion_preparacion TEXT,
  fecha_hora_confirmacion TEXT,
  fecha_hora_listo TEXT,
  fecha_hora_entrega TEXT
);

CREATE TABLE detalle_pedido (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES producto(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario INTEGER NOT NULL CHECK (precio_unitario >= 0),
  UNIQUE (pedido_id, producto_id)
);
