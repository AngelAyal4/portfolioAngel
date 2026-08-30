# Plan — FASE 3: Hero Section

> Fuente: `specs/03-hero-section.md`
> Stack verificado: Astro `^7.2.9` + Tailwind CSS v4 (`@tailwindcss/vite ^4.3.3`, CSS-first) + `@astrojs/react ^6.0.4` + adapter Vercel `output:'static'` (`astro.config.mjs:6`) + Design System Fase 1 (`src/styles/global.css:1`, `src/components/ui/*`).
> Fecha: 2026-08-30

---

## 1. Objetivo

Primer impacto visual (reclutador decide en <30s si sigue). Entregables:

- Hero `min-h-[100dvh]` centrado vertical/horizontal, tipografía display grande (48–64px escala `global.css:24-27`), fondo sutil gradiente.
- Contenido estático: `Angel José Luis Ayala` + `Desarrollador Fullstack | Est. Ingeniería de Sistemas` + tagline `Construyo aplicaciones web modernas, de la idea al deploy.` (`03-hero-section.md:24-28`).
- CTAs `Button` primary `Ver Proyectos → #proyectos` + secondary `Contacto → #contacto` con scroll suave.
- Scroll indicator sutil (`ScrollIndicator.astro`).
- `Navbar.astro` sticky con anclas + `ThemeToggle`.
- Animación fade-in no bloqueante con `prefers-reduced-motion` (`global.css:86`).

Dependencia: Fase 1 (`src/styles/global.css`, `Layout.astro`, `Button.astro`, `Section.astro`). No requiere Fase 2.

## 2. Estado actual verificado

| Pieza | Estado |
|---|---|
| `src/styles/global.css:1` | Tokens light/dark, `@theme inline`, escala `xs-4xl`, `prefers-reduced-motion` OK. No tocar. |
| `src/components/ui/Layout.astro` | Anti-FOUC `is:inline` script `data-theme`, fuentes `@fontsource-variable/*`. No tocar. |
| `src/components/ui/Button.astro` | Variants `primary/secondary`, soporta `href` → `<a>` o `<button>`. Reusar. |
| `src/components/ui/Section.astro` | `py-16 md:py-24` + `max-w-[1280px] px-4 sm:px-6 lg:px-8`. Reusar. |
| `src/components/ui/ThemeToggle.astro` | Vanilla toggle + `localStorage` + `theme-change` event. Reusar en Navbar. |
| `src/pages/index.astro:1` | Harness Fase 1 (tipografía/badges/cards/demo). **Reemplazar incrementalmente** en esta fase por `Navbar + Hero`. |
| `src/sections/` | **No existe** — crear. |
| `src/components/Navbar.astro` / `ScrollIndicator.astro` | No existen — crear. |

## 3. Decisiones técnicas

1. **Altura:** `min-h-[100dvh]` (dynamic viewport) en vez de `100vh` para evitar bug barra móvil iOS. Centrado con `flex items-center justify-center`. `03-hero-section.md:32` pide `100vh`, `dvh` es superset compatible.
2. **Scroll suave:** `html { scroll-behavior: smooth }` en `global.css:57` + `scroll-margin-top` en secciones ancladas para compensar navbar sticky. Si `prefers-reduced-motion:reduce` se desactiva smooth (respeta `global.css:86`).
3. **Tipografía:** `h1` único por página (SEO, `03-hero-section.md:55`), `text-3xl (48px) md:text-4xl (64px) font-display font-bold`. Tagline `text-lg md:text-xl text-text-muted`. Nunca hex, solo `text-text/accent` tokens.
4. **Fondo sutil:** `bg-gradient-to-b from-accent/5 via-transparent to-transparent` + `bg-bg`. Nada cargado, respeta `03-hero-section.md:36`.
5. **Animación:** `animate-fadeIn` custom `@keyframes fadeIn {from{opacity:0;translate:0 8px} to{opacity:1;translate:0 0}}` con `motion-reduce:animate-none` y `opacity` inicial para no bloquear lectura.
6. **Navbar:** Nuevo `src/components/Navbar.astro` sticky `top-0 z-10 border-b border-border bg-bg/80 backdrop-blur`. Links `a[href="#sobre-mi|#proyectos|#cv|#contacto"]` con `hover:text-accent`. `ThemeToggle` a la derecha. `aria-label="Navegación principal"` en `nav`.
7. **CTAs:** `Button href="#proyectos" variant="primary"` y `href="#contacto" variant="secondary"`. Sin JS, ancla nativa.

## 4. Archivos y código exacto

| Acción | Archivo |
|---|---|
| CREAR | `src/components/Navbar.astro` |
| CREAR | `src/components/ScrollIndicator.astro` |
| CREAR | `src/sections/Hero.astro` |
| EDITAR | `src/styles/global.css` — añadir `scroll-behavior` + `scroll-margin` + `keyframes` |
| REEMPLAZAR | `src/pages/index.astro` — harness → `Layout + Navbar + Hero` (+ placeholders comentarios para Fases 4-7) |
| NO TOCAR | `astro.config.mjs`, `package.json`, `src/lib/*`, `src/pages/api/revalidate.ts` |

### 4.1 `src/components/Navbar.astro`

```astro
---
import ThemeToggle from "./ui/ThemeToggle.astro";

interface Props {
  class?: string;
}
const { class: className } = Astro.props;
---

<header class:list={["sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60", className]}>
  <div class="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
    <a href="#inicio" class="font-display text-base font-bold text-text hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded">
      Angel Ayala
    </a>

    <nav aria-label="Navegación principal" class="hidden items-center gap-6 md:flex">
      <a href="#sobre-mi" class="text-sm font-medium text-text-muted hover:text-accent transition-colors">Sobre mí</a>
      <a href="#proyectos" class="text-sm font-medium text-text-muted hover:text-accent transition-colors">Proyectos</a>
      <a href="#cv" class="text-sm font-medium text-text-muted hover:text-accent transition-colors">CV</a>
      <a href="#contacto" class="text-sm font-medium text-text-muted hover:text-accent transition-colors">Contacto</a>
    </nav>

    <div class="flex items-center gap-2">
      <ThemeToggle />
      <!-- Mobile: detalles/summary alternativo se añadirá en Fase 3 si se requiere, por ahora solo toggle -->
    </div>
  </div>

  <!-- Mobile nav simple (sin JS) -->
  <nav aria-label="Navegación móvil" class="flex items-center justify-center gap-4 border-t border-border px-4 py-2 md:hidden">
    <a href="#sobre-mi" class="text-xs font-medium text-text-muted hover:text-accent">Sobre mí</a>
    <a href="#proyectos" class="text-xs font-medium text-text-muted hover:text-accent">Proyectos</a>
    <a href="#cv" class="text-xs font-medium text-text-muted hover:text-accent">CV</a>
    <a href="#contacto" class="text-xs font-medium text-text-muted hover:text-accent">Contacto</a>
  </nav>
</header>
```

Notas: `ThemeToggle` ya maneja `id="theme-toggle"` único; solo una instancia por página (navbar). Mobile nav usa links sin JS para simplicidad.

### 4.2 `src/components/ScrollIndicator.astro`

```astro
---
interface Props {
  href?: string;
  class?: string;
}
const { href = "#sobre-mi", class: className } = Astro.props;
---

<a
  href={href}
  aria-label="Desplazarse a la siguiente sección"
  class:list={[
    "inline-flex flex-col items-center gap-1 text-text-muted hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-lg p-2 motion-reduce:animate-none",
    "animate-bounce",
    className,
  ]}
>
  <span class="text-xs font-medium tracking-wide">Scroll</span>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
</a>
```

Respeta `prefers-reduced-motion` vía `motion-reduce:animate-none` (Tailwind v4 usa `global.css:86`).

### 4.3 `src/sections/Hero.astro`

```astro
---
import Section from "../components/ui/Section.astro";
import Button from "../components/ui/Button.astro";
import ScrollIndicator from "../components/ScrollIndicator.astro";
---

<Section id="inicio" class="min-h-[100dvh] flex items-center justify-center py-16 md:py-24 scroll-mt-16">
  <div class="mx-auto max-w-[1280px] w-full">
    <div class="flex flex-col items-center text-center">
      <!-- Fondo sutil gradiente (capa decorativa, no interfiere) -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 via-transparent to-transparent"></div>

      <p class="animate-fadeIn text-sm font-medium tracking-widest text-accent uppercase motion-reduce:animate-none" style="animation-delay: 0ms">
        Hola, soy Angel
      </p>

      <h1 class="animate-fadeIn mt-3 font-display text-3xl md:text-4xl font-bold leading-tight text-text motion-reduce:animate-none" style="animation-delay: 80ms">
        Desarrollador Fullstack
        <span class="block text-text-muted font-normal text-lg md:text-xl mt-2 font-body">Est. Ingeniería de Sistemas</span>
      </h1>

      <p class="animate-fadeIn mt-4 max-w-2xl text-base md:text-lg text-text-muted leading-relaxed motion-reduce:animate-none" style="animation-delay: 160ms">
        Construyo aplicaciones web modernas, de la idea al deploy.
      </p>

      <div class="animate-fadeIn mt-8 flex flex-wrap items-center justify-center gap-3 motion-reduce:animate-none" style="animation-delay: 240ms">
        <Button href="#proyectos" variant="primary" ariaLabel="Ver proyectos">Ver Proyectos</Button>
        <Button href="#contacto" variant="secondary" ariaLabel="Ir a contacto">Contacto</Button>
      </div>

      <div class="animate-fadeIn mt-12 motion-reduce:animate-none" style="animation-delay: 320ms">
        <ScrollIndicator />
      </div>
    </div>
  </div>
</Section>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out both;
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-fadeIn { animation: none !important; }
  }
</style>
```

Notas: `Section` ya aporta `mx-auto max-w-[1280px] px-4`, pero Hero necesita centrado extra + `min-h-[100dvh]`. `scroll-mt-16` compensa navbar sticky al navegar por ancla. `h1` único, tagline en `p`.

### 4.4 `src/styles/global.css` — patch

Añadir al final de `global.css:57` (dentro de `html {}` y tras `scrollbar-gutter`):

```css
html {
  scrollbar-gutter: stable;
  scroll-behavior: smooth;
  scroll-padding-top: 5rem; /* navbar sticky */
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

No requiere `@keyframes` global porque Hero lo encapsula en `<style>` scoped.

### 4.5 `src/pages/index.astro` — reemplazo

```astro
---
import Layout from "../components/ui/Layout.astro";
import Navbar from "../components/Navbar.astro";
import Hero from "../sections/Hero.astro";
---

<Layout title="Angel Ayala — Desarrollador Fullstack">
  <Navbar />
  <main>
    <Hero />
    <!-- FASE 4: <About /> -->
    <!-- FASE 5: <Proyectos /> -->
    <!-- FASE 6: <CV /> -->
    <!-- FASE 7: <Contacto /> -->
  </main>

  <footer class="border-t border-border py-6">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <p class="text-center text-xs text-text-muted">© {new Date().getFullYear()} Angel Ayala — Portfolio</p>
    </div>
  </footer>
</Layout>
```

Elimina harness Fase 1 (`Section` demo). Footer mínimo persiste.

## 5. Orden de ejecución `opencode build`

1. Crear `src/components/Navbar.astro` (§4.1)
2. Crear `src/components/ScrollIndicator.astro` (§4.2)
3. Crear `src/sections/Hero.astro` (§4.3)
4. Parchear `src/styles/global.css` (§4.4) — añadir `scroll-behavior` + `scroll-padding-top`
5. Reemplazar `src/pages/index.astro` (§4.5)
6. Verificar §6

## 6. Criterios de verificación

### 6.1 Automática

```bash
npm run check  # 0 errors
npm run build  # dist/index.html con <h1>Angel, href="#proyectos" y "#contacto"
rg -n "#[0-9a-fA-F]{3,8}" src/sections src/components/Navbar.astro src/components/ScrollIndicator.astro
# → vacío (solo global.css tiene hex)
rg -n "min-h-\[100dvh\]" src/sections/Hero.astro
```

### 6.2 Manual

| # | Prueba | Esperado |
|---|---|---|
| 1 | Desktop 1280px | Hero ocupa ≥100dvh, centrado vert/horiz, `h1` 64px (`text-4xl`), CTAs lado a lado |
| 2 | 320px | `h1` legible sin overflow, CTAs hacen wrap, nav móvil visible, scroll indicator centrado |
| 3 | Click `Ver Proyectos` | Scroll suave a `#proyectos` (placeholder Fase 5) sin salto brusco, `scroll-margin` compensa navbar |
| 4 | Click `Contacto` | Scroll a `#contacto` |
| 5 | Tab navigation | Focus ring acento en logo, links nav, ambos botones, scroll indicator |
| 6 | `prefers-reduced-motion: reduce` (DevTools Rendering → Emulate) | Sin `fadeIn` ni `bounce` |
| 7 | Lighthouse a11y | `h1` presente, `nav aria-label`, `aria-label` en scroll indicator |

### 6.3 Checklist spec `03-hero-section.md:49`

- [ ] Ocupa al menos 100vh en desktop (`100dvh`)
- [ ] Tagline + nombre legibles en 320px
- [ ] Ambos CTAs funcionales (scroll a secciones)
- [ ] Sin overflow horizontal en mobile
- [ ] Animación no bloquea lectura (`prefers-reduced-motion`)
- [ ] Accesible: `h1` presente, `aria-label` si iconos

## 7. Fuera de alcance

- `About`, `Proyectos`, `CV`, `Contacto` (Fases 4–7)
- Lógica WPGraphQL (Fase 2, ya planificada) y consumo en Hero (no aplica, contenido estático)
- Animaciones complejas con librerías (Framer Motion) — solo CSS nativo
- Navbar con menú hamburguesa JS (v1 usa links visibles, sin JS)

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| `100dvh` no soportado en navegador viejo | Fallback `min-h-screen` no crítico; `dvh` es progresivo |
| Ancla `#proyectos` no existe aún (Fase 5) | Scroll llega a footer sin error; se documenta como placeholder |
| Duplicar `ThemeToggle` id si se usa en footer | Solo una instancia en `Navbar` en Fase 3; footer usa texto sin toggle |

## 9. Estado

**PLAN GENERADO (2026-08-30) — pendiente de ejecución.** Próximo: Fase 4.
