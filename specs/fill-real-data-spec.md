---
name: fill-real-data
description: Llenar portfolio con información real del CV de Angel Ayala
status: pending
---

# Llenado de datos reales del portfolio

## Fuente
CV: `Angel_Ayala_CV_ConsultoresEnIT2.docx`

## Datos extraídos

### Identidad
- **Nombre completo:** ÁNGEL JOSÉ LUIS AYALA
- **Ubicación:** Rosario, Santa Fe, Argentina
- **Teléfono:** +54 341 344 2980
- **Email:** ajoseayala.00@gmail.com
- **LinkedIn:** linkedin.com/in/angeljose-ayala
- **GitHub:** github.com/AngelAyal4

### Resumen profesional (síntesis para Hero/About)
"Técnico con 13 años de experiencia en soporte técnico, gestión de incidentes y coordinación operativa en entornos de alta criticidad. Base sólida en desarrollo con PHP/MySQL bajo arquitectura MVC y fundamentos de Python con POO. En transición activa hacia stack JavaScript fullstack (Next.js + Nest.js)."

### Experiencia profesional (3 items)
1. **Programador – Equipo Docente**, FAPyD · Universidad Nacional de Rosario (Ago 2024 – Dic 2025)
   - Python POO en producción académica
   - Capacitación técnica a alumnos sin experiencia
   - Corrección de errores + documentación técnica
   - Badges: Python, POO, Docencia, Documentación

2. **Técnico Independiente**, Soporte y Desarrollo Web (Oct 2021 – May 2022 / Ene 2023 — Actualidad, ~5 años)
   - PHP con arquitectura MVC
   - Gestión end-to-end de incidentes con documentación formal
   - Coordinación de equipos según criticidad e impacto
   - Presupuestación y gestión de proyectos
   - Badges: PHP, MVC, MySQL, Soporte, Autogestión

3. **Técnico de Área – Soporte y Gestión de Incidentes**, GESTAM Argentina S.A. (Ene 2013 – Sep 2021, 8 años)
   - Instalaciones bancarias, análisis de causa raíz
   - Nexo entre soporte, proveedores y clientes
   - Capacitación de técnicos y onboarding
   - Coordinación directa del área ante ausencia del responsable
   - Badges: Soporte, Incidentes, Bancos, Coordinación

### Educación (3 items)
1. **Ingeniería en Sistemas de Información** (en curso, 1° año) — UTN FRRO (2025 — Actualidad)
   - Badges: UTN, Algoritmos, Bases de Datos

2. **Programador Full Stack** — Argentina Programa 4.0 (Dic 2022)
   - Badges: Full Stack, Certificación

3. **Técnico en Electrónica** — EET N°465 Gral. Manuel Belgrano (Dic 2012)
   - Badges: Electrónica, Técnico

### Proyectos técnicos (3 items)
1. **AppSalon** — Sistema de gestión de turnos
   - Arquitectura MVC, autenticación, panel admin, BD relacional
   - Stack: PHP · MySQL · JS · SCSS
   - Repo: github.com/AngelAyal4/appsalon-phpmvc
   - Categoría: Fullstack

2. **UpTask** — Gestor de tareas kanban
   - CRUD completo, autenticación, manejo de estados
   - Stack: PHP · MVC · MySQL · Composer
   - Repo: github.com/AngelAyal4/Uptask-mvc
   - Categoría: Fullstack

3. **DevWebCamp** — Plataforma de conferencias
   - Registro, ponentes, agenda dinámica
   - Stack: PHP · MVC · MySQL · JS
   - Repo: github.com/AngelAyal4/DebWebCamp
   - Categoría: Fullstack

### Stack técnico
PHP, Laravel, Arquitectura MVC, Python (POO), JavaScript, HTML5, CSS3/SCSS, SQL (consultas avanzadas, joins, subconsultas), Git, Next.js, Nest.js, React, Node.js, TypeScript, PostgreSQL/MongoDB

### Habilidades IT (soporte)
Gestión de incidentes, análisis de causa raíz, documentación técnica, capacitación de usuarios y técnicos, coordinación con proveedores, exposición a SAP y Protecnus

### Habilidades blandas
Comunicación efectiva con stakeholders · Orientación al cliente interno · Coordinación de equipos multidisciplinarios · Capacitación y mentoría · Trabajo bajo presión en entornos de alta criticidad · Resolución de problemas y pensamiento estructurado

### Idiomas
Español (nativo) · Inglés B1 (lectura técnica, documentación y comunicación escrita)

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/components/ui/Layout.astro` | Meta description con resumen real |
| `src/sections/Hero.astro` | Tagline + subtítulo actualizados |
| `src/sections/About.astro` | Bio real + stack expandido |
| `src/sections/CV.astro` | Experiencia real (3 items), educación real (3 items), sin cursos placeholder |
| `src/sections/Contacto.astro` | Links reales (email, LinkedIn, GitHub) |
| `src/sections/Proyectos.astro` | Fallback con 3 proyectos reales del CV |

## Criterios de aceptación
- [ ] Hero refleja identidad real (nombre + resumen profesional)
- [ ] About incluye bio real con stack técnico completo del CV
- [ ] CV muestra las 3 experiencias reales con badges relevantes
- [ ] CV muestra las 3 formaciones reales (UTN, Argentina Programa, Electrónica)
- [ ] Proyectos fallback usa AppSalon, UpTask, DevWebCamp con datos reales
- [ ] Contacto tiene email, LinkedIn y GitHub reales
- [ ] Sin textos placeholder ("ejemplo.com", "tu@email.com", etc.)
- [ ] Responsive mantenido (320/768/1280px)

## Ejecución
1. Crear branch `fill-real-data`
2. Aplicar cambios archivo por archivo
3. Lanzar `npm run dev` para verificar
4. Ajustar longitudes si es necesario
