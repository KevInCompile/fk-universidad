import { beforeEach, describe, expect, it } from "vitest";
import { buscarRondaPorCodigo, escribirEstado, estadoInicial, leerEstado } from "./store";
import type { Estado } from "./types";

class LocalStorageMock {
  private datos = new Map<string, string>();

  getItem(clave: string): string | null {
    return this.datos.get(clave) ?? null;
  }

  setItem(clave: string, valor: string): void {
    this.datos.set(clave, valor);
  }

  removeItem(clave: string): void {
    this.datos.delete(clave);
  }

  clear(): void {
    this.datos.clear();
  }
}

describe("store en el navegador", () => {
  beforeEach(() => {
    (globalThis as { localStorage?: LocalStorageMock }).localStorage = new LocalStorageMock();
  });

  it("devuelve el estado semilla la primera vez", () => {
    const estado = leerEstado();
    expect(estado.rondas.length).toBeGreaterThan(0);
    expect(estado.noticias.length).toBeGreaterThan(0);
  });

  it("persiste las rondas agregadas", () => {
    const estado: Estado = leerEstado();
    estado.rondas.push({
      id: "r99",
      codigo: "R99",
      fecha: "01 DIC",
      nombre: "Prueba",
      ciudad: "Bogotá",
      pista: "Autódromo Norte",
      pistaId: "T1",
      codigoQr: "FEDKART-R99-2027",
      estado: "programada",
    });
    escribirEstado(estado);

    expect(leerEstado().rondas).toHaveLength(estado.rondas.length);
  });

  it("encuentra una ronda por su código QR", () => {
    const ronda = buscarRondaPorCodigo("FEDKART-R02-2027");
    expect(ronda?.codigo).toBe("R02");
  });

  it("encuentra una ronda por su código corto", () => {
    const ronda = buscarRondaPorCodigo("r03");
    expect(ronda?.nombre).toBe("Copa Montaña");
  });

  it("devuelve undefined para un código desconocido", () => {
    expect(buscarRondaPorCodigo("FEDKART-R99-2027")).toBeUndefined();
  });

  it("reinicia el estado a la semilla", () => {
    const estado = leerEstado();
    estado.licencias.push({
      id: "LIC-1",
      pilotoId: "FK-2027-ABC123",
      categoria: "Infantil",
      estado: "en_validacion",
      solicitadaEn: new Date().toISOString(),
      documentoNombre: "doc.pdf",
      documentoTipo: "application/pdf",
      fotoNombre: "foto.jpg",
    });
    escribirEstado(estado);
    expect(leerEstado().licencias).toHaveLength(1);

    expect(estadoInicial().licencias).toHaveLength(0);
  });
});

describe("inscripciones de la semilla", () => {
  it("incluye inscritos de ejemplo que apuntan a pilotos y rondas reales", () => {
    const estado = estadoInicial();

    expect(estado.inscripciones.length).toBeGreaterThan(0);
    for (const inscripcion of estado.inscripciones) {
      expect(estado.pilotos.some((piloto) => piloto.id === inscripcion.pilotoId)).toBe(true);
      expect(estado.rondas.some((ronda) => ronda.id === inscripcion.rondaId)).toBe(true);
    }
  });
});

/** Mock con cuota limitada: falla cuando el payload supera el límite. */
class LocalStorageCuotaMock {
  guardado = "";

  constructor(private readonly limite: number) {}

  getItem(): string | null {
    return null;
  }

  setItem(_clave: string, valor: string): void {
    if (valor.length > this.limite) {
      const error = new Error("QuotaExceededError");
      error.name = "QuotaExceededError";
      throw error;
    }
    this.guardado = valor;
  }

  removeItem(): void {}

  clear(): void {}
}

describe("cuota del almacenamiento del navegador", () => {
  it("guarda la licencia aunque no entre la previsualización de la foto", () => {
    const estado = estadoInicial();
    estado.licencias = [
      {
        id: "LIC-1",
        pilotoId: estado.pilotos[0].id,
        categoria: "Infantil",
        estado: "en_validacion",
        solicitadaEn: "2026-11-01T10:00:00.000Z",
        documentoNombre: "cedula.pdf",
        documentoTipo: "application/pdf",
        fotoNombre: "foto.jpg",
        fotoPreview: `data:image/jpeg;base64,${"A".repeat(5000)}`,
      },
    ];

    const sinPrevisualizacion = {
      ...estado,
      licencias: estado.licencias.map((licencia) => ({ ...licencia, fotoPreview: undefined })),
    };
    const limite = JSON.stringify(sinPrevisualizacion).length + 50;

    const mock = new LocalStorageCuotaMock(limite);
    (globalThis as { localStorage?: unknown }).localStorage = mock;

    expect(() => escribirEstado(estado)).not.toThrow();
    expect(mock.guardado).toContain("LIC-1");
    expect(mock.guardado).not.toContain("data:image/jpeg;base64");
  });

  it("avisa con un mensaje claro cuando la cuota está llena", () => {
    (globalThis as { localStorage?: unknown }).localStorage = new LocalStorageCuotaMock(10);

    expect(() => escribirEstado(estadoInicial())).toThrowError(
      /almacenamiento del navegador está lleno/i,
    );
  });
});
