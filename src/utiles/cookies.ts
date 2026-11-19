export function leerCookies(cabecera: string | undefined): Record<string, string> {
  if (!cabecera) return {};

  const cookies: Record<string, string> = {};

  for (const parte of cabecera.split(';')) {
    const limpia = parte.trim();
    if (!limpia) continue;

    const indice = limpia.indexOf('=');
    if (indice < 0) continue;

    const nombre = limpia.slice(0, indice).trim();
    const valor = limpia.slice(indice + 1).trim();

    try {
      cookies[nombre] = decodeURIComponent(valor);
    } catch {
      cookies[nombre] = valor;
    }
  }

  return cookies;
}

export function leerCookie(
  cabecera: string | undefined,
  nombre: string,
): string | undefined {
  return leerCookies(cabecera)[nombre];
}
