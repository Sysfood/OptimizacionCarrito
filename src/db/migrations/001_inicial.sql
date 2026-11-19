CREATE TABLE carrito (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  ubicacion TEXT NOT NULL
);

CREATE TABLE jornada (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  carrito_id INTEGER NOT NULL REFERENCES carrito(id),
  fecha TEXT NOT NULL,
  hora_apertura TEXT NOT NULL,
  hora_cierre TEXT NOT NULL,
  recepcion_digital INTEGER NOT NULL DEFAULT 1 CHECK (recepcion_digital IN (0, 1))
);

CREATE TABLE producto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  precio INTEGER NOT NULL CHECK (precio >= 0)
);

CREATE TABLE existencia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jornada_id INTEGER NOT NULL REFERENCES jornada(id),
  producto_id INTEGER NOT NULL REFERENCES producto(id),
  unidades_asignadas INTEGER NOT NULL DEFAULT 0 CHECK (unidades_asignadas >= 0),
  unidades_reservadas INTEGER NOT NULL DEFAULT 0 CHECK (unidades_reservadas >= 0),
  unidades_consumidas INTEGER NOT NULL DEFAULT 0 CHECK (unidades_consumidas >= 0),
  fecha_hora_actualizacion TEXT NOT NULL,
  UNIQUE (jornada_id, producto_id)
);

CREATE TABLE configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
