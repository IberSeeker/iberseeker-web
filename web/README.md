# IberSeeker Visual — Web

Sitio estático en HTML/CSS/JS vanilla. Listo para subir a Vercel sin build.

## Estructura

```
web/
├── index.html          Inicio (hero vídeo + stats + equipo + servicios + CTA)
├── servicios.html      Detalle de los 7 servicios
├── trabajos.html       Galería con filtros
├── packs.html          4 packs + extras
├── contacto.html       Formulario mailto: + WhatsApp
├── styles.css          Sistema de diseño completo
├── app.js              Interacciones (nav, reveal, gallery filters, form)
├── vercel.json         Config de despliegue + headers
├── robots.txt          SEO
├── sitemap.xml         SEO
└── assets/
    ├── logo/           Logo blanco/negro
    ├── services/       Imágenes de cada servicio
    └── brands/         Logos de marcas (Sony, DJI, Matterport...)
```

## Datos de contacto en el código

- Email: `grupo@iberseeker.net`
- WhatsApp: `+34 634 32 31 62` (formateado en URLs como `34634323162`)

Si cambian, busca y reemplaza estas dos cadenas en todos los `.html`.

## Vídeo del hero

Por ahora el hero usa un vídeo demo de Coverr (libre de derechos). Para sustituirlo:

1. Sube tu vídeo propio (formato MP4 H.264, 1080p o 4K, idealmente <8 MB) a la carpeta `assets/`.
   Renómbralo a `assets/hero.mp4`.
2. En `index.html`, busca la línea:
   ```html
   <source src="https://cdn.coverr.co/videos/coverr-luxury-house-tour-9614/1080p.mp4" type="video/mp4" />
   ```
   Y cámbiala por:
   ```html
   <source src="assets/hero.mp4" type="video/mp4" />
   ```
3. (Opcional) cambia el atributo `poster="..."` del `<video>` por una imagen extraída del primer frame.

## Despliegue en Vercel (gratis, 3 minutos)

### Opción A — Drag & drop (la más rápida)

1. Entra en https://vercel.com/new y crea cuenta gratis (Hobby).
2. Pulsa **"Deploy"** y arrastra la carpeta `web/` completa al navegador.
3. Vercel te dará una URL tipo `iberseeker-visual.vercel.app`. Ya está online.

### Opción B — Conectar a GitHub (recomendado a medio plazo)

1. Sube la carpeta `web/` a un repo nuevo en GitHub.
2. En Vercel: **New Project → Import Git Repository → selecciona el repo**.
3. Framework preset: **"Other"**. Output directory: **`./`**.
4. **Deploy**. Cada `git push` desplegará automáticamente.

## Apuntar el dominio iberseeker.com (DonDominio → Vercel)

1. En Vercel: **Project Settings → Domains → Add → `iberseeker.com`** y también `www.iberseeker.com`.
2. Vercel te mostrará los registros DNS exactos. Normalmente:
   - **Tipo `A`** para `iberseeker.com` apuntando a `76.76.21.21`
   - **Tipo `CNAME`** para `www` apuntando a `cname.vercel-dns.com`
3. En DonDominio: **Mis dominios → iberseeker.com → Zona DNS → Editar**.
4. Borra los registros antiguos que apuntan a Wix (A y CNAME).
5. Crea los nuevos según indique Vercel. Guarda.
6. La propagación tarda entre 10 minutos y unas horas. Mientras, la web sigue accesible en la URL `.vercel.app`.
7. Cuando esté propagado, Vercel emite el certificado SSL automáticamente.

> **Tip**: antes de cambiar los DNS, verifica que la nueva web funciona perfectamente en la URL `.vercel.app`. Así Wix sigue activa hasta el último momento.

## Personalización rápida

| Quiero cambiar... | Dónde |
|---|---|
| Colores | `styles.css` → `:root` (variables `--gold`, `--black`, etc.) |
| Tipografía | `styles.css` → `:root` (`--font-body`, `--font-display`) y `<link>` de Google Fonts en cada HTML |
| Textos del hero | `index.html` → bloque `<section class="hero">` |
| Precios | `packs.html` → `.pack-price` y `.extras-grid` |
| Imágenes de servicios | `assets/services/` (mantén el mismo nombre o actualiza la ruta en HTML) |
| Logos de equipamiento | `assets/brands/` |

## Compatibilidad

- Chrome, Safari, Firefox, Edge (últimas 2 versiones)
- iOS 14+, Android 9+
- Responsive desde 360px hasta 1920px+
- `prefers-reduced-motion` respetado
- Lighthouse: optimizada para >90 en performance/SEO/accesibilidad

## Próximos pasos sugeridos

1. Sustituir el vídeo del hero por uno propio.
2. Añadir 6–10 fotos reales de proyectos en `assets/works/` y reemplazar la galería de `trabajos.html`.
3. (Opcional) integrar Plausible/Umami para analítica respetuosa con privacidad.
4. (Opcional) añadir blog o casos de éxito como nuevas páginas HTML.
