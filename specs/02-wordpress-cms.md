# 2. WordPress CMS & WPGraphQL

## Objetivo

Configurar WordPress local como CMS headless para que los proyectos se gestionen vía panel de administración y se consuman via GraphQL desde Astro.

## Stack WP

- WordPress 6 + PHP 8.3 (docker-compose ya configurado)
- Plugin: **WPGraphQL** (gratuito, activa endpoint `/graphql`)
- Plugin: **WPGraphQL for ACF** (si usamos Advanced Custom Fields)

## Content Model

### Custom Post Type: `proyecto`

Campos:
- `title` (nativo) — Nombre del proyecto
- `slug` (nativo) — URL-friendly
- `excerpt` (nativo) — Descripción corta (card)
- `featuredImage` (nativo) — Imagen principal
- `content` (nativo) — Descripción larga (HTML)
- `proyectoURL` (ACF o meta) — Link al deploy
- `repoURL` (ACF o meta) — Link al repositorio
- `techStack` (taxonomy o repeater) — Tecnologías usadas
- `categoria` (taxonomy) — Frontend / Backend / Fullstack / Mobile

### Taxonomía: `categoria-proyecto`

Términos: Frontend, Backend, Fullstack, Mobile, Otro

## GraphQL Query (referencia)

```graphql
query Proyectos {
  proyectos {
    nodes {
      id
      title
      slug
      excerpt
      content
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      proyectoFields {
        proyectoUrl
        repoUrl
        techStack
      }
      categoriasProyecto {
        nodes {
          name
          slug
        }
      }
    }
  }
}
```

## Configuración Docker

- `docker-compose up -d` → WP en `:8080`, MySQL en `:3306`, phpMyAdmin en `:8081`
- `./wp-content` montado como volumen para themes/plugins
- WPGraphQL instalado y activado

## Archivos

```
docker-compose.yml (ya existe)
wp-content/plugins/ (WPGraphQL instalado)

src/lib/
  wp-client.ts (fetch wrapper para GraphQL)
  wp-queries.ts (queries tipadas)
  types.ts (interfaces TypeScript: Proyecto, Categoria, etc.)
```

## Criterios de Aceptación

- [ ] `docker-compose up -d` levanta WP en localhost:8080
- [ ] WPGraphQL activo: `localhost:8080/graphql` responde
- [ ] CPT `proyecto` creado con todos los campos
- [ ] Taxonomía `categoria-proyecto` con términos seed
- [ ] Al menos 3 proyectos de ejemplo cargados en WP
- [ ] `wp-client.ts` hace fetch y tipa la respuesta
- [ ] La query devuelve proyectos con imagen, tech stack y categoría
