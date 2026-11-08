import { beforeEach, describe, expect, it } from "vitest";
import { escribirEstado, guardarRonda, leerEstado, publicarNoticia } from "../../lib/store";
import {
  htmlListaRondas,
  htmlListaNoticias,
  htmlRondaDestacada,
  noticiasPublicadas,
  proximaRonda,
} from "./home-data";

/** localStorage mínimo para poder ejercitar el store del prototipo en node. */
function crearAlmacenamiento(): Storage {
  const datos = new Map<string, string>();
  return {
    get length() {
      return datos.size;
    },
    clear: () => datos.clear(),
    getItem: (clave: string) => datos.get(clave) ?? null,
    key: (indice: number) => [...datos.keys()][indice] ?? null,
    removeItem: (clave: string) => {
      datos.delete(clave);
    },
    setItem: (clave: string, valor: string) => {
      datos.set(clave, valor);
    },
  } as Storage;
}

beforeEach(() => {
  (globalThis as Record<string, unknown>).window = {};
  (globalThis as Record<string, unknown>).localStorage = crearAlmacenamiento();
});

describe("el store alimenta la home", () => {
  it("una noticia publicada desde la directiva aparece en la home", () => {
    publicarNoticia({
      fecha: "10 ENE 2027",
      categoria: "Campeonato",
      titulo: "Titular de prueba",
      resumen: "Resumen de prueba",
      publicada: true,
    });

    const estado = leerEstado();
    const visibles = noticiasPublicadas(estado.noticias);

    expect(visibles[0].titulo).toBe("Titular de prueba");
    expect(htmlListaNoticias(visibles)).toContain("Titular de prueba");
  });

  it("una noticia con publicada=false no se muestra en la home", () => {
    publicarNoticia({
      fecha: "10 ENE 2027",
      categoria: "Campeonato",
      titulo: "Borrador",
      resumen: "No debe verse",
      publicada: false,
    });

    const visibles = noticiasPublicadas(leerEstado().noticias);

    expect(visibles.some((noticia) => noticia.titulo === "Borrador")).toBe(false);
    expect(htmlListaNoticias(visibles)).not.toContain("Borrador");
  });

  it("una ronda agregada desde la directiva cambia el próximo evento destacado", () => {
    const rondas = leerEstado().rondas;
    escribirEstado({
      ...leerEstado(),
      rondas: rondas.map((ronda) => ({ ...ronda, estado: "finalizada" as const })),
    });
    guardarRonda({
      codigo: "R07",
      fecha: "05 SEP",
      nombre: "Ronda agregada",
      ciudad: "Cali",
      pista: "Kartódromo del Valle",
      pistaId: "T2",
      estado: "programada",
    });

    const estado = leerEstado();
    const destacada = proximaRonda(estado.rondas);

    expect(estado.rondas).toHaveLength(rondas.length + 1);
    expect(destacada?.codigo).toBe("R07");
    expect(htmlRondaDestacada(destacada)).toContain("Ronda agregada");
    expect(htmlListaRondas(estado.rondas)).toContain("Ronda agregada");
  });
});
