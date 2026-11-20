# IberSeeker Visual — Web

Sitio estático en HTML, CSS y JavaScript sin dependencias. Vercel lo publica tal cual, sin build.

## Estructura

```
web/
├── index.html        Inicio: vídeo de portada, cifras con fuentes, caminos, trabajos, clientes, equipamiento
├── servicios.html    Los 7 servicios (#foto, #video, #dron, #dron-fpv, #tour, #plano, #certificado) y #extras
├── trabajos.html     Galerías (#trabajos-foto, #trabajos-dron, #trabajos-fpv)
├── packs.html        Packs, extras, resumen y pedido por WhatsApp
├── contacto.html     Datos y formulario que abre WhatsApp
├── 404.html
├── css/site.css      Estilos compartidos
├── js/site.js        Menú, vídeos, cifras, galerías, packs y formulario
├── fonts/            Cormorant Garamond e Inter (alojadas aquí, sin Google Fonts)
├── img/  v/          Imágenes y vídeos en uso
├── vercel.json       URLs limpias y cabeceras
├── robots.txt  sitemap.xml
```

## Vídeo de portada

`js/site.js` elige la versión:

| Archivo | Uso |
|---|---|
| `v/hero_d2160.mp4` | Ordenador y tableta (4K, decisión del 20/11/2026) |
| `v/hero_d1440.mp4` | Red de seguridad: si un equipo pierde más del 15 % de los fotogramas con el 4K, cambia a esta |
| `v/hero_m1080.mp4` | Móvil en vertical (1080×1920) |
| `v/hero_d.mp4`, `v/hero_m.mp4` | Conexiones lentas o modo de ahorro de datos |

Para probar una versión a mano: `/?hero=d2160`, `/?hero=d1440`, `/?hero=d` (ligera), `/?hero=m1080`.

## Transiciones

Fundido entre páginas con View Transitions (`@view-transition` en `site.css`) y precarga al pasar el ratón por un enlace (`<script type="speculationrules">` en cada página). Los navegadores que no lo admiten navegan normal.

## Datos de contacto en el código

- Email: `grupo@iberseeker.net`
- WhatsApp: `+34 634 32 31 62` (en las URLs, `34634323162`)

Si cambian, busca y reemplaza estas dos cadenas en todos los `.html` y en `js/site.js`.
