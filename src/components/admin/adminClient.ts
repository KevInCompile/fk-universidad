/**
 * Utilidades compartidas por las pantallas client-side del panel de directiva.
 *
 * El prototipo guarda toda la sesión en localStorage (decisión D1: login
 * simulado), por eso estas funciones solo pueden ejecutarse en el navegador.
 */

import { exigirSesion } from "../../lib/guard";
import { escribirSesion, leerSesion } from "../../lib/store";
import type { Sesion } from "../../lib/types";

/**
 * Exige una sesión de directiva. Si no hay sesión redirige al login; si la
 * sesión pertenece a otro rol redirige al panel de ese rol.
 */
export function exigirDirectivo(): Sesion | null {
  const sesion = leerSesion();
  if (!sesion) {
    window.location.href = "/login";
    return null;
  }
  if (sesion.rol !== "directivo") {
    window.location.href = sesion.rol === "piloto" ? "/piloto" : "/login";
    return null;
  }
  return exigirSesion("directivo", "/login");
}

/** Cierra la sesión simulada y vuelve al login. */
export function cerrarSesion(): void {
  escribirSesion(null);
  window.location.href = "/login";
}

/** Escapa texto antes de inyectarlo en el DOM. */
export function esc(valor: unknown): string {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Formatea una fecha ISO a un texto legible en español. */
export function fechaLegible(iso: string): string {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
