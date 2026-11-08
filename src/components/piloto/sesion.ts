/**
 * Utilidades de sesión del portal del piloto (lado navegador).
 *
 * Toda la lógica del portal vive en scripts de cliente: el store y la sesión
 * son client-side (decisión D1), así que la guarda se aplica en el navegador.
 */

import { exigirSesion } from "../../lib/guard";
import { leerSesion } from "../../lib/store";
import type { Sesion } from "../../lib/types";

/** Panel al que se envía a cada rol. */
const PANEL_POR_ROL: Record<string, string> = {
  piloto: "/piloto",
  directivo: "/admin",
};

/**
 * Exige una sesión de rol "piloto".
 * - Sin sesión: redirige a /login (comportamiento de `exigirSesion`).
 * - Con sesión de otro rol: redirige al panel de ese rol.
 */
export function sesionPiloto(): Sesion | null {
  const actual = leerSesion();
  if (actual && actual.rol !== "piloto") {
    window.location.href = PANEL_POR_ROL[actual.rol] ?? "/login";
    return null;
  }
  return exigirSesion("piloto", "/login");
}

/**
 * Para páginas públicas del portal (registro): si ya hay sesión, lleva al
 * panel del rol correspondiente en lugar de dejar seguir el flujo.
 */
export function redirigirSiHaySesion(): boolean {
  const actual = leerSesion();
  if (!actual) return false;
  window.location.href = PANEL_POR_ROL[actual.rol] ?? "/login";
  return true;
}
