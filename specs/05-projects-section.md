# 5. Proyectos Section v2 (Pieza Central) — REESCRITA 2026-09-07

> Criterios que la gobiernan: **CE-2** (CTA principal), **CE-3** (proyectos reales, cero placeholder), **CE-7** (base técnica).
> Reemplaza a la v1 (que aceptaba fallback genérico y skeletons — ambos prohibidos ahora).

## Objetivo

La sección que convierte. El visitante llega acá desde el CTA del hero y en 60 segundos entiende qué construye Angel, con evidencia clicable (demo o código). Es lo que más evalúan reclutadores, líderes técnicos y clientes.

## Lista real (CE-3)

- **Slot 1 (fijo): CashInsight** — app financiera en producción (`https://cashinsight-app.vercel.app`).
- **Slots 2–4 (a definir):** elegir con estos criterios, en orden:
  1. Deploy vivo o repo público legible (sin esto, no entra).
  2. Muestra una skill distinta a los otros slots (ej: backend/API, fullstack, mobile).
  3. Tiene una historia contable: problema → decisión técnica → resultado.
- **Prohibido:** clones de tutorial sin cambios, proyectos sin link vivo ni repo, "próximamente".

## Contrato de contenido por proyecto (en WP)

Cada proyecto trae obligatoriamente:

- `title` + `titleEn` — nombre real.
- `excerpt` + `excerptEn` — 1–2 líneas orientadas a **resultado** ("reduce X", "automatiza Y"), no lista de tech. El tech va en badges.
- `featuredImage` propia (1200×630 aprox., <300KB) con `altText` descriptivo. Prohibido picsum, placeholders y URLs `localhost` en prod.
- Al menos **un link real**: demo viva (`proyectoUrl`) o repo (`repoUrl`). Idealmente ambos.
- `techStack`: máx. 4 visibles (el resto se colapsa en "+N").
- `categoriasProyecto`: 1–2 categorías reales. Los filtros se **derivan** de las categorías existentes, nunca hardcodeados.
- `destacado` (boolean, nuevo en spec 02): ordena la grilla, destacados primero. Límite: 4 proyectos visibles.

## Funcionalidad

1. **Carga:** SSG al build desde WPGraphQL (prod en deploy, local en dev). Sin fetch en cliente.
2. **Filtrado:** React state, por categoría, sin refetch. Botón "Todos" + categorías reales.
3. **Cards:** imagen (lazy + dimensiones fijas contra CLS), título, excerpt, badges, links Demo/Código en nueva pestaña con `rel="noopener"`.
4. **Empty states (únicos estados permitidos):**
   - Sin proyectos en WP → mensaje simple: "Proyectos en camino — mientras tanto, mirá mi GitHub." (nada de skeletons, nada de fallback genérico).
   - Filtro sin coincidencias → "No hay proyectos en esta categoría."
5. **Sin loading skeleton en ningún caso** (preferencia registrada: contenido real o mensaje limpio).

## Interacción

- Filtro: pills, activo con acento, `aria-pressed`.
- Card hover: shadow + translate sutil (ya implementado, mantener).
- Click en card: no abre nada (los links externos son la acción). Detalle/modal queda fuera de alcance.

## Archivos

```
src/sections/
  Proyectos.astro          (EDITAR: quitar fallback genérico + nota "conecta WP")

src/components/
  ProyectoCard.astro       (EDITAR: copy resultado, alt obligatorio)
  ProyectoFilter.tsx       (OK, mantener)
  ProyectosGrid.tsx        (EDITAR: empty state simple, sin skeleton)

src/lib/
  types.ts                 (EDITAR: + titleEn/excerptEn/destacado — ver spec 10 y 02)
  wp-queries.ts            (EDITAR: query con campos EN + destacado, límite 4)
```

## Criterios de Aceptación

- [ ] Los 3–4 proyectos son reales según la lista (CE-3, auditoría manual)
- [ ] Cero placeholders: grep de `example.com`, `github.com/angel`, `picsum`, `localhost` en el HTML de prod → vacío
- [ ] Cada card tiene demo viva o repo (verificado clicando)
- [ ] Excerpts hablan de resultado, no de tech list
- [ ] Filtro deriva categorías de WP (agregar/quitar categoría en WP cambia los pills sin tocar código)
- [ ] Imágenes propias con alt, lazy y sin CLS
- [ ] Responsive 1/2/3 col + sin overflow en 390px
- [ ] `astro check` 0 errores, 0 excepciones en consola
