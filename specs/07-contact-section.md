# 7. Contacto Section + API v2 — REESCRITA 2026-09-07

> Criterio que la gobierna: **CE-5** (formulario que envía de verdad).
> Decisión aprobada: **Resend**. Reemplaza a la v1 (opciones A/B/C abiertas, "log en prod" como aceptable — ya no lo es).

## Objetivo

Que un reclutador o cliente escriba y el mensaje **llegue al email real de Angel**, con confirmación visible y sin fricción. El formulario es el segundo conversor después de Proyectos.

## Contenido real (CE-5)

- Links GitHub/LinkedIn/email reales (hoy son `github.com/angel`, `angel@example.com` — reemplazar).
- Fuera el copy interno ("Actualiza los links en...", "Edita src/...").

## Envío con Resend

1. **API route** `src/pages/api/contacto.ts` (EDITAR):
   - Mantiene validación server-side actual (nombre ≥2, email válido, mensaje ≥10, honeypot silencioso) + límites de longitud actuales.
   - Si existe `RESEND_API_KEY` → envía con el SDK (`resend` package) a `CONTACT_TO_EMAIL`, `from` en el dominio verificado o `onboarding@resend.dev` en pruebas, `replyTo` = email del visitante.
   - Si NO existe (dev local) → `console.log` como hoy y 200 (comportamiento dev intacto).
   - Respuesta 200: `{ ok: true, message }` (bilingüe vía spec 10). Error de Resend → 502 con mensaje genérico al cliente, detalle en server log. Nunca exponer la key ni el error crudo.
2. **Antispam:** honeypot (actual) + throttle simple (máx. 5 POST / 10 min por IP, 429 si excede). Sin captcha.
3. **Cliente** `ContactForm.tsx` (EDITAR menor): mensajes de validación y feedback desde diccionarios i18n (spec 10). Resto igual (labels, `aria-live`, estados — ya correctos).

## Variables de entorno

```
RESEND_API_KEY=re_...        (solo servidor, NUNCA prefijo PUBLIC_)
CONTACT_TO_EMAIL=angel@...   (email real)
```

Agregar ambas a `.env.example` con placeholders (sin valores reales). `.env` real solo en local + dashboard de Vercel.

## Archivos

```
src/pages/api/contacto.ts  (EDITAR: envío Resend + throttle + i18n)
src/components/ContactForm.tsx (EDITAR: strings a diccionarios)
src/sections/Contacto.astro (EDITAR: links reales, fuera copy interno)
.env.example (EDITAR: + RESEND_API_KEY, CONTACT_TO_EMAIL)
package.json (npm i resend — en implementación)
```

## Criterios de Aceptación

- [ ] POST válido en **producción** → email recibido en `CONTACT_TO_EMAIL` (prueba real, CE-5)
- [ ] POST inválido → 400 con detalle por campo (comportamiento actual, mantener)
- [ ] Honeypot con valor → 200 silencioso sin enviar (mantener)
- [ ] Sin `RESEND_API_KEY` (dev) → log + 200, sin crash
- [ ] 6to POST en 10 min desde misma IP → 429
- [ ] `RESEND_API_KEY` no aparece en bundle cliente (grep en `dist/client` → vacío)
- [ ] Formulario usable en ES y EN (spec 10)
- [ ] Links GitHub/LinkedIn/email reales y abriendo correcto (nueva pestaña salvo `mailto:`)
