# Plan — FASE 1: Design System & Theme

> Fuente: `specs/01-design-system.md`
> Stack verificado: Astro `^7.2.9` + Tailwind CSS v4 (`@tailwindcss/vite ^4.3.3`, CSS-first, sin `tailwind.config.js`) + React (`@astrojs/react ^6.0.4`) + adapter Vercel (`output: 'static'`).
> Fecha: 2026-08-30

---

## 1. Objetivo

Definir los tokens visuales, el sistema de diseño base y la infraestructura dark/light mode que TODAS las secciones (Fases 2–8) consumen. Entregables:

- `global.css` con tokens CSS para ambas paletas + Tailwind v4 theme mapping.
- 7 componentes base en `src/components/ui/` que usan SIEMPRE variables/utility classes de tokens, nunca hex hardcodeado.
- Toggle dark/light con persistencia en `localStorage`, `data-theme` en `<html>`, sin FOUC (script inline en `<head>` antes del CSS).
- `ThemeContext.tsx` (React) listo para islas de Fases 5 y 7 (no consumido en Fase 1).
- Harness visual temporal en `index.astro` para QA manual en 320/768/1280px.

## 2. Estado actual del repo (verificado 2026-08-30)

| Pieza | Estado |
|---|---|
| `package.json` | Ya incluye `@fontsource-variable/inter` y `@fontsource-variable/space-grotesk` — **no instalar nada** |
| `astro.config.mjs` | Correcto: `react()` + `tailwindcss()` vite plugin + `vercel()`. **No tocar** |
| `src/styles/global.css` | Implementado (código en §4.1) |
| `src/components/ui/*` | 7 componentes implementados (código en §4.2–§4.8) |
| `src/context/ThemeContext.tsx` | Implementado (código en §4.9) |
| `src/pages/index.astro` | Harness demo implementado (código en §4.10) |
| `src/pages/api/revalidate.ts` | Existe, pertenece a Fase 2/8. **No tocar** |

> Este plan documenta el diseño aprobado y sirve como spec reproducible: si se borra `src/`, ejecutando §4 archivo por archivo se reconstruye la fase completa.

## 3. Decisiones técnicas (aprobadas)

1. **Tipografía:** Space Grotesk Variable (display) + Inter Variable (body), self-hosted vía `@fontsource-variable/*` (sin CDN Google Fonts).
2. **Acento:** `#22d3ee` cyan en dark; en light se usa `#0891b2` (cyan-600) para contraste AA sobre fondo claro. Alternativa violeta `#818cf8` descartada.
3. **Resolución de tema:** `localStorage.theme` → `prefers-color-scheme` → fallback `dark` (diseño dark-first).
4. **Dark mode Tailwind v4:** `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))` + tokens como CSS variables mapeados en `@theme inline`, así `bg-bg`, `text-accent`, etc. reaccionan en runtime al cambiar `data-theme` sin duplicar utilidades.
5. **Texto sobre acento:** token dedicado `--token-on-accent` (`#ffffff` light / `#0f172a` dark) — evita `text-white` hardcodeado en componentes.
6. **Script anti-FOUC vanilla** (no React) en `<head>`: se ejecuta antes de pintar y antes de hidratar cualquier isla.

### Tokens semánticos

| Token | Light | Dark | Utility Tailwind |
|---|---|---|---|
| `--token-bg` | `#f8fafc` | `#0f172a` | `bg-bg`, `ring-offset-bg` |
| `--token-surface` | `#ffffff` | `#1e293b` | `bg-surface` |
| `--token-text` | `#1e293b` | `#e2e8f0` | `text-text` |
| `--token-text-muted` | `#64748b` | `#94a3b8` | `text-text-muted` |
| `--token-accent` | `#0891b2` | `#22d3ee` | `bg/text/border/ring-accent`, `bg-accent/10` |
| `--token-accent-hover` | `#0e7490` | `#06b6d4` | `hover:bg-accent-hover` |
| `--token-border` | `#e2e8f0` | `#334155` | `border-border` |
| `--token-on-accent` | `#ffffff` | `#0f172a` | `text-on-accent` |

Escala tipográfica (spec 12/16/20/28/36/48/64): `xs 0.75rem` · `base 1rem` · `lg 1.25rem` · `xl 1.75rem` · `2xl 2.25rem` · `3xl 3rem` · `4xl 4rem`. Fuentes: `--font-display` (Space Grotesk Variable), `--font-body` (Inter Variable).

## 4. Archivos y código exacto

Resumen:

| Acción | Archivo |
|---|---|
| CREAR | `src/styles/global.css` |
| CREAR | `src/components/ui/Layout.astro` |
| CREAR | `src/components/ui/Section.astro` |
| CREAR | `src/components/ui/Button.astro` |
| CREAR | `src/components/ui/Card.astro` |
| CREAR | `src/components/ui/Badge.astro` |
| CREAR | `src/components/ui/Input.astro` |
| CREAR | `src/components/ui/ThemeToggle.astro` |
| CREAR | `src/context/ThemeContext.tsx` |
| REEMPLAZAR | `src/pages/index.astro` (boilerplate → harness demo) |
| NO TOCAR | `astro.config.mjs`, `package.json`, `src/pages/api/revalidate.ts` |

### 4.1 `src/styles/global.css`

Tokens + Tailwind v4 theme + base styles. **Único archivo del proyecto donde viven hex.**

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

/* === Paleta Light (default) === */
:root,
[data-theme="light"] {
  --token-bg: #f8fafc;
  --token-surface: #ffffff;
  --token-text: #1e293b;
  --token-text-muted: #64748b;
  --token-accent: #0891b2;
  --token-accent-hover: #0e7490;
  --token-border: #e2e8f0;
  --token-on-accent: #ffffff;
  color-scheme: light;
}

/* === Paleta Dark === */
[data-theme="dark"] {
  --token-bg: #0f172a;
  --token-surface: #1e293b;
  --token-text: #e2e8f0;
  --token-text-muted: #94a3b8;
  --token-accent: #22d3ee;
  --token-accent-hover: #06b6d4;
  --token-border: #334155;
  --token-on-accent: #0f172a;
  color-scheme: dark;
}

/* === Base === */
html {
  scrollbar-gutter: stable;
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

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4.2 `src/components/ui/Layout.astro`

Layout raíz: fuentes, CSS global, meta y **script anti-FOUC inline antes de cualquier render**.

```astro
---
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "../../styles/global.css";

interface Props {
  title?: string;
  description?: string;
}

const {
  title = "Angel Ayala — Portfolio",
  description = "Desarrollador Fullstack | Est. Ingeniería de Sistemas — Construyo aplicaciones web modernas, de la idea al deploy.",
} = Astro.props;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="generator" content={Astro.generator} />
    <meta name="description" content={description} />
    <title>{title}</title>
    <script is:inline>
      (function () {
        try {
          var stored = localStorage.getItem("theme");
          var theme = stored;
          if (!theme) {
            theme = window.matchMedia("(prefers-color-scheme: light)").matches
              ? "light"
              : "dark";
          }
          document.documentElement.setAttribute("data-theme", theme);
        } catch {
          document.documentElement.setAttribute("data-theme", "dark");
        }
      })();
    </script>
  </head>
  <body class="min-h-screen font-body antialiased">
    <slot />
  </body>
</html>
```

Puntos críticos: `is:inline` (Astro no lo bundla ni difiere), orden `localStorage → matchMedia → dark`, `try/catch` por si `localStorage` está bloqueado (fallback `dark`).

### 4.3 `src/components/ui/Section.astro`

Wrapper con padding vertical consistente + container 1280px.

```astro
---
interface Props {
  id?: string;
  class?: string;
}

const { id, class: className } = Astro.props;
---

<section id={id} class:list={["py-16 md:py-24", className]}>
  <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
    <slot />
  </div>
</section>
```

### 4.4 `src/components/ui/Button.astro`

`primary` (acento filled) y `secondary` (outline). Renderiza `<a>` si recibe `href`.

```astro
---
interface Props {
  variant?: "primary" | "secondary";
  href?: string;
  type?: "button" | "submit" | "reset";
  class?: string;
  ariaLabel?: string;
}

const {
  variant = "primary",
  href,
  type = "button",
  class: className,
  ariaLabel,
} = Astro.props;

const base =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-hover border border-transparent",
  secondary:
    "bg-transparent text-accent border border-accent hover:bg-accent/10",
};
---

{
  href ? (
    <a
      href={href}
      aria-label={ariaLabel}
      class:list={[base, variants[variant], className]}
    >
      <slot />
    </a>
  ) : (
    <button
      type={type}
      aria-label={ariaLabel}
      class:list={[base, variants[variant], className]}
    >
      <slot />
    </button>
  )
}
```

### 4.5 `src/components/ui/Card.astro`

Card para Proyecto/Experience con hover state (shadow + elevación), respeta `prefers-reduced-motion`.

```astro
---
interface Props {
  class?: string;
}

const { class: className } = Astro.props;
---

<div
  class:list={[
    "bg-surface border border-border rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:transform-none",
    className,
  ]}
>
  <slot />
</div>
```

### 4.6 `src/components/ui/Badge.astro`

Tag/categoría para tech stack y proyectos.

```astro
---
interface Props {
  class?: string;
}

const { class: className } = Astro.props;
---

<span
  class:list={[
    "inline-flex items-center rounded-full bg-accent/10 text-accent text-xs font-medium px-2.5 py-0.5 border border-accent/20",
    className,
  ]}
>
  <slot />
</span>
```

### 4.7 `src/components/ui/Input.astro`

Form control con label asociado (`for`/`id`), `required` con asterisco `aria-hidden`, focus visible, y modo `multiline` (textarea).

```astro
---
type InputType =
  | "text"
  | "email"
  | "password"
  | "search"
  | "tel"
  | "url"
  | "number";

interface Props {
  label: string;
  id: string;
  name: string;
  type?: InputType;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  class?: string;
}

const {
  label,
  id,
  name,
  type = "text",
  placeholder,
  required = false,
  multiline = false,
  rows = 4,
  class: className,
} = Astro.props;

const fieldClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors";
---

<div class:list={["flex flex-col gap-1.5", className]}>
  <label for={id} class="text-sm font-medium text-text">
    {label}{required && <span aria-hidden="true" class="text-accent"> *</span>}
  </label>
  {
    multiline ? (
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
        class:list={[fieldClass, "resize-y min-h-[96px]"]}
      />
    ) : (
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        class={fieldClass}
      />
    )
  }
</div>
```

### 4.8 `src/components/ui/ThemeToggle.astro`

Botón sol/luna. Script vanilla inline: toggle `data-theme` + `localStorage` + evento `theme-change` (lo escucha `ThemeContext.tsx`) + sync cross-tab vía `storage`.

```astro
---
interface Props {
  class?: string;
}

const { class: className } = Astro.props;
---

<button
  id="theme-toggle"
  type="button"
  aria-label="Cambiar tema"
  aria-pressed="false"
  class:list={[
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text hover:bg-accent/10 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    className,
  ]}
>
  <span class="icon-sun hidden" aria-hidden="true">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      ><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path
        d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path
        d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path
        d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path
        d="m19.07 4.93-1.41 1.41"></path></svg
    >
  </span>
  <span class="icon-moon hidden" aria-hidden="true">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      ><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg
    >
  </span>
</button>

<script is:inline>
  (function () {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;

    var sun = btn.querySelector(".icon-sun");
    var moon = btn.querySelector(".icon-moon");

    function getTheme() {
      return document.documentElement.getAttribute("data-theme") || "dark";
    }

    function render(theme) {
      var isDark = theme === "dark";
      if (sun) sun.classList.toggle("hidden", !isDark);
      if (moon) moon.classList.toggle("hidden", isDark);
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
      );
    }

    render(getTheme());

    btn.addEventListener("click", function () {
      var next = getTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {}
      render(next);
      window.dispatchEvent(
        new CustomEvent("theme-change", { detail: { theme: next } }),
      );
    });

    // Sync if another tab changes storage
    window.addEventListener("storage", function (e) {
      if (e.key === "theme" && e.newValue) {
        document.documentElement.setAttribute("data-theme", e.newValue);
        render(e.newValue);
      }
    });
  })();
</script>
```

> **Limitación conocida:** `id="theme-toggle"` es único por página — solo una instancia de ThemeToggle por página (spec pide "navbar/footer": se implementará una sola instancia en el navbar final de Fase 3, o refactorizar a clase si se requieren dos).

### 4.9 `src/context/ThemeContext.tsx`

Estado React para islas futuras (Fases 5 y 7). Sincroniza con el DOM vía evento `theme-change`, `storage` y `MutationObserver` sobre `data-theme`. **No se consume en Fase 1.**

```tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme } }));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getCurrentTheme());

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as { theme: Theme } | undefined;
      if (detail?.theme) setThemeState(detail.theme);
      else setThemeState(getCurrentTheme());
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        setThemeState(e.newValue as Theme);
      }
    };

    window.addEventListener("theme-change", onChange);
    window.addEventListener("storage", onStorage);

    const observer = new MutationObserver(() => setThemeState(getCurrentTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      window.removeEventListener("theme-change", onChange);
      window.removeEventListener("storage", onStorage);
      observer.disconnect();
    };
  }, []);

  const setTheme = (t: Theme) => {
    applyTheme(t);
    setThemeState(t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

### 4.10 `src/pages/index.astro` (harness temporal)

Reemplaza el boilerplate. Demo que consume TODOS los componentes base para QA visual. Será reemplazado por las secciones reales en Fases 3–7.

```astro
---
import Layout from "../components/ui/Layout.astro";
import Section from "../components/ui/Section.astro";
import Button from "../components/ui/Button.astro";
import Card from "../components/ui/Card.astro";
import Badge from "../components/ui/Badge.astro";
import Input from "../components/ui/Input.astro";
import ThemeToggle from "../components/ui/ThemeToggle.astro";
---

<Layout title="Design System — Portfolio Angel">
  <header class="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
    <div class="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <span class="font-display text-lg font-bold text-text">Portfolio Angel</span>
      <ThemeToggle />
    </div>
  </header>

  <main>
    <Section>
      <h1 class="font-display text-3xl md:text-4xl font-bold text-text">Design System — Fase 1</h1>
      <p class="mt-3 max-w-2xl text-base text-text-muted">
        Tokens, componentes base y dark/light mode. Esta página es un harness visual temporal para verificar el spec <code class="rounded bg-surface border border-border px-1 py-0.5 text-xs">01-design-system.md</code>.
      </p>

      <!-- Typography scale -->
      <div class="mt-10">
        <h2 class="font-display text-xl font-semibold text-text">Tipografía — escala modular 12/16/20/28/36/48/64</h2>
        <div class="mt-4 grid gap-2">
          <p class="text-xs text-text-muted">xs 12 — Texto pequeño / captions</p>
          <p class="text-base text-text">base 16 — Body (Inter Variable)</p>
          <p class="text-lg text-text">lg 20 — Lead</p>
          <p class="font-display text-xl font-semibold text-text">xl 28 — H3 (Space Grotesk)</p>
          <p class="font-display text-2xl font-bold text-text">2xl 36 — H2</p>
          <p class="font-display text-3xl font-bold text-text">3xl 48 — H1</p>
          <p class="font-display text-4xl font-bold text-text">4xl 64 — Display</p>
        </div>
      </div>

      <!-- Buttons -->
      <div class="mt-10">
        <h2 class="font-display text-xl font-semibold text-text">Button</h2>
        <div class="mt-4 flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="primary" href="#demo">Primary como link</Button>
        </div>
      </div>

      <!-- Badges -->
      <div class="mt-10">
        <h2 class="font-display text-xl font-semibold text-text">Badge</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          <Badge>React</Badge>
          <Badge>TypeScript</Badge>
          <Badge>Node.js</Badge>
          <Badge>Astro</Badge>
          <Badge>Tailwind</Badge>
          <Badge>NestJS</Badge>
          <Badge>PostgreSQL</Badge>
          <Badge>WordPress</Badge>
        </div>
      </div>

      <!-- Cards -->
      <div class="mt-10">
        <h2 class="font-display text-xl font-semibold text-text">Card</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <h3 class="font-display text-lg font-semibold text-text">Proyecto ejemplo</h3>
            <p class="mt-2 text-sm text-text-muted">Card con hover state (shadow + elevación). Consume tokens surface/border/text.</p>
            <div class="mt-3 flex gap-2"><Badge>Astro</Badge><Badge>Tailwind</Badge></div>
          </Card>
          <Card>
            <h3 class="font-display text-lg font-semibold text-text">Experiencia</h3>
            <p class="mt-2 text-sm text-text-muted">Reutilizable para proyectos, CV y contacto.</p>
            <div class="mt-3"><Button variant="secondary" href="#">Ver más</Button></div>
          </Card>
          <Card>
            <h3 class="font-display text-lg font-semibold text-text">Contacto</h3>
            <p class="mt-2 text-sm text-text-muted">Tercera card para validar grid responsive 1→2→3 col.</p>
          </Card>
        </div>
      </div>

      <!-- Inputs -->
      <div class="mt-10 max-w-xl">
        <h2 class="font-display text-xl font-semibold text-text">Input</h2>
        <form class="mt-4 grid gap-4" onsubmit="return false">
          <Input label="Nombre" id="demo-nombre" name="nombre" placeholder="Tu nombre" required />
          <Input label="Email" id="demo-email" name="email" type="email" placeholder="tu@email.com" required />
          <Input label="Mensaje" id="demo-mensaje" name="mensaje" placeholder="Escribe tu mensaje..." multiline rows={4} required />
          <Button type="submit" variant="primary">Enviar</Button>
        </form>
        <p class="mt-2 text-xs text-text-muted">Labels asociados vía for/id, focus visible con ring acento.</p>
      </div>

      <!-- Layout/Section note -->
      <div class="mt-10 rounded-lg border border-border bg-surface p-4">
        <p class="text-sm text-text-muted">
          <strong class="text-text">Layout</strong> provee anti-FOUC + fuentes + variables. <strong class="text-text">Section</strong> envuelve este contenido (max 1280px, py consistente). Cambiá el tema con el botón del header — debe persistir al recargar.
        </p>
      </div>
    </Section>
  </main>

  <footer class="border-t border-border py-6">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <p class="text-center text-xs text-text-muted">FASE 1 — Design System & Theme · Mobile-first · Sin overflow en 320px</p>
    </div>
  </footer>
</Layout>
```

## 5. Criterios de verificación

### 5.1 Automática (comandos)

```bash
# 1. Type-check limpio
npm run check          # → 0 errors, 0 warnings

# 2. Build estático OK
npm run build          # → dist/index.html + dist/_astro/index.*.css + fuentes .woff2

# 3. Cero hex hardcodeado fuera de global.css (debe retornar vacío)
rg -n "#[0-9a-fA-F]{3,8}" src/components src/context src/pages
```

### 5.2 Manual (dev server)

`npm run dev` y en el navegador:

| # | Prueba | Esperado |
|---|---|---|
| 1 | Click en ThemeToggle: dark → light → dark | Tema cambia instantáneo, ícono sol/luna alterna, `aria-pressed` cambia |
| 2 | Recargar con F5 tras elegir light | Mantiene light (persistencia `localStorage.theme`) |
| 3 | DevTools → Elements: `<html>` | Tiene `data-theme="dark"` o `"light"` ya en el HTML inicial (view-source), sin flash |
| 4 | Sin FOUC: recargar con Network throttling | Primera pintada ya con el tema correcto, sin parpadeo blanco/negro |
| 5 | Responsive 320px (DevTools device toolbar) | Sin scroll horizontal; badges/botones hacen wrap; grid de cards 1 col |
| 6 | 768px y 1280px | Cards 2 col y 3 col; container max 1280px centrado |
| 7 | Tab navigation | Focus visible con outline/ring acento en toggle, botones e inputs |
| 8 | Segunda pestaña: cambiar tema en una | La otra sincroniza (listener `storage`) |

### 5.3 Checklist de aceptación (spec)

- [x] `global.css` define variables CSS para ambas paletas (§4.1)
- [x] ThemeToggle funciona: dark → light → dark (§4.8)
- [x] No FOUC: script inline aplica `data-theme` antes del render (§4.2)
- [x] Persistencia: al recargar, mantiene el tema elegido (§4.2 + §4.8)
- [x] Componentes base usan SIEMPRE variables, nunca colores hardcoded (verificación 5.1.3)
- [x] Mobile-first: funciona en 320px sin overflow (verificación 5.2.5)

## 6. Fuera de alcance

- Navbar/footer finales y contenido real de `index.astro` (Fases 3–7).
- Consumo de `ThemeContext.tsx` por islas React (Fases 5 y 7).
- WPGraphQL / CMS (Fase 2). ISR, dominio y CI/CD (Fase 8).
- No modificar `astro.config.mjs` ni agregar dependencias.

## 7. Estado

**IMPLEMENTADO Y VERIFICADO (2026-08-30).** Este documento queda como spec ejecutable de referencia; el código de §4 es exactamente el que vive en `src/`. Próximo paso: Fase 2 (`specs/02-wordpress-cms.md`).
