import { describe, expect, it } from "vitest";
import { clubes, noticias, rounds } from "../../data/site";
import type { Club, Noticia, Ronda } from "../../lib/types";
import {
  categoriasDeClubes,
  departamentoDe,
  etiquetaEstado,
  escaparHtml,
  filtrarClubes,
  htmlTarjetasRondas,
  noticiasPublicadas,
  proximaRonda,
} from "./home-data";

describe("etiquetaEstado", () => {
  it("traduce cada estado de ronda al español", () => {
    expect(etiquetaEstado("programada")).toBe("Programada");
    expect(etiquetaEstado("inscripciones_cerradas")).toBe("Inscripciones cerradas");
    expect(etiquetaEstado("en_disputa")).toBe("En disputa");
    expect(etiquetaEstado("finalizada")).toBe("Finalizada");
  });
});

describe("proximaRonda", () => {
  it("devuelve la primera ronda con estado programada", () => {
    expect(proximaRonda(rounds)?.codigo).toBe("R02");
  });

  it("ignora las rondas que ya no están programadas", () => {
    const todas: Ronda[] = rounds.map((ronda) => ({ ...ronda, estado: "finalizada" }));
    expect(proximaRonda(todas)).toBeUndefined();
  });

  it("no falla con una lista vacía", () => {
    expect(proximaRonda([])).toBeUndefined();
  });
});

describe("noticiasPublicadas", () => {
  it("excluye las noticias no publicadas", () => {
    const mezcla: Noticia[] = [
      { id: "a", fecha: "01 ENE 2027", categoria: "Campeonato", titulo: "A", resumen: "a", publicada: true },
      { id: "b", fecha: "02 ENE 2027", categoria: "Pistas", titulo: "B", resumen: "b", publicada: false },
    ];
    expect(noticiasPublicadas(mezcla).map((noticia) => noticia.id)).toEqual(["a"]);
  });

  it("conserva el orden del store", () => {
    expect(noticiasPublicadas(noticias).every((noticia) => noticia.publicada)).toBe(true);
  });
});

describe("filtrarClubes", () => {
  const todos = clubes;

  it("sin filtros devuelve todos los clubes", () => {
    expect(filtrarClubes(todos, {})).toHaveLength(todos.length);
  });

  it("busca por nombre", () => {
    const resultado = filtrarClubes(todos, { texto: "valle" });
    expect(resultado.map((club) => club.id)).toEqual(["c02"]);
  });

  it("busca por ciudad", () => {
    const resultado = filtrarClubes(todos, { texto: "barranquilla" });
    expect(resultado.every((club) => club.ciudad === "Barranquilla")).toBe(true);
    expect(resultado).toHaveLength(2);
  });

  it("filtra por departamento", () => {
    const resultado = filtrarClubes(todos, { departamento: "Valle del Cauca" });
    expect(resultado.map((club) => club.id)).toEqual(["c02", "c06"]);
  });

  it("filtra por categoría", () => {
    const resultado = filtrarClubes(todos, { categoria: "Master" });
    expect(resultado.map((club) => club.id)).toEqual(["c07"]);
  });

  it("filtra por clubes homologados", () => {
    const resultado = filtrarClubes(todos, { soloHomologados: true });
    expect(resultado.every((club) => club.homologado)).toBe(true);
    expect(resultado).toHaveLength(5);
  });

  it("combina texto y filtro de homologación", () => {
    const resultado = filtrarClubes(todos, { texto: "bogotá", soloHomologados: true });
    expect(resultado.map((club) => club.id)).toEqual(["c01", "c05"]);
  });

  it("devuelve lista vacía cuando no hay coincidencias", () => {
    expect(filtrarClubes(todos, { texto: "zzzz" })).toEqual([]);
  });
});

describe("departamentoDe", () => {
  it("devuelve los departamentos sin repetir y ordenados", () => {
    expect(departamentoDe(clubes)).toEqual([
      "Antioquia",
      "Atlántico",
      "Bogotá D.C.",
      "Cundinamarca",
      "Valle del Cauca",
    ]);
  });
});

describe("categoriasDeClubes", () => {
  it("devuelve las categorías usadas por los clubes sin repetir", () => {
    const categorias = categoriasDeClubes(clubes);
    expect(categorias).toContain("Iniciación");
    expect(categorias).toContain("Master");
    expect(new Set(categorias).size).toBe(categorias.length);
  });
});

describe("escaparHtml", () => {
  it("escapa las entidades peligrosas", () => {
    expect(escaparHtml('<b>"x" & \'y\'</b>')).toBe(
      "&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;",
    );
  });
});

describe("tipos de apoyo", () => {
  it("acepta un club con la forma del contrato compartido", () => {
    const club: Club = clubes[0];
    expect(club.homologado).toBe(true);
  });
});

describe("htmlTarjetasRondas", () => {
  it("devuelve un aviso cuando no hay rondas", () => {
    expect(htmlTarjetasRondas([])).toContain("Todavía no hay rondas cargadas");
  });

  it("renderiza una tarjeta por ronda con sus datos y estado", () => {
    const rondas: Ronda[] = [
      {
        id: "r01",
        codigo: "R01",
        fecha: "14 MAR",
        nombre: "Apertura Nacional",
        ciudad: "Bogotá",
        pista: "Autódromo Norte",
        pistaId: "T1",
        codigoQr: "FEDKART-R01-2027",
        estado: "programada",
      },
    ];
    const html = htmlTarjetasRondas(rondas);
    expect(html).toContain("R01");
    expect(html).toContain("Apertura Nacional");
    expect(html).toContain("Bogotá");
    expect(html).toContain("Programada");
  });
});
