import { crearApp } from './app';
import { abrirDb } from './db/conexion';

const db = abrirDb();
const app = crearApp(db);
const puerto = Number(process.env.PORT ?? 3000);

app.listen(puerto, () => {
  console.log(`TurnoCarrito disponible en http://localhost:${puerto}/catalogo`);
});
