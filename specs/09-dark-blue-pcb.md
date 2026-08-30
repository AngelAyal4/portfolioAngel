---
name: 09-dark-blue-pcb
description: Paleta azul oscuro nocturno + animación PCB de fondo
status: pending
depends-on: [01-design-system]
---

# Fase 9: Azul Oscuro Nocturno + PCB Fondo

## Objetivo

Paleta más oscura, ambiente nocturno con base azul profundo. Animación sutil de pistas PCB iluminándose de fondo.

## Criterios de Aceptación

- [ ] Paleta light: azul profundo en vez de cyan, fondos más oscuros
- [ ] Paleta dark: azul noche (#0a0e1a en vez de #0f172a)
- [ ] Sin color accent — usa azul para estados interactivos
- [ ] Mantener accesibilidad WCAG AA (ratio 4.5:1 mínimo)
- [ ] Componentes UI funcionan en la nueva paleta sin pérdida de jerarquía
- [ ] Animación PCB: SVG con paths tipo pistas de circuito
- [ ] Gradiente luminoso viaja verticalmente (arriba → abajo)
- [ ] Opacidad baja (0.05–0.12) — decorativo, no competitivo
- [ ] Respetar `prefers-reduced-motion` — desactivar animación
- [ ] Fijo al viewport, detrás de todo (`z-index: -1`)
- [ ] GPU-accelerated (solo `transform`/`opacity`)

## Paleta

### Light (default)
```css
--token-bg: #f0f4f8;          /* azul grisáceo claro */
--token-surface: #ffffff;
--token-text: #1a202c;
--token-text-muted: #4a5568;
--token-accent: #2b6cb0;      /* azul profundo */
--token-accent-hover: #2c5282;
--token-border: #cbd5e0;
--token-on-accent: #ffffff;
```

### Dark
```css
--token-bg: #0a0e1a;          /* azul noche */
--token-surface: #131b2e;
--token-text: #e2e8f0;
--token-text-muted: #8899aa;
--token-accent: #4299e1;      /* azul eléctrico */
--token-accent-hover: #63b3ed;
--token-border: #1e293b;
--token-on-accent: #0a0e1a;
```

## Animación PCB

### `src/components/BackgroundPCB.astro` (nuevo)

```astro
---
interface Props {
  class?: string;
}
const { class: className } = Astro.props;
---

<div class={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true">
  <svg class="absolute inset-0 h-full w-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="var(--token-accent)" stroke-width="0.5" fill="none" opacity="0.08">
      <!-- paths hardcodeados -->
    </g>
    <g fill="var(--token-accent)" opacity="0.12">
      <!-- nodos -->
    </g>
  </svg>
  <div class="absolute inset-0 animate-pcb-sweep bg-gradient-to-b from-transparent via-accent/[0.07] to-transparent"></div>
</div>
```

### Keyframe

```css
@keyframes pcb-sweep {
  0%   { transform: translateY(-100%); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}

.animate-pcb-sweep {
  animation: pcb-sweep 10s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-pcb-sweep { animation: none !important; opacity: 0; }
}
```

### Integración

Agregar `<BackgroundPCB />` en `src/pages/index.astro` dentro de `<Layout>`, antes del contenido principal.

## Notas

- No usar cyan, teal, verde — solo espectro azul
- Borde por defecto: `#cbd5e0` (light), `#1e293b` (dark)
- Estado `disabled`: opacidad 0.4, sin cambio de color
- SVG hardcodeado (~15-20 paths) — no canvas, no generador dinámico
- En mobile mantener misma densidad de paths
