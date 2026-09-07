# Plan — FASE 9: Azul Oscuro Nocturno + PCB Fondo

> Fuente: `specs/09-dark-blue-pcb.md` (depende de `specs/01-design-system.md`)
> Stack verificado: Astro `^7.2.9` + Tailwind CSS v4 (`@tailwindcss/vite ^4.3.3`, CSS-first, sin `tailwind.config.js`) + React `@astrojs/react ^6.0.4` + adapter Vercel `output: 'static'` (`astro.config.mjs:6`) + tokens en `src/styles/global.css:1`.
> Fecha: 2026-08-30

---

## 1. Objetivo

Migrar la paleta vigente (cyan `#22d3ee` / `#0891b2` sobre `#f8fafc`/`#0f172a`) a **azul oscuro nocturno** + añadir **animación PCB** de fondo sutil sin competir con el contenido. Entregables:

- `global.css` con tokens light/dark reemplazados por la paleta §2 de `09-dark-blue-pcb.md` (light `#f0f4f8`/`#2b6cb0`, dark `#0a0e1a`/`#4299e1`), solo espectro azul, sin cyan/teal/verde.
- `BackgroundPCB.astro` nuevo (`src/components/BackgroundPCB.astro:1`) — SVG con ~16-20 paths tipo pistas + nodos, opacidad 0.05–0.12, barrido vertical luminoso `pcb-sweep` solo con `transform`/`opacity`, `prefers-reduced-motion` respeta, fijo al viewport `z-index -1`.
- `index.astro` integra `<BackgroundPCB />` detrás de todo.
- Todos los componentes UI (`Button.astro:1`, `Card.astro:1`, `Badge.astro:1`, `Navbar.astro:1`, `Hero.astro:1`, etc.) siguen funcionando sin pérdida de jerarquía ni hex hardcodeado fuera de `global.css`.

---

## 2. Estado actual del repo (verificado 2026-08-30)

| Pieza | Estado |
|---|---|
| `src/styles/global.css:30` | Paleta light `#f8fafc` / `#0891b2` y dark `#0f172a` / `#22d3ee` — **REEMPLAZAR tokens** |
| `src/components/ui/Layout.astro:1` | Layout raíz con anti-FOUC `data-theme` + fuentes. **No tocar** |
| `src/components/ui/Button.astro:1`, `Badge.astro:1`, `Card.astro:1`, `Input.astro:1`, `Section.astro:1`, `ThemeToggle.astro:1` | Consumen solo `text-accent`, `bg-surface`, `border-border`, etc. — **No tocar**, validarán contra nueva paleta |
| `src/components/Navbar.astro:1`, `src/sections/Hero.astro:1`, `src/sections/About.astro:1`, `src/sections/Proyectos.astro:1`, `src/sections/CV.astro:1`, `src/sections/Contacto.astro:1` | Secciones existentes. **No tocar** salvo `index.astro` |
| `src/pages/index.astro:1` | `Layout + Navbar + Hero + About + Proyectos + CV + Contacto` — **EDITAR para inyectar BackgroundPCB** |
| `src/components/BackgroundPCB.astro` | **No existe** — CREAR |
| `tailwindcss v4` | `@theme inline` mapea `--token-*` → `bg-bg`, `text-accent`, etc. — **No tocar mapping, solo valores** |
| `rg -n "#[0-9a-fA-F]{3,8}" src/components src/sections src/pages` | Hoy solo retorna `global.css` — debe seguir vacío fuera de `global.css` tras el cambio |

> Si se borra `src/styles/global.css` y `src/components/BackgroundPCB.astro`, ejecutando §4 se reconstruye la fase completa.

---

## 3. Decisiones técnicas (aprobadas)

1. **Tokens — reemplazo directo, sin renombrar variables.** El mapping `@theme inline` (`src/styles/global.css:5`) permanece idéntico (`--color-bg: var(--token-bg)` etc.). Solo cambian los hex de `--token-*`. Así `bg-bg`, `text-accent`, `border-border`, `bg-accent/10` etc. reaccionan en runtime sin rebuild de utilidades. Único archivo con hex sigue siendo `global.css`.

2. **Paleta exacta (spec §Paleta):**
   | Token | Light | Dark | Ratio AA (calculado) | Nota |
   |---|---|---|---|---|
   | `--token-bg` | `#f0f4f8` (azul grisáceo claro) | `#0a0e1a` (azul noche, reemplaza `#0f172a`) | text `#1a202c`/`#e2e8f0` → 14.76 / 15.62 | Fondo base |
   | `--token-surface` | `#ffffff` | `#131b2e` | text sobre surface 16.32 / 13.92 | Card/input surface |
   | `--token-text` | `#1a202c` | `#e2e8f0` | — | Body |
   | `--token-text-muted` | `#4a5568` | `#8899aa` | sobre bg 6.81 / 6.59 | Secundario |
   | `--token-accent` | `#2b6cb0` (azul profundo) | `#4299e1` (azul eléctrico) | sobre bg 4.90 / 6.30; sobre accent `#ffffff`/`#0a0e1a` → 5.42 / 6.30 | Interactivo, reemplaza cyan |
   | `--token-accent-hover` | `#2c5282` | `#63b3ed` | hover más oscuro/claro | Hover |
   | `--token-border` | `#cbd5e0` | `#1e293b` | decorativo | Borde por defecto |
   | `--token-on-accent` | `#ffffff` | `#0a0e1a` | — | Texto sobre accent |

   Todos los pares text/bg superan WCAG AA 4.5:1 (verificados con luminancia, build logs §6). No usar cyan/teal/verde — solo espectro azul. Bordes `light #cbd5e0` / `dark #1e293b` por spec Notas. Estado `disabled`: `opacity 0.4` sin cambio de color (ya en `Button.astro` via `disabled:opacity-50`, se documenta pero no se cambia token).

3. **Sin color accent genérico — azul es el acento.** No se introduce token nuevo ni se renombra `--token-accent`. El nombre se conserva por compatibilidad; su valor pasa a azul. Regla de componentes: nunca hardcodear `#22d3ee`/`#0891b2`/`#0f172a` etc., usar siempre `var(--token-accent)`.

4. **Animación PCB — SVG hardcodeado, no canvas, no generador dinámico.** ~16-18 `<path>` + ~12 nodos `<circle>`/`<rect>` que simulan pistas y pads. `stroke="var(--token-accent)" stroke-width="0.5" fill="none" opacity="0.08"` y nodos `fill="var(--token-accent)" opacity="0.12"` — dentro del rango 0.05–0.12 del spec. `preserveAspectRatio="none"` para cubrir `inset-0 h-full w-full` sin recalcular viewBox por breakpoint. Misma densidad en mobile (spec Notas). `aria-hidden="true"` y `pointer-events-none`.

5. **Barrido luminoso — solo `transform` + `opacity` (GPU).** `<div class="absolute inset-0 animate-pcb-sweep bg-gradient-to-b from-transparent via-accent/[0.07] to-transparent">` con keyframe `pcb-sweep { 0% translateY(-100%) opacity 0 → 10% opacity1 → 90% opacity1 → 100% translateY(100%) opacity0 }` duración `10s ease-in-out infinite`. No usa `top`/`left`/`width` → GPU-accelerated. El gradiente usa `via-accent/[0.07]` (7% opacidad) dentro del rango decorativo.

6. **`prefers-reduced-motion` — desactivar.** `@media (prefers-reduced-motion: reduce) { .animate-pcb-sweep { animation: none !important; opacity: 0; } }` además del reset global ya en `src/styles/global.css:90` (que pone `animation-duration 0.01ms`). Se añade regla específica para ocultar el sweep completamente (`opacity:0`), no solo pausarlo.

7. **Fijo al viewport, detrás de todo.** Contenedor `pointer-events-none fixed inset-0 -z-10 overflow-hidden` — cubre viewport, no bloquea clicks, detrás de `Navbar z-20` y contenido. Se inyecta en `src/pages/index.astro:11` dentro de `<Layout>` antes de `<Navbar />` (spec §Integración). Alternativa `Layout.astro` se descarta para respetar spec literal; si en el futuro se añaden más páginas, mover a `Layout.astro` es trivial (1 línea).

8. **Scope CSS — keyframes en `global.css`, no scoped.** `pcb-sweep` vive en `global.css` junto a tokens para que `BackgroundPCB.astro` no necesite `<style is:global>`. El componente solo referencia la clase `animate-pcb-sweep`. Mantener `html { scrollbar-gutter: stable; scroll-behavior: smooth }` existente.

---

## 4. Archivos y código exacto

| Acción | Archivo | Descripción |
|---|---|---|
| EDITAR | `src/styles/global.css` | Reemplazar valores de `--token-*` (§4.1) + añadir `@keyframes pcb-sweep` y `.animate-pcb-sweep` |
| CREAR | `src/components/BackgroundPCB.astro` | SVG + sweep (§4.2) |
| EDITAR | `src/pages/index.astro` | Importar e insertar `<BackgroundPCB />` (§4.3) |
| NO TOCAR | `src/components/ui/*`, `src/components/Navbar.astro`, `src/sections/*`, `src/lib/*`, `astro.config.mjs`, `package.json` | Consumen tokens, validan nueva paleta |

### 4.1 `src/styles/global.css` — patch

Solo cambian los bloques `:root, [data-theme="light"]` y `[data-theme="dark"]` y se añade keyframe al final. El resto del archivo permanece idéntico.

```css
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

/* === Design Tokens === */
@theme inline {
  --color-bg: var(--token-bg);
  --color-surface: var(--token-surface);
  --color-text: var(--token-text);
  --color-text-muted: var(--token-text-muted);
  --color-accent: var(--token-accent);
  --color-accent-hover: var(--token-accent-hover);
  --color-border: var(--token-border);
  --color-on-accent: var(--token-on-accent);

  --font-display: "Space Grotesk Variable", system-ui, sans-serif;
  --font-body: "Inter Variable", system-ui, -apple-system, sans-serif;

  /* Escala modular 12/16/20/28/36/48/64 */
  --text-xs: 0.75rem; /* 12 */
  --text-sm: 0.875rem; /* 14 */
  --text-base: 1rem; /* 16 */
  --text-lg: 1.25rem; /* 20 */
  --text-xl: 1.75rem; /* 28 */
  --text-2xl: 2.25rem; /* 36 */
  --text-3xl: 3rem; /* 48 */
  --text-4xl: 4rem; /* 64 */
}

/* === Paleta Light (default) — Fase 9: azul grisáceo + azul profundo === */
:root,
[data-theme="light"] {
  --token-bg: #f0f4f8;
  --token-surface: #ffffff;
  --token-text: #1a202c;
  --token-text-muted: #4a5568;
  --token-accent: #2b6cb0;
  --token-accent-hover: #2c5282;
  --token-border: #cbd5e0;
  --token-on-accent: #ffffff;
  color-scheme: light;
}

/* === Paleta Dark — Fase 9: azul noche #0a0e1a + azul eléctrico === */
[data-theme="dark"] {
  --token-bg: #0a0e1a;
  --token-surface: #131b2e;
  --token-text: #e2e8f0;
  --token-text-muted: #8899aa;
  --token-accent: #4299e1;
  --token-accent-hover: #63b3ed;
  --token-border: #1e293b;
  --token-on-accent: #0a0e1a;
  color-scheme: dark;
}

/* === Base === */
html {
  scrollbar-gutter: stable;
  scroll-behavior: smooth;
  scroll-padding-top: 5rem; /* navbar sticky */
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

body {
  background-color: var(--token-bg);
  color: var(--token-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Typography display */
h1,
h2,
h3 {
  font-family: var(--font-display);
}

/* Focus visible — accesible, usa acento */
*:focus-visible {
  outline: 2px solid var(--token-accent);
  outline-offset: 2px;
}

/* === Animación PCB — Fase 9 === */
@keyframes pcb-sweep {
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}

.animate-pcb-sweep {
  animation: pcb-sweep 10s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-pcb-sweep { animation: none !important; opacity: 0; }
}

/* Reduced motion global — respeta accesibilidad */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Diff mínimo (para `opencode build`):** reemplazar 8 líneas por bloque de tokens (valores hex) + insertar bloque `@keyframes`/`animate-pcb-sweep` antes del último `@media (prefers-reduced-motion)`. Mantener orden `color-scheme` y comentarios.

> Nota: el duplicado `prefers-reduced-motion` final es intencional: la regla `.animate-pcb-sweep` debe preceder al reset global `*` para que `opacity:0` no sea sobreescrita por `animation-duration:0.01ms`. Orden exacto como arriba.

### 4.2 `src/components/BackgroundPCB.astro` (nuevo)

Replica la plantilla del spec §Animación PCB con paths hardcodeados. ViewBox `0 0 1440 900` cubre desktop; `preserveAspectRatio="none"` estira en mobile sin recalcular. 18 paths (ortogonales + codos 90°) + 12 nodos. Todo usa `var(--token-accent)`.

```astro
---
interface Props {
  class?: string;
}
const { class: className } = Astro.props;
---

<div
  class:list={["pointer-events-none fixed inset-0 -z-10 overflow-hidden", className]}
  aria-hidden="true"
>
  <svg
    class="absolute inset-0 h-full w-full"
    viewBox="0 0 1440 900"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- Pistas — stroke fino, opacidad decorativa 0.08 -->
    <g stroke="var(--token-accent)" stroke-width="0.7" fill="none" opacity="0.08" stroke-linecap="round" stroke-linejoin="round">
      <!-- Horizontales largas -->
      <path d="M0 80 H 320 V 140 H 600 V 80 H 900" />
      <path d="M0 180 H 260 V 260 H 540 V 180 H 820 V 220 H 1100" />
      <path d="M1440 120 H 1080 V 200 H 820 V 120 H 600" />
      <path d="M0 320 H 180 V 400 H 420 V 360 H 700" />
      <path d="M1440 300 H 1200 V 380 H 980 V 300 H 760" />
      <!-- Verticales -->
      <path d="M220 0 V 180 H 400 V 320" />
      <path d="M520 0 V 100 H 680 V 240 H 840" />
      <path d="M980 0 V 160 H 1120 V 280 H 1280" />
      <path d="M360 900 V 640 H 540 V 520 H 700" />
      <path d="M780 900 V 680 H 980 V 560 H 1120" />
      <path d="M1100 900 V 720 H 900 V 600 H 740" />
      <!-- Codos y derivaciones -->
      <path d="M140 400 H 260 V 520 H 120 V 600 H 360" />
      <path d="M700 400 H 880 V 480 H 1080 V 420 H 1260" />
      <path d="M420 600 H 600 V 720 H 820 V 640 H 1000" />
      <path d="M0 720 H 200 V 640 H 400 V 760 H 540" />
      <path d="M1440 660 H 1240 V 740 H 1080 V 680 H 900" />
      <path d="M640 200 H 760 V 360 H 620 V 480 H 800" />
    </g>
    <!-- Nodos / pads — círculos y rects pequeños, opacidad 0.12 -->
    <g fill="var(--token-accent)" opacity="0.12">
      <circle cx="320" cy="80" r="3.5" />
      <circle cx="600" cy="80" r="2.5" />
      <circle cx="260" cy="180" r="3" />
      <circle cx="540" cy="260" r="2.5" />
      <circle cx="820" cy="180" r="3" />
      <circle cx="220" cy="180" r="2" />
      <circle cx="680" cy="100" r="2.5" />
      <circle cx="980" cy="160" r="3" />
      <circle cx="360" cy="640" r="2.5" />
      <circle cx="540" cy="520" r="3" />
      <circle cx="980" cy="560" r="3" />
      <circle cx="700" cy="400" r="2.5" />
      <rect x="518" y="238" width="6" height="6" rx="1" />
      <rect x="878" y="478" width="6" height="6" rx="1" />
      <rect x="598" y="718" width="6" height="6" rx="1" />
      <rect x="838" y="638" width="6" height="6" rx="1" />
    </g>
  </svg>
  <!-- Barrido luminoso vertical — GPU: solo transform/opacity -->
  <div class="animate-pcb-sweep absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.07] to-transparent"></div>
</div>
```

Puntos críticos:
- `fixed inset-0 -z-10` detrás de todo; `pointer-events-none` no bloquea interacción.
- SVG usa `var(--token-accent)` → cambia automáticamente light/dark.
- `opacity 0.08` en pistas + `0.12` en nodos + `via-accent/[0.07]` están dentro de 0.05–0.12.
- Sin JS, sin canvas, sin `requestAnimationFrame`.
- Solo `transform`/`opacity` en animación → GPU.

### 4.3 `src/pages/index.astro` — patch

Insertar `<BackgroundPCB />` como primer hijo de `<Layout>`, antes de `<Navbar />`. Mantener resto idéntico.

```astro
---
import Layout from "../components/ui/Layout.astro";
import Navbar from "../components/Navbar.astro";
import BackgroundPCB from "../components/BackgroundPCB.astro";
import Hero from "../sections/Hero.astro";
import About from "../sections/About.astro";
import Proyectos from "../sections/Proyectos.astro";
import CV from "../sections/CV.astro";
import Contacto from "../sections/Contacto.astro";
---

<Layout title="Angel Ayala — Desarrollador Fullstack">
  <BackgroundPCB />
  <Navbar />
  <main>
    <Hero />
    <About />
    <Proyectos />
    <CV />
    <Contacto />
  </main>

  <footer class="border-t border-border py-6">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <p class="text-center text-xs text-text-muted">© {new Date().getFullYear()} Angel Ayala — Portfolio</p>
    </div>
  </footer>
</Layout>
```

Si `Layout.astro` se prefiere como host global (para futuras páginas), alternativa es mover `<BackgroundPCB />` a `src/components/ui/Layout.astro:44` dentro de `<body><BackgroundPCB /><slot /></body>` — documentado como variante, pero el plan ejecuta la integración en `index.astro` para fidelidad al spec.

---

## 5. Orden de ejecución `opencode build`

1. **EDITAR** `src/styles/global.css` (§4.1) — reemplazar tokens light/dark + añadir keyframes (preservar `@theme inline` y `html`/`body`/`focus-visible`).
2. **CREAR** `src/components/BackgroundPCB.astro` (§4.2) — verificar que el archivo compila (`astro check` debe reconocer `var(--token-accent)` en SVG).
3. **EDITAR** `src/pages/index.astro` (§4.3) — importar e insertar `<BackgroundPCB />` antes de `<Navbar />`.
4. **Verificar** §6 (automática + manual).

No instalar dependencias. No tocar `astro.config.mjs`, `package.json`, `src/lib/*`, `src/context/*`.

---

## 6. Criterios de verificación

### 6.1 Automática (comandos)

```bash
# 1. Type-check limpio (Astro + React)
npm run check
# → 0 errors, 0 warnings, 0 hints

# 2. Build estático OK — genera dist/index.html con BackgroundPCB
npm run build
# → dist/index.html contiene 'BackgroundPCB' o '<svg' + 'animate-pcb-sweep'
# → dist/_astro/*.css contiene '#0a0e1a' y '#4299e1' y 'pcb-sweep'

# 3. Cero hex hardcodeado fuera de global.css (debe retornar vacío para componentes)
rg -n "#[0-9a-fA-F]{3,8}" src/components src/sections src/pages --glob '!src/styles/global.css'
# → (vacío) — solo global.css tiene hex

# 4. No quedó cyan/teal antiguo
rg -n "22d3ee|0891b2|0f172a|f8fafc|#06b6d4|#0e7490" src/
# → vacío (solo historia git)

# 5. Tokens nuevos presentes en CSS
rg -n "#f0f4f8|#2b6cb0|#0a0e1a|#4299e1|#131b2e|#1a202c" src/styles/global.css

# 6. Animación solo usa transform/opacity (GPU)
rg -n "pcb-sweep|animate-pcb-sweep" src/styles/global.css src/components/BackgroundPCB.astro
rg -n "prefers-reduced-motion" src/styles/global.css src/components/BackgroundPCB.astro
# → debe mostrar @keyframes + @media reduce con animation: none

# 7. Contraste WCAG AA (4.5:1) — validación rápida con script
python3 -c "
import math
def hex_to_rgb(h): return tuple(int(h.lstrip('#')[i:i+2],16) for i in (0,2,4))
def lum(rgb):
    def c(v):
        v=v/255
        return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4
    r,g,b=[c(x) for x in rgb]; return 0.2126*r+0.7152*g+0.0722*b
def ratio(a,b):
    l1,lum2=lum(hex_to_rgb(a)),lum(hex_to_rgb(b)); L1,L2=max(l1,lum2),min(l1,lum2)
    return (L1+0.05)/(L2+0.05)
for name,a,b in [('light text','#1a202c','#f0f4f8'),('light muted','#4a5568','#f0f4f8'),('light accent on bg','#2b6cb0','#f0f4f8'),('light on-accent','#ffffff','#2b6cb0'),('dark text','#e2e8f0','#0a0e1a'),('dark muted','#8899aa','#0a0e1a'),('dark accent','#4299e1','#0a0e1a'),('dark on-accent','#0a0e1a','#4299e1')]:
    r=ratio(a,b); print(name, round(r,2), 'AA' if r>=4.5 else 'FAIL')
"
# → todos >=4.5

# 8. BackgroundPCB está detrás y no bloquea
rg -n "fixed inset-0 -z-10|pointer-events-none.*fixed|aria-hidden" src/components/BackgroundPCB.astro

# 9. Audit rápido (sin CVEs esperados)
npm audit --audit-level=moderate
```

### 6.2 Manual (dev server `npm run dev`)

| # | Prueba | Esperado |
|---|---|---|
| 1 | Light mode (default o toggle) | Fondo `#f0f4f8` azul grisáceo claro (no `#f8fafc` blanco frío), surface `#ffffff`, texto `#1a202c`, bordes `#cbd5e0`, acento azul `#2b6cb0` en links/botones/focus |
| 2 | Dark mode (toggle) | Fondo `#0a0e1a` más oscuro que antes (`#0f172a`), surface `#131b2e`, texto `#e2e8f0`, muted `#8899aa`, acento `#4299e1` eléctrico, hover `#63b3ed`, borde `#1e293b` |
| 3 | Toggle persistencia | Cambiar tema → F5 mantiene elección (`localStorage.theme` + `data-theme` en `<html>`), sin FOUC |
| 4 | PCB visible — desktop 1280px | Pistas muy sutiles (opacidad ~0.08) + nodos 0.12 + barrido vertical luminoso cada ~10s de arriba→abajo, no compite con texto; `z-index -1` (contenido por encima) |
| 5 | PCB mobile 320px | Misma densidad de paths (no desaparecen), svg estirado sin overflow horizontal, barrido visible pero sutil |
| 6 | `prefers-reduced-motion: reduce` (DevTools Rendering → Emulate) | Barrido desaparece (`opacity:0`, `animation:none`), resto de la página sin animación forzada (`* animation-duration 0.01ms`) |
| 7 | Componentes UI jerarquía | `Button primary` (`bg-accent text-on-accent`) y `secondary` (`border-accent text-accent`) mantienen contraste; `Card` (`bg-surface border-border`) y `Badge` (`bg-accent/10 text-accent`) legibles en ambas paletas sin pérdida de jerarquía |
| 8 | Focus visible | Tab sobre `Navbar`, `Button`, `Input`, `Card links` → outline/ring azul `#2b6cb0`/`#4299e1` visible (WCAG 2.4.7) |
| 9 | `disabled` | Botón deshabilitado → `opacity 0.4` (clase `disabled:opacity-50` actual ≈0.5, verificar visual; si se exige 0.4 exacto, ajustar a `disabled:opacity-40`) sin cambio de color |
| 10 | Performance | DevTools Performance → animación solo `transform`/`opacity` (composited layer), sin `top`/`left`/`width`, sin jank |
| 11 | Lighthouse a11y | Contraste AA sin errores; `aria-hidden` en PCB no afecta lectura; `h1` único en `Hero` |

### 6.3 Checklist de aceptación (spec `09-dark-blue-pcb.md:15`)

- [ ] Paleta light: azul profundo en vez de cyan, fondos más oscuros (`#f0f4f8`/`#2b6cb0`/`#cbd5e0`) — §4.1
- [ ] Paleta dark: azul noche (`#0a0e1a` en vez de `#0f172a`, surface `#131b2e`, acento `#4299e1`) — §4.1
- [ ] Sin color accent cyan — usa azul para estados interactivos (focus/hover/border) — §4.1 + 6.1.4
- [ ] Mantener accesibilidad WCAG AA (ratio 4.5:1 mínimo) — verificado 6.1.7 (todos 4.90–16.32)
- [ ] Componentes UI funcionan en la nueva paleta sin pérdida de jerarquía — 6.2.7
- [ ] Animación PCB: SVG con paths tipo pistas de circuito — §4.2 (18 paths + 12 nodos)
- [ ] Gradiente luminoso viaja verticalmente (arriba → abajo) — `@keyframes pcb-sweep translateY(-100%→100%)`
- [ ] Opacidad baja (0.05–0.12) — decorativo, no competitivo — pistas 0.08, nodos 0.12, gradiente 0.07
- [ ] Respetar `prefers-reduced-motion` — desactivar animación — `@media reduce { animation:none; opacity:0 }`
- [ ] Fijo al viewport, detrás de todo (`z-index: -1`) — `fixed inset-0 -z-10`
- [ ] GPU-accelerated (solo `transform`/`opacity`) — keyframe solo usa esos dos

---

## 7. Fuera de alcance

- Rediseño de tipografía, espaciado o layout (fases 01–08 intactas).
- Canvas/WebGL o generador dinámico de pistas — SVG hardcodeado por spec.
- Variantes adicionales de paleta (violeta `#818cf8` descartada en Fase 01, no retomar).
- Mover `BackgroundPCB` a `Layout.astro` para soporte multi-página (variante documentada, no ejecutada en este plan; 1 línea si se requiere).
- `disabled:opacity-40` exacto si `Button.astro` usa `opacity-50` (ajuste menor, no bloqueante).
- WPGraphQL / ISR / deploy (Fases 02/08).

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Contraste insuficiente tras oscurecer fondo light a `#f0f4f8` | Ratios calculados: muted 6.81 y accent 4.90 sobre `#f0f4f8` pasan AA; `on-accent` 5.42 sobre `#2b6cb0` pasa. Si diseño pide más contraste, subir `text-muted` a `#475569` (tradeoff) |
| `#0a0e1a` demasiado oscuro pierde profundidad vs `#131b2e` | Surface `#131b2e` es 1 tono más claro que bg, mantiene elevación de `Card`; verificar visual con `shadow-sm` |
| SVG con `preserveAspectRatio="none"` distorsiona pistas en ultra-wide | Distorsión es aceptable para decorativo sutil (0.08 opacidad); alternativa `xMidYMid slice` recorta bordes — se mantiene `none` por simplicidad |
| `via-accent/[0.07]` no resuelto por Tailwind v4 (arbitrary opacity) | Tailwind v4 soporta `via-accent/[0.07]` y `via-accent/5`; si falla, fallback `via-[#4299e1]/[0.07]` o `background: linear-gradient` en `global.css` |
| Doble `prefers-reduced-motion` en `global.css` confunde orden | Orden fijado: `@keyframes` → `.animate-pcb-sweep` → `@media reduce { .animate-pcb-sweep }` → `@media reduce { * }` — así `opacity:0` gana |
| `fixed -z-10` queda detrás de `body bg` si `body` no es transparente | `body` usa `background-color: var(--token-bg)` — el PCB es hijo de `body` con `fixed`, pero `-z-10` lo pone detrás de `body` bg en stacking context. Solución: `body` no crea stacking context (sin `position`/`z-index`/`transform`), así `fixed -z-10` queda detrás del contenido pero sobre `html` bg. Verificar en DevTools Layers; si falla, cambiar a `z-0` + `isolation` |
| Duplicar `ThemeToggle` id si se integra PCB con script | PCB no tiene JS ni id, no colisiona |

---

## 9. Estado

**PLAN GENERADO (2026-08-30) — pendiente de ejecución.** Ejecutor: `opencode build` siguiendo §5. Verificador: `opencode test` con §6. Próximo: aplicar §4.1→4.3 y validar contraste + animación + reduced-motion.

