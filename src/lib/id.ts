/**
 * Identificador único de piloto: se deriva del documento de identidad para
 * que el mismo documento siempre produzca el mismo ID (salvo colisión, que se
 * resuelve con el sufijo de posición).
 */

const ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford: sin I, L, O, U

function hashFnv1a(texto: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function aBase32(numero: number, largo: number): string {
  let salida = "";
  let resto = numero;
  for (let i = 0; i < largo; i++) {
    salida = ALFABETO[resto % ALFABETO.length] + salida;
    resto = Math.floor(resto / ALFABETO.length);
  }
  return salida;
}

/** Normaliza un documento para que "1.020.334.567-8" y "10203345678" coincidan. */
export function normalizarDocumento(documento: string): string {
  return documento.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
}

/**
 * Genera el identificador de la federación para un documento.
 * Formato: FK-<temporada>-<6 caracteres>.
 */
export function generarIdPiloto(documento: string, temporada = "2027"): string {
  const normalizado = normalizarDocumento(documento);
  const hash = hashFnv1a(normalizado);
  const prefijo = aBase32(hash, 6);
  return `FK-${temporada}-${prefijo}`;
}

/**
 * Igual que `generarIdPiloto`, pero garantiza que el ID no esté repetido:
 * si ya existe, deriva una variante determinista con un sufijo numérico.
 */
export function generarIdUnico(
  documento: string,
  idsExistentes: string[],
  temporada = "2027",
): string {
  const base = generarIdPiloto(documento, temporada);
  if (!idsExistentes.includes(base)) return base;

  let intento = 2;
  let candidato = `${base}-${intento}`;
  while (idsExistentes.includes(candidato)) {
    intento += 1;
    candidato = `${base}-${intento}`;
  }
  return candidato;
}
