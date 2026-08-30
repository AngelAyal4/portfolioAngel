# 5. Proyectos Section (Pieza Central)

## Objetivo

El corazón del portfolio. Mostrar proyectos con filtrado dinámico por categoría. Consume WordPress via WPGraphQL. ES lo que más evalúan reclutadores y clientes.

## Estructura

```
┌─────────────────────────────────────────┐
│   PROYECTOS                             │
│                                         │
│   [Todos] [Frontend] [Backend] [Full]   │
│   ────── (filtro horizontal) ──────     │
│                                         │
│   ┌──────────┐  ┌──────────┐            │
│   │ Proyecto │  │ Proyecto │            │
│   │ Card     │  │ Card     │            │
│   │ (img +   │  │ (img +   │            │
│   │ title +  │  │ title +  │            │
│   │ tags +   │  │ tags +   │            │
│   │ links)   │  │ links)   │            │
│   └──────────┘  └──────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

## Funcionalidad

1. **Carga inicial:** Fetch a WPGraphQL al build time (SSG) o ISR
2. **Filtrado:** React state, filtra por `categoria` sin refetch
3. **Cards:** Imagen, título, excerpt, tech stack badges, links (demo + repo)
4. **Empty state:** "No hay proyectos en esta categoría"
5. **Loading state:** Skeleton o spinner durante fetch (ISR revalidación)

## Datos (desde WP CPT `proyecto`)

Cada card muestra:
- `featuredImage` (con lazy loading)
- `title`
- `excerpt`
- `techStack` (badges)
- `proyectoURL` (botón "Demo")
- `repoURL` (botón "Código")
- `categoriasProyecto` (determina filtro)

## Interacción

- Filtro: botones tipo pill, activo con acento
- Card hover: leve scale + shadow
- Click en card → NO abre (simples cards con links externos) O abre modal/detalle (v2)

## Archivos

```
src/sections/
  Proyectos.astro

src/components/
  ProyectoCard.astro
  ProyectoFilter.tsx (React — estado de filtro)
  ProyectosGrid.tsx (React — grid filtrado)

src/lib/
  types.ts (interfaces: Proyecto, Categoria)
```

## Criterios de Aceptación

- [ ] Proyectos cargan desde WP (no hardcoded)
- [ ] Mínimo 3 proyectos visibles
- [ ] Filtro por categoría funciona sin refetch
- [ ] Cards muestran imagen, título, excerpt, tech, links
- [ ] Links demo + repo abren en nueva pestaña
- [ ] Empty state cuando filtro no coincide
- [ ] Lazy loading en imágenes
- [ ] Responsive: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] Accesible: alt text en imágenes, focus en links, aria-labels
- [ ] En caso de no tener proyectos creados aun se creara una ejemplo generico hasta que se cargue con un proyecto
