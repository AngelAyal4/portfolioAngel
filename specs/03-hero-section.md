# 3. Hero Section

## Objetivo

Primer impacto visual. Comunicar quién sos, qué hacés y dar CTA inmediata. El reclitador decide en <30 segundos si sigue scrolleando.

## Estructura

```
┌─────────────────────────────────────────┐
│                                         │
│   Hola, soy [Nombre]                    │
│   [Rol principal — Fullstack Dev]       │
│   [1 línea de valor/diferencial]        │
│                                         │
│   [Ver Proyectos]  [Contacto]           │
│                                         │
│   (scroll indicator sutil)              │
│                                         │
└─────────────────────────────────────────┘
```

## Contenido (estático)

- **Nombre:** Angel José Luis Ayala
- **Rol:** Desarrollador Fullstack | Est. Ingeniería de Sistemas
- **Tagline:** "Construyo aplicaciones web modernas, de la idea al deploy."
- **CTAs:** "Ver Proyectos" (scroll a #proyectos) + "Contacto" (scroll a #contacto)

## Diseño

- Altura completa (min-height: 100vh)
- Centrado vertical/horizontal
- Tipografía display grande (48-64px)
- CTAs como Button (Primary + Secondary)
- Fondo sutil (gradiente leve o patrón, nada cargado)
- Animación de entrada sutil (fade-in al load)

## Archivos

```
src/sections/
  Hero.astro

src/components/
  ScrollIndicator.astro (opcional)
```

## Criterios de Aceptación

- [ ] Ocupa al menos 100vh en desktop
- [ ] Tagline + nombre legibles en 320px
- [ ] Ambos CTAs funcionales (scroll a secciones)
- [ ] Sin overflow horizontal en mobile
- [ ] Animación de entrada no bloquea lectura (prefers-reduced-motion)
- [ ] Accesible: h1 presente, botones con aria-label si usan iconos
