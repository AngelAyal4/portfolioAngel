# 2. WordPress CMS & WPGraphQL v2 — REESCRITA 2026-09-07

> Criterios: **CE-3** (contenido real), **CE-4** (campos EN), **CE-6** (WP productivo).
> La v1 solo cubría WP local. Esta v2 suma campos nuevos + la decisión productiva pendiente.

## Objetivo

WP como CMS headless en dos entornos: **local** (autoría y dev, ya funciona) y **productivo** (GraphQL + media públicos para el build de Vercel).

## Lo que se mantiene (local, verificado)

- `docker-compose`: WP `:8080`, MySQL `:3306`, phpMyAdmin `:8081`.
- Plugins: WPGraphQL + CPT `proyecto` (ver `wp-content/plugins/portfolio-cpt/`).
- `src/lib/wp-client.ts`, `wp-queries.ts`, `types.ts` con fallback `[]` si WP cae (el build nunca rompe por WP).

## Cambios al content model (nuevos)

Campos a agregar al CPT `proyecto` (vía `portfolio-cpt.php`):

- `destacado` (boolean) — ordena la grilla, destacados primero (spec 05).
- `titleEn`, `excerptEn` (text) — copy inglés con fallback a ES (spec 10). El `content` largo queda solo en ES por ahora.
- Regla de media: imágenes propias, ~1200×630, <300KB, con `altText` siempre cargado.

Query `QUERY_PROYECTOS`: sumar `destacado`, `titleEn`, `excerptEn`; ordenar destacados primero; límite 4.

## WordPress productivo (CE-6 — decisión abierta)

Requisitos no negociables, viva donde viva:

1. URL pública HTTPS con `/graphql` accesible desde los builders de Vercel.
2. Media servida desde dominio público (las `sourceUrl` van al HTML tal cual — nada de `localhost`).
3. Mismo CPT + campos que local (exportar/importar config del plugin).
4. `WP_APP_PASSWORD` para el endpoint de revalidación si se usa autenticado (ver spec 08).

**Recomendación por defecto: hosting WordPress administrado (compartido) con SSL gratis.** Por qué: 3–4 posts + media mínima no justifican un VPS; cero mantenimiento; costo menor. El VPS propio solo si el objetivo pasa a ser practicar infra — hoy el objetivo es el portfolio, no el hosting.

## Variables

```
# Local (dev) — ya existen
WP_GRAPHQL_URL=http://localhost:8080/graphql
# Prod (solo Vercel dashboard + .env local para probar prod)
WP_GRAPHQL_URL_PROD=https://wp.tudominio.com/graphql
```

El cliente elige URL según `import.meta.env.PROD` (o variable `PUBLIC_ENV`). Nunca hardcodear hosts en `wp-client.ts`.

## Archivos

```
wp-content/plugins/portfolio-cpt/portfolio-cpt.php (EDITAR: + destacado, titleEn, excerptEn)
src/lib/types.ts (EDITAR: nuevos campos)
src/lib/wp-queries.ts (EDITAR: query extendida + orden + límite)
src/lib/wp-client.ts (EDITAR: selección local/prod por entorno)
.env.example (EDITAR: + WP_GRAPHQL_URL_PROD)
```

## Criterios de Aceptación

- [ ] Local intacto: `:8080/graphql` responde, 3 posts de prueba visibles en dev
- [ ] CPT tiene `destacado`, `titleEn`, `excerptEn` (verificado en GraphiQL)
- [ ] Query devuelve los 4 campos nuevos y ordena destacados primero
- [ ] Proyecto sin copy EN muestra ES (fallback, con spec 10)
- [ ] Decisión productiva tomada (hosting vs VPS) y documentada acá
- [ ] Build con `WP_GRAPHQL_URL_PROD` trae proyectos con imágenes que cargan fuera de la LAN (CE-6)
- [ ] Caída de WP en build → `[]` + empty state limpio, build verde igual
