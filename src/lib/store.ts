/**
 * Estado del prototipo, persistido en localStorage.
 *
 * Decisión D1 del usuario: "Login simulado" — no hay base de datos ni sesiones
 * reales. Todo el estado vive en el navegador y se reinicia si se borra el
 * almacenamiento local.
 */

import type { Estado, Inscripcion, Licencia, Noticia, Piloto, Ronda, Sesion } from "./types";
import { generarIdUnico } from "./id";
import { noticias, pilotosSemilla, rounds as rondas, temporada } from "../data/site";

const CLAVE_ESTADO = "fed-kartismo:estado:v1";
const CLAVE_SESION = "fed-kartismo:sesion:v1";

function navegador(): boolean {
  return typeof localStorage !== "undefined";
}

/**
 * Inscripciones de ejemplo: un par de pilotos por fecha para que el listado de
 * inscritos del panel de directiva tenga contenido desde el primer arranque.
 */
function inscripcionesSemilla(): Inscripcion[] {
  const porDocumento = new Map(pilotosSemilla.map((piloto) => [piloto.documento, piloto.id]));

  const base: [documento: string, rondaId: string, categoria: string, codigo: string][] = [
    ["10203345678", "r01", "Infantil", "INS-R01-A1B2"],
    ["10987654321", "r01", "Iniciación", "INS-R01-C3D4"],
    ["10452218893", "r02", "Aficionado", "INS-R02-E5F6"],
    ["10203345678", "r02", "Infantil", "INS-R02-G7H8"],
    ["10987654321", "r03", "Preinfantil", "INS-R03-J9K0"],
  ];

  return base.map(([documento, rondaId, categoria, codigo], indice) => ({
    id: `INS-S${String(indice + 1).padStart(2, "0")}`,
    pilotoId: porDocumento.get(documento) ?? "",
    rondaId,
    categoria,
    codigo,
    creadaEn: `2026-10-${String(10 + indice).padStart(2, "0")}T10:00:00.000Z`,
  }));
}

export function estadoInicial(): Estado {
  return {
    noticias: structuredClone(noticias),
    rondas: structuredClone(rondas),
    pilotos: structuredClone(pilotosSemilla),
    licencias: [],
    inscripciones: inscripcionesSemilla(),
  };
}

export function leerEstado(): Estado {
  if (!navegador()) return estadoInicial();

  const crudo = localStorage.getItem(CLAVE_ESTADO);
  if (!crudo) {
    const inicial = estadoInicial();
    escribirEstado(inicial);
    return inicial;
  }

  try {
    const guardado = JSON.parse(crudo) as Partial<Estado>;
    const inicial = estadoInicial();
    return {
      noticias: guardado.noticias ?? inicial.noticias,
      rondas: guardado.rondas ?? inicial.rondas,
      pilotos: guardado.pilotos ?? inicial.pilotos,
      licencias: guardado.licencias ?? inicial.licencias,
      inscripciones: guardado.inscripciones ?? inicial.inscripciones,
    };
  } catch {
    const inicial = estadoInicial();
    escribirEstado(inicial);
    return inicial;
  }
}

export function escribirEstado(estado: Estado): void {
  if (!navegador()) return;

  try {
    localStorage.setItem(CLAVE_ESTADO, JSON.stringify(estado));
  } catch {
    // Cuota llena: lo más pesado son las previsualizaciones de las fotografías.
    // Se descartan y se reintenta una sola vez antes de fallar.
    const sinPrevisualizaciones: Estado = {
      ...estado,
      licencias: estado.licencias.map((licencia) => ({
        ...licencia,
        fotoPreview: undefined,
      })),
    };

    try {
      localStorage.setItem(CLAVE_ESTADO, JSON.stringify(sinPrevisualizaciones));
    } catch {
      throw new Error(
        "No se pudo guardar la información: el almacenamiento del navegador está lleno.",
      );
    }
  }
}

export function reiniciarEstado(): Estado {
  const inicial = estadoInicial();
  escribirEstado(inicial);
  return inicial;
}

/* -------------------------------------------------------------------------- */
/* Sesión simulada                                                             */
/* -------------------------------------------------------------------------- */

export function leerSesion(): Sesion | null {
  if (!navegador()) return null;
  const crudo = localStorage.getItem(CLAVE_SESION);
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as Sesion;
  } catch {
    return null;
  }
}

export function escribirSesion(sesion: Sesion | null): void {
  if (!navegador()) return;
  if (sesion === null) {
    localStorage.removeItem(CLAVE_SESION);
    return;
  }
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

/* -------------------------------------------------------------------------- */
/* Operaciones de dominio                                                      */
/* -------------------------------------------------------------------------- */

export function registrarPiloto(datos: Omit<Piloto, "id" | "creadoEn">): Piloto {
  const estado = leerEstado();
  const id = generarIdUnico(
    datos.documento,
    estado.pilotos.map((piloto) => piloto.id),
    temporada,
  );
  const piloto: Piloto = { ...datos, id, creadoEn: new Date().toISOString() };
  estado.pilotos.push(piloto);
  escribirEstado(estado);
  return piloto;
}

export function obtenerPiloto(pilotoId: string): Piloto | undefined {
  return leerEstado().pilotos.find((piloto) => piloto.id === pilotoId);
}

export function licenciaDe(pilotoId: string): Licencia | undefined {
  return leerEstado()
    .licencias.filter((licencia) => licencia.pilotoId === pilotoId)
    .sort((a, b) => b.solicitadaEn.localeCompare(a.solicitadaEn))[0];
}

export function solicitarLicencia(
  pilotoId: string,
  datos: {
    categoria: string;
    documentoNombre: string;
    documentoTipo: string;
    fotoNombre: string;
    fotoPreview?: string;
  },
): Licencia {
  const estado = leerEstado();
  const licencia: Licencia = {
    id: `LIC-${Date.now().toString(36).toUpperCase()}`,
    pilotoId,
    categoria: datos.categoria,
    estado: "en_validacion",
    solicitadaEn: new Date().toISOString(),
    documentoNombre: datos.documentoNombre,
    documentoTipo: datos.documentoTipo,
    fotoNombre: datos.fotoNombre,
    fotoPreview: datos.fotoPreview,
  };
  estado.licencias.push(licencia);
  escribirEstado(estado);
  return licencia;
}

export function validarLicencia(
  licenciaId: string,
  decision: "aprobada" | "rechazada",
  observacion?: string,
): Licencia | undefined {
  const estado = leerEstado();
  const licencia = estado.licencias.find((item) => item.id === licenciaId);
  if (!licencia) return undefined;

  licencia.estado = decision === "aprobada" ? "activa" : "rechazada";
  licencia.validadaEn = new Date().toISOString();
  licencia.observacion = observacion;
  escribirEstado(estado);
  return licencia;
}

export function publicarNoticia(datos: Omit<Noticia, "id">): Noticia {
  const estado = leerEstado();
  const noticia: Noticia = { ...datos, id: `N${Date.now().toString(36).toUpperCase()}` };
  estado.noticias.unshift(noticia);
  escribirEstado(estado);
  return noticia;
}

export function actualizarNoticia(id: string, datos: Partial<Noticia>): Noticia | undefined {
  const estado = leerEstado();
  const noticia = estado.noticias.find((item) => item.id === id);
  if (!noticia) return undefined;
  Object.assign(noticia, datos);
  escribirEstado(estado);
  return noticia;
}

export function borrarNoticia(id: string): void {
  const estado = leerEstado();
  estado.noticias = estado.noticias.filter((item) => item.id !== id);
  escribirEstado(estado);
}

export function guardarRonda(datos: Omit<Ronda, "id" | "codigoQr"> & { id?: string }): Ronda {
  const estado = leerEstado();
  const existente = datos.id
    ? estado.rondas.find((ronda) => ronda.id === datos.id)
    : undefined;

  if (existente) {
    Object.assign(existente, datos);
    escribirEstado(estado);
    return existente;
  }

  const id = `r${Date.now().toString(36)}`;
  const ronda: Ronda = {
    ...(datos as Omit<Ronda, "id" | "codigoQr">),
    id,
    codigoQr: `FEDKART-${datos.codigo}-${temporada}`,
  };
  estado.rondas.push(ronda);
  escribirEstado(estado);
  return ronda;
}

export function borrarRonda(id: string): void {
  const estado = leerEstado();
  estado.rondas = estado.rondas.filter((ronda) => ronda.id !== id);
  escribirEstado(estado);
}

export function inscribirEnRonda(
  pilotoId: string,
  rondaId: string,
  categoria: string,
): { inscripcion: Inscripcion; repetida: boolean } {
  const estado = leerEstado();
  const repetida = estado.inscripciones.some(
    (item) => item.pilotoId === pilotoId && item.rondaId === rondaId,
  );

  if (repetida) {
    const existente = estado.inscripciones.find(
      (item) => item.pilotoId === pilotoId && item.rondaId === rondaId,
    )!;
    return { inscripcion: existente, repetida: true };
  }

  const ronda = estado.rondas.find((item) => item.id === rondaId);
  const codigo = `INS-${(ronda?.codigo ?? "R00").toUpperCase()}-${Date.now()
    .toString(36)
    .toUpperCase()
    .slice(-4)}`;

  const inscripcion: Inscripcion = {
    id: `INS-${Date.now().toString(36).toUpperCase()}`,
    pilotoId,
    rondaId,
    categoria,
    codigo,
    creadaEn: new Date().toISOString(),
  };
  estado.inscripciones.push(inscripcion);
  escribirEstado(estado);
  return { inscripcion, repetida: false };
}

export function inscribirPorCodigo(
  pilotoId: string,
  codigoQr: string,
  categoria: string,
): { ronda: Ronda; inscripcion: Inscripcion; repetida: boolean } | null {
  const ronda = buscarRondaPorCodigo(codigoQr);
  if (!ronda) return null;
  const { inscripcion, repetida } = inscribirEnRonda(pilotoId, ronda.id, categoria);
  return { ronda, inscripcion, repetida };
}

export function inscripcionesDe(pilotoId: string): Inscripcion[] {
  return leerEstado().inscripciones.filter((item) => item.pilotoId === pilotoId);
}

export function buscarRondaPorCodigo(codigo: string): Ronda | undefined {
  const normalizado = codigo.trim().toUpperCase();
  return leerEstado().rondas.find(
    (ronda) => ronda.codigoQr.toUpperCase() === normalizado || ronda.codigo.toUpperCase() === normalizado,
  );
}
