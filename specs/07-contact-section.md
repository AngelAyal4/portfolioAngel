# 7. Contacto Section + API

## Objetivo

Formulario de contacto funcional + links a redes. Que reclitadores y clientes puedan escribirte sin abrir el cliente de correo.

## Estructura

```
┌─────────────────────────────────────────┐
│   CONTACTO                              │
│                                         │
│   [Nombre]     [Email]                  │
│   [Mensaje — textarea]                  │
│   [Enviar]                              │
│                                         │
│   ── o encontrame en ──                 │
│   [GitHub] [LinkedIn] [Email]           │
│                                         │
└─────────────────────────────────────────┘
```

## Funcionalidad

1. **Formulario controlado** (React state)
2. **Validación client-side:** nombre requerido, email válido, mensaje no vacío
3. **Submit:** POST a `/api/contacto` (API route de Astro)
4. **API Route:** recibe JSON, envía email o guarda en log
5. **Feedback:** éxito / error visible sin recargar
6. **Protección:** honeypot anti-spam (sin captcha visible)

## API Route

```
POST /api/contacto
Body: { nombre, email, mensaje, honeypot }
```

Opciones de envío:
- **Opción A:** Email via SMTP (himalaya/nodemailer) — requiere credenciales
- **Opción B:** Guardar en JSON file (dev) / log (prod) — simple, sin deps
- **Opción C:** Servicio externo (Formspree, Web3Forms) — sin backend

**Recomendación:** Opción B para dev, migrar a A o C para prod.

## Validación

- `nombre`: string, min 2 chars
- `email`: regex email válido
- `mensaje`: string, min 10 chars
- `honeypot`: string vacío (si tiene valor, es bot → rechazar silenciosamente)

## Archivos

```
src/sections/
  Contacto.astro

src/components/
  ContactForm.tsx (React — formulario controlado)

src/pages/api/
  contacto.ts (API route — POST handler)
```

## Criterios de Aceptación

- [ ] Formulario renderiza correctamente
- [ ] Validación client-side funciona (muestra errores)
- [ ] Submit exitoso muestra mensaje de confirmación
- [ ] Submit con error muestra mensaje de error
- [ ] API route responde 200 con datos válidos
- [ ] API route responde 400 con datos inválidos
- [ ] Honeypot rechaza bots silenciosamente
- [ ] Links a redes abren en nueva pestaña
- [ ] Accesible: labels en todos los inputs, focus visible, error messages con aria
