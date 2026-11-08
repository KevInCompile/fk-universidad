/**
 * Guardas de sesión simuladas. Si el usuario no tiene sesión con el rol
 * esperado, se redirige al login.
 */

import { leerSesion } from "./store";
import type { Rol, Sesion } from "./types";

export function exigirSesion(rol: Rol, destino = "/login"): Sesion | null {
  const sesion = leerSesion();
  if (!sesion || sesion.rol !== rol) {
    window.location.href = destino;
    return null;
  }
  return sesion;
}

export function nombrePiloto(sesion: Sesion): string {
  return sesion.nombre;
}
