/**
 * Lógica de dominio del panel de directiva, sin dependencias del DOM.
 *
 * Las páginas del panel son client-side (decisión D1: login simulado), así que
 * estas funciones puras concentran las reglas verificables y las páginas solo
 * pintan el resultado.
 */

import type { Estado, Inscripcion, Licencia, Piloto, Ronda } from "../../lib/types";

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

/** Una inscripción con los datos del piloto que la realiza. */
export interface InscripcionDePiloto {
  inscripcion: Inscripcion;
  piloto?: Piloto;
}

/** Un evento de la temporada con las personas inscritas. */
export interface EventoConInscripciones {
  ronda: Ronda;
  inscritos: InscripcionDePiloto[];
  porCategoria: ConteoCategoria[];
}

/** Conteo de personas por categoría. */
export interface ConteoCategoria {
  categoria: string;
  total: number;
}

/** Listado completo de inscritos de la temporada. */
export interface ListadoInscripciones {
  eventos: EventoConInscripciones[];
  totalInscritos: number;
  categorias: ConteoCategoria[];
}

/** Acciones que la directiva puede aplicar sobre una licencia resuelta. */
export type AccionLicencia = "suspender" | "reactivar";

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

/** Cuenta personas por categoría, de la más numerousa a la menos numerousa. */
function contarPorCategoria(inscritos: InscripcionDePiloto[]): ConteoCategoria[] {
  const conteo = new Map<string, number>();

  for (const { inscripcion } of inscritos) {
    conteo.set(inscripcion.categoria, (conteo.get(inscripcion.categoria) ?? 0) + 1);
  }

  return [...conteo.entries()]
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total || a.categoria.localeCompare(b.categoria, "es"));
}

/**
 * Listado de las personas inscritas por evento.
 *
 * Incluye todos los eventos de la temporada, incluso los que todavía no
 * tienen nadie inscrito, para que la directiva vea de una sola vez cómo está
 * cada fecha.
 */
export function listadoInscripciones(estado: Estado): ListadoInscripciones {
  const eventos: EventoConInscripciones[] = estado.rondas.map((ronda) => {
    const inscritos: InscripcionDePiloto[] = estado.inscripciones
      .filter((inscripcion) => inscripcion.rondaId === ronda.id)
      .map((inscripcion) => ({
        inscripcion,
        piloto: estado.pilotos.find((piloto) => piloto.id === inscripcion.pilotoId),
      }));

    return { ronda, inscritos, porCategoria: contarPorCategoria(inscritos) };
  });

  const totalInscritos = eventos.reduce((total, evento) => total + evento.inscritos.length, 0);
  const categorias = contarPorCategoria(
    eventos.flatMap((evento) => evento.inscritos),
  );

  return { eventos, totalInscritos, categorias };
}

/**
 * Reglas para suspender o reactivar una licencia.
 *
 * Solo se suspende una licencia activa y solo se reactiva una suspendida: el
 * estado público de /verificar depende de esta transición.
 */
export function cambiarEstadoLicencia(
  estado: Estado,
  licenciaId: string,
  accion: AccionLicencia,
): ResultadoDecision {
  const licencia = estado.licencias.find((item) => item.id === licenciaId);
  if (!licencia) {
    return { ok: false, error: "No se encontró la licencia" };
  }

  if (accion === "suspender") {
    if (licencia.estado !== "activa") {
      return { ok: false, error: "Solo se puede suspender una licencia activa" };
    }
    return { ok: true, error: "", licencia: { ...licencia, estado: "suspendida" } };
  }

  if (licencia.estado !== "suspendida") {
    return { ok: false, error: "Solo se puede reactivar una licencia suspendida" };
  }
  return { ok: true, error: "", licencia: { ...licencia, estado: "activa" } };
}
