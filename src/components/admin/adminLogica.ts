/**
 * Lógica de dominio del panel de directiva, sin dependencias del DOM.
 *
 * Las páginas del panel son client-side (decisión D1: login simulado), así que
 * estas funciones puras concentran las reglas verificables y las páginas solo
 * pintan el resultado.
 */

import type { Estado, Licencia, Piloto, Ronda } from "../../lib/types";

export interface ResumenPanel {
  noticiasPublicadas: number;
  rondas: number;
  licenciasEnValidacion: number;
}

export interface ResultadoValidacion {
  ok: boolean;
  error: string;
}

export interface DatosNoticia {
  fecha: string;
  categoria: string;
  titulo: string;
  resumen: string;
  publicada: boolean;
}

export interface DatosRonda {
  codigo: string;
  fecha: string;
  nombre: string;
  ciudad: string;
  pistaId: string;
  estado: string;
}

export interface SolicitudLicencia {
  licencia: Licencia;
  piloto?: Piloto;
}

export interface BandejaLicencias {
  pendientes: SolicitudLicencia[];
  resueltas: SolicitudLicencia[];
}

export interface ResultadoDecision {
  ok: boolean;
  error: string;
  licencia?: Licencia;
}

const ESTADOS_RONDA: Ronda["estado"][] = [
  "programada",
  "inscripciones_cerradas",
  "en_disputa",
  "finalizada",
];

/** Cifras del dashboard de la directiva. */
export function resumenPanel(estado: Estado): ResumenPanel {
  return {
    noticiasPublicadas: estado.noticias.filter((noticia) => noticia.publicada).length,
    rondas: estado.rondas.length,
    licenciasEnValidacion: estado.licencias.filter(
      (licencia) => licencia.estado === "en_validacion",
    ).length,
  };
}

/** Reglas del formulario de noticias. */
export function validarNoticia(datos: DatosNoticia): ResultadoValidacion {
  if (!datos.fecha.trim()) return { ok: false, error: "Completá la fecha" };
  if (!datos.categoria.trim()) return { ok: false, error: "Completá la categoría" };
  if (!datos.titulo.trim()) return { ok: false, error: "Completá el título" };
  if (!datos.resumen.trim()) return { ok: false, error: "Completá el resumen" };
  return { ok: true, error: "" };
}

/** Reglas del formulario de rondas. */
export function validarRonda(datos: DatosRonda): ResultadoValidacion {
  if (!datos.codigo.trim()) return { ok: false, error: "Completá el código de la ronda" };
  if (!datos.fecha.trim()) return { ok: false, error: "Completá la fecha" };
  if (!datos.nombre.trim()) return { ok: false, error: "Completá el nombre de la ronda" };
  if (!datos.ciudad.trim()) return { ok: false, error: "Completá la ciudad" };
  if (!datos.pistaId.trim()) return { ok: false, error: "Seleccione una pista homologada" };
  if (!ESTADOS_RONDA.includes(datos.estado as Ronda["estado"])) {
    return { ok: false, error: "Seleccione un estado válido para la ronda" };
  }
  return { ok: true, error: "" };
}

/** Divide las licencias entre la bandeja de pendientes y el histórico. */
export function bandejaLicencias(estado: Estado): BandejaLicencias {
  const pendientes: SolicitudLicencia[] = [];
  const resueltas: SolicitudLicencia[] = [];

  for (const licencia of estado.licencias) {
    const piloto = estado.pilotos.find((item) => item.id === licencia.pilotoId);
    if (licencia.estado === "en_validacion") {
      pendientes.push({ licencia, piloto });
    } else {
      resueltas.push({ licencia, piloto });
    }
  }

  return { pendientes, resueltas };
}

/**
 * Reglas de la decisión sobre una solicitud de licencia.
 * Rechazar exige observación; aprobar la deja activa.
 */
export function decidirLicencia(
  estado: Estado,
  licenciaId: string,
  decision: "aprobada" | "rechazada",
  observacion: string,
  ahora = new Date().toISOString(),
): ResultadoDecision {
  const licencia = estado.licencias.find((item) => item.id === licenciaId);
  if (!licencia) {
    return { ok: false, error: "No se encontró la solicitud de licencia" };
  }

  const nota = observacion.trim();
  if (decision === "rechazada" && !nota) {
    return { ok: false, error: "Escriba la observación para rechazar la solicitud" };
  }

  return {
    ok: true,
    error: "",
    licencia: {
      ...licencia,
      estado: decision === "aprobada" ? "activa" : "rechazada",
      validadaEn: ahora,
      observacion: nota || undefined,
    },
  };
}
