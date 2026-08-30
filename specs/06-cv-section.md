# 6. CV Section

## Objetivo

Mostrar experiencia, educación y skills de forma escaneable. Reclitadores imprimen o screensean esto.

## Estructura

```
┌─────────────────────────────────────────┐
│   EXPERIENCIA / CV                      │
│                                         │
│   [Experiencia]                         │
│   ├─ Rol @ Empresa (año–año)            │
│   │   Logros clave, tech usada          │
│   └─ ...                                │
│                                         │
│   [Educación]                           │
│   ├─ Ing. Sistemas — UTN (en curso)     │
│   └─ ...                                │
│                                         │
│   [Certificaciones / Cursos]            │
│   ├─ Curso X — Plataforma (año)         │
│   └─ ...                                │
│                                         │
└─────────────────────────────────────────┘
```

## Contenido (estático)

### Experiencia
- Soporte Técnico / IT (década) —括ars transition a dev

### Educación
- Ingeniería de Sistemas de Información — UTN, Com. 1º K13 (en curso)

### Cursos/Certificaciones
- (Pendiente de definir — cursos relevantes que hayas hecho)

## Diseño

- Timeline sutil o lista con bullets
- Cada item: título, entidad, período, descripción breve
- Badges de tech donde corresponda
- Sección clara, sin ruido visual

## Archivos

```
src/sections/
  CV.astro

src/components/
  CVItem.astro (reutilizable para exp/edu/certs)
```

## Criterios de Aceptación

- [ ] Experiencia, educación y cursos visibles
- [ ] Formato escaneable (títulos destacados, fechas claras)
- [ ] Responsive: apila correctamente en mobile
- [ ] Sin overflow en 320px
- [ ] Accesible: estructura semántica (h2, h3, listas)
