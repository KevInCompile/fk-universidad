/**
 * Tipos compartidos del portal. Todo el estado del prototipo vive en el
 * navegador (localStorage), por eso estos tipos son el contrato entre la
 * home, el panel de directiva y el portal del piloto.
 */

export type Rol = "directivo" | "piloto";

export type EstadoLicencia =
  | "sin_solicitud"
  | "en_validacion"
  | "activa"
  | "rechazada"
  | "suspendida";

export interface Piloto {
  /** Identificador único de la federación, derivado del documento. */
  id: string;
  documento: string;
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  /** Categoría en la que el piloto se clasifica para competir. */
  categoria?: string;
  creadoEn: string;
}

export interface Licencia {
  id: string;
  pilotoId: string;
  categoria: string;
  estado: EstadoLicencia;
  solicitadaEn: string;
  /** Nombre del archivo de identidad cargado por el piloto. */
  documentoNombre: string;
  /** Tipo MIME declarado del archivo de identidad. */
  documentoTipo: string;
  /** Nombre del archivo de fotografía cargado por el piloto. */
  fotoNombre: string;
  /** Marca temporal (base64) de la foto, solo para previsualización. */
  fotoPreview?: string;
  validadaEn?: string;
  observacion?: string;
  /** Fecha en la que empieza la vigencia de la licencia (ISO). */
  vigenciaDesde?: string;
  /** Fecha en la que termina la vigencia de la licencia (ISO). */
  vigenciaHasta?: string;
}

export interface Inscripcion {
  id: string;
  pilotoId: string;
  rondaId: string;
  categoria: string;
  codigo: string;
  creadaEn: string;
}

export interface Noticia {
  id: string;
  fecha: string;
  categoria: string;
  titulo: string;
  resumen: string;
  publicada: boolean;
}

export interface Ronda {
  id: string;
  codigo: string;
  fecha: string;
  nombre: string;
  ciudad: string;
  pista: string;
  pistaId: string;
  /** Código QR con el que el piloto puede inscribirse al evento. */
  codigoQr: string;
  estado: "programada" | "inscripciones_cerradas" | "en_disputa" | "finalizada";
}

export interface Categoria {
  id: string;
  nombre: string;
  edadMin: number;
  edadMax: number;
  kart: string;
  licenciaRequerida: string;
  descripcion: string;
}

export interface Club {
  id: string;
  nombre: string;
  ciudad: string;
  departamento: string;
  categorias: string[];
  contacto: string;
  homologado: boolean;
}

export interface Reglamento {
  slug: string;
  titulo: string;
  resumen: string;
  articulos: { titulo: string; texto: string }[];
}

export interface Estado {
  noticias: Noticia[];
  rondas: Ronda[];
  pilotos: Piloto[];
  licencias: Licencia[];
  inscripciones: Inscripcion[];
}

export interface Sesion {
  rol: Rol;
  nombre: string;
  pilotoId?: string;
}

export const ETIQUETA_ESTADO_LICENCIA: Record<EstadoLicencia, string> = {
  sin_solicitud: "Sin solicitud",
  en_validacion: "En validación",
  activa: "Activa",
  rechazada: "Rechazada",
  suspendida: "Suspendida",
};

export const COLOR_ESTADO_LICENCIA: Record<EstadoLicencia, string> = {
  sin_solicitud: "muted",
  en_validacion: "primary",
  activa: "primary",
  rechazada: "destructive",
  suspendida: "destructive",
};
