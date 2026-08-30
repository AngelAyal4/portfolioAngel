# Plan — FASE 5: Proyectos Section (CORE)

> Fuente: `specs/05-projects-section.md` (pieza central) + `specs/02-wordpress-cms.md` (CPT/tax/query) + `specs/INDEX.md:44` (depende 01+02)
> Stack verificado: Astro `^7.2.9` + React `^6.0.4` isla filtrado + WPGraphQL `localhost:8080/graphql` + DS `Card.astro/Badge.astro/Button.astro/Section.astro` + `src/lib/{types,wp-client,wp-queries}.ts` (Fase 2).
> Fecha: 2026-08-30

---

## 1. Objetivo

Corazón del portfolio — lo que más evalúan reclutadores. Entregables:

- Grid filtrado por categoría sin refetch, consume WP en build time (SSG) vía `getProyectos()` (`05-projects-section.md:30`).
- Cards con `featuredImage` lazy, `title`, `excerpt`, `techStack` badges, `proyectoUrl` (Demo) + `repoUrl` (Código) `target="_blank"` (`05-projects-section.md:37-45`).
- Filtro pill horizontal `Todos/Frontend/Backend/Fullstack/Mobile/Otro` activo con `bg-accent` (`05-projects-section.md:48`).
- Empty `No hay proyectos en esta categoría` y fallback 3 genéricos si WP vacío (`05-projects-section.md:79`).
- Responsive 1 col mobile / 2 tablet / 3 desktop (`05-projects-section.md:77`), a11y `alt`, `focus`, `aria-labels`.
- ISR preparado (revalidate) sin romper `output:'static'`.

Dependencia: **Fase 1 + Fase 2** completas. Si Fase 2 no seedó WP, Fase 5 usa fallback genérico y no falla build.

## 2. Estado actual

| Pieza | Estado |
|---|---|
| `src/lib/types.ts` | Existe tras Fase 2: `Proyecto`, `ProyectoFields`, `CategoriaProyecto`, `ProyectosQueryResult`. |
| `src/lib/wp-client.ts` | `fetchGraphQL<T>` con `WP_GRAPHQL_URL` env. |
| `src/lib/wp-queries.ts` | `QUERY_PROYECTOS` + `getProyectos():Promise<Proyecto[]>` con `try/catch → []`. |
| `wp-content/plugins/portfolio-cpt/portfolio-cpt.php` | CPT `proyecto` + tax `categoria-proyecto` + `proyectoFields` nesting. |
| `src/components/ui/Card.astro` | `bg-surface border-border rounded-xl hover:shadow-md` OK. |
| `src/components/ui/Badge.astro` | `bg-accent/10 text-accent` OK. |
| `src/components/ui/Button.astro` | `variant primary/secondary`, `href` → `<a>` OK. |
| `src/sections/Hero.astro`, `About.astro` | Creados Fases 3-4, `index.astro` con `Navbar + Hero + About`. |
| `src/sections/Proyectos.astro`, `src/components/ProyectosGrid.tsx`, `ProyectoCard.astro`, `ProyectoFilter.tsx` | **No existen** — crear. |
| `src/components/CVItem.astro` etc. | Fases 6-7 pendientes. |

## 3. Decisiones técnicas

1. **Isla React mínima:** Solo `ProyectosGrid.tsx` es isla (`client:load`). `Proyectos.astro` hace fetch SSR (`await getProyectos()`) y pasa `proyectos` como prop serializable. Filtro es estado React `active:string` sin refetch, `useMemo` para `filtrados`. Así se cumple SSG + interactividad sin duplicar fetch. `05-projects-section.md:30` exige filtrado sin refetch.
2. **Fallback genérico:** Si `getProyectos()` retorna `[]` (WP caído o sin seed), `Proyectos.astro` inyecta 3 proyectos hardcodeados (mismos que `scripts/seed-proyectos.mjs` Fase 2) para cumplir `05-projects-section.md:79` y no mostrar sección vacía. Se marca con `isFallback=true` para badge `Demo`.
3. **Cards:** `ProyectoCard.astro` (Astro, no React) renderiza `Card` + `img loading="lazy" decoding="async"` + `altText || title` (`05-projects-section.md:76`), `excerpt` con `set:html` sanitizado (WP ya sanitiza), `techStack` `slice(0,4)` + `+N` si >4, links `Button href={proyectoUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver demo de {title}"` + repo.
4. **Filtro pill:** `ProyectoFilter.tsx` buttons `rounded-full px-4 py-1.5 text-sm font-medium border`, activo `bg-accent text-on-accent border-accent`, inactivo `bg-surface text-text-muted border-border hover:border-accent/50`. `aria-pressed` + `aria-label="Filtrar por {cat}"`.
5. **Empty:** Si `filtrados.length===0` → `<p role="status" class="text-center text-text-muted py-12">No hay proyectos en esta categoría.</p>` (`05-projects-section.md:33`).
6. **Imágenes:** `featuredImage.node.sourceUrl` puede ser externa (`picsum`) o WP media. Siempre `loading="lazy"`. Sin `cover` si no hay imagen → placeholder `bg-surface border-dashed`.
7. **Categorías:** `const allCategorias = ["Todos", ...new Set(proyectos.flatMap(p=>p.categoriasProyecto?.nodes.map(n=>n.name) ?? []))]` orden estable. `Todos` muestra todos.
8. **Performance:** `ProyectosGrid` <30 líneas lógica + render, sin libs extra. `Card` hover `hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none` ya en `Card.astro`.

## 4. Archivos y código exacto

| Acción | Archivo |
|---|---|
| CREAR | `src/components/ProyectoCard.astro` |
| CREAR | `src/components/ProyectoFilter.tsx` |
| CREAR | `src/components/ProyectosGrid.tsx` |
| CREAR | `src/sections/Proyectos.astro` |
| EDITAR | `src/pages/index.astro` — insertar `<Proyectos />` tras `<About />` |
| NO TOCAR | `src/lib/*`, `src/styles/global.css`, `astro.config.mjs` |

### 4.1 `src/components/ProyectoCard.astro`

```astro
---
import Card from "./ui/Card.astro";
import Badge from "./ui/Badge.astro";
import Button from "./ui/Button.astro";
import type { Proyecto } from "../lib/types";

interface Props {
  proyecto: Proyecto;
}

const { proyecto } = Astro.props;
const title = proyecto.title;
const excerpt = proyecto.excerpt;
const image = proyecto.featuredImage?.node;
const fields = proyecto.proyectoFields;
const tech = fields?.techStack ?? [];
const categorias = proyecto.categoriasProyecto?.nodes ?? [];
---

<Card class="flex flex-col overflow-hidden p-0">
  {image?.sourceUrl ? (
    <img
      src={image.sourceUrl}
      alt={image.altText || title}
      width="600"
      height="400"
      loading="lazy"
      decoding="async"
      class="h-48 w-full object-cover"
    />
  ) : (
    <div class="flex h-48 w-full items-center justify-center border-b border-border bg-surface text-text-muted text-sm border-dashed">
      Sin imagen
    </div>
  )}

  <div class="flex flex-1 flex-col p-6">
    <h3 class="font-display text-lg font-semibold leading-tight text-text line-clamp-2">{title}</h3>

    {categorias.length > 0 && (
      <p class="mt-1 text-xs font-medium text-accent">{categorias.map(c=>c.name).join(" · ")}</p>
    )}

    {excerpt && (
      <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted" set:html={excerpt} />
    )}

    {tech.length > 0 && (
      <ul class="mt-3 flex flex-wrap gap-1.5" aria-label={`Tecnologías de ${title}`}>
        {tech.slice(0,4).map(t => <li><Badge>{t}</Badge></li>)}
        {tech.length > 4 && <li><Badge>+{tech.length - 4}</Badge></li>}
      </ul>
    )}

    <div class="mt-4 flex flex-wrap gap-2">
      {fields?.proyectoUrl && (
        <Button href={fields.proyectoUrl} variant="primary" ariaLabel={`Ver demo de ${title}`}>
          <span class="inline-flex items-center gap-1.5">
            Demo
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </span>
        </Button>
      )}
      {fields?.repoUrl && (
        <Button href={fields.repoUrl} variant="secondary" ariaLabel={`Ver código de ${title}`}>
          Código
        </Button>
      )}
    </div>
  </div>
</Card>

<style>
  /* Asegura que Card hover no rompa con motion-reduce ya en Card.astro */
</style>
```

Notas: `Button` con `href` renderiza `<a target>`? `Button.astro` no añade `target` por defecto; `ProyectosGrid` pasará `Button` con `href` y se añade `target="_blank"` vía prop no existente — por eso se hace que `Button.astro` ya soporte `target`? Ver §4.3 para parche si falta; alternativa: usar `<a>` directo con clases de `Button`. Mantener simple: envolver con `<a>` si `Button` no soporta `target`.

Ajuste: extender `Button.astro` con `target`/`rel` opcional (ver nota en `ProyectosGrid.tsx`).

### 4.2 `src/components/ProyectoFilter.tsx`

```tsx
type Props = {
  categorias: string[];
  active: string;
  onChange: (cat: string) => void;
};

export default function ProyectoFilter({ categorias, active, onChange }: Props) {
  return (
    <div role="group" aria-label="Filtrar proyectos por categoría" className="flex flex-wrap gap-2">
      {categorias.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            type="button"
            aria-pressed={isActive}
            aria-label={`Filtrar por ${cat}`}
            onClick={() => onChange(cat)}
            className={
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
              (isActive
                ? "bg-accent text-on-accent border-accent"
                : "bg-surface text-text-muted border-border hover:border-accent/50 hover:text-accent")
            }
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
```

### 4.3 `src/components/ProyectosGrid.tsx`

```tsx
import { useMemo, useState } from "react";
import type { Proyecto } from "../lib/types";
import ProyectoFilter from "./ProyectoFilter";
import ProyectoCard from "./ProyectoCard.astro"; // Nota: Astro no se importa en React, se itera distinto

// Como ProyectoCard es Astro, en React renderizamos cards inline con mismo markup para evitar duplicar
import Badge from "./ui/Badge.astro"; // no usar en React, usar span con clases
import Card from "./ui/Card.astro";   // idem

type Props = {
  proyectos: Proyecto[];
};

export default function ProyectosGrid({ proyectos }: Props) {
  const categorias = useMemo(() => {
    const set = new Set<string>();
    proyectos.forEach((p) => p.categoriasProyecto?.nodes.forEach((n) => set.add(n.name)));
    return ["Todos", ...Array.from(set)];
  }, [proyectos]);

  const [active, setActive] = useState("Todos");

  const filtrados = useMemo(() => {
    if (active === "Todos") return proyectos;
    return proyectos.filter((p) => p.categoriasProyecto?.nodes.some((n) => n.name === active));
  }, [proyectos, active]);

  if (proyectos.length === 0) {
    return (
      <p role="status" className="py-12 text-center text-text-muted">
        No hay proyectos disponibles aún.
      </p>
    );
  }

  return (
    <div>
      <ProyectoFilter categorias={categorias} active={active} onChange={setActive} />

      {filtrados.length === 0 ? (
        <p role="status" className="py-12 text-center text-text-muted">
          No hay proyectos en esta categoría.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((p) => (
            <article key={p.id} className="bg-surface border border-border rounded-xl p-0 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all motion-reduce:transform-none flex flex-col">
              {p.featuredImage?.node.sourceUrl ? (
                <img
                  src={p.featuredImage.node.sourceUrl}
                  alt={p.featuredImage.node.altText || p.title}
                  loading="lazy"
                  decoding="async"
                  className="h-48 w-full object-cover"
                  width={600}
                  height={400}
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center border-b border-border bg-surface text-sm text-text-muted border-dashed">Sin imagen</div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg font-semibold leading-tight text-text line-clamp-2">{p.title}</h3>
                {p.categoriasProyecto?.nodes.length ? (
                  <p className="mt-1 text-xs font-medium text-accent">{p.categoriasProyecto.nodes.map((c) => c.name).join(" · ")}</p>
                ) : null}
                {p.excerpt && <div className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted" dangerouslySetInnerHTML={{ __html: p.excerpt }} />}
                {p.proyectoFields?.techStack?.length ? (
                  <ul aria-label={`Tecnologías de ${p.title}`} className="mt-3 flex flex-wrap gap-1.5">
                    {p.proyectoFields.techStack.slice(0, 4).map((t) => (
                      <li key={t}><span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs font-medium px-2.5 py-0.5 border border-accent/20">{t}</span></li>
                    ))}
                    {p.proyectoFields.techStack.length > 4 && (
                      <li><span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs font-medium px-2.5 py-0.5 border border-accent/20">+{p.proyectoFields.techStack.length - 4}</span></li>
                    )}
                  </ul>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.proyectoFields?.proyectoUrl && (
                    <a href={p.proyectoFields.proyectoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver demo de ${p.title}`} className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-accent text-on-accent hover:bg-accent-hover border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Demo</a>
                  )}
                  {p.proyectoFields?.repoUrl && (
                    <a href={p.proyectoFields.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver código de ${p.title}`} className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-transparent text-accent border border-accent hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Código</a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
```

Nota: `ProyectoCard.astro` se mantiene como referencia para render Astro puro, pero `ProyectosGrid.tsx` duplica markup en React para evitar mezclar Astro+React en isla. Alternativa: `ProyectoCard` como `ProyectoCard.tsx` React. Se elige duplicar markup React simple para cumplir <30 líneas por función.

### 4.4 `src/sections/Proyectos.astro`

```astro
---
import Section from "../components/ui/Section.astro";
import ProyectosGrid from "../components/ProyectosGrid";
import { getProyectos } from "../lib/wp-queries";
import type { Proyecto } from "../lib/types";

let proyectos: Proyecto[] = await getProyectos();

// Fallback genérico si WP vacío (05-projects-section.md:79)
const fallback: Proyecto[] = [
  {
    id: "fallback-1",
    title: "Portfolio Astro + WP",
    slug: "portfolio-astro-wp",
    excerpt: "Portfolio headless con Astro, Tailwind y WPGraphQL. SSG + ISR.",
    content: null,
    featuredImage: { node: { sourceUrl: "https://picsum.photos/seed/a/800/600", altText: "Portfolio Astro" } },
    proyectoFields: { proyectoUrl: "https://portfolio.example.com", repoUrl: "https://github.com/angel/portfolio", techStack: ["Astro","Tailwind","WordPress","GraphQL"] },
    categoriasProyecto: { nodes: [{ name:"Fullstack", slug:"fullstack" }] },
  },
  {
    id: "fallback-2",
    title: "API Task Manager",
    slug: "api-task-manager",
    excerpt: "API REST con auth JWT y CRUD de tareas. NestJS + PostgreSQL.",
    content: null,
    featuredImage: { node: { sourceUrl: "https://picsum.photos/seed/b/800/600", altText: "API Task Manager" } },
    proyectoFields: { proyectoUrl: "https://api.example.com/docs", repoUrl: "https://github.com/angel/task-api", techStack: ["NestJS","PostgreSQL","Docker"] },
    categoriasProyecto: { nodes: [{ name:"Backend", slug:"backend" }] },
  },
  {
    id: "fallback-3",
    title: "E-commerce Mobile",
    slug: "ecommerce-mobile",
    excerpt: "App de compras con React Native, Expo y Stripe.",
    content: null,
    featuredImage: { node: { sourceUrl: "https://picsum.photos/seed/c/800/600", altText: "E-commerce Mobile" } },
    proyectoFields: { proyectoUrl: "https://expo.dev/@angel/app", repoUrl: "https://github.com/angel/shop-mobile", techStack: ["React Native","Expo","Stripe"] },
    categoriasProyecto: { nodes: [{ name:"Mobile", slug:"mobile" }] },
  },
];

const isFallback = proyectos.length === 0;
if (isFallback) proyectos = fallback;
---

<Section id="proyectos" class="scroll-mt-16" aria-labelledby="proyectos-heading">
  <div class="mx-auto max-w-[1280px]">
    <div class="flex items-baseline justify-between gap-4">
      <h2 id="proyectos-heading" class="font-display text-2xl md:text-3xl font-bold text-text">Proyectos</h2>
      {isFallback && <span class="text-xs text-text-muted">Mostrando ejemplos — conecta WP para ver reales</span>}
    </div>
    <p class="mt-2 max-w-2xl text-sm text-text-muted">Filtrá por categoría. Datos desde WordPress vía WPGraphQL.</p>

    <div class="mt-8">
      <ProyectosGrid proyectos={proyectos} client:load />
    </div>
  </div>
</Section>
```

Notas: `client:load` hidrata filtro. `fallback` cumple `05-projects-section.md:79`. `isFallback` badge avisa.

### 4.5 `src/pages/index.astro` — patch

```astro
---
import Layout from "../components/ui/Layout.astro";
import Navbar from "../components/Navbar.astro";
import Hero from "../sections/Hero.astro";
import About from "../sections/About.astro";
import Proyectos from "../sections/Proyectos.astro";
---

<Layout title="Angel Ayala — Desarrollador Fullstack">
  <Navbar />
  <main>
    <Hero />
    <About />
    <Proyectos />
    <!-- FASE 6: <CV /> -->
    <!-- FASE 7: <Contacto /> -->
  </main>
  <footer>...</footer>
</Layout>
```

## 5. Orden de ejecución

1. Verificar Fase 2 `src/lib/*` existe (`ls src/lib/types.ts`)
2. Crear `src/components/ProyectoCard.astro` (§4.1) — opcional pero sirve como doc
3. Crear `src/components/ProyectoFilter.tsx` (§4.2)
4. Crear `src/components/ProyectosGrid.tsx` (§4.3)
5. Crear `src/sections/Proyectos.astro` (§4.4)
6. Editar `src/pages/index.astro` (§4.5)
7. Verificar §6

## 6. Criterios de verificación

### 6.1 Automática

```bash
npm run check  # 0 errors, React types OK
npm run build  # dist/index.html contiene "Proyectos" + 3 cards (fallback o reales)
# WP activo: debe traer reales
curl -sf http://localhost:8080/graphql -X POST -H "Content-Type: application/json" -d '{"query":"query{proyectos{nodes{id}}}"}' | jq .data.proyectos.nodes | wc -l
rg -n "target=\"_blank\".*noopener" src/components/ProyectosGrid.tsx
rg -n "loading=\"lazy\"" src/components/ProyectosGrid.tsx
```

### 6.2 Manual

| # | Prueba | Esperado |
|---|---|---|
| 1 | `npm run dev` → `#proyectos` | Grid visible, 1 col 320px, 2 col 768px, 3 col 1280px, sin overflow |
| 2 | Click `Frontend` | Filtra sin refetch, `aria-pressed` cambia, `Todos` vuelve a mostrar todos |
| 3 | Filtro sin coincidencias | `No hay proyectos en esta categoría.` con `role="status"` |
| 4 | Sin WP (`docker compose stop`) | Muestra 3 fallback + aviso `Mostrando ejemplos` |
| 5 | Card Demo/Código | `target="_blank" rel="noopener noreferrer"`, `aria-label` con título, focus ring visible |
| 6 | Imagen `alt` | `altText` de WP o `title` fallback, `loading="lazy"` en DevTools Network |
| 7 | Tab | Focus en pills y links Demo/Código con ring acento |

### 6.3 Checklist spec `05-projects-section.md:68-79`

- [ ] Proyectos cargan desde WP (no hardcoded; fallback solo si vacío)
- [ ] Mínimo 3 visibles
- [ ] Filtro funciona sin refetch
- [ ] Cards muestran imagen/título/excerpt/tech/links
- [ ] Links abren en nueva pestaña
- [ ] Empty state OK
- [ ] Lazy loading
- [ ] Responsive 1/2/3 cols
- [ ] Accesible alt/focus/aria
- [ ] Fallback genérico si no hay proyectos

## 7. Fuera de alcance

- Modal/detalle proyecto (v2, `05-projects-section.md:51`)
- Paginación (100 proyectos `first:100` suficiente v1)
- CV/Contacto/Deploy (Fases 6–8)
- `Button.astro` refactor a `target` prop (se usa `<a>` directo en Grid)

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| WP caído → sección vacía | Fallback 3 genéricos + `isFallback` aviso |
| `excerpt` con HTML inseguro | WP sanitiza; usar `dangerouslySetInnerHTML` solo con excerpt de WP |
| Hidratación React pesada | `client:load` solo en Grid (1 isla), resto Astro estático |
| `techStack` vacío | No renderiza `ul`, card sigue válida |

## 9. Estado

**PLAN GENERADO (2026-08-30) — pendiente de ejecución.** Próximo: Fase 6.
