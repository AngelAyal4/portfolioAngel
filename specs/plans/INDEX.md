# Plans Generados

Esta carpeta contiene los planes generados por el agente `plan` (Kimi K3) que luego ejecuta el agente `build` (Muse Spark).

## Estructura

Cada plan se nombra segun la fase correspondiente en `../`:

| Fase | Plan | Estado |
|------|------|--------|
| 01-design-system | `01-design-system-plan.md` | completado (2026-08-30) |
| 02-wordpress-cms | `02-wordpress-cms-plan.md` | plan generado (2026-08-30) — pendiente build |
| 03-hero-section | `03-hero-section-plan.md` | plan generado (2026-08-30) — pendiente build |
| 04-about-section | `04-about-section-plan.md` | plan generado (2026-08-30) — pendiente build |
| 05-projects-section | `05-projects-section-plan.md` | plan generado (2026-08-30) — pendiente build |
| 06-cv-section | `06-cv-section-plan.md` | plan generado (2026-08-30) — pendiente build |
| 07-contact-section | `07-contact-section-plan.md` | plan generado (2026-08-30) — pendiente build |
| 08-deploy-vercel | `08-deploy-vercel-plan.md` | plan generado (2026-08-30) — pendiente build |

## Flujo

1. Kimi K3 genera el plan → se guarda aqui
2. Angel revisa y aprueba
3. Muse Spark ejecuta el plan (build)
