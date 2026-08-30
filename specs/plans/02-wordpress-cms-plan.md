# Plan — FASE 2: WordPress CMS & WPGraphQL

> Fuente: `specs/02-wordpress-cms.md`
> Stack verificado: Astro `^7.2.9` + Tailwind CSS v4 (`@tailwindcss/vite ^4.3.3`) + React (`@astrojs/react ^6.0.4`) + adapter Vercel (`output: 'static'` en `astro.config.mjs:6`) + WordPress `6-php8.3` / MySQL `8` / phpMyAdmin (`docker-compose.yml:1`).
> Fecha: 2026-08-30

---

## 1. Objetivo

Configurar WordPress local como CMS headless para que los proyectos se gestionen vía `/wp-admin` y se consuman vía GraphQL desde Astro. Entregables:

- WPGraphQL activo: `localhost:8080/graphql` responde.
- CPT `proyecto` + taxonomía `categoria-proyecto` vía código (plugin mínimo versionado en `wp-content/`).
- Campos: `title/slug/excerpt/featuredImage/content` nativos + `proyectoUrl/repoUrl/techStack` custom expuestos como `proyectoFields { proyectoUrl repoUrl techStack }` para calcar la query del spec `specs/02-wordpress-cms.md:34-63`.
- 5 términos seed + 3 proyectos seed.
- Capa Astro en `src/lib/{types.ts,wp-client.ts,wp-queries.ts}` tipada, con `WP_GRAPHQL_URL` vía `import.meta.env` (`.env.example:2`).
- Build Astro no se rompe si WP está caído (`getProyectos()` retorna `[]`).

Dependencia: Fase 1 completada. Esta fase no toca `src/styles/global.css` ni `src/components/ui/*` ni `src/context/ThemeContext.tsx`.

## 2. Estado actual del repo (verificado 2026-08-30)

| Pieza | Estado |
|---|---|
| `docker-compose.yml:1` | Existe. Servicios `db:mysql:8` (`3306:3306`), `wordpress:6-php8.3` (`8080:80`), `phpmyadmin` (`8081:80`). Vols `db_data`, `wp_data`, `./wp-content:/var/www/html/wp-content`. **No tocar**. |
| `wp-content/plugins` | Solo `akismet/hello.php` — **WPGraphQL NO instalado**. |
| `wp-content/themes` | `twentytwenty{3,4,5}` stock. No se necesita theme headless. |
| `wp-content/plugins/portfolio-cpt` | No existe — **crear en esta fase**. |
| `src/lib` | Vacío — `wp-client.ts/wp-queries.ts/types.ts` faltan (`src/lib:1`). |
| `.env.example:1` | `WP_GRAPHQL_URL=http://localhost:8080/graphql`, `REVALIDATION_SECRET`, `WP_APP_PASSWORD` placeholders. Correcto. |
| `.gitignore:4` | `.env` gitignored, `.env.example` versionado. OK. |
| `src/pages/api/revalidate.ts:1` | Existe, valida `x-revalidation-secret` vs `import.meta.env.REVALIDATION_SECRET`. **No tocar** (Fase 8). |
| `package.json:8` | Sin deps GraphQL. No se añadirán (`fetch` nativo). Node `>=22.12.0`. |
| `astro.config.mjs:6` | `output:'static'` + `vercel()` + `react()` + `tailwindcss()` vite plugin. No tocar. |

> Bloqueante: instalar + activar WPGraphQL y crear plugin CPT. Sin ello todos los criterios `specs/02-wordpress-cms.md:84-91` fallan.

## 3. Decisiones técnicas (aprobadas)

1. **CPT vía código vs CPT UI / ACF UI:** Plugin mínimo `wp-content/plugins/portfolio-cpt/portfolio-cpt.php` con `register_post_type` + `register_taxonomy` + `register_post_meta`. Versionado en git, reproducible en CI/Vercel, sin pasos manuales ni dependencia de plugins pagos. Descartado ACF Pro / CPT UI por ser click-ops no versionable.
2. **Campos custom sin ACF:** `register_post_meta` con `show_in_rest:true` + `show_in_graphql:true` (`single:true`, `type:'string'`, `auth_callback: current_user_can('edit_posts')`). `techStack` se guarda como string JSON `["Astro","Tailwind"]` y se expone en GraphQL como `[String]` vía resolver que hace `json_decode` + fallback `explode(',')`. Evita `WPGraphQL for ACF` (requiere ACF). Motivo: 1 plugin menos, sin clave Pro.
3. **Nesting `proyectoFields`:** Spec espera `proyectoFields { proyectoUrl repoUrl techStack }` (`02-wordpress-cms.md:49-53`). Se logra con `register_graphql_object_type('ProyectoFields', ...)` + `register_graphql_field('Proyecto','proyectoFields', {resolve: fn get_post_meta})`. Cumple literal la query del spec.
4. **Taxonomía `categoria-proyecto`:** `register_taxonomy('categoria-proyecto', ['proyecto'], {show_in_graphql:true, graphql_single_name:'categoriaProyecto', graphql_plural_name:'categoriasProyecto', show_in_rest:true, hierarchical:false})` para que la query sea `categoriasProyecto { nodes { name slug }}` idéntica al spec.
5. **Endpoint GraphQL:** `WP_GRAPHQL_URL` de `.env.example:2`. `src/lib/wp-client.ts` usa `import.meta.env.WP_GRAPHQL_URL ?? import.meta.env.PUBLIC_WP_GRAPHQL_URL ?? 'http://localhost:8080/graphql'` para SSR + islas React. Sin cache, error tipado si WP caído (retorna `[]` en `getProyectos` para no romper `astro build`).
6. **Imágenes:** `featuredImage { node { sourceUrl altText }}` nativo de WPGraphQL. Seed usará `picsum.photos` o media library vía WP-CLI/REST.
7. **Seed:** Script Node `scripts/seed-proyectos.mjs` con REST + Application Password (`WP_APP_PASSWORD` en `.env.example:11`) + alternativa WP-CLI (`docker compose exec wordpress wp ...`) o carga manual en admin. Mínimo 3 proyectos para `specs/INDEX.md:45` y Fase 5.
8. **Sin nuevas deps npm:** `wp-client` es wrapper `fetch` genérico `<T>`. Tipado estricto en `types.ts`.

## 4. Archivos y código exacto

| Acción | Archivo | Nota |
|---|---|---|
| CREAR | `wp-content/plugins/portfolio-cpt/portfolio-cpt.php` | CPT + tax + meta + GraphQL nesting |
| CREAR | `src/lib/types.ts` | Interfaces `Proyecto/CategoriaProyecto/FeaturedImage` |
| CREAR | `src/lib/wp-client.ts` | `fetchGraphQL<T>(query,variables)` |
| CREAR | `src/lib/wp-queries.ts` | `QUERY_PROYECTOS` + `getProyectos()` |
| CREAR | `scripts/seed-proyectos.mjs` | Seed 3 proyectos + 5 categorías (opcional) |
| VERIFICAR | `docker-compose.yml` | No tocar, solo `up -d` |
| VERIFICAR | `.env.example` | Ya correcto, crear `.env` local desde él |
| NO TOCAR | `astro.config.mjs`, `package.json`, `src/styles/*`, `src/components/ui/*`, `src/context/*`, `src/pages/api/revalidate.ts` | Fase 1 / Fase 8 |

### 4.1 `wp-content/plugins/portfolio-cpt/portfolio-cpt.php`

Plugin <130 líneas, único PHP de la fase. Activar tras `docker compose up`.

```php
<?php
/**
 * Plugin Name: Portfolio CPT — Proyecto
 * Description: CPT proyecto + taxonomia categoria-proyecto + campos proyectoUrl/repoUrl/techStack expuestos en WPGraphQL como proyectoFields.
 * Version: 1.0.0
 * Author: Angel
 */

if (!defined('ABSPATH')) exit;

// 1) CPT proyecto
add_action('init', function () {
    register_post_type('proyecto', [
        'label' => 'Proyectos',
        'labels' => ['name' => 'Proyectos', 'singular_name' => 'Proyecto', 'add_new_item' => 'Añadir Proyecto'],
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'proyecto',
        'graphql_plural_name' => 'proyectos',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'],
        'has_archive' => false,
        'rewrite' => ['slug' => 'proyecto'],
        'menu_icon' => 'dashicons-portfolio',
    ]);

    // 2) Taxonomia categoria-proyecto
    register_taxonomy('categoria-proyecto', ['proyecto'], [
        'label' => 'Categorías de Proyecto',
        'labels' => ['name' => 'Categorías', 'singular_name' => 'Categoría'],
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'categoriaProyecto',
        'graphql_plural_name' => 'categoriasProyecto',
        'hierarchical' => false,
        'rewrite' => ['slug' => 'categoria-proyecto'],
    ]);
});

// 3) Campos meta
add_action('init', function () {
    $auth = fn() => current_user_can('edit_posts');

    register_post_meta('proyecto', 'proyectoUrl', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'proyectoUrl',
        'description' => 'URL del deploy',
        'auth_callback' => $auth,
        'sanitize_callback' => 'sanitize_url',
    ]);

    register_post_meta('proyecto', 'repoUrl', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'repoUrl',
        'description' => 'URL del repositorio',
        'auth_callback' => $auth,
        'sanitize_callback' => 'sanitize_url',
    ]);

    register_post_meta('proyecto', 'techStack', [
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'techStack',
        'description' => 'Tech stack JSON array, ej: ["Astro","Tailwind"]',
        'auth_callback' => $auth,
        'sanitize_callback' => fn($v) => is_string($v) ? wp_kses_post($v) : $v,
    ]);
});

// 4) WPGraphQL: agrupar en proyectoFields { proyectoUrl repoUrl techStack }
add_action('graphql_register_types', function () {
    if (!function_exists('register_graphql_object_type') || !function_exists('register_graphql_field')) return;

    register_graphql_object_type('ProyectoFields', [
        'description' => 'Campos custom de Proyecto',
        'fields' => [
            'proyectoUrl' => ['type' => 'String', 'description' => 'URL deploy'],
            'repoUrl'     => ['type' => 'String', 'description' => 'URL repo'],
            'techStack'   => ['type' => ['list_of' => 'String'], 'description' => 'Tecnologías'],
        ],
    ]);

    register_graphql_field('Proyecto', 'proyectoFields', [
        'type' => 'ProyectoFields',
        'description' => 'Grupo de campos custom',
        'resolve' => function ($post) {
            $id = $post->ID ?? $post->databaseId ?? 0;
            if (!$id && isset($post->ID)) $id = (int) $post->ID;
            $raw = get_post_meta($id, 'techStack', true);
            $tech = [];
            if ($raw) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) $tech = $decoded;
                else $tech = array_filter(array_map('trim', explode(',', (string) $raw)));
            }
            return [
                'proyectoUrl' => get_post_meta($id, 'proyectoUrl', true) ?: null,
                'repoUrl'     => get_post_meta($id, 'repoUrl', true) ?: null,
                'techStack'   => $tech,
            ];
        },
    ]);
});

// 5) Seed de términos al activar
register_activation_hook(__FILE__, function () {
    foreach (['Frontend','Backend','Fullstack','Mobile','Otro'] as $term) {
        if (!term_exists($term, 'categoria-proyecto')) {
            wp_insert_term($term, 'categoria-proyecto', ['slug' => sanitize_title($term)]);
        }
    }
});
```

Notas: `show_in_graphql:true` en CPT/tax/meta es lo que expone automáticamente. El bloque `graphql_register_types` requiere WPGraphQL activo; guard defensivo evita fatal si no lo está. `sanitize_url` / `wp_kses_post` preservan JSON sin truncar.

### 4.2 `src/lib/types.ts`

Tipado 1:1 con la query del spec `02-wordpress-cms.md:35-63`.

```ts
export interface FeaturedImageNode {
  sourceUrl: string;
  altText: string | null;
}

export interface ProyectoFields {
  proyectoUrl: string | null;
  repoUrl: string | null;
  techStack: string[]; // ej: ["Astro","Tailwind","Vercel"]
}

export interface CategoriaProyecto {
  name: string;
  slug: string;
}

export interface Proyecto {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: { node: FeaturedImageNode } | null;
  proyectoFields: ProyectoFields | null;
  categoriasProyecto: { nodes: CategoriaProyecto[] } | null;
}

export interface ProyectosQueryResult {
  proyectos: { nodes: Proyecto[] };
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: unknown }>;
}
```

### 4.3 `src/lib/wp-client.ts`

Wrapper `fetch` sin deps, sin secretos hardcodeados.

```ts
export type FetchGraphQLOptions = {
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  nextFetchOptions?: RequestInit;
};

const WP_URL =
  import.meta.env.WP_GRAPHQL_URL ??
  import.meta.env.PUBLIC_WP_GRAPHQL_URL ??
  "http://localhost:8080/graphql";

export async function fetchGraphQL<T>(
  query: string,
  options: FetchGraphQLOptions = {}
): Promise<T> {
  const { variables, headers, nextFetchOptions } = options;

  const res = await fetch(WP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
    ...nextFetchOptions,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WPGraphQL HTTP ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = (await res.json()) as import("./types").GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(`WPGraphQL: ${json.errors.map((e) => e.message).join(" | ")}`);
  }
  if (!json.data) throw new Error("WPGraphQL: respuesta sin data");

  return json.data;
}
```

`WP_APP_PASSWORD` nunca se usa aquí; solo en `scripts/seed-proyectos.mjs` vía `process.env` (Node).

### 4.4 `src/lib/wp-queries.ts`

Query exacta del spec + helper tolerante a WP caído.

```ts
import { fetchGraphQL } from "./wp-client";
import type { Proyecto, ProyectosQueryResult } from "./types";

export const QUERY_PROYECTOS = /* GraphQL */ `
  query Proyectos {
    proyectos(first: 100) {
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
`;

export async function getProyectos(): Promise<Proyecto[]> {
  try {
    const data = await fetchGraphQL<ProyectosQueryResult>(QUERY_PROYECTOS);
    return data.proyectos?.nodes ?? [];
  } catch (err) {
    console.warn("[wp] getProyectos falló — retorna [] para no romper build:", err);
    return [];
  }
}

// Preparado para Fase 5 (detalle por slug), no requerido aún
export const QUERY_PROYECTO_BY_SLUG = /* GraphQL */ `
  query ProyectoBySlug($slug: ID!) {
    proyecto(id: $slug, idType: SLUG) {
      id
      title
      slug
      excerpt
      content
      featuredImage { node { sourceUrl altText } }
      proyectoFields { proyectoUrl repoUrl techStack }
      categoriasProyecto { nodes { name slug } }
    }
  }
`;
```

### 4.5 `scripts/seed-proyectos.mjs` (opcional pero recomendado)

REST + Application Password para crear 3 proyectos sin tocar admin. Fallback: WP-CLI o carga manual.

```js
// Uso: WP_APP_PASSWORD="xxxx xxxx ..." WP_USER=admin node scripts/seed-proyectos.mjs
// Requiere WP instalado (wizard de :8080 completado) y plugins activos
const WP = (process.env.WP_GRAPHQL_URL || "http://localhost:8080").replace(/\/graphql\/?$/, "");
const USER = process.env.WP_USER || "admin";
const APP_PASS = process.env.WP_APP_PASSWORD;

if (!APP_PASS) { console.error("Falta WP_APP_PASSWORD (generar en WP Admin > Users > Application Passwords)"); process.exit(1); }
const auth = "Basic " + Buffer.from(`${USER}:${APP_PASS}`).toString("base64");

const proyectos = [
  { title:"Portfolio Astro + WP", slug:"portfolio-astro-wp", excerpt:"Portfolio headless con Astro y WPGraphQL", content:"<p>Portfolio headless con Astro, Tailwind y WPGraphQL. SSG + ISR.</p>", proyectoUrl:"https://portfolio.example.com", repoUrl:"https://github.com/angel/portfolio", techStack:["Astro","Tailwind","WordPress","GraphQL"], categoria:"Fullstack", image:"https://picsum.photos/seed/a/800/600" },
  { title:"API Task Manager", slug:"api-task-manager", excerpt:"API REST con auth JWT y CRUD de tareas", content:"<p>API NestJS + PostgreSQL + Docker. Tests con Jest, deploy en Render.</p>", proyectoUrl:"https://api.example.com/docs", repoUrl:"https://github.com/angel/task-api", techStack:["NestJS","PostgreSQL","Docker"], categoria:"Backend", image:"https://picsum.photos/seed/b/800/600" },
  { title:"E-commerce Mobile", slug:"ecommerce-mobile", excerpt:"App de compras con React Native y Stripe", content:"<p>E-commerce con Expo, Stripe y notificaciones push.</p>", proyectoUrl:"https://expo.dev/@angel/app", repoUrl:"https://github.com/angel/shop-mobile", techStack:["React Native","Expo","Stripe"], categoria:"Mobile", image:"https://picsum.photos/seed/c/800/600" },
];

async function wpFetch(path, opts={}) {
  const url = `${WP}/wp-json/wp/v2/${path}`;
  const res = await fetch(url, { headers:{ Authorization: auth, "Content-Type":"application/json", ...(opts.headers||{}) }, ...opts });
  if (!res.ok) throw new Error(`${path} ${res.status} ${await res.text()}`);
  return res.json();
}

async function ensureCategoria(name) {
  const slug = name.toLowerCase();
  const found = await wpFetch(`categoria-proyecto?slug=${slug}`).catch(() => []);
  if (found.length) return found[0].id;
  const created = await wpFetch(`categoria-proyecto`, { method:"POST", body: JSON.stringify({ name, slug }) });
  return created.id;
}

for (const p of proyectos) {
  const catId = await ensureCategoria(p.categoria);
  // Crear post tipo proyecto
  let post;
  try {
    post = await wpFetch(`proyecto`, {
      method: "POST",
      body: JSON.stringify({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        status: "publish",
        "categoria-proyecto": [catId],
        meta: { proyectoUrl: p.proyectoUrl, repoUrl: p.repoUrl, techStack: JSON.stringify(p.techStack) },
      }),
    });
    console.log("Creado", p.slug, "id", post.id);
  } catch (e) {
    console.error("Error creando", p.slug, e.message);
    continue;
  }
  // Sideload imagen destacada (opcional): descargar y POST /media luego PUT /proyecto/{id} con featured_media
}
console.log("Seed OK — 3 proyectos");
```

Si no se usa script, seed manual: WP Admin > Proyectos > Añadir (3 entradas con campos arriba + asignar categoría + imagen destacada).

### 4.6 `.env` local (no versionado)

```bash
cp .env.example .env
# WP_GRAPHQL_URL ya es http://localhost:8080/graphql
# Generar WP_APP_PASSWORD en WP Admin > Usuarios > Contraseñas de aplicación (solo local)
```

`.env` ya está en `.gitignore:4`, `.env.example` queda versionado con placeholders.

### 4.7 Instalación WPGraphQL (infra — no es archivo, es paso verificable)

```bash
docker compose up -d
# esperar 10-15s a que mysql healthy; si es primera vez abrir http://localhost:8080 y completar wizard (crea admin)
docker compose exec wordpress wp plugin install wp-graphql --activate --allow-root \
  || { curl -L https://github.com/wp-graphql/wp-graphql/releases/latest/download/wp-graphql.zip -o /tmp/wpgraphql.zip && unzip -o /tmp/wpgraphql.zip -d wp-content/plugins/; }
docker compose exec wordpress wp plugin activate wp-graphql --allow-root
docker compose exec wordpress wp plugin activate portfolio-cpt --allow-root
```

Alternativa manual: descargar zip desde `https://wordpress.org/plugins/wp-graphql/` y descomprimir en `wp-content/plugins/wp-graphql`.

## 5. Orden de ejecución para `opencode build`

1. `docker compose up -d` y esperar `db` healthy (`docker compose ps`; `curl -I http://localhost:8080` → 200). Si es primera vez, completar wizard en `http://localhost:8080` para crear usuario `admin`.
2. Instalar + activar `wp-graphql` (§4.7) y copiar `wp-content/plugins/portfolio-cpt/portfolio-cpt.php` del plan (§4.1).
3. Activar `portfolio-cpt` (`wp plugin activate portfolio-cpt` o Plugins > Activar en admin).
4. Verificar CPT/tax en admin: Proyectos y Categorías visibles; crear 1 proyecto de prueba y comprobar `show_in_graphql`.
5. Crear `src/lib/types.ts` → `src/lib/wp-client.ts` → `src/lib/wp-queries.ts` en ese orden (types primero por dependencia).
6. `cp .env.example .env` si no existe `.env`.
7. Seed: `node scripts/seed-proyectos.mjs` (con `WP_APP_PASSWORD`) o carga manual 3 proyectos.
8. Verificación §6.

> No modificar `astro.config.mjs:1` ni `package.json:8` ni `src/styles/*` ni `src/components/ui/*` ni `src/pages/api/revalidate.ts:1` en esta fase.

## 6. Criterios de verificación

### 6.1 Automática (comandos)

```bash
# 1. Infra OK
docker compose up -d && docker compose ps
curl -sf http://localhost:8080/graphql -X POST -H "Content-Type: application/json" -d '{"query":"{ generalSettings { title } }"}' | jq .

# 2. WPGraphQL activo
curl -sf http://localhost:8080/graphql -X POST -H "Content-Type: application/json" \
  -d '{"query":"query Proyectos{ proyectos{ nodes{ id title slug } } }"}' | jq .

# 3. CPT + tax + campos expuestos (debe devolver [] o 3 nodos, sin errors)
curl -sf http://localhost:8080/graphql -X POST -H "Content-Type: application/json" \
  -d '{"query":"query Proyectos{ proyectos{ nodes{ id title slug excerpt content featuredImage{node{sourceUrl altText}} proyectoFields{proyectoUrl repoUrl techStack} categoriasProyecto{nodes{name slug}} } } }"}' | jq .

# 4. Tipos y build Astro no roto (WP puede estar caído y getProyectos retorna [])
npm run check   # → 0 errors
npm run build   # → dist/ OK aunque WP caído (warning en consola, no throw)

# 5. Sin secretos hardcodeados
rg -n "rootpassword|REVALIDATION_SECRET|WP_APP_PASSWORD" src/lib --hidden
# debe salir vacío o solo import.meta.env

# 6. Plugin versionado
ls -l wp-content/plugins/portfolio-cpt/portfolio-cpt.php
rg -n "register_post_type.*proyecto|register_taxonomy.*categoria-proyecto|register_graphql_field.*proyectoFields" wp-content/plugins/portfolio-cpt/portfolio-cpt.php
```

### 6.2 Manual (navegador / admin)

| # | Prueba | Esperado |
|---|---|---|
| 1 | `http://localhost:8080/wp-admin` > Proyectos | CPT visible, botón Añadir, editor con excerpt/content/imagen destacada |
| 2 | Crear proyecto test: campos `proyectoUrl`, `repoUrl`, `techStack='["Astro","WP"]'` + categoría `Frontend` | Se guarda, slug autogenerado, meta en `wp_postmeta` |
| 3 | GraphiQL IDE en `http://localhost:8080/graphql` ejecutar query del spec | Retorna nodos con `proyectoFields` y `categoriasProyecto` sin `errors` |
| 4 | `curl` §6.1.3 con 3 proyectos seed | `nodes.length >=3`, cada nodo con `featuredImage.node.sourceUrl` y `techStack` array |
| 5 | Detener Docker (`docker compose stop`) y `npm run build` | Build OK, `getProyectos()` loguea warning y retorna `[]` (no crash) |
| 6 | `http://localhost:8081` phpMyAdmin (root/rootpassword) | Tablas `wp_posts` con `post_type='proyecto'` y `wp_postmeta` con `proyectoUrl/repoUrl/techStack` |

### 6.3 Checklist de aceptación (spec `02-wordpress-cms.md:84-91`)

- [ ] `docker compose up -d` levanta WP en `:8080` + `phpMyAdmin` en `:8081`
- [ ] `localhost:8080/graphql` responde 200 a introspection
- [ ] CPT `proyecto` creado con todos los campos (`title/slug/excerpt/featuredImage/content` + `proyectoUrl/repoUrl/techStack`)
- [ ] Taxonomía `categoria-proyecto` con 5 términos seed (Frontend, Backend, Fullstack, Mobile, Otro)
- [ ] ≥3 proyectos cargados, cada uno con imagen, techStack y categoría
- [ ] `src/lib/wp-client.ts` hace fetch tipado `<T>` y propaga `errors` como throw
- [ ] `src/lib/wp-queries.ts` query devuelve `proyectos { nodes { ... } }` con imagen/techStack/categoría

## 7. Fuera de alcance

- Consumo en UI (grid filtrado, `ProyectoCard`, `ProyectoFilter.tsx`) → Fase 5 (`specs/05-projects-section.md`).
- `src/sections/Proyectos.astro` y filtros React → Fase 5.
- ISR / `revalidate.ts` real con `VERCEL_DEPLOY_HOOK_URL` → Fase 8 (ahora solo log en `src/pages/api/revalidate.ts:15`).
- Estilos, dark/light, `ThemeContext.tsx` → Fase 1 (no tocar).
- `docker-compose.yml` con secrets en prod (ahora `rootpassword` solo local) → Fase 8.
- No añadir deps npm ni modificar `astro.config.mjs`.

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| WordPress no instalado (wizard pendiente en `:8080`) bloquea WP-CLI | Abrir `http://localhost:8080` y completar instalación antes de activar plugins |
| `sanitize_text_field` corrompe JSON de `techStack` | Usar `wp_kses_post` como `sanitize_callback` (§4.1) |
| WPGraphQL no expone `proyectoFields` si se activa antes que WPGraphQL | Guard `function_exists('register_graphql_field')` y activar WPGraphQL primero |
| `techStack` string vs `[String]` mismatch | Resolver hace `json_decode` + fallback `explode(',')` (§4.1) |
| Build Astro falla si WP caído | `getProyectos()` captura error y retorna `[]` (§4.4) |
| `wp_data` volumen persiste estado viejo | `docker compose down -v` solo si se quiere reset; documentar |

## 9. Estado

**PLAN GENERADO (2026-08-30) — pendiente de ejecución por `opencode build`.** Próximo paso: ejecutar §5 archivo por archivo y verificar §6. Luego Fase 3 (`specs/03-hero-section.md`).
