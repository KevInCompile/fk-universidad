# Federación de Kartismo — Portal web (home + panel directiva + portal piloto)

Prototipo Astro con datos en el navegador. Dos roles simulados: directiva y piloto.

## Specs

- **S1** — "para la pagina inicial, deja calendario, reglamentos, categorias, las noticias de la federación, consultar los clubes, el mapa de las pistas homologados"
- **S2** — "el panel administrativo donde como directivo quiero publicas noticias, actualizar el calendario"
- **S3** — "Como rol de piloto poder registrarme en la plataforma y obtener un identificador unico ligado al documento de identidad"
- **S4** — "ver estado de la licencia y sus datos"
- **S5** — "un piloto quiere inscribirse a un evento por busqueda o codigo QR"
- **S6** — "tambien el piloto podria solicitar su licencia mediante un formulario cargando su documento y fotografia para iniciar la validación"
- **S7** — "una vez esa licencia este activa poder descargarla como PDF desde el panel de su rol"

Decisiones tomadas por el usuario (2026-11-08):

- **D1** — Persistencia y acceso: "Login simulado" (selector de rol + usuarios de prueba, sin base de datos ni sesiones reales).
- **D2** — Licencia del piloto: "HTML para imprimir" (vista optimizada para imprimir/guardar como PDF; no se genera PDF en el server).
- **D3** — Mapa de pistas: "Mapa real (Leaflet + OSM)" con pines en coordenadas de cada pista homologada.

Contexto previo (2026-11-08): "Vamos a crear un proyecto, por el momento crealo con astro, algo simple ya que es un prototipo y todos datos quemados".

## Tasks

| ID | Spec | Route | Work unit |
| --- | --- | --- | --- |
| T1 | S1 | `src/pages/index.astro` | Home: calendario de temporada |
| T2 | S1 | `src/pages/index.astro` | Home: reglamentos |
| T3 | S1 | `src/pages/index.astro` | Home: categorías |
| T4 | S1 | `src/pages/index.astro` | Home: noticias de la federación |
| T5 | S1 | `src/pages/index.astro` | Home: consultar clubes |
| T6 | S1, D3 | `src/pages/index.astro` | Home: mapa de pistas homologadas (Leaflet + OSM) |
| T7 | D1 | `src/pages/login.astro` | Login simulado + selección de rol |
| T8 | S2 | `src/pages/admin/noticias.astro` | Directiva: publicar/editar/borrar noticias |
| T9 | S2 | `src/pages/admin/calendario.astro` | Directiva: agregar/editar/borrar rondas |
| T10 | S2 | `src/pages/admin/licencias.astro` | Directiva: validar solicitudes de licencia |
| T11 | S3 | `src/pages/piloto/registro.astro` | Registro de piloto + identificador único ligado al documento |
| T12 | S4 | `src/pages/piloto/index.astro` | Panel del piloto: datos e estado de licencia |
| T13 | S6 | `src/pages/piloto/licencia.astro` | Solicitar licencia (documento + fotografía) |
| T14 | S5 | `src/pages/piloto/inscripciones.astro` | Inscripción a evento por búsqueda |
| T15 | S5 | `src/pages/piloto/inscripciones.astro` | Inscripción a evento por código QR |
| T16 | S7, D2 | `src/pages/piloto/licencia-activa.astro` | Licencia activa imprimible (HTML para imprimir) |

Contrato compartido (lo escribe el orquestador, no los workers): `src/lib/types.ts`, `src/lib/store.ts`, `src/lib/seed.ts`, `src/data/site.ts`.

## Log

- **L1** — 2026-11-08 — "Ok, hay que hacer varios cambios, para la pagina inicial, deja calendario, reglamentos, categorias, las noticias de la federación, consultar los clubes, el mapa de las pistas homologados. Ya despues de eso iria el panel administrativo donde como directivo quiero publicas noticias, actualizar el calendario. Como rol de piloto poder registrarme en la plataforma y obtener un identificador unico ligado al documento de identidad. ver estado de la licencia y sus datos, tambien un piloto quiere inscribirse a un evento por busqueda o codigo QR, tambien el piloto podria solicitar su licencia mediante un formulario cargando su documento y fotografia para iniciar la validación. una vez esa licencia este activa poder descargarla como PDF desde el panel de su rol"
- **L2** — 2026-11-08 — Decisiones: D1 login simulado, D2 HTML para imprimir, D3 mapa real Leaflet + OSM.
