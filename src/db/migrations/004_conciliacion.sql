CREATE TABLE conciliacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pago_id INTEGER NOT NULL REFERENCES pago(id),
  estado TEXT NOT NULL CHECK (estado IN ('en_resolucion', 'confirmada', 'reembolsada')),
  motivo TEXT NOT NULL,
  fecha_hora TEXT NOT NULL,
  referencia_reversa TEXT
);

CREATE INDEX idx_conciliacion_pago ON conciliacion(pago_id);
