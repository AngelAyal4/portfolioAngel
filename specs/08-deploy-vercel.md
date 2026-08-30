# 8. Deploy en Vercel

## Objetivo

Poner el portfolio online con CI/CD automático, ISR para contenido de WordPress y dominio custom.

## Configuración Vercel

1. **Importar repo** desde GitHub (o CLI `vercel`)
2. **Framework preset:** Astro (auto-detectado)
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Environment variables:**
   - `WP_GRAPHQL_URL` → URL de producción de WP
   - `REVALIDATION_SECRET` → secreto para ISR
   - `VERCEL_DEPLOY_HOOK_URL` → (opcional) hook de rebuild

## ISR (Incremental Static Regeneration)

- Proyectos se generan en build time
- Cuando se actualiza un proyecto en WP → webhook dispara regeneración
- Config: `astro.config.mjs` con `adapter vercel` y revalidate

## Dominio

- Inicial: `portfolioangel.vercel.app` (o similar)
- Custom futuro: configurar DNS (CNAME → cname.vercel-dns.com)

## Deploy Hook (opcional)

WordPress dispara un webhook cuando se publica/actualiza un proyecto:
- Plugin: **WP Webhooks** o custom hook
- URL: Vercel deploy hook o endpoint de revalidación propio

## Archivos

```
astro.config.mjs (adapter vercel configurado)
.env (variables de entorno locales)
```

## Criterios de Aceptación

- [ ] `npm run build` completa sin errores
- [ ] Deploy en Vercel exitoso
- [ ] Sitio accesible en URL .vercel.app
- [ ] Proyectos cargan desde WP en producción
- [ ] ISR funciona: cambio en WP → rebuild → contenido actualizado
- [ ] Lighthouse performance >90
- [ ] Sin errores de consola en producción
- [ ] HTTPS activo (Vercel lo da por defecto)
