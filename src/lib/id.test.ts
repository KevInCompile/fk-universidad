import { describe, expect, it } from "vitest";
import {
  generarIdPiloto,
  generarIdUnico,
  normalizarDocumento,
} from "./id";

describe("normalizarDocumento", () => {
  it("quita puntos, guiones y espacios", () => {
    expect(normalizarDocumento("1.020.334.567-8")).toBe("10203345678");
  });

  it("deja el documento sin caracteres no alfanuméricos en mayúsculas", () => {
    expect(normalizarDocumento(" ab-12 ")).toBe("AB12");
  });
});

describe("generarIdPiloto", () => {
  it("devuelve un ID con el formato FK-<temporada>-<6 caracteres>", () => {
    expect(generarIdPiloto("10203345678")).toMatch(/^FK-2027-[0-9A-Z]{6}$/);
  });

  it("es determinista: el mismo documento produce siempre el mismo ID", () => {
    expect(generarIdPiloto("10203345678")).toBe(generarIdPiloto("10203345678"));
  });

  it("normaliza el documento antes de derivar el ID", () => {
    expect(generarIdPiloto("1.020.334.567-8")).toBe(generarIdPiloto("10203345678"));
  });

  it("genera IDs distintos para documentos distintos", () => {
    const ids = ["10203345678", "10987654321", "10452218893", "805060101"].map((documento) =>
      generarIdPiloto(documento),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("generarIdUnico", () => {
  it("devuelve el ID base cuando no existe", () => {
    expect(generarIdUnico("10203345678", [])).toBe(generarIdPiloto("10203345678"));
  });

  it("resuelve la colisión con un sufijo determinista", () => {
    const base = generarIdPiloto("10203345678");
    const ids = [base];
    expect(generarIdUnico("10203345678", ids)).toBe(`${base}-2`);
  });

  it("no repite un ID ya usado cuando hay varias colisiones", () => {
    const base = generarIdPiloto("10203345678");
    const ids = [base, `${base}-2`];
    expect(generarIdUnico("10203345678", ids)).toBe(`${base}-3`);
  });
});
