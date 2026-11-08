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
