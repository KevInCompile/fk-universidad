/**
 * Helpers puros de las secciones de la home.
 *
 * La lógica vive aquí (y no dentro de los `<script>` de los componentes) para
 * que pueda testearse de forma determinista y para que el markup de servidor
 * y el re-render del cliente compartan exactamente la misma fuente.
 */

import type { Club, Noticia, Ronda } from "../../lib/types";

/* -------------------------------------------------------------------------- */
/* Etiquetas y utilidades                                                      */
/* -------------------------------------------------------------------------- */

export const ETIQUETA_ESTADO_RONDA: Record<Ronda["estado"], string> = {
  programada: "Programada",
  inscripciones_cerradas: "Inscripciones cerradas",
  en_disputa: "En disputa",
  finalizada: "Finalizada",
};

export function etiquetaEstado(estado: Ronda["estado"]): string {
  return ETIQUETA_ESTADO_RONDA[estado];
}

export function claseEstado(estado: Ronda["estado"]): string {
  switch (estado) {
    case "programada":
      return "border-primary text-primary";
    case "en_disputa":
      return "border-primary bg-primary text-primary-foreground";
    case "inscripciones_cerradas":
      return "border-border text-foreground";
    case "finalizada":
      return "border-border text-muted-foreground";
  }
}

const ENTIDADES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (caracter) => ENTIDADES[caracter] ?? caracter);
}

/* -------------------------------------------------------------------------- */
/* Calendario                                                                  */
/* -------------------------------------------------------------------------- */

/** Primera ronda con estado "programada" (el próximo evento destacado). */
export function proximaRonda(rondas: Ronda[]): Ronda | undefined {
  return rondas.find((ronda) => ronda.estado === "programada");
}

export function htmlRondaDestacada(ronda: Ronda | undefined): string {
  if (!ronda) {
    return `<p class="border border-border bg-card p-6 font-mono text-xs tracking-wide text-muted-foreground">
      No hay rondas programadas por el momento.
    </p>`;
  }

  return `<div class="grid gap-6 border border-border bg-card p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
    <div>
      <p class="font-mono text-xs uppercase tracking-widest text-primary">${escaparHtml(ronda.codigo)}</p>
      <p class="mt-2 font-display text-6xl uppercase leading-none">${escaparHtml(ronda.fecha)}</p>
    </div>
    <div>
      <h3 class="font-display text-4xl uppercase leading-none md:text-5xl">${escaparHtml(ronda.nombre)}</h3>
      <p class="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        ${escaparHtml(ronda.ciudad)} · ${escaparHtml(ronda.pista)}
      </p>
      <p class="mt-4 inline-block border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${claseEstado(ronda.estado)}">
        ${escaparHtml(etiquetaEstado(ronda.estado))}
      </p>
    </div>
    <a href="/calendario" class="font-mono text-xs uppercase tracking-widest text-primary md:text-right">
      Ver calendario →
    </a>
  </div>`;
}

export function htmlRondaFila(ronda: Ronda): string {
  return `<li class="grid gap-2 border-b border-border py-5 md:grid-cols-[72px_130px_1fr_1fr_190px] md:items-center">
    <span class="font-mono text-xs text-primary">${escaparHtml(ronda.codigo)}</span>
    <span class="font-display text-2xl uppercase leading-none">${escaparHtml(ronda.fecha)}</span>
    <span class="text-lg font-medium">${escaparHtml(ronda.nombre)}</span>
    <span class="font-mono text-xs uppercase tracking-widest text-muted-foreground">
      ${escaparHtml(ronda.ciudad)} · ${escaparHtml(ronda.pista)}
    </span>
    <span class="justify-self-start border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${claseEstado(ronda.estado)}">
      ${escaparHtml(etiquetaEstado(ronda.estado))}
    </span>
  </li>`;
}

export function htmlListaRondas(rondas: Ronda[]): string {
  if (rondas.length === 0) {
    return `<li class="border-b border-border py-6 font-mono text-xs tracking-wide text-muted-foreground">
      Todavía no hay rondas cargadas.
    </li>`;
  }

  return rondas.map(htmlRondaFila).join("\n");
}

/* -------------------------------------------------------------------------- */
/* Noticias                                                                    */
/* -------------------------------------------------------------------------- */

/** Sólo se publican las noticias marcadas como `publicada: true`. */
export function noticiasPublicadas(noticias: Noticia[]): Noticia[] {
  return noticias.filter((noticia) => noticia.publicada);
}

export function htmlNoticia(noticia: Noticia): string {
  return `<li class="grid gap-2 border-b border-border py-6 md:grid-cols-[160px_160px_1fr] md:items-start">
    <span class="font-mono text-xs text-muted-foreground">${escaparHtml(noticia.fecha)}</span>
    <span class="font-mono text-xs uppercase tracking-widest text-primary">${escaparHtml(noticia.categoria)}</span>
    <span>
      <span class="block text-xl font-medium">${escaparHtml(noticia.titulo)}</span>
      <span class="mt-2 block text-sm text-muted-foreground">${escaparHtml(noticia.resumen)}</span>
    </span>
  </li>`;
}

export function htmlListaNoticias(noticias: Noticia[]): string {
  if (noticias.length === 0) {
    return `<li class="border-b border-border py-6 font-mono text-xs tracking-wide text-muted-foreground">
      No hay noticias publicadas por el momento.
    </li>`;
  }

  return noticias.map(htmlNoticia).join("\n");
}

/* -------------------------------------------------------------------------- */
/* Clubes                                                                      */
/* -------------------------------------------------------------------------- */

export interface FiltroClubes {
  texto?: string;
  departamento?: string;
  categoria?: string;
  soloHomologados?: boolean;
}

export function filtrarClubes(clubes: Club[], filtro: FiltroClubes): Club[] {
  const texto = (filtro.texto ?? "").trim().toLowerCase();

  return clubes.filter((club) => {
    if (filtro.soloHomologados && !club.homologado) return false;
    if (filtro.departamento && club.departamento !== filtro.departamento) return false;
    if (filtro.categoria && !club.categorias.includes(filtro.categoria)) return false;
    if (!texto) return true;

    return (
      club.nombre.toLowerCase().includes(texto) || club.ciudad.toLowerCase().includes(texto)
    );
  });
}

export function departamentoDe(clubes: Club[]): string[] {
  return [...new Set(clubes.map((club) => club.departamento))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

export function categoriasDeClubes(clubes: Club[]): string[] {
  return [...new Set(clubes.flatMap((club) => club.categorias))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

export function htmlClub(club: Club): string {
  const insignia = club.homologado
    ? `<span class="border border-primary px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">Homologado</span>`
    : `<span class="border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">No homologado</span>`;

  return `<li class="border border-border bg-card p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <h3 class="font-display text-2xl uppercase leading-none">${escaparHtml(club.nombre)}</h3>
      ${insignia}
    </div>
    <p class="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
      ${escaparHtml(club.ciudad)} · ${escaparHtml(club.departamento)}
    </p>
    <p class="mt-4 font-mono text-[10px] uppercase tracking-widest text-primary">Categorías</p>
    <p class="mt-1 text-sm">${escaparHtml(club.categorias.join(" · "))}</p>
    <p class="mt-4 font-mono text-xs text-muted-foreground">${escaparHtml(club.contacto)}</p>
  </li>`;
}

export function htmlListaClubes(clubes: Club[]): string {
  if (clubes.length === 0) {
    return `<li class="border border-border bg-card p-6 font-mono text-xs tracking-wide text-muted-foreground">
      Ningún club coincide con la búsqueda.
    </li>`;
  }

  return clubes.map(htmlClub).join("\n");
}

/** Grilla de tarjetas de la temporada (bloque histórico "Temporada 2027"). */
export function htmlTarjetasRondas(rondas: Ronda[]): string {
  if (rondas.length === 0) {
    return `<p class="col-span-full border border-border bg-card p-6 font-mono text-xs tracking-wide text-muted-foreground">
      Todavía no hay rondas cargadas.
    </p>`;
  }

  return rondas
    .map(
      (ronda) => `<div class="group relative bg-card p-6 transition-colors hover:bg-primary">
        <div class="flex justify-between font-mono text-xs uppercase tracking-widest">
          <span>${escaparHtml(ronda.codigo)}</span>
          <span class="text-muted-foreground transition-colors group-hover:text-primary-foreground">${escaparHtml(ronda.ciudad)}</span>
        </div>
        <p class="mt-8 font-display text-6xl uppercase leading-none">${escaparHtml(ronda.fecha)}</p>
        <p class="mt-2 text-lg font-medium">${escaparHtml(ronda.nombre)}</p>
        <p class="font-mono text-xs uppercase text-muted-foreground transition-colors group-hover:text-primary-foreground">${escaparHtml(ronda.pista)}</p>
        <p class="mt-4 inline-block border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${claseEstado(ronda.estado)}">${escaparHtml(etiquetaEstado(ronda.estado))}</p>
      </div>`,
    )
    .join("\n");
}
