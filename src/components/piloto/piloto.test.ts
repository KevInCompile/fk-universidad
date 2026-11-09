import { beforeEach, describe, expect, it } from "vitest";

import {
  inscribirEnRonda,
  inscribirPorCodigo,
  licenciaDe,
  registrarPiloto,
  reiniciarEstado,
  escribirSesion,
  leerSesion,
  solicitarLicencia,
} from "../../lib/store";
import { ETIQUETA_ESTADO_LICENCIA } from "../../lib/types";
import { generarIdPiloto } from "../../lib/id";
import { sesionPiloto } from "./sesion";
import { escapar, formatoFecha } from "./ui";

/* Almacenamiento local simulado (decisión D1: todo vive en el navegador). */
class AlmacenamientoFalso {
  private datos = new Map<string, string>();

  getItem(clave: string): string | null {
    return this.datos.has(clave) ? (this.datos.get(clave) as string) : null;
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

const almacen = new AlmacenamientoFalso();

beforeEach(() => {
  almacen.clear();
  (globalThis as unknown as { localStorage: AlmacenamientoFalso }).localStorage =
    almacen;
  (globalThis as unknown as { window: { location: { href: string } } }).window = {
    location: { href: "" },
  };
  reiniciarEstado();
});

function crearSesionPiloto() {
  const piloto = registrarPiloto({
    nombre: "Valentina Ríos",
    documento: "10123456789",
    email: "valentina.rios@correo.co",
    telefono: "+57 310 555 0142",
    fechaNacimiento: "2008-04-12",
  });
  escribirSesion({ rol: "piloto", nombre: piloto.nombre, pilotoId: piloto.id });
  return piloto;
}

describe("registro de piloto (S3)", () => {
  it("genera un identificador único ligado al documento", () => {
    const piloto = crearSesionPiloto();

    expect(piloto.id).toMatch(/^FK-2027-[0-9A-Z]{6}$/);
  });

  it("deriva el mismo identificador base para el mismo documento", () => {
    const primero = registrarPiloto({
      nombre: "Mateo Salas",
      documento: "10987654321",
      email: "mateo@correo.co",
      telefono: "3000000000",
      fechaNacimiento: "2013-09-30",
    });
    const segundo = registrarPiloto({
      nombre: "Mateo Salas",
      documento: "10987654321",
      email: "mateo@correo.co",
      telefono: "3000000000",
      fechaNacimiento: "2013-09-30",
    });

    const base = generarIdPiloto("10987654321");
    expect(primero.id.startsWith(base)).toBe(true);
    expect(segundo.id.startsWith(base)).toBe(true);
    expect(segundo.id).not.toBe(primero.id);
  });

  it("guarda la sesión del piloto con su identificador", () => {
    const piloto = crearSesionPiloto();
    const sesion = leerSesion();

    expect(sesion?.rol).toBe("piloto");
    expect(sesion?.pilotoId).toBe(piloto.id);
    expect(sesion?.nombre).toBe("Valentina Ríos");
  });
});

describe("guarda de sesión del portal (S3, S4)", () => {
  it("redirige a /login cuando no hay sesión", () => {
    expect(sesionPiloto()).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("redirige al panel de la directiva cuando la sesión es de otro rol", () => {
    escribirSesion({ rol: "directivo", nombre: "Directiva" });

    expect(sesionPiloto()).toBeNull();
    expect(window.location.href).toBe("/admin");
  });

  it("deja pasar la sesión de rol piloto", () => {
    const piloto = crearSesionPiloto();

    expect(sesionPiloto()?.pilotoId).toBe(piloto.id);
    expect(window.location.href).toBe("");
  });
});

describe("solicitud y estado de licencia (S4, S6)", () => {
  it("deja la licencia en validación al solicitarla", () => {
    const piloto = crearSesionPiloto();

    const licencia = solicitarLicencia(piloto.id, {
      categoria: "Infantil",
      documentoNombre: "documento.pdf",
      documentoTipo: "application/pdf",
      fotoNombre: "foto.png",
      fotoPreview: "data:image/png;base64,AAAA",
    });

    expect(licencia.estado).toBe("en_validacion");
    expect(ETIQUETA_ESTADO_LICENCIA[licencia.estado]).toBe("En validación");
    expect(licenciaDe(piloto.id)?.id).toBe(licencia.id);
  });

  it("no encuentra licencia cuando el piloto no solicitó", () => {
    const piloto = crearSesionPiloto();

    expect(licenciaDe(piloto.id)).toBeUndefined();
  });
});

describe("inscripciones (S5)", () => {
  it("inscribe al piloto en una ronda con un código de inscripción", () => {
    const piloto = crearSesionPiloto();
    const rondas = leerRondas();

    const { inscripcion, repetida } = inscribirEnRonda(
      piloto.id,
      rondas[0].id,
      "Infantil",
    );

    expect(repetida).toBe(false);
    expect(inscripcion.codigo).toMatch(/^INS-/);
    expect(inscripcion.categoria).toBe("Infantil");
  });

  it("no duplica la inscripción en la misma ronda", () => {
    const piloto = crearSesionPiloto();
    const rondas = leerRondas();

    inscribirEnRonda(piloto.id, rondas[0].id, "Infantil");
    const segunda = inscribirEnRonda(piloto.id, rondas[0].id, "Infantil");

    expect(segunda.repetida).toBe(true);
  });

  it("inscribe por código QR válido", () => {
    const piloto = crearSesionPiloto();
    const ronda = leerRondas()[0];

    const resultado = inscribirPorCodigo(
      piloto.id,
      ronda.codigoQr,
      "Infantil",
    );

    expect(resultado?.ronda.id).toBe(ronda.id);
    expect(resultado?.inscripcion.pilotoId).toBe(piloto.id);
  });

  it("devuelve null cuando el código QR no existe", () => {
    const piloto = crearSesionPiloto();

    expect(
      inscribirPorCodigo(piloto.id, "FEDKART-Z99-2027", "Infantil"),
    ).toBeNull();
  });
});

describe("utilidades de presentación", () => {
  it("escapa el texto insertado con innerHTML", () => {
    expect(escapar("<b>Ana</b> & \"B\"")).toBe(
      "&lt;b&gt;Ana&lt;/b&gt; &amp; &quot;B&quot;",
    );
  });

  it("formatea fechas ISO en español", () => {
    expect(formatoFecha("2026-10-02T09:00:00.000Z")).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(formatoFecha(undefined)).toBe("—");
  });
});

function leerRondas() {
  const crudo = almacen.getItem("fed-kartismo:estado:v2");
  const estado = crudo ? JSON.parse(crudo) : { rondas: [] };
  return (estado.rondas as { id: string; codigoQr: string }[]).filter(
    (ronda) => Boolean(ronda.codigoQr),
  );
}
