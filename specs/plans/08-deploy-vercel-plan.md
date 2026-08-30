# Plan — FASE 8: Deploy Vercel + ISR

> Fuente: `specs/08-deploy-vercel.md` + `specs/INDEX.md:46` (depende 03-07) + `astro.config.mjs:6` + `src/pages/api/revalidate.ts:1` + `.env.example:1`
> Stack verificado: Astro `^7.2.9` + `@astrojs/vercel ^11.0.8` `output:'static'` + `vercel.json` no existe + `dist/` gitignored + Node `>=22.12.0` (`package.json:5`).
> Fecha: 2026-08-30

---

## 1. Objetivo

Portfolio online con CI/CD automático, env vars y actualización de contenido desde WordPress. Entregables:

- `npm run build` sin errores con y sin WP (`getProyectos()` fallback `08-deploy-vercel.md:44`).
- Deploy en Vercel `portfolioangel.vercel.app` accesible vía HTTPS (`08-deploy-vercel.md:46-47,51`).
- Env vars prod `WP_GRAPHQL_URL`, `REVALIDATION_SECRET`, `VERCEL_DEPLOY_HOOK_URL` (`08-deploy-vercel.md:14`) configuradas en Vercel dashboard.
- ISR simulado: `POST /api/revalidate` con `x-revalidation-secret` dispara redeploy via `VERCEL_DEPLOY_HOOK_URL` o log (`08-deploy-vercel.md:18-21` + `src/pages/api/revalidate.ts:3`).
- Dominio custom futuro `CNAME → cname.vercel-dns.com` (`08-deploy-vercel.md:26`).
- Lighthouse perf >90, sin errores consola (`08-deploy-vercel.md:49`).

Dependencia: **Fases 03-07 completas** (Hero/About/Proyectos/CV/Contacto). Fase 2 WP opcional en prod (fallback si no hay WP prod).

## 2. Estado actual

| Pieza | Estado |
|---|---|
| `astro.config.mjs:6` | `output:'static'` + `adapter: vercel({webAnalytics:{enabled:false}})` + `integrations:[react()]` + `vite:plugins:[tailwindcss()]`. Correcto v1. Para ISR on-demand real requeriría `output:'server'`/`hybrid`, se deja `static` y se simula via webhook redeploy. |
| `src/pages/api/revalidate.ts:1` | `POST` valida `x-revalidation-secret` vs `REVALIDATION_SECRET`, log `Regenerating: ${type} - ${slug}`, retorna `200 {revalidated:true}`. **No llama deploy hook** — parchear en esta fase. |
| `src/pages/api/contacto.ts` | Creado Fase 7 con `prerender=false`. Valida patrón `prerender=false` para APIs en `static`. |
| `.env.example:1` | `WP_GRAPHQL_URL`, `REVALIDATION_SECRET`, `VERCEL_DEPLOY_HOOK_URL`, `WP_APP_PASSWORD`. Falta `PUBLIC_` prefix doc si se usa client. |
| `.env` | Gitignored (` .gitignore:4`), local. No existe en CI — se configura en Vercel. |
| `package.json:8` | `build: astro build`, `preview`, `check`. No `vercel` CLI dep. |
| `vercel.json` | No existe — crear opcional `cleanUrls`. |
| `dist/` | `gitignore:2`, se genera con `npm run build`. |
| `docker-compose.yml:1` | WP local `:8080`, no usado en prod (WP prod sería hosting externo). |

## 3. Decisiones técnicas

1. **SSG vs ISR:** v1 es **SSG puro** (`output:'static'`). Proyectos se fetchean en `Proyectos.astro` build time. ISR on-demand real de Vercel requiere `output:'server'` y `export const prerender=false` + `revalidate` — se documenta como evolución, no se cambia ahora para no romper build. El webhook `revalidate.ts` en v1 hace `fetch(VERCEL_DEPLOY_HOOK_URL, {method:"POST"})` para disparar rebuild completo (suficiente para portfolio con pocos proyectos). Si `VERCEL_DEPLOY_HOOK_URL` no seteado, solo log y `200` (dev).
2. **Env vars:** `WP_GRAPHQL_URL` prod apunta a WP prod (ej. `https://wp.angel-ayala.com/graphql`). Si no hay WP prod, se deja fallback a `https://...` o se usa `isFallback` de Fase 5. `REVALIDATION_SECRET` se genera con `openssl rand -hex 32` y se guarda en Vercel + WP webhook. `VERCEL_DEPLOY_HOOK_URL` se crea en Vercel Dashboard → Settings → Git → Deploy Hooks → `redeploy-proyectos`.
3. **Revalidate API:** Parchear `src/pages/api/revalidate.ts` para `export const prerender=false`, validar secret, opcional `fetch(VERCEL_DEPLOY_HOOK_URL)` con `await` + timeout, manejar `type`/`slug` body, retornar `200/401/500`. Mantener `console.log` para logs Vercel.
4. **Vercel config:** `vercel.json` con `{"cleanUrls":true, "headers":[{"source":"/(.*)","headers":[{"key":"X-Content-Type-Options","value":"nosniff"}]}]}` mínimo seguridad (`AGENTS.md:10` pide CSP/X-Frame). No añadir `rewrites` innecesarios.
5. **Build:** `npm run build` debe pasar sin WP (Fase 2/5 fallback). Vercel `Build Command: npm run build`, `Output: dist`, `Framework: Astro`, `Node 22`. Env vars en Vercel → Project → Settings → Environment Variables.
6. **Dominio:** Inicial `portfolioangel.vercel.app`. Custom futuro: Vercel → Domains → Add → `angel-ayala.com` → añadir `CNAME` en DNS `cname.vercel-dns.com`.
7. **Lighthouse:** Perf >90 requiere: imágenes con `loading="lazy"` ya en `ProyectosGrid`, fuentes self-hosted `@fontsource-variable/*` ya, sin JS pesado (solo 2 islas React `ProyectosGrid` + `ContactForm` `client:load`). `vercel.json` headers ayuda.

## 4. Archivos y código exacto

| Acción | Archivo |
|---|---|
| EDITAR | `src/pages/api/revalidate.ts` — añadir `prerender=false` + `VERCEL_DEPLOY_HOOK_URL` fetch |
| EDITAR | `.env.example` — documentar prod vars + `PUBLIC_` alternativa |
| CREAR | `vercel.json` — `cleanUrls` + headers seguridad |
| CREAR/EDITAR | `README.md` — sección Deploy Vercel + env vars + webhook WP |
| VERIFICAR | `astro.config.mjs` — no tocar (ya correcto), documentar futura migración `output:'server'` |
| NO TOCAR | `src/sections/*`, `src/components/*`, `src/lib/*`, `dist/` |

### 4.1 `src/pages/api/revalidate.ts` — parche

```ts
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const secret = request.headers.get("x-revalidation-secret");
  const REVALIDATION_SECRET = import.meta.env.REVALIDATION_SECRET;
  const DEPLOY_HOOK = import.meta.env.VERCEL_DEPLOY_HOOK_URL;

  if (!REVALIDATION_SECRET || secret !== REVALIDATION_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { slug, type } = body as { slug?: string; type?: string };

    console.log(`[revalidate] ${new Date().toISOString()} — Regenerating: ${type ?? "unknown"} - ${slug ?? "unknown"}`);

    // Dispara redeploy Vercel si hook configurado (opcional, no bloquea)
    if (DEPLOY_HOOK) {
      try {
        const hookRes = await fetch(DEPLOY_HOOK, { method: "POST" });
        console.log(`[revalidate] Deploy hook status: ${hookRes.status}`);
      } catch (err) {
        console.warn("[revalidate] Deploy hook failed:", err);
        // No falla la revalidación por hook caído
      }
    } else {
      console.log("[revalidate] VERCEL_DEPLOY_HOOK_URL no configurado — solo log (dev)");
    }

    return new Response(JSON.stringify({ revalidated: true, message: `Regenerated ${type ?? "all"}: ${slug ?? ""}`.trim() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[revalidate] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
```

Cambios vs original `revalidate.ts:1`: añade `prerender=false` (obligatorio en `static`), valida `REVALIDATION_SECRET` existencia, `fetch(DEPLOY_HOOK)` opcional, JSON consistente, logs con timestamp.

### 4.2 `.env.example` — patch (mantener existentes, añadir comentarios)

```ini
# WordPress WPGraphQL
WP_GRAPHQL_URL=http://localhost:8080/graphql
# En prod: https://wp.tudominio.com/graphql
WP_API_URL=http://localhost:8080/wp-json

# Regeneración ISR
REVALIDATION_SECRET=your-revalidation-secret-here
# Generar con: openssl rand -hex 32
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/your-hook-id
# Crear en Vercel Dashboard → Settings → Git → Deploy Hooks

# WordPress Application Password (prod) — solo local/seed, no exponer en client
# Generar en WP Admin > Users > Application Passwords
WP_APP_PASSWORD=your-app-password-here

# Opcional: si necesitas WP URL en client (islas), usa PUBLIC_ prefix
# PUBLIC_WP_GRAPHQL_URL=https://wp.tudominio.com/graphql
```

`.env` sigue gitignored. En Vercel, añadir `WP_GRAPHQL_URL` prod y `REVALIDATION_SECRET` en `Environment Variables` (Production/Preview).

### 4.3 `vercel.json`

```json
{
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

No añade `rewrites` ni `redirects`. Headers cumplen `AGENTS.md:10` sin `CSP` compleja v1.

### 4.4 `README.md` — sección Deploy (añadir al existente)

```markdown
## Deploy Vercel

### 1. Importar repo
- Vercel → Add New Project → Import GitHub `portfolioAngel` → Framework: Astro (auto) → Build: `npm run build` → Output: `dist` → Node: 22.x

### 2. Env vars (Vercel → Settings → Environment Variables)
- `WP_GRAPHQL_URL` → `https://wp.tudominio.com/graphql` (o deja fallback si aún no hay WP prod)
- `REVALIDATION_SECRET` → `openssl rand -hex 32` (copiar a WP webhook también)
- `VERCEL_DEPLOY_HOOK_URL` → `https://api.vercel.com/v1/integrations/deploy/...` (Deploy Hooks → Create Hook)

### 3. Deploy
- `git push origin main` → Vercel auto-deploy. Verifica `https://portfolioangel.vercel.app` → Proyectos cargan (o fallback).

### 4. Webhook WP (ISR simulado)
- WP Admin → WP Webhooks o snippet en `portfolio-cpt.php`: al `save_post_proyecto` hacer `wp_remote_post("https://portfolioangel.vercel.app/api/revalidate", ["headers"=>["x-revalidation-secret"=>REVALIDATION_SECRET], "body"=>json_encode(["type"=>"proyecto","slug"=>$post->post_name])])`
- Test: `curl -X POST https://portfolioangel.vercel.app/api/revalidate -H "x-revalidation-secret: $REVALIDATION_SECRET" -H "Content-Type: application/json" -d '{"type":"proyecto","slug":"test"}'` → `{"revalidated":true}` y en Vercel → Deployments aparece nuevo deploy.

### 5. Dominio custom (futuro)
- Vercel → Domains → Add `angel-ayala.com` → añadir DNS `CNAME @ → cname.vercel-dns.com` (o `A 76.76.21.21`).

### 6. Lighthouse
- `npm run build && npm run preview` → Chrome DevTools Lighthouse → Performance >90 (ya lazy + fuentes self-hosted).
```

### 4.5 `astro.config.mjs` — verificación (no editar, solo documentar)

```js
// Actual astro.config.mjs:6 ya OK
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static', // v1 SSG; futuro ISR on-demand: cambiar a 'server' o 'hybrid' + prerender en páginas
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
```

Futuro ISR on-demand real: `output:'server'` + `export const prerender = false` en `Proyectos.astro` + `Astro.revalidate`.

## 5. Orden de ejecución

1. Parchear `src/pages/api/revalidate.ts` (§4.1) — añadir `prerender=false` + hook
2. Parchear `.env.example` (§4.2) — comentarios prod
3. Crear `vercel.json` (§4.3)
4. Actualizar `README.md` (§4.4)
5. Verificar §6 (`npm run check && npm run build`)
6. Deploy manual: `vercel --prod` o push a GitHub + configurar env vars en Vercel dashboard
7. Test webhook `curl` y Lighthouse

## 6. Criterios de verificación

### 6.1 Automática

```bash
npm run check  # 0 errors
npm run build  # dist/ con _astro/*, index.html, api/revalidate (si hybrid) o solo static

# Revalidate local (necesita dev server)
npm run dev &
sleep 5
REVALIDATION_SECRET=$(grep REVALIDATION_SECRET .env | cut -d= -f2)
curl -sf -X POST http://localhost:4321/api/revalidate -H "x-revalidation-secret: $REVALIDATION_SECRET" -H "Content-Type: application/json" -d '{"type":"proyecto","slug":"test"}' | jq .
# → {"revalidated":true}
curl -sf -X POST http://localhost:4321/api/revalidate -H "x-revalidation-secret: wrong" -d '{}' | jq .
# → 401

rg -n "prerender = false" src/pages/api/revalidate.ts src/pages/api/contacto.ts
ls -lh vercel.json && cat vercel.json | jq .
```

### 6.2 Manual

| # | Prueba | Esperado |
|---|---|---|
| 1 | `npm run build` con WP parado | Build OK, Proyectos muestra fallback 3 genéricos |
| 2 | `npm run build` con WP activo | Build OK, Proyectos muestra reales de `localhost:8080/graphql` |
| 3 | Vercel deploy `portfolioangel.vercel.app` | Sitio accesible HTTPS, Hero/About/Proyectos/CV/Contacto visibles, sin errores consola |
| 4 | Env var WP prod configurada | Proyectos en prod cargan desde WP prod (no fallback) |
| 5 | `POST /api/revalidate` con secret correcto | `200 {revalidated:true}` + nuevo deployment en Vercel → Deployments (si hook seteado) |
| 6 | `POST /api/revalidate` sin secret | `401 Unauthorized` |
| 7 | Lighthouse `npm run preview` → Chrome | Performance >90, Accessibility >95, Best Practices >95 |
| 8 | Dominio | `https://portfolioangel.vercel.app` con `X-Content-Type-Options: nosniff` header (`curl -I`) |

### 6.3 Checklist spec `08-deploy-vercel.md:42`

- [ ] `npm run build` completa sin errores
- [ ] Deploy en Vercel exitoso
- [ ] Sitio accesible en `.vercel.app`
- [ ] Proyectos cargan desde WP en prod (o fallback si no hay WP prod)
- [ ] ISR simulado: cambio WP → `POST /api/revalidate` → rebuild
- [ ] Lighthouse >90
- [ ] Sin errores consola prod
- [ ] HTTPS activo

## 7. Fuera de alcance

- Migrar a `output:'server'` + `ISR on-demand` real (se deja documentado, no ejecutado)
- WP prod hosting (se asume WP externo ya existe; si no, queda fallback)
- Dominio custom DNS (solo documentado)
- Email real en `contacto.ts` Opción A/C (queda `console.log` Fase 7)

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| `output:'static'` + `prerender=false` en API sin `vercel` adapter | Ya existe `adapter: vercel` en `astro.config.mjs:7`, APIs funcionan en `static` con `prerender=false` |
| `VERCEL_DEPLOY_HOOK_URL` no seteado en prod | `revalidate.ts` hace `if(DEPLOY_HOOK)` y solo log, no falla |
| WP prod no existe aún | `Proyectos.astro` fallback 3 genéricos, deploy no bloquea |
| Secret expuesto en client | `REVALIDATION_SECRET` solo server (`import.meta.env` sin `PUBLIC_`), nunca en `wp-client.ts` |
| Lighthouse <90 por imágenes externas sin `width/height` | `ProyectosGrid` ya usa `width/height` + `loading="lazy"` |

## 9. Estado

**PLAN GENERADO (2026-08-30) — pendiente de ejecución.** Con este se cierra Milestone M4 (Live) `specs/INDEX.md:54`. Próximo: `opencode build` ejecutar Fases 03-07 y luego esta, y `opencode test` QA final.
