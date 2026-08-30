# 1. Design System & Theme

## Objetivo

Definir los tokens visuales, el sistema de diseño base y la infraestructura de dark/light mode que TODAS las secciones consumen.

## Paleta

- **Base dark:** `#0f172a` (azul noche, NO negro puro)
- **Base light:** `#f8fafc` (gris casi blanco)
- **Acento:** `#22d3ee` (cyan/vibrante — alternativa: `#818cf8` violeta)
- **Texto dark:** `#e2e8f0`
- **Texto light:** `#1e293b`

## Tipografía

- **Display:** Inter o Space Grotesk (sans-serif bold)
- **Body:** Inter o system-ui
- Escala modular: 12/16/20/28/36/48/64

## Dark/Light Mode

**Regla:** Toggle obligatorio, persistencia en `localStorage`, sin FOUC.

- Script inline en `<head>` aplica la clase ANTES de React hidrate
- Toggle botón visible en navbar/footer
- `data-theme="dark|light"` en `<html>`
- Tailwind `dark:` variants

## Componentes Base

1. **Layout** — Container responsive (max-width 1280px, padding lateral)
2. **Section** — Wrapper con padding vertical consistente
3. **Button** — Primary (acento filled) y Secondary (outline)
4. **Card** — Proyecto/Experience con hover state
5. **Badge** — Tags/categorías (tech stack, proyectos)
6. **Input** — Form controls con focus visible
7. **Typography** — Componentes Heading/Text consistentes

## Archivos

```
src/components/ui/
  Layout.astro
  Section.astro
  Button.astro
  Card.astro
  Badge.astro
  Input.astro
  ThemeToggle.astro

src/styles/
  global.css (variables + tailwind)

src/context/
  ThemeContext.tsx (React state para toggle)
```

## Criterios de Aceptación

- [ ] `global.css` define variables CSS para ambas paletas
- [ ] ThemeToggle funciona: dark → light → dark
- [ ] No FOUC: la clase theme se aplica antes del render
- [ ] Persistencia: al recargar, mantiene el tema elegido
- [ ] Componentes base usan SIEMPRE variables, nunca colores hardcoded
- [ ] Mobile-first: funciona en 320px sin overflow
