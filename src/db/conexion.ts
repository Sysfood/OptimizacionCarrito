import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export type Db = Database.Database;

const DIRECTORIO_MIGRACIONES = path.join(process.cwd(), 'src', 'db', 'migrations');

export function fechaHoraLocal(fecha = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())} ` +
    `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`
  );
}

export function fechaLocal(fecha = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

export function aplicarMigraciones(db: Db): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      aplicada_en TEXT NOT NULL
    );
  `);

  const archivos = fs
    .readdirSync(DIRECTORIO_MIGRACIONES)
    .filter((archivo) => archivo.endsWith('.sql'))
    .sort();

  const aplicadas = new Set(
    (db.prepare('SELECT version FROM schema_migrations').all() as { version: string }[]).map(
      (fila) => fila.version,
    ),
  );

  for (const archivo of archivos) {
    if (aplicadas.has(archivo)) continue;

    const sql = fs.readFileSync(path.join(DIRECTORIO_MIGRACIONES, archivo), 'utf8');
    db.exec('BEGIN');
    try {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (version, aplicada_en) VALUES (?, ?)').run(
        archivo,
        fechaHoraLocal(),
      );
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}

export function abrirDb(ruta?: string): Db {
  const archivo = ruta ?? process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'app.db');

  if (archivo !== ':memory:') {
    fs.mkdirSync(path.dirname(archivo), { recursive: true });
  }

  const db = new Database(archivo);
  db.pragma('foreign_keys = ON');
  aplicarMigraciones(db);
  return db;
}
