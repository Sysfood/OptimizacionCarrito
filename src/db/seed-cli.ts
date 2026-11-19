import { abrirDb } from './conexion';
import { sembrar } from './seed';

const db = abrirDb();
sembrar(db);
db.close();
console.log('Datos de ejemplo cargados en data/app.db');
