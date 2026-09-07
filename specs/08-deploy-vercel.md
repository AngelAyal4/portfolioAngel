# 8. Deploy en Vercel v2 — REESCRITA 2026-09-07

> Criterios: **CE-1** (analytics día uno), **CE-6** (WP prod), **CE-7** (base técnica), **CE-8** (gate pre-deploy).
> Cambios fuertes vs v1: el endpoint `/api/revalidate` hoy solo loguea (no regenera nada); el gate CE-8 es obligatorio.

## Objetivo

Portfolio online con CI/CD, contenido WP productivo, formulario real, analytics desde el día uno — y **ningún deploy con placeholders**.

## Configuración Vercel

1. Importar repo desde GitHub, preset Astro, build `npm run build`, output `dist`.
2. Variables (dashboard Vercel, nunca en código):
   - `WP_GRAPHQL_URL` → GraphQL **productivo** (spec 02)
   - `REVALIDATION_SECRET` → secreto del endpoint revalidate
   - `VERCEL_DEPLOY_HOOK_URL` → hook de rebuild (hay que **usarlo**, ver punto siguiente)
   - `RESEND_API_KEY` + `CONTACT_TO_EMAIL` → formulario real (spec 07)
   - `PUBLIC_SITE_URL` → canónica (`https://...vercel.app` hasta tener dominio)
3. `.env.example` refleja todas (placeholders, sin valores).

## Revalidación (fix obligatorio)

El `POST /api/revalidate` actual valida el secreto pero **solo hace `console.log`** — no regenera nada. En esta fase se cablea: secreto válido → `fetch(VERCEL_DEPLOY_HOOK_URL, { method: "POST" })` server-side → 200 con estado del hook. Secreto inválido → 401 (actual, mantener). Documentar en WP qué evento dispara el webhook (publicar/actualizar `proyecto`).

## Analytics día uno (CE-1)

Sin medición no hay CE-1. Activar Vercel Analytics (o equivalente con 1 snippet) en el deploy inicial. Eventos mínimos: vista por sección (anchors) + submit exitoso del formulario.

## Gate pre-deploy (CE-8, obligatorio)

Ningún deploy a producción sin este checklist verde:

- [ ] CE-3: auditoría placeholders (grep `example.com|github.com/angel|picsum|localhost` en HTML prod → vacío)
- [ ] CE-5: POST de prueba en la URL de preview → email recibido
- [ ] CE-6: proyectos e imágenes cargan desde WP prod fuera de la LAN
- [ ] CE-7: `astro check` 0 errores, 0 excepciones consola, Lighthouse ≥90 (mobile, performance + a11y)
- [ ] CE-4: recorrido ES + EN en la URL de preview
- [ ] Regla operativa respetada: build de verificación con el dev detenido

## Dominio

Inicial: `*.vercel.app`. Dominio custom = fase posterior (fuera de alcance acá).

## Archivos

```
src/pages/api/revalidate.ts (EDITAR: disparar deploy hook de verdad)
src/components/ui/Layout.astro (EDITAR: snippet analytics + hreflang con spec 10)
.env.example (EDITAR: todas las vars con placeholders)
```

## Criterios de Aceptación

- [ ] Deploy verde en `*.vercel.app` con las 5 vars configuradas
- [ ] Revalidate con secreto válido dispara rebuild (verificado cambiando un proyecto en WP prod)
- [ ] Revalidate con secreto inválido → 401
- [ ] Analytics recibe eventos (vista + submit) en las primeras 24h
- [ ] Gate CE-8 firmado antes del primer deploy (evidencia en el log de sesión)
- [ ] HTTPS activo, sin errores de consola en prod
