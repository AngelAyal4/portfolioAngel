# Plan — FASE 4: About Section

> Fuente: `specs/04-about-section.md`
> Stack verificado: Astro `^7.2.9` + Tailwind CSS v4 (`@tailwindcss/vite ^4.3.3`) + Design System (`src/styles/global.css:1`, `src/components/ui/Badge.astro`, `Section.astro`, `Card.astro`) + Tipografía `Inter/Space Grotesk` (`src/components/ui/Layout.astro:1`).
> Fecha: 2026-08-30

---

## 1. Objetivo

Humanizar el portfolio. Entregables:

- Sección `Sobre mí` con grid 2 col desktop (foto + texto) / 1 col mobile (`04-about-section.md:32`).
- Bio estática (`04-about-section.md:26`): estudiante UTN, +10 años IT → fullstack, React/Node/TS.
- Stack badges vía `Badge.astro` reutilizable: `React, TypeScript, Node.js, Astro, Tailwind, NestJS, PostgreSQL, WordPress` (`04-about-section.md:27`).
- Valor diferencial: `Combino experiencia técnica real con formación académica actualizada.` (`04-about-section.md:28`).
- Foto/avatar con bordes sutiles, `alt` descriptivo, lazy, sin overflow 320px.

Dependencia: Fase 1 (Badge, Section, tokens). Fase 3 (Hero + Navbar + ancla `#sobre-mi`). No requiere WP.

## 2. Estado actual

| Pieza | Estado |
|---|---|
| `src/components/ui/Badge.astro` | `bg-accent/10 text-accent border-accent/20 rounded-full` OK. Reusar sin modificar. |
| `src/components/ui/Section.astro` | `py-16 md:py-24` + `max-w-[1280px]` OK. |
| `src/components/ui/Card.astro` | `bg-surface border-border` OK. No requerido aquí, pero disponible. |
| `src/sections/Hero.astro` | Creado en Fase 3 con `id="inicio"`. |
| `src/sections/About.astro` | **No existe** — crear. |
| `public/avatar.jpg` | **No existe** — crear placeholder o instruir copia. |
| `src/pages/index.astro` | Tras Fase 3: `Navbar + Hero + footer` con comentarios `<!-- FASE 4: <About /> -->`. Editar para insertar. |

## 3. Decisiones técnicas

1. **Layout:** `grid gap-8 md:grid-cols-[320px_1fr] items-start` (foto 320px fija desktop, texto fluido). En mobile `grid-cols-1` apila foto arriba texto. `04-about-section.md:32` pide 2→1 col.
2. **Foto:** `public/avatar.jpg` (usuario pendiente). Si no existe, build no debe fallar: `About.astro` acepta `imageSrc` prop opcional, fallback `https://picsum.photos/seed/angel-avatar/400/400` o `public/avatar-placeholder.svg` local. `img` con `width/height 400`, `loading="lazy" decoding="async"`, `class="rounded-2xl border border-border shadow-sm object-cover aspect-square"` + `alt="Retrato de Angel José Luis Ayala, desarrollador fullstack"`.
3. **Badges:** `div flex flex-wrap gap-2` con 8 `Badge`. Sin hardcodear colores, solo `Badge` del DS.
4. **Bio:** 3 párrafos: `Estudiante de Ingeniería de Sistemas (UTN). +10 años en soporte/IT transitando a desarrollo fullstack.` + `Enfocado en aplicaciones web modernas con React, Node.js y TypeScript.` + `Combino experiencia técnica...` en `p text-base leading-relaxed text-text-muted` + `strong text-text` para diferencial.
5. **Accesibilidad:** `Section id="sobre-mi" aria-labelledby="sobre-mi-heading"`, `h2 id="sobre-mi-heading"`, `ul` para badges con `li`, `alt` descriptivo, `scroll-mt-16` para navbar sticky.
6. **Estilo:** `h2` `font-display text-2xl font-bold text-text`, espaciado generoso `py-16 md:py-24` ya en `Section`.

## 4. Archivos y código exacto

| Acción | Archivo |
|---|---|
| CREAR | `src/sections/About.astro` |
| CREAR | `public/avatar-placeholder.svg` (opcional fallback) |
| COPIAR | `public/avatar.jpg` — manual por usuario (si no, fallback) |
| EDITAR | `src/pages/index.astro` — insertar `<About />` tras `<Hero />` |
| NO TOCAR | `src/styles/global.css`, `src/components/ui/*`, `astro.config.mjs` |

### 4.1 `src/sections/About.astro`

```astro
---
import Section from "../components/ui/Section.astro";
import Badge from "../components/ui/Badge.astro";

interface Props {
  imageSrc?: string;
  imageAlt?: string;
}

const {
  imageSrc = "/avatar.jpg",
  imageAlt = "Retrato de Angel José Luis Ayala, desarrollador fullstack",
} = Astro.props;

const stack = ["React", "TypeScript", "Node.js", "Astro", "Tailwind", "NestJS", "PostgreSQL", "WordPress"];
---

<Section id="sobre-mi" class="scroll-mt-16" aria-labelledby="sobre-mi-heading">
  <div class="mx-auto max-w-[1280px]">
    <h2 id="sobre-mi-heading" class="font-display text-2xl md:text-3xl font-bold text-text">Sobre mí</h2>

    <div class="mt-8 grid gap-8 md:grid-cols-[320px_1fr] md:items-start">
      <!-- Foto -->
      <div class="mx-auto w-full max-w-[320px] md:mx-0">
        <img
          src={imageSrc}
          alt={imageAlt}
          width="400"
          height="400"
          loading="lazy"
          decoding="async"
          class="aspect-square w-full rounded-2xl border border-border bg-surface object-cover shadow-sm"
          onerror="this.onerror=null;this.src='https://picsum.photos/seed/angel-avatar/400/400'"
        />
        <p class="mt-3 text-center text-xs text-text-muted md:text-left">UTN — Ingeniería en Sistemas · En curso</p>
      </div>

      <!-- Texto -->
      <div class="flex flex-col gap-4">
        <p class="text-base leading-relaxed text-text-muted">
          Estudiante de <strong class="font-semibold text-text">Ingeniería de Sistemas de Información (UTN)</strong> con más de 10 años en soporte e infraestructura IT, en transición a desarrollo fullstack.
        </p>
        <p class="text-base leading-relaxed text-text-muted">
          Enfocado en aplicaciones web modernas con <strong class="font-semibold text-text">React, Node.js y TypeScript</strong>. Trabajo de la idea al deploy: diseño, código, tests y CI/CD.
        </p>
        <p class="text-base leading-relaxed text-text">
          <em class="not-italic font-medium text-accent">Combino experiencia técnica real con formación académica actualizada.</em>
        </p>

        <div class="mt-2">
          <h3 class="text-sm font-semibold tracking-wide text-text uppercase">Stack principal</h3>
          <ul class="mt-3 flex flex-wrap gap-2" aria-label="Tecnologías principales">
            {stack.map((tech) => (
              <li><Badge>{tech}</Badge></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
</Section>
```

Notas: `onerror` inline fallback a `picsum` si `/avatar.jpg` falta (sin romper build). `scroll-mt-16` compensa navbar sticky Fase 3. `Badge` siempre vía DS. `Section` ya aporta `py-16`.

### 4.2 `public/avatar-placeholder.svg` (fallback opcional)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="Avatar placeholder">
  <rect width="400" height="400" fill="#1e293b"/>
  <circle cx="200" cy="150" r="60" fill="#22d3ee" opacity="0.3"/>
  <path d="M100 320 Q200 250 300 320 Z" fill="#22d3ee" opacity="0.2"/>
  <text x="200" y="360" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="14">avatar.jpg pendiente</text>
</svg>
```

Usuario debe reemplazar con foto real `public/avatar.jpg` (400×400, JPG/WebP, <200KB).

### 4.3 `src/pages/index.astro` — patch

Tras Fase 3, `index.astro` tiene `Navbar + Hero`. Añadir:

```astro
---
import Layout from "../components/ui/Layout.astro";
import Navbar from "../components/Navbar.astro";
import Hero from "../sections/Hero.astro";
import About from "../sections/About.astro";
---

<Layout title="Angel Ayala — Desarrollador Fullstack">
  <Navbar />
  <main>
    <Hero />
    <About />
    <!-- FASE 5: <Proyectos /> -->
    <!-- FASE 6: <CV /> -->
    <!-- FASE 7: <Contacto /> -->
  </main>
  <footer>...</footer>
</Layout>
```

## 5. Orden de ejecución

1. Crear `public/avatar-placeholder.svg` (§4.2) o verificar `public/avatar.jpg` existe (`ls public/`)
2. Crear `src/sections/About.astro` (§4.1)
3. Editar `src/pages/index.astro` (§4.3) — insertar `About`
4. Verificar §6

## 6. Criterios de verificación

### 6.1 Automática

```bash
npm run check && npm run build
rg -n "#[0-9a-fA-F]{3,8}" src/sections/About.astro  # vacío
rg -n "Badge" src/sections/About.astro  # debe aparecer 1 import + 8 usos
ls -lh public/avatar.jpg public/avatar-placeholder.svg  # al menos placeholder existe
```

### 6.2 Manual

| # | Prueba | Esperado |
|---|---|---|
| 1 | 1280px | Foto 320px izquierda, texto derecha, `h2` 36px, badges en fila wrap |
| 2 | 320px | Foto arriba (max 320px centrada), texto abajo, sin overflow horizontal |
| 3 | Sin `public/avatar.jpg` | `onerror` carga `picsum` sin broken image, `alt` sigue descriptivo |
| 4 | Dark/light toggle | `text-text/text-muted` y `border-border` adaptan, badges `bg-accent/10` legibles |
| 5 | Click nav `Sobre mí` | Scroll suave a `#sobre-mi` con `scroll-mt-16` (no queda tapado por navbar) |
| 6 | Tab + screen reader | `h2` con `aria-labelledby`, `ul aria-label`, `alt` no vacío, focus visible |

### 6.3 Checklist spec `04-about-section.md:47`

- [ ] Foto + bio apilan correctamente en mobile
- [ ] Badges usan `Badge` del DS
- [ ] Texto legible en ambos modos
- [ ] Sin overflow en 320px
- [ ] `alt` descriptivo

## 7. Fuera de alcance

- Hero (Fase 3), Proyectos (Fase 5), CV (Fase 6), Contacto (Fase 7), Deploy (Fase 8)
- Consumir avatar desde WP (v1 estático en `public/`)
- Animaciones complejas — solo `Section` padding + `Badge` hover nativo

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Usuario no provee `avatar.jpg` | Fallback `picsum` + `avatar-placeholder.svg`, `onerror` sin crash |
| Imagen 400×400 pesada (>500KB) | Documentar optimizar (<200KB, WebP), `loading="lazy"` |
| Duplicar `h1` | `About` usa `h2`, `h1` solo en `Hero.astro` |

## 9. Estado

**PLAN GENERADO (2026-08-30) — pendiente de ejecución.** Próximo: Fase 5 (CORE).
