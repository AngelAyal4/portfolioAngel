# 4. About Section

## Objetivo

Humanizar el portfolio. Quién sos, qué sabés hacer y por qué deberían confiar en vos. Breve, directo, sin autocomplacencia.

## Estructura

```
┌─────────────────────────────────────────┐
│   SOBRE MÍ                              │
│                                         │
│   [Foto/avatar]    [Texto bio —         │
│                     3-4 líneas:          │
│                     formación, enfoque,  │
│                     qué te motiva]       │
│                                         │
│   Stack principal (badges):             │
│   [React] [TypeScript] [Node] [Astro]   │
│                                         │
└─────────────────────────────────────────┘
```

## Contenido (estático)

- **Bio:** Estudiante de Ingeniería de Sistemas (UTN). +10 años en soporte/IT transitando a desarrollo fullstack. Enfocado en aplicaciones web modernas con React, Node.js yTypeScript.
- **Stack (badges):** React, TypeScript, Node.js, Astro, Tailwind, NestJS, PostgreSQL, WordPress
- **Valor diferencial:** "Combino experiencia técnica real con formación académica actualizada."

## Diseño

- Grid 2 columnas en desktop (foto + texto), 1 columna en mobile
- Foto/avatar con bordes sutiles
- Badges como componente Badge reutilizable
- Espaciado generoso (padding vertical grande)

## Archivos

```
src/sections/
  About.astro

public/
  (avatar.jpg — pendiente de proporcionar)
```

## Criterios de Aceptación

- [ ] Foto + bio apilan correctamente en mobile
- [ ] Badges usan el componente Badge del design system
- [ ] Texto legible en ambos modos (dark/light)
- [ ] Sin overflow en 320px
- [ ] Alt text en imagen descriptivo
