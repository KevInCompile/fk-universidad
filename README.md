# Federación de Kartismo

Prototipo web (Astro + Tailwind v4) de la federación de kartismo: home pública, panel
administrativo para directiva y portal para pilotos.

## Alcance actual

Prototipo del trabajo de la Federación de Kartismo. Hoy cubre la home pública, el
panel de directiva, el portal del piloto y la consulta pública de licencias, sin
backend: los datos viven en `localStorage`.

Códigos de prueba: `FK-2027-KHT6C4` (Valentina Ríos), `LIC-SEM01` (licencia
vigente), `LIC-SEM02` (suspendida) y `LIC-SEM03` (vencida).

## Qué incluye

- **Home** (`/`) — hero, ticker del calendario, calendario de la temporada, pistas
  homologadas con mapa real (Leaflet + OpenStreetMap), categorías, reglamentos,
  noticias de la federación y consulta de clubes. La sección de escuelas queda
  comentada en `src/pages/index.astro` a pedido del usuario.
- **Calendario completo** (`/calendario`) — grilla de las rondas de la temporada, leída
  del mismo estado que la home (los cambios del panel de directiva se reflejan).
- **Panel de directiva** (`/admin`) — publicar/editar/borrar noticias, actualizar el
  calendario de rondas, validar solicitudes de licencia y consultar el listado de
  personas inscritas por evento (`/admin/inscripciones`, con buscador y conteo por
  categoría).
- **Consulta pública de licencias** (`/verificar`) — pantalla abierta al público para
  verificar la autenticidad de una licencia: se escanea el QR del carné con la cámara
  (o se escribe el número) y se ve nombre, fotografía, categoría y estado (vigente,
  vencida o suspendida). No expone documento ni correo.
- **Portal del piloto** (`/piloto`) — registro con identificador único ligado al
  documento de identidad y con la categoría en la que compite, estado y datos de la
  licencia, solicitud de licencia con documento y fotografía, inscripción a eventos por
  búsqueda o por código QR, y licencia activa lista para imprimir.

## Decisiones del prototipo

- **Acceso simulado**: no hay base de datos ni backend de autenticación. La sesión y
  los datos viven en `localStorage` y se reinician si se borra el almacenamiento local
  del navegador.
- **Licencia**: se genera una vista HTML optimizada para imprimir; el PDF se obtiene
  con "Imprimir → Guardar como PDF" del navegador.
- **Mapa**: Leaflet con teselas de OpenStreetMap y las coordenadas aproximadas de cada
  complejo homologado.
- **Idioma**: registro neutro (usted) en toda la interfaz: "Seleccione", "Cargue",
  "Ingrese", "Guarde", "Descargue", "Revise", "Apruebe o rechace".
- **Licencias**: al aprobarlas, la directiva fija la vigencia hasta el cierre de la
  temporada; una licencia suspendida por la directiva sigue visible en la consulta
  pública, pero con estado "Suspendida".
- **Almacenamiento**: todo el estado vive en `localStorage` (~5 MB). Las fotografías se
  reducen a un thumbnail de 480 px antes de guardarse; si la cuota se llena, se
  descartan las previsualizaciones y se reintenta una vez antes de avisar por pantalla.

## Comandos

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build estático en dist/
npm run preview  # sirve el build
npm test         # pruebas unitarias (vitest)
```

## Estructura

```
src/
  data/site.ts          datos semilla (pistas, rondas, categorías, clubes, reglamentos, noticias)
  lib/types.ts          tipos de dominio
  lib/id.ts             identificador único de piloto (derivado del documento)
  lib/store.ts          estado en localStorage + operaciones de dominio
  lib/guard.ts          guardas de sesión por rol
  lib/licencia.ts       estado público de una licencia y código de verificación
  components/           header, footer, mapa y piezas de cada sección
  pages/                home, stubs públicos, /verificar, /login, /admin/**, /piloto/**
```

La especificación del trabajo en curso vive en `odd/tasks/federacion-kartismo.md`.
