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

`js/site.js` elige la calidad según la pantalla:

| Archivo | Uso |
|---|---|
| `v/hero_m1080.mp4` | Móvil en vertical |
| `v/hero_d1080.mp4` | Pantallas de hasta 1920 px reales |
| `v/hero_d1440.mp4` | Hasta 2600 px reales |
| `v/hero_d2160.mp4` | Más de 2600 px (4K, pantallas retina) |
| `v/hero_m.mp4`, `v/hero_d.mp4` | Conexiones lentas o modo de ahorro de datos |

Para comparar calidades a mano: `/?hero=d1080`, `/?hero=d1440`, `/?hero=d2160`, `/?hero=d` (versión ligera), `/?hero=m1080`.

## Transiciones

Fundido entre páginas con View Transitions (`@view-transition` en `site.css`) y precarga al pasar el ratón por un enlace (`<script type="speculationrules">` en cada página). Los navegadores que no lo admiten navegan normal.

## Datos de contacto en el código

- Email: `grupo@iberseeker.net`
- WhatsApp: `+34 634 32 31 62` (en las URLs, `34634323162`)

Si cambian, busca y reemplaza estas dos cadenas en todos los `.html` y en `js/site.js`.
