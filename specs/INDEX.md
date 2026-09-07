# Specs del Portfolio — Orden de Ejecucion

> Fuente de verdad de objetivos: `specs/00-criterios-de-exito.md` (CE-1..CE-8, aprobado 2026-09-07).
> Specs v2 (reescritas 2026-09-07): 02, 05, 07, 08. Nueva: 10. Pendientes de rewrite: 03, 04, 06.

## Reglas Generales

1. Cada spec se implementa como una fase independiente
2. No avanzar a la fase N+1 sin completar los criterios de aceptacion de la fase N
3. Commits por feature, mensajes semanticos
4. Testing manual en 320/768/1280px entre fases

## Pipeline

```
FASE 1: Design System & Theme         (token, componentes base, dark/light)
   |
   v
FASE 2: WordPress CMS & WPGraphQL     (CPT proyecto, taxonomias, queries)
   |
   v
FASE 3: Hero Section                  (primer impacto visual, CTAs)
   |
   v
FASE 4: About Section                 (bio humana, stack badges)
   |
   v
FASE 5: Proyectos Section             (grid filtrado, consume WP) ← CORE
   |
   v
FASE 6: CV Section                    (experiencia, educacion)
   |
   v
FASE 7: Contacto Section + API        (formulario funcional, endpoint)
   |
   v
FASE 8: Deploy Vercel                 (ISR, dominio, CI/CD)
   |
   v
FASE 10: i18n ES/EN                   (diccionarios, rutas /en, toggle) — NUEVA
```

## Dependencias entre Fases

| Fase | Depende de | Por que |
|------|-----------|---------|
| 2 | 1 | WP client usa tipos y theme |
| 3 | 1 | Hero usa componentes base (Button, ThemeToggle) |
| 4 | 1 | About usa Badge, Button |
| 5 | 1 + 2 | Proyectos consume WP y usa Card, Badge |
| 6 | 1 | CV usa Card, Badge |
| 7 | 1 | Contacto usa Button, Input, Card |
| 8 | 3-7 | Deploy necesita todas las secciones funcionando |

## Hitos (Milestones)

- **M1 (Fundacion):** Fases 1-2 completas → Design system + CMS funcionando
- **M2 (Contenido):** Fases 3-5 completas → Portfolio navegable con proyectos reales
- **M3 (Completo):** Fases 6-7 completas → CV + Contacto funcionales
- **M4 (Live):** Fase 8 completa → Portfolio online en Vercel

## Archivos de Spec

| # | Archivo | Descripcion |
|---|---------|-------------|
| 01 | `specs/01-design-system.md` | Paleta, tipografia, componentes base, dark/light |
| 02 | `specs/02-wordpress-cms.md` | CPT proyecto, taxonomias, queries GraphQL |
| 03 | `specs/03-hero-section.md` | Hero con tagline y CTAs |
| 04 | `specs/04-about-section.md` | Bio, foto, stack badges |
| 05 | `specs/05-projects-section.md` | Grid filtrable de proyectos (CORE) |
| 06 | `specs/06-cv-section.md` | Experiencia, educacion, cursos |
| 07 | `specs/07-contact-section.md` | Formulario + API route |
| 08 | `specs/08-deploy-vercel.md` | Vercel, ISR, dominio |
| 09 | `specs/09-dark-blue-pcb.md` | Azul oscuro nocturno + PCB fondo |
| 00 | `specs/00-criterios-de-exito.md` | CE-1..CE-8 + impacto en specs |
| 10 | `specs/10-i18n.md` | ES/EN: diccionarios, rutas /en, toggle |
