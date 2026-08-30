# Plan — FASE 6: CV Section

> Fuente: `specs/06-cv-section.md`
> Stack verificado: Astro `^7.2.9` + DS (`src/styles/global.css:1`, `src/components/ui/Badge.astro`, `Section.astro`, `Card.astro`) + `src/sections/{Hero,About,Proyectos}.astro` (Fases 3-5).
> Fecha: 2026-08-30

---

## 1. Objetivo

Mostrar experiencia, educación y skills escaneable (reclutadores imprimen/screensean). Entregables:

- Timeline/lista con `Experiencia` (soporte IT década → dev), `Educación` (UTN Ing Sistemas en curso), `Certificaciones/Cursos` (placeholder editable) (`06-cv-section.md:29-38`).
- Cada item: título, entidad, período, descripción breve, badges tech donde corresponda (`06-cv-section.md:44`).
- `CVItem.astro` reutilizable + `CV.astro` sección.
- Responsive y semántica `h2/h3/listas` (`06-cv-section.md:63`), sin overflow 320px.

Dependencia: Fase 1 (DS). No requiere WP.

## 2. Estado actual

| Pieza | Estado |
|---|---|
| `src/components/ui/Badge.astro` | OK. |
| `src/components/ui/Section.astro` | OK `py-16 md:py-24`. |
| `src/components/ui/Card.astro` | OK, opcional para envolver CV (no requerido, se usa timeline). |
| `src/sections/Hero.astro`, `About.astro`, `Proyectos.astro` | Creados Fases 3-5. |
| `src/sections/CV.astro`, `src/components/CVItem.astro` | **No existen** — crear. |
| `src/pages/index.astro` | `Navbar + Hero + About + Proyectos + footer`. Insertar `CV` tras Proyectos. |

## 3. Decisiones técnicas

1. **Estructura:** `Section id="cv" scroll-mt-16 aria-labelledby="cv-heading"` con `h2 EXPERIENCIA / CV`. Tres bloques `h3` (Experiencia, Educación, Certificaciones) cada uno con `ol` o `ul` + `CVItem` `li`. Timeline sutil con `border-l-2 border-border pl-6 ml-2` y punto `absolute -left-[9px] top-1.5 h-3 w-3 rounded-full bg-accent border-2 border-bg`.
2. **CVItem props:** `title:string, entity:string, period:string, description:string, badges?:string[], current?:boolean`. `current` añade `Badge` `Actual` o punto pulsante. `time` con `datetime` si parseable, sino `span`.
3. **Contenido estático:** Datos en `CV.astro` como arrays TS (no WP). Editable fácil. Experiencia: `Soporte Técnico / IT — Empresa/Independiente (2014–Actual)` + transición. Educación: `Ingeniería en Sistemas de Información — UTN FRP (2022–Actual)` + `Com. 1º K13`. Cursos: 3 placeholders `Curso X — Plataforma (202X)` marcados `TODO: completar`.
4. **Semántica:** `h2` sección, `h3` bloques, `h4` ítem título (`CVItem` usa `h4`), `p` entity/period, `ul` badges. `ol` con `aria-label`.
5. **Estilo:** `text-text` títulos, `text-text-muted` descripciones, `font-display` para títulos. Cards no necesarias; timeline + `Badges` suficiente para escaneabilidad.
6. **Impresión:** `@media print` no requerido v1, pero `Card` no oculta contenido.

## 4. Archivos y código exacto

| Acción | Archivo |
|---|---|
| CREAR | `src/components/CVItem.astro` |
| CREAR | `src/sections/CV.astro` |
| EDITAR | `src/pages/index.astro` — insertar `<CV />` tras `<Proyectos />` |
| NO TOCAR | `src/styles/global.css`, `src/lib/*`, `astro.config.mjs` |

### 4.1 `src/components/CVItem.astro`

```astro
---
import Badge from "./ui/Badge.astro";

interface Props {
  title: string;
  entity: string;
  period: string;
  description: string;
  badges?: string[];
  current?: boolean;
}

const { title, entity, period, description, badges = [], current = false } = Astro.props;
---

<li class="relative pl-6">
  <span aria-hidden="true" class:list={["absolute -left-[9px] top-1.5 h-3 w-3 rounded-full border-2 border-bg", current ? "bg-accent animate-pulse" : "bg-accent/80"]}></span>
  <div class="flex flex-wrap items-baseline gap-2">
    <h4 class="font-display text-base font-semibold text-text">{title}</h4>
    {current && <Badge>Actual</Badge>}
  </div>
  <p class="mt-1 text-sm font-medium text-accent">{entity} <span class="font-normal text-text-muted">· {period}</span></p>
  <p class="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
  {badges.length > 0 && (
    <ul class="mt-3 flex flex-wrap gap-1.5" aria-label={`Tecnologías en ${title}`}>
      {badges.map(b => <li><Badge>{b}</Badge></li>)}
    </ul>
  )}
</li>
```

Notas: `li` pensada para estar dentro de `ol class="border-l-2 border-border ml-2 pl-2 space-y-8"`. Punto `bg-accent` usa token. `Badge` solo vía DS.

### 4.2 `src/sections/CV.astro`

```astro
---
import Section from "../components/ui/Section.astro";
import CVItem from "../components/CVItem.astro";

const experiencia = [
  {
    title: "Soporte Técnico / IT",
    entity: "Independiente / Empresa",
    period: "2014 — Actual",
    description: "Más de 10 años resolviendo infraestructura, redes y soporte a usuarios. Transición a desarrollo fullstack: automatización, scripting y aplicaciones web a medida.",
    badges: ["Soporte", "Redes", "Linux", "Automatización"],
    current: true,
  },
  {
    title: "Desarrollador Fullstack (en formación)",
    entity: "Proyectos personales / Freelance",
    period: "2023 — Actual",
    description: "Construcción de portfolios, APIs y apps con React, Astro, Node.js y PostgreSQL. Enfoque en código limpio, accesibilidad y deploy continuo.",
    badges: ["React", "Astro", "Node.js", "PostgreSQL"],
    current: true,
  },
];

const educacion = [
  {
    title: "Ingeniería en Sistemas de Información",
    entity: "UTN — Facultad Regional Paraná",
    period: "2022 — Actual · Com. 1º K13",
    description: "Formación en algoritmos, estructuras de datos, bases de datos y arquitectura de software. Promedio y materias al día.",
    badges: ["Algoritmos", "Bases de Datos", "Sistemas"],
  },
];

const cursos = [
  { title: "Curso React / Next.js", entity: "Plataforma (ej. Udemy)", period: "2024", description: "Hooks, SSR, routing y optimización.", badges: ["React","Next.js"] },
  { title: "Node.js + NestJS", entity: "Plataforma", period: "2024", description: "APIs REST, auth JWT, testing.", badges: ["NestJS","TypeScript"] },
  { title: "SQL & PostgreSQL", entity: "Plataforma", period: "2023", description: "Modelado, consultas y optimización.", badges: ["PostgreSQL"] },
];
// TODO: Reemplazar cursos placeholder por certificaciones reales
---

<Section id="cv" class="scroll-mt-16 bg-surface/50" aria-labelledby="cv-heading">
  <div class="mx-auto max-w-[1280px]">
    <h2 id="cv-heading" class="font-display text-2xl md:text-3xl font-bold text-text">Experiencia / CV</h2>
    <p class="mt-2 max-w-2xl text-sm text-text-muted">Trayectoria escaneable. Imprimible con <kbd class="rounded border border-border bg-surface px-1 py-0.5 text-xs">Ctrl+P</kbd>.</p>

    <div class="mt-10 grid gap-10 lg:grid-cols-3">
      <!-- Experiencia -->
      <div class="lg:col-span-1">
        <h3 class="font-display text-lg font-semibold text-text">Experiencia</h3>
        <ol class="mt-4 space-y-8 border-l-2 border-border ml-2 pl-6" aria-label="Experiencia laboral">
          {experiencia.map(item => <CVItem {...item} />)}
        </ol>
      </div>

      <!-- Educación -->
      <div class="lg:col-span-1">
        <h3 class="font-display text-lg font-semibold text-text">Educación</h3>
        <ol class="mt-4 space-y-8 border-l-2 border-border ml-2 pl-6" aria-label="Educación">
          {educacion.map(item => <CVItem {...item} />)}
        </ol>
      </div>

      <!-- Cursos -->
      <div class="lg:col-span-1">
        <h3 class="font-display text-lg font-semibold text-text">Cursos / Certificaciones</h3>
        <ol class="mt-4 space-y-8 border-l-2 border-border ml-2 pl-6" aria-label="Cursos y certificaciones">
          {cursos.map(item => <CVItem {...item} />)}
        </ol>
        <p class="mt-6 text-xs text-text-muted">¿Tenés cursos para sumar? Edita <code class="rounded bg-surface border border-border px-1 py-0.5 text-xs">src/sections/CV.astro:6</code>.</p>
      </div>
    </div>

    <div class="mt-10 flex justify-center">
      <a href="#contacto" class="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-accent text-on-accent hover:bg-accent-hover border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">
        Disponible para proyectos → Contacto
      </a>
    </div>
  </div>
</Section>
```

Notas: `bg-surface/50` sutil para diferenciar sección. Datos estáticos editables arriba. `Badge` en cada item. CTA a `#contacto`.

### 4.3 `src/pages/index.astro` — patch

```astro
---
import Layout from "../components/ui/Layout.astro";
import Navbar from "../components/Navbar.astro";
import Hero from "../sections/Hero.astro";
import About from "../sections/About.astro";
import Proyectos from "../sections/Proyectos.astro";
import CV from "../sections/CV.astro";
---

<Layout title="Angel Ayala — Desarrollador Fullstack">
  <Navbar />
  <main>
    <Hero />
    <About />
    <Proyectos />
    <CV />
    <!-- FASE 7: <Contacto /> -->
  </main>
  <footer>...</footer>
</Layout>
```

## 5. Orden de ejecución

1. Crear `src/components/CVItem.astro` (§4.1)
2. Crear `src/sections/CV.astro` (§4.2)
3. Editar `src/pages/index.astro` (§4.3)
4. Verificar §6

## 6. Criterios de verificación

### 6.1 Automática

```bash
npm run check && npm run build
rg -n "CVItem" src/sections/CV.astro
rg -n "#[0-9a-fA-F]{3,8}" src/components/CVItem.astro src/sections/CV.astro  # vacío
```

### 6.2 Manual

| # | Prueba | Esperado |
|---|---|---|
| 1 | 1280px | 3 columnas (Exp/Edu/Cursos) lado a lado, timeline con línea + punto acento |
| 2 | 768px / 320px | Apila 1 columna, timeline sigue visible, sin overflow |
| 3 | Dark/light | `text-text/accent/text-muted` adaptan, `border-border` visible, `Badge` legible |
| 4 | Tab | Focus en `a[href="#contacto"]` con ring acento |
| 5 | Screen reader | `h2` Experiencia/CV, `h3` bloques, `h4` ítems, `ol aria-label`, `ul badges` |
| 6 | Print preview | Contenido visible sin recortes (Ctrl+P) |

### 6.3 Checklist spec `06-cv-section.md:57`

- [ ] Experiencia, educación y cursos visibles
- [ ] Formato escaneable (títulos destacados, fechas claras)
- [ ] Responsive apila en mobile
- [ ] Sin overflow 320px
- [ ] Semántica `h2/h3/listas`

## 7. Fuera de alcance

- Hero/About/Proyectos (Fases 3-5), Contacto (Fase 7), Deploy (Fase 8)
- Descarga PDF CV (v2, se puede añadir `a href="/cv.pdf" download`)
- Datos desde WP (v1 estático)

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Cursos placeholder poco profesionales | Marcar `TODO` y pedir al usuario completar con cursos reales |
| Timeline con `border-l` causa overflow 320px | `ml-2 pl-6` compensa, probar 320px |
| Duplicar estilos | `CVItem` <30 líneas, usa `Badge` existente |

## 9. Estado

**PLAN GENERADO (2026-08-30) — pendiente de ejecución.** Próximo: Fase 7.
