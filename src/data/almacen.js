import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA = path.join(__dirname, '..', '..', 'almacen');

async function asegurarCarpeta() {
  await fs.mkdir(CARPETA, { recursive: true });
}

export async function leerRegistros(archivo) {
  await asegurarCarpeta();
  try {
    const contenido = await fs.readFile(path.join(CARPETA, archivo), 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export async function guardarRegistro(archivo, registro) {
  const registros = await leerRegistros(archivo);
  registros.push(registro);
  await fs.writeFile(path.join(CARPETA, archivo), JSON.stringify(registros, null, 2), 'utf8');
  return registro;
}
