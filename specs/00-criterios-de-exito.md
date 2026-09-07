# Criterios de éxito — Portfolio Angel

> Fuente: 15 respuestas de Angel (2026-09-06/07). Sin estos criterios, las specs 01–09 no tienen contra qué verificarse.
> Estado: **PROPUESTO — pendiente de aprobación.** Al aprobar, se reescriben las specs y sus planes.

## Contexto decidido

- **Objetivo dual:** primer puesto dev en relación de dependencia + clientes freelance.
- **Audiencia primaria:** reclutadores/HR que escanean 30 segundos.
- **CTA principal:** ver los proyectos.
- **Contenido:** 3–4 proyectos reales (CashInsight fijo + 2–3 a definir en spec 05). Foto, links y datos reales ya disponibles.
- **Idioma:** ES + EN con toggle en todo el sitio.
- **Contacto:** formulario que envía de verdad vía Resend.
- **CMS:** se mantiene WordPress headless. WP productivo aún no definido (va en spec 02/08).
- **Lanzamiento:** con los 3–4 proyectos reales, no antes.

## Criterios (todos verificables)

### CE-1 — Conversión medible
**2–3 entrevistas o consultas por mes dentro de los 90 días post-lanzamiento.**
Verificación: conteo mensual de contactos (formulario Resend + email directo). Requiere analytics básico (Vercel Analytics o equivalente) desde el día uno.
Nota honesta: el sitio genera el contacto; la postulación activa sigue siendo responsabilidad de Angel.

### CE-2 — Escaneo HR en 30 segundos
**El hero comunica rol + stack + CTA a proyectos sin scrollear, en desktop y mobile.**
Verificación: checklist pre-deploy (h1 con rol, stack visible, CTA "Ver proyectos" funcional) + test de 5 segundos con una persona externa.

### CE-3 — Proyectos reales, cero placeholder
**3–4 proyectos propios. Cada uno: demo viva o repo, descripción de 1–2 líneas orientada a resultado (no lista de tech), imagen propia.**
Prohibido en prod: URLs `example.com`, `github.com/angel`, imágenes `localhost` o picsum, copy interno ("Edita src/...", "conecta WP").
Verificación: auditoría de contenido pre-deploy (grep de placeholders + revisión visual).

### CE-4 — Bilingüe completo y persistente
**Toggle ES/EN en todo el sitio, elección persistida, cero strings sin traducir ni rutas rotas.**
Verificación: recorrido completo en ambos idiomas + grep de strings hardcodeados fuera de los diccionarios.

### CE-5 — Contacto que envía de verdad
**Formulario vía Resend al email real, con validación server-side, honeypot y feedback accesible. Links GitHub/LinkedIn reales.**
Verificación: POST de prueba en producción con email recibido + caso inválido con error 400.

### CE-6 — WordPress productivo definido
**WP público con WPGraphQL accesible desde Vercel, media servida desde dominio público, revalidación funcionando.**
Verificación: build de prod trae los 3–4 proyectos con imágenes que cargan fuera de la red local.

### CE-7 — Base técnica sin regresiones
**`astro check` 0 errores, build verde, 0 excepciones en consola, sin overflow en 390/768/1280, Lighthouse ≥90 en performance y a11y en mobile.**
Verificación: pipeline de verificación antes de cada deploy (ya practicado: check + build + CDP).

### CE-8 — Lanzamiento con contenido real
**Deploy en Vercel solo cuando CE-3 y CE-5 estén verdes. Nada de "publicar ya e iterar" con placeholders.**
Verificación: checklist CE-1..CE-7 firmado antes del deploy.

## Impacto en las specs existentes

| Spec | Rewrite requerido |
|---|---|
| 01 design system | Menor: sumar tokens/convenciones i18n |
| 02 wordpress-cms | Mayor: decisión WP productivo + estrategia de media |
| 03 hero | Mayor: reescritura orientada a escaneo HR (CE-2) |
| 04 about | Mayor: contenido real (foto, bio, stack) |
| 05 projects | Mayor: lista real 3–4 + copy orientado a resultado (CE-3) |
| 06 cv | Mayor: cursos reales, fuera copy de dev |
| 07 contact | Mayor: integración Resend (CE-5) |
| 08 deploy | Mayor: Vercel + WP prod + analytics (CE-1, CE-6, CE-8) |
| 09 dark-blue-pcb | Ninguno: hecho y verificado |
| 10 i18n (nueva) | Crear: arquitectura ES/EN + diccionarios (CE-4) |

> Contradicción detectada y resuelta: `AGENTS.md` manda `prompts/specs`, pero el repo real usa `specs/`. Se sigue el repo (`specs/`), ya ignorado `prompts/` en `.gitignore`.
