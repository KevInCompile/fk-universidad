import { describe, expect, it } from "vitest";
import {
  buscarLicenciaPorConsulta,
  codigoVerificacionLicencia,
  estadoPublicoLicencia,
  licenciaHabilita,
  normalizarCodigoLicencia,
} from "./licencia";
import type { Estado, Licencia, Piloto } from "./types";

function licencia(datos: Partial<Licencia> = {}): Licencia {
  return {
    id: "LIC-ABC12",
    pilotoId: "FK-2027-ABC123",
    categoria: "Infantil",
    estado: "activa",
    solicitadaEn: "2026-11-01T10:00:00.000Z",
    documentoNombre: "cedula.pdf",
    documentoTipo: "application/pdf",
    fotoNombre: "foto.jpg",
    ...datos,
  };
}

describe("estado público de una licencia", () => {
  it("no encuentra la licencia cuando no existe", () => {
    expect(estadoPublicoLicencia(undefined)).toBe("no_encontrada");
  });

  it("una licencia activa dentro de su vigencia está vigente", () => {
    const estado = estadoPublicoLicencia(
      licencia({ vigenciaDesde: "2026-11-01T00:00:00.000Z", vigenciaHasta: "2027-12-31T00:00:00.000Z" }),
      new Date("2027-03-01T00:00:00.000Z"),
    );

    expect(estado).toBe("vigente");
    expect(licenciaHabilita(estado)).toBe(true);
  });

  it("una licencia activa con vigencia vencida aparece como vencida", () => {
    const estado = estadoPublicoLicencia(
      licencia({ vigenciaHasta: "2026-12-31T00:00:00.000Z" }),
      new Date("2027-03-01T00:00:00.000Z"),
    );

    expect(estado).toBe("vencida");
    expect(licenciaHabilita(estado)).toBe(false);
  });

  it("una licencia suspendida aparece como suspendida aunque siga vigente", () => {
    const estado = estadoPublicoLicencia(
      licencia({ estado: "suspendida", vigenciaHasta: "2027-12-31T00:00:00.000Z" }),
      new Date("2027-03-01T00:00:00.000Z"),
    );

    expect(estado).toBe("suspendida");
    expect(licenciaHabilita(estado)).toBe(false);
  });

  it("una solicitud en validación o rechazada no habilita al piloto", () => {
    expect(estadoPublicoLicencia(licencia({ estado: "en_validacion" }))).toBe("en_validacion");
    expect(estadoPublicoLicencia(licencia({ estado: "rechazada" }))).toBe("rechazada");
    expect(licenciaHabilita("en_validacion")).toBe(false);
    expect(licenciaHabilita("rechazada")).toBe(false);
  });

  it("una licencia sin fecha de vigencia se considera vigente", () => {
    expect(estadoPublicoLicencia(licencia())).toBe("vigente");
  });
});

describe("código de verificación de la licencia", () => {
  it("arma el código con el prefijo de la federación", () => {
    expect(codigoVerificacionLicencia(licencia())).toBe("FEDKART-LIC-LIC-ABC12");
  });

  it("normaliza lo que escribe el público", () => {
    expect(normalizarCodigoLicencia("lic-abc12")).toBe("LIC-ABC12");
    expect(normalizarCodigoLicencia(" fedkart-lic-lic-abc12 ")).toBe("LIC-ABC12");
    expect(normalizarCodigoLicencia("LIC ABC12")).toBe("LICABC12");
  });
});

describe("búsqueda de una licencia desde la consulta pública", () => {
  function piloto(datos: Partial<Piloto> = {}): Piloto {
    return {
      id: "FK-2027-KHT6C4",
      documento: "10203345678",
      nombre: "Valentina Ríos",
      email: "valentina.rios@correo.co",
      telefono: "+57 310 555 0142",
      fechaNacimiento: "2008-04-12",
      categoria: "Senior",
      creadoEn: "2026-10-02T09:00:00.000Z",
      ...datos,
    };
  }

  function estado(pruebas: Partial<Estado> = {}): Estado {
    return {
      noticias: [],
      rondas: [],
      pilotos: [piloto()],
      licencias: [licencia({ pilotoId: "FK-2027-KHT6C4" })],
      inscripciones: [],
      ...pruebas,
    };
  }

  it("encuentra la licencia por su número", () => {
    const resultado = buscarLicenciaPorConsulta(estado(), "LIC-ABC12");
    expect(resultado?.modo).toBe("licencia");
    expect(resultado?.licencia.id).toBe("LIC-ABC12");
  });

  it("encuentra la licencia por el código con prefijo", () => {
    const resultado = buscarLicenciaPorConsulta(estado(), "fedkart-lic-lic-abc12");
    expect(resultado?.modo).toBe("licencia");
  });

  it("encuentra la licencia por el identificador único del piloto", () => {
    const resultado = buscarLicenciaPorConsulta(estado(), "FK-2027-KHT6C4");
    expect(resultado?.modo).toBe("piloto");
    expect(resultado?.licencia.pilotoId).toBe("FK-2027-KHT6C4");
    expect(resultado?.piloto?.nombre).toBe("Valentina Ríos");
  });

  it("no encuentra nada con un código desconocido", () => {
    expect(buscarLicenciaPorConsulta(estado(), "LIC-NOEXISTE")).toBeUndefined();
    expect(buscarLicenciaPorConsulta(estado(), "FK-2027-000000")).toBeUndefined();
  });

  it("si el piloto tiene varias licencias muestra la que está vigente", () => {
    const resultado = buscarLicenciaPorConsulta(
      estado({
        licencias: [
          licencia({ id: "LIC-VIEJA", pilotoId: "FK-2027-KHT6C4", estado: "rechazada", solicitadaEn: "2026-01-01T00:00:00.000Z" }),
          licencia({ id: "LIC-NUEVA", pilotoId: "FK-2027-KHT6C4", estado: "activa", solicitadaEn: "2026-06-01T00:00:00.000Z" }),
        ],
      }),
      "FK-2027-KHT6C4",
    );

    expect(resultado?.licencia.id).toBe("LIC-NUEVA");
  });

  it("no encuentra licencia cuando el piloto no tiene ninguna", () => {
    expect(
      buscarLicenciaPorConsulta(estado({ licencias: [] }), "FK-2027-KHT6C4"),
    ).toBeUndefined();
  });
});
