import { describe, expect, it } from "vitest";
import {
  bandejaLicencias,
  decidirLicencia,
  listadoInscripciones,
  resumenPanel,
  validarNoticia,
  validarRonda,
} from "./adminLogica";
import type { Estado, Licencia, Piloto } from "../../lib/types";

const piloto: Piloto = {
  id: "FK-2027-ABC123",
  documento: "10203345678",
  nombre: "Valentina Ríos",
  email: "valentina.rios@correo.co",
  telefono: "+57 310 555 0142",
  fechaNacimiento: "2008-04-12",
  creadoEn: "2026-10-02T09:00:00.000Z",
};

function licencia(estado: Licencia["estado"], id = "LIC-1"): Licencia {
  return {
    id,
    pilotoId: piloto.id,
    categoria: "Infantil",
    estado,
    solicitadaEn: "2026-11-01T10:00:00.000Z",
    documentoNombre: "cedula.pdf",
    documentoTipo: "application/pdf",
    fotoNombre: "foto.jpg",
  };
}

function estadoBase(): Estado {
  return {
    noticias: [
      {
        id: "n1",
        fecha: "02 NOV 2026",
        categoria: "Campeonato",
        titulo: "Publicada",
        resumen: "Sí",
        publicada: true,
      },
      {
        id: "n2",
        fecha: "01 NOV 2026",
        categoria: "Escuelas",
        titulo: "Borrador",
        resumen: "No",
        publicada: false,
      },
    ],
    rondas: [
      {
        id: "r1",
        codigo: "R01",
        fecha: "14 MAR",
        nombre: "Apertura Nacional",
        ciudad: "Bogotá",
        pista: "Autódromo Norte",
        pistaId: "T1",
        codigoQr: "FEDKART-R01-2027",
        estado: "programada",
      },
    ],
    pilotos: [piloto],
    licencias: [licencia("en_validacion")],
    inscripciones: [],
  };
}

describe("resumen del panel", () => {
  it("cuenta solo las noticias publicadas", () => {
    expect(resumenPanel(estadoBase()).noticiasPublicadas).toBe(1);
  });

  it("cuenta las rondas de la temporada", () => {
    expect(resumenPanel(estadoBase()).rondas).toBe(1);
  });

  it("cuenta solo las licencias en validación", () => {
    const estado = estadoBase();
    estado.licencias.push(licencia("activa", "LIC-2"));
    expect(resumenPanel(estado).licenciasEnValidacion).toBe(1);
  });
});

describe("validación del formulario de noticias", () => {
  it("exige fecha, categoría, título y resumen", () => {
    const resultado = validarNoticia({
      fecha: "",
      categoria: "Campeonato",
      titulo: "Titular",
      resumen: "Resumen",
      publicada: true,
    });
    expect(resultado.ok).toBe(false);
    expect(resultado.error).toBeTruthy();
  });

  it("acepta una noticia completa", () => {
    const resultado = validarNoticia({
      fecha: "02 NOV 2026",
      categoria: "Campeonato",
      titulo: "Titular",
      resumen: "Resumen",
      publicada: true,
    });
    expect(resultado.ok).toBe(true);
  });
});

describe("validación del formulario de rondas", () => {
  it("exige una pista homologada", () => {
    const resultado = validarRonda({
      codigo: "R07",
      fecha: "05 DIC",
      nombre: "Final extra",
      ciudad: "Bogotá",
      pistaId: "",
      estado: "programada",
    });
    expect(resultado.ok).toBe(false);
  });

  it("acepta una ronda completa con estado conocido", () => {
    const resultado = validarRonda({
      codigo: "R07",
      fecha: "05 DIC",
      nombre: "Final extra",
      ciudad: "Bogotá",
      pistaId: "T1",
      estado: "en_disputa",
    });
    expect(resultado.ok).toBe(true);
  });

  it("rechaza un estado desconocido", () => {
    const resultado = validarRonda({
      codigo: "R07",
      fecha: "05 DIC",
      nombre: "Final extra",
      ciudad: "Bogotá",
      pistaId: "T1",
      estado: "inventado",
    });
    expect(resultado.ok).toBe(false);
  });
});

describe("bandeja de licencias", () => {
  it("separa las solicitudes pendientes del histórico", () => {
    const estado = estadoBase();
    estado.licencias.push(licencia("rechazada", "LIC-2"));

    const bandeja = bandejaLicencias(estado);
    expect(bandeja.pendientes).toHaveLength(1);
    expect(bandeja.resueltas).toHaveLength(1);
    expect(bandeja.pendientes[0].piloto?.nombre).toBe("Valentina Ríos");
    expect(bandeja.resueltas[0].licencia.id).toBe("LIC-2");
  });
});

describe("decisión sobre una licencia", () => {
  it("exige observación para rechazar", () => {
    const resultado = decidirLicencia(estadoBase(), "LIC-1", "rechazada", "   ");
    expect(resultado.ok).toBe(false);
    expect(resultado.error).toBeTruthy();
  });

  it("aprueba la licencia y la deja activa", () => {
    const resultado = decidirLicencia(estadoBase(), "LIC-1", "aprobada", "");
    expect(resultado.ok).toBe(true);
    expect(resultado.licencia?.estado).toBe("activa");
    expect(resultado.licencia?.validadaEn).toBeTruthy();
  });

  it("rechaza la licencia y guarda la observación", () => {
    const resultado = decidirLicencia(
      estadoBase(),
      "LIC-1",
      "rechazada",
      "La foto no es legible",
    );
    expect(resultado.ok).toBe(true);
    expect(resultado.licencia?.estado).toBe("rechazada");
    expect(resultado.licencia?.observacion).toBe("La foto no es legible");
  });

  it("avisa cuando la licencia no existe", () => {
    const resultado = decidirLicencia(estadoBase(), "LIC-99", "aprobada", "");
    expect(resultado.ok).toBe(false);
  });
});

describe("listado de inscritos por evento", () => {
  it("agrupa los inscritos de cada ronda con los datos del piloto", () => {
    const estado = estadoBase();
    estado.rondas = [
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
    estado.inscripciones = [
      {
        id: "INS-1",
        pilotoId: piloto.id,
        rondaId: "r01",
        categoria: "Infantil",
        codigo: "INS-R01-A1B2",
        creadaEn: "2026-11-01T10:00:00.000Z",
      },
    ];

    const listado = listadoInscripciones(estado);

    expect(listado.eventos).toHaveLength(1);
    expect(listado.eventos[0].ronda.codigo).toBe("R01");
    expect(listado.eventos[0].inscritos).toHaveLength(1);
    expect(listado.eventos[0].inscritos[0].piloto?.nombre).toBe("Valentina Ríos");
    expect(listado.totalInscritos).toBe(1);
  });

  it("cuenta los inscritos por categoría dentro de cada evento", () => {
    const estado = estadoBase();
    estado.rondas = [
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
    estado.inscripciones = [
      {
        id: "INS-1",
        pilotoId: piloto.id,
        rondaId: "r01",
        categoria: "Infantil",
        codigo: "INS-R01-A1B2",
        creadaEn: "2026-11-01T10:00:00.000Z",
      },
      {
        id: "INS-2",
        pilotoId: piloto.id,
        rondaId: "r01",
        categoria: "Infantil",
        codigo: "INS-R01-C3D4",
        creadaEn: "2026-11-02T10:00:00.000Z",
      },
      {
        id: "INS-3",
        pilotoId: piloto.id,
        rondaId: "r01",
        categoria: "Senior",
        codigo: "INS-R01-E5F6",
        creadaEn: "2026-11-03T10:00:00.000Z",
      },
    ];

    const evento = listadoInscripciones(estado).eventos[0];

    expect(evento.inscritos).toHaveLength(3);
    expect(evento.porCategoria).toEqual([
      { categoria: "Infantil", total: 2 },
      { categoria: "Senior", total: 1 },
    ]);
  });

  it("deja el evento sin inscritos cuando nadie se anotó", () => {
    const estado = estadoBase();
    estado.rondas = [
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
    estado.inscripciones = [];

    const listado = listadoInscripciones(estado);

    expect(listado.eventos).toHaveLength(1);
    expect(listado.eventos[0].inscritos).toHaveLength(0);
    expect(listado.eventos[0].porCategoria).toEqual([]);
    expect(listado.totalInscritos).toBe(0);
  });

  it("no rompe cuando el piloto de la inscripción ya no existe", () => {
    const estado = estadoBase();
    estado.rondas = [
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
    estado.inscripciones = [
      {
        id: "INS-1",
        pilotoId: "FK-2027-XXX999",
        rondaId: "r01",
        categoria: "Infantil",
        codigo: "INS-R01-A1B2",
        creadaEn: "2026-11-01T10:00:00.000Z",
      },
    ];

    const evento = listadoInscripciones(estado).eventos[0];

    expect(evento.inscritos).toHaveLength(1);
    expect(evento.inscritos[0].piloto).toBeUndefined();
  });

  it("suma los inscritos de toda la temporada por categoría", () => {
    const estado = estadoBase();
    estado.rondas = [
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
      {
        id: "r02",
        codigo: "R02",
        fecha: "11 ABR",
        nombre: "Gran Premio del Valle",
        ciudad: "Cali",
        pista: "Kartódromo del Valle",
        pistaId: "T2",
        codigoQr: "FEDKART-R02-2027",
        estado: "programada",
      },
    ];
    estado.inscripciones = [
      {
        id: "INS-1",
        pilotoId: piloto.id,
        rondaId: "r01",
        categoria: "Infantil",
        codigo: "INS-R01-A1B2",
        creadaEn: "2026-11-01T10:00:00.000Z",
      },
      {
        id: "INS-2",
        pilotoId: piloto.id,
        rondaId: "r02",
        categoria: "Senior",
        codigo: "INS-R02-C3D4",
        creadaEn: "2026-11-02T10:00:00.000Z",
      },
    ];

    const listado = listadoInscripciones(estado);

    expect(listado.totalInscritos).toBe(2);
    expect(listado.categorias).toEqual([
      { categoria: "Infantil", total: 1 },
      { categoria: "Senior", total: 1 },
    ]);
  });
});
