/**
 * Formateadores compartidos por las páginas del portal del piloto.
 */

import type { EstadoLicencia } from "../../lib/types";

/** Escapa texto antes de insertarlo con innerHTML. */
export function escapar(valor: string): string {
  return valor.replace(/[&<>"']/g, (caracter) => {
    switch (caracter) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

/** Fecha legible en español (dd/mm/aaaa) a partir de un ISO. */
export function formatoFecha(iso?: string | null): string {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

/** Clases de Tailwind según el estado de la licencia. */
export function claseEstadoLicencia(estado: EstadoLicencia): string {
  switch (estado) {
    case "activa":
      return "bg-primary text-primary-foreground border border-primary";
    case "en_validacion":
      return "border border-primary text-primary";
    case "rechazada":
      return "border border-destructive text-destructive";
    default:
      return "border border-border text-muted-foreground";
  }
}

/** Etiqueta de un estado de ronda (inscripciones abiertas/closed). */
export function etiquetaEstadoRonda(estado: string): string {
  switch (estado) {
    case "programada":
      return "Inscripciones abiertas";
    case "inscripciones_cerradas":
      return "Inscripciones cerradas";
    case "en_disputa":
      return "En disputa";
    default:
      return "Finalizada";
  }
}
