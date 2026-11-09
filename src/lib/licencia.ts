/**
 * Estado público de una licencia de piloto.
 *
 * La consulta pública de /verificar muestra, a partir del número o del código
 * QR de una licencia, quién es el titular, su categoría y si la licencia está
 * vigente, vencida o suspendida.
 */

import type { Estado, Licencia, Piloto } from "./types";

/** Estados que ve el público en la consulta de licencias. */
export type EstadoPublicoLicencia =
  | "vigente"
  | "vencida"
  | "suspendida"
  | "en_validacion"
  | "rechazada"
  | "no_encontrada";

export const ETIQUETA_ESTADO_PUBLICO: Record<EstadoPublicoLicencia, string> = {
  vigente: "Vigente",
  vencida: "Vencida",
  suspendida: "Suspendida",
  en_validacion: "En validación",
  rechazada: "Rechazada",
  no_encontrada: "No encontrada",
};

/** Texto de apoyo que acompaña a cada estado público. */
export const DETALLE_ESTADO_PUBLICO: Record<EstadoPublicoLicencia, string> = {
  vigente: "Licencia habilitada para participar en el campeonato.",
  vencida: "La vigencia de esta licencia terminó.",
  suspendida: "La directiva suspendió esta licencia.",
  en_validacion: "La directiva todavía no resuelve esta solicitud.",
  rechazada: "La directiva rechazó esta solicitud.",
  no_encontrada: "No hay ninguna licencia con ese código.",
};

/** Prefijo de los códigos de verificación que llevan las licencias. */
export const PREFIJO_CODIGO_LICENCIA = "FEDKART-LIC";

/**
 * Código de verificación de una licencia: es lo que se escanea con la cámara
 * o se escribe a mano en la consulta pública.
 */
export function codigoVerificacionLicencia(licencia: Licencia): string {
  return `${PREFIJO_CODIGO_LICENCIA}-${licencia.id}`;
}

/**
 * Normaliza lo que escribe o escanea el público: acepta el número de licencia
 * ("LIC-ABC12"), el código completo ("FEDKART-LIC-LIC-ABC12") y tolerate
 * espacios, guiones y minúsculas.
 */
export function normalizarCodigoLicencia(codigo: string): string {
  const limpio = codigo.trim().toUpperCase().replace(/\s+/g, "");
  const sinPrefijo = limpio.startsWith(`${PREFIJO_CODIGO_LICENCIA}-`)
    ? limpio.slice(PREFIJO_CODIGO_LICENCIA.length + 1)
    : limpio;
  return sinPrefijo;
}

/**
 * Estado público de una licencia.
 *
 * - "suspendida" gana sobre todo lo demás.
 * - Una licencia activa con vigencia vencida se muestra como "vencida".
 * - Una licencia en validación o rechazada no habilita al piloto.
 */
export function estadoPublicoLicencia(
  licencia: Licencia | undefined,
  hoy: Date = new Date(),
): EstadoPublicoLicencia {
  if (!licencia) return "no_encontrada";
  if (licencia.estado === "suspendida") return "suspendida";
  if (licencia.estado === "rechazada") return "rechazada";
  if (licencia.estado !== "activa") return "en_validacion";

  if (licencia.vigenciaHasta) {
    const fin = new Date(licencia.vigenciaHasta).getTime();
    if (!Number.isNaN(fin) && fin < hoy.getTime()) return "vencida";
  }

  return "vigente";
}

/** true cuando la licencia habilita al piloto para competir. */
export function licenciaHabilita(estado: EstadoPublicoLicencia): boolean {
  return estado === "vigente";
}

/** Cómo se resolvió la consulta del público. */
export type ModoConsultaLicencia = "licencia" | "piloto";

export interface ResultadoConsultaLicencia {
  licencia: Licencia;
  piloto?: Piloto;
  /** Por qué se encontró: por el número de licencia o por el identificador del piloto. */
  modo: ModoConsultaLicencia;
}

/**
 * Busca la licencia que corresponde a lo que escribió el público.
 *
 * Acepta dos identificaciones, porque son las dos que hay en la mano:
 * - el número o código de licencia ("LIC-ABC12", "FEDKART-LIC-LIC-ABC12");
 * - el identificador único del piloto ("FK-2027-ABC123"), que es lo que
 *   aparece en el panel del piloto y en la acreditación.
 */
export function buscarLicenciaPorConsulta(
  estado: Estado,
  codigoIngresado: string,
): ResultadoConsultaLicencia | undefined {
  const codigo = normalizarCodigoLicencia(codigoIngresado);
  if (!codigo) return undefined;

  const licencia = estado.licencias.find(
    (item) => normalizarCodigoLicencia(item.id) === codigo,
  );
  if (licencia) {
    return {
      licencia,
      piloto: estado.pilotos.find((item) => item.id === licencia.pilotoId),
      modo: "licencia",
    };
  }

  const piloto = estado.pilotos.find(
    (item) => normalizarCodigoLicencia(item.id) === codigo,
  );
  if (!piloto) return undefined;

  const licenciasDelPiloto = estado.licencias.filter((item) => item.pilotoId === piloto.id);
  if (licenciasDelPiloto.length === 0) return undefined;

  // Si tiene varias, se muestra la que está vigente (o suspendida) y, si no,
  // la más reciente.
  const prioridad = (item: Licencia): number =>
    item.estado === "activa" ? 3 : item.estado === "suspendida" ? 2 : 1;
  const elegida = [...licenciasDelPiloto].sort((a, b) => {
    const diferencia = prioridad(b) - prioridad(a);
    if (diferencia !== 0) return diferencia;
    return b.solicitadaEn.localeCompare(a.solicitadaEn);
  })[0];

  return { licencia: elegida, piloto, modo: "piloto" };
}
