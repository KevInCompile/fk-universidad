import type { Categoria, Club, Noticia, Piloto, Reglamento, Ronda } from "../lib/types";
import { generarIdUnico } from "../lib/id";

export const nav = [
  { n: "01", label: "Calendario", href: "/calendario" },
  { n: "02", label: "Campeonatos", href: "/campeonatos" },
  // Inscripciones: acceso público oculto temporalmente (a pedido del usuario).
  // Se restaura descomentando la línea.
  // { n: "03", label: "Inscripciones", href: "/inscripciones" },
  { n: "04", label: "Noticias", href: "/noticias" },
  { n: "05", label: "Escuelas", href: "/escuelas" },
  // Contacto: acceso público oculto temporalmente (a pedido del usuario).
  // Se restaura descomentando la línea.
  // { n: "06", label: "Contacto", href: "/contacto" },
  { n: "07", label: "Verificar", href: "/verificar" },
];

export const temporada = "2027";

/* -------------------------------------------------------------------------- */
/* Pistas homologadas                                                          */
/* -------------------------------------------------------------------------- */

export type Track = {
  code: string;
  name: string;
  city: string;
  length: string;
  corners: string;
  record: string;
  /** Coordenadas aproximadas del complejo (no son direcciones verificadas). */
  lat: number;
  lng: number;
  direccion: string;
};

export const tracks: Track[] = [
  {
    code: "T1",
    name: "Autódromo Norte",
    city: "Bogotá",
    length: "1.240 m",
    corners: "14 curvas",
    record: "48.312",
    lat: 4.7719,
    lng: -74.0306,
    direccion: "Autódromo Norte · Autopista Norte, km 12",
  },
  {
    code: "T2",
    name: "Kartódromo del Valle",
    city: "Cali",
    length: "1.080 m",
    corners: "11 curvas",
    record: "45.907",
    lat: 3.423,
    lng: -76.5101,
    direccion: "Kartódromo del Valle · Vía Palmira, km 18",
  },
  {
    code: "T3",
    name: "Circuito Alto",
    city: "Medellín",
    length: "960 m",
    corners: "12 curvas",
    record: "43.551",
    lat: 6.2901,
    lng: -75.6103,
    direccion: "Circuito Alto · Corregimiento de La Ceja",
  },
  {
    code: "T4",
    name: "Pista del Mar",
    city: "Barranquilla",
    length: "1.150 m",
    corners: "10 curvas",
    record: "46.204",
    lat: 10.9402,
    lng: -74.8001,
    direccion: "Pista del Mar · Vía Circunvalar, km 4",
  },
];

/* -------------------------------------------------------------------------- */
/* Calendario                                                                  */
/* -------------------------------------------------------------------------- */

export const rounds: Ronda[] = [
  {
    id: "r01",
    codigo: "R01",
    fecha: "14 MAR",
    nombre: "Apertura Nacional",
    ciudad: "Bogotá",
    pista: "Autódromo Norte",
    pistaId: "T1",
    codigoQr: "FEDKART-R01-2027",
    estado: "inscripciones_cerradas",
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
  {
    id: "r03",
    codigo: "R03",
    fecha: "16 MAY",
    nombre: "Copa Montaña",
    ciudad: "Medellín",
    pista: "Circuito Alto",
    pistaId: "T3",
    codigoQr: "FEDKART-R03-2027",
    estado: "programada",
  },
  {
    id: "r04",
    codigo: "R04",
    fecha: "20 JUN",
    nombre: "Noche de Velocidad",
    ciudad: "Bogotá",
    pista: "Autódromo Norte",
    pistaId: "T1",
    codigoQr: "FEDKART-R04-2027",
    estado: "programada",
  },
  {
    id: "r05",
    codigo: "R05",
    fecha: "25 JUL",
    nombre: "Trofeo Costa",
    ciudad: "Barranquilla",
    pista: "Pista del Mar",
    pistaId: "T4",
    codigoQr: "FEDKART-R05-2027",
    estado: "programada",
  },
  {
    id: "r06",
    codigo: "R06",
    fecha: "29 AGO",
    nombre: "Gran Final",
    ciudad: "Cali",
    pista: "Kartódromo del Valle",
    pistaId: "T2",
    codigoQr: "FEDKART-R06-2027",
    estado: "programada",
  },
];

/* -------------------------------------------------------------------------- */
/* Categorías                                                                  */
/* -------------------------------------------------------------------------- */

export const categorias: Categoria[] = [
  {
    id: "iniciacion",
    nombre: "Iniciación",
    edadMin: 5,
    edadMax: 7,
    kart: "Karts mini (100 cc)",
    licenciaRequerida: "Licencia de iniciación",
    descripcion:
      "Primera aproximación al karting: trabajo de técnica, controles de kart y conductor de pista.",
  },
  {
    id: "preinfantil",
    nombre: "Preinfantil",
    edadMin: 7,
    edadMax: 9,
    kart: "Karts mini y junior (100–125 cc)",
    licenciaRequerida: "Licencia preinfantil",
    descripcion:
      "Transición entre la escuela y la competencia: primeros cronometrados y trabajo en bandeja.",
  },
  {
    id: "infantil",
    nombre: "Infantil",
    edadMin: 9,
    edadMax: 12,
    kart: "Karts junior (125 cc)",
    licenciaRequerida: "Licencia infantil",
    descripcion:
      "Categoría base del campeonato nacional con ranking propio y series de seis pilotos.",
  },
  {
    id: "aficionado",
    nombre: "Aficionado",
    edadMin: 12,
    edadMax: 16,
    kart: "Karts junior y senior (125–150 cc)",
    licenciaRequerida: "Licencia de aficiado",
    descripcion:
      "Categoría puente entre la formación y el élite: regularity y класificaciones por puntos.",
  },
  {
    id: "senior",
    nombre: "Senior",
    edadMin: 16,
    edadMax: 99,
    kart: "Karts senior (150–200 cc)",
    licenciaRequerida: "Licencia senior",
    descripcion:
      "Máxima exigencia técnica del campeonato: luchar por la victoria en la final de carrera.",
  },
  {
    id: "master",
    nombre: "Master",
    edadMin: 35,
    edadMax: 99,
    kart: "Karts senior (150 cc)",
    licenciaRequerida: "Licencia master",
    descripcion:
      "Categoría de prevailed pilots con experiencia acreditada y trofeo independiente.",
  },
];

/* -------------------------------------------------------------------------- */
/* Clubes                                                                      */
/* -------------------------------------------------------------------------- */

export const clubes: Club[] = [
  {
    id: "c01",
    nombre: "Kart Club Sabana",
    ciudad: "Bogotá",
    departamento: "Cundinamarca",
    categorias: ["Iniciación", "Preinfantil", "Infantil"],
    contacto: "direccion@sabanakart.club",
    homologado: true,
  },
  {
    id: "c02",
    nombre: "Escuela de Kartismo del Valle",
    ciudad: "Cali",
    departamento: "Valle del Cauca",
    categorias: ["Iniciación", "Preinfantil", "Infantil", "Aficionado"],
    contacto: "inscripciones@kartvalle.co",
    homologado: true,
  },
  {
    id: "c03",
    nombre: "Pilotos del Café",
    ciudad: "Medellín",
    departamento: "Antioquia",
    categorias: ["Preinfantil", "Infantil", "Aficionado"],
    contacto: "escuela@pilotosdelcafe.co",
    homologado: true,
  },
  {
    id: "c04",
    nombre: "Club Kart Norte",
    ciudad: "Barranquilla",
    departamento: "Atlántico",
    categorias: ["Iniciación", "Preinfantil"],
    contacto: "contacto@clubkartnorte.co",
    homologado: false,
  },
  {
    id: "c05",
    nombre: "Academia Velocidadkana",
    ciudad: "Bogotá",
    departamento: "Bogotá D.C.",
    categorias: ["Infantil", "Aficionado", "Senior"],
    contacto: "info@velocidadkana.co",
    homologado: true,
  },
  {
    id: "c06",
    nombre: "Kart Club Pacífico",
    ciudad: "Cali",
    departamento: "Valle del Cauca",
    categorias: ["Iniciación", "Infantil"],
    contacto: "deportes@kartpacifico.co",
    homologado: false,
  },
  {
    id: "c07",
    nombre: "Escuela Andina de Karting",
    ciudad: "Medellín",
    departamento: "Antioquia",
    categorias: ["Iniciación", "Preinfantil", "Aficionado", "Master"],
    contacto: "andina@escuelakart.co",
    homologado: true,
  },
  {
    id: "c08",
    nombre: "Club Litoral Kart",
    ciudad: "Barranquilla",
    departamento: "Atlántico",
    categorias: ["Infantil", "Aficionado", "Senior"],
    contacto: "deportes@clublitoral.co",
    homologado: false,
  },
];

/* -------------------------------------------------------------------------- */
/* Reglamentos                                                                 */
/* -------------------------------------------------------------------------- */

export const reglamentos: Reglamento[] = [
  {
    slug: "reglamento-general",
    titulo: "Reglamento General 2027",
    resumen:
      "Marco normativo de la temporada: calendario, formato de campeonato, puntualidad y conducta.",
    articulos: [
      {
        titulo: "Artículo 1 — Formato",
        texto:
          "La federaciónHomologa seis rondas de calendario. Cada ronda suma puntos al campeonato por categoría.",
      },
      {
        titulo: "Artículo 2 — Paddock",
        texto:
          "El acceso al paddock cierra 30 minutos antes de la señal de lights. Los pilotos deben portar credencial ychaleco ignífugo.",
      },
      {
        titulo: "Artículo 3 — Conducta",
        texto:
          "Cualquier conducta antideportiva durante la sesión puede implicar exclusión de la fecha y pérdida de puntos.",
      },
    ],
  },
  {
    slug: "reglamento-tecnico",
    titulo: "Reglamento Técnico",
    resumen: "Homologación de karts, pesos, motor y verificación de neumáticos.",
    articulos: [
      {
        titulo: "Artículo 1 — Chasis",
        texto:
          "Los karts deben contar con ocho clases homologados, kit original y sistema de escape homologado.",
      },
      {
        titulo: "Artículo 2 — Neumáticos",
        texto:
          "Se permiten slicks traseros y de lluvia solo cuando la dirección de carrera lo autoriza.",
      },
      {
        titulo: "Artículo 3 — Verificación",
        texto:
          "La verificación técnica se realiza 45 minutos antes de la primera tanda y puede continuar en boxes.",
      },
    ],
  },
  {
    slug: "reglamento-inscripciones",
    titulo: "Reglamento de Inscripciones",
    resumen:
      "Cómo se abre y cierra cada evento, requisitos de licencia, cupos por categoría y forma de pago.",
    articulos: [
      {
        titulo: "Artículo 1 — Plazos",
        texto:
          "Las inscripciones abren al publicarse el calendario y cierran 10 días antes de cada fecha.",
      },
      {
        titulo: "Artículo 2 — Requisitos",
        texto:
          "Solo pueden participar pilotos con licencia activa y documento de identidad vigente.",
      },
      {
        titulo: "Artículo 3 — Cupos",
        texto:
          "Cada categoría admite hasta 24 pilotos. Si se supera el cupo, el orden lo define la clasificación previa.",
      },
    ],
  },
  {
    slug: "reglamento-pits",
    titulo: "Reglamento de Pits y Paddock",
    resumen:
      "Procedimientos en boxes, velocidad máxima, uso de radios y autorización de maquinaria de apoyo.",
    articulos: [
      {
        titulo: "Artículo 1 — Velocidad",
        texto: "La velocidad máxima dentro del paddock es de 15 km/h.",
      },
      {
        titulo: "Artículo 2 — Asistentes",
        texto:
          "Cada piloto puede acreditar un asistente mecánico con credencial propia del campeonato.",
      },
      {
        titulo: "Artículo 3 — Incidentes",
        texto:
          "Todo incidente en boxes se reporta al commissario de carrera dentro de los 10 minutos siguientes.",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Noticias                                                                    */
/* -------------------------------------------------------------------------- */

export const noticias: Noticia[] = [
  {
    id: "n04",
    fecha: "28 NOV 2026",
    categoria: "Licencias",
    titulo: "Consulta pública de licencias con escaneo de código QR",
    resumen:
      "Desde la home se puede verificar la autenticidad de un carné escaneando su código QR o escribiendo el número de licencia.",
    publicada: true,
  },
  {
    id: "n05",
    fecha: "20 NOV 2026",
    categoria: "Campeonato",
    titulo: "Cerradas las inscripciones de la fecha inaugural de la temporada 2027",
    resumen:
      "La directiva habilitó las inscripciones de la primera ronda en los cuatro circuitos homologados del país.",
    publicada: true,
  },
  {
    id: "n06",
    fecha: "12 NOV 2026",
    categoria: "Escuelas",
    titulo: "Se incorporan seis escuelas al programa de formación de pilotos",
    resumen:
      "Los clubes avalados amplían el programa de iniciación infantil para la temporada 2027, con nuevos cupos para menores de 7 años.",
    publicada: true,
  },
  {
    id: "n07",
    fecha: "10 NOV 2026",
    categoria: "Pistas",
    titulo: "El Autódromo Sur homologa su recta principal",
    resumen:
      "La comisión técnica aprobó la ampliación de la recta a 180 metros y el reposicionamiento de los boxes.",
    publicada: true,
  },
  {
    id: "n01",
    fecha: "02 NOV 2026",
    categoria: "Campeonato",
    titulo: "Presentado el calendario oficial de la temporada 2027",
    resumen:
      "Seis fechas, cuatro circuitos homologados y un cambio de formato en la final de temporada.",
    publicada: true,
  },
  {
    id: "n02",
    fecha: "24 OCT 2026",
    categoria: "Escuelas",
    titulo: "Abren cupos para el programa de iniciación infantil",
    resumen:
      "Las escuelas avaladas abren 120 cupos para pilotos entre 5 y 7 años en toda el país.",
    publicada: true,
  },
  {
    id: "n03",
    fecha: "15 OCT 2026",
    categoria: "Pistas",
    titulo: "El Autódromo Norte estrena nueva chicana y zona de pits",
    resumen:
      "La homologación del circuito norte incluye una nueva zona de pits de 24 boxes y una tribuna mayor.",
    publicada: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Pilotos de prueba (login simulado)                                          */
/* -------------------------------------------------------------------------- */

export const pilotosSemilla: Piloto[] = [
  {
    id: "",
    documento: "10203345678",
    nombre: "Valentina Ríos",
    email: "valentina.rios@correo.co",
    telefono: "+57 310 555 0142",
    fechaNacimiento: "2008-04-12",
    categoria: "Senior",
    creadoEn: "2026-10-02T09:00:00.000Z",
  },
  {
    id: "",
    documento: "10987654321",
    nombre: "Mateo Salas",
    email: "mateo.salas@correo.co",
    telefono: "+57 320 555 0188",
    fechaNacimiento: "2013-09-30",
    categoria: "Aficionado",
    creadoEn: "2026-10-05T14:30:00.000Z",
  },
  {
    id: "",
    documento: "10452218893",
    nombre: "Juliana Ortiz",
    email: "juliana.ortiz@correo.co",
    telefono: "+57 301 555 0175",
    fechaNacimiento: "1996-02-21",
    categoria: "Senior",
    creadoEn: "2026-10-11T11:15:00.000Z",
  },
  {
    id: "",
    documento: "10556677889",
    nombre: "Samuel Zapata",
    email: "samuel.zapata@correo.co",
    telefono: "+57 316 555 0199",
    fechaNacimiento: "2016-03-08",
    categoria: "Infantil",
    creadoEn: "2026-10-15T08:40:00.000Z",
  },
].map((piloto) => ({
  ...piloto,
  id: generarIdUnico(piloto.documento, [], temporada),
}));

/* -------------------------------------------------------------------------- */
/* Textos de la home                                                           */
/* -------------------------------------------------------------------------- */

export const schoolsCopy =
  "Escuelas avaladas con instructores certificados, karts adaptados y un camino claro desde la iniciación hasta la competencia.";

export const heroCopy =
  "El punto oficial de información del kartismo: dónde correr, cuándo correr y cómo empezar.";

export const clubCopy =
  "Escuelas y clubes avalados por la federación, con instructores certificados y cobertura en todo el país.";
