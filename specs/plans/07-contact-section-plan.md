# Plan — FASE 7: Contacto Section + API

> Fuente: `specs/07-contact-section.md`
> Stack verificado: Astro `^7.2.9` + React `^6.0.4` (form controlado) + DS `Input.astro/Badge.astro/Section.astro/Button.astro` + `src/pages/api/revalidate.ts:1` (referencia API route) + `src/context/ThemeContext.tsx` no requerido.
> Fecha: 2026-08-30

---

## 1. Objetivo

Que reclutadores/clientes puedan escribir sin abrir mail client. Entregables:

- Sección `Contacto` con form `nombre/email/mensaje` + links redes (`GitHub/LinkedIn/Email`) (`07-contact-section.md:9-20`).
- Form controlado React (`ContactForm.tsx`) con validación client-side (`nombre≥2`, `email` regex, `mensaje≥10`) + honeypot `website` vacío (`07-contact-section.md:46-52`).
- `POST /api/contacto` API route Astro valida server-side, responde `200` ok / `400` error, honeypot silencioso `200` sin log (`07-contact-section.md:34-38`).
- Feedback éxito/error visible sin recargar, `labels`, `focus`, `aria` (`07-contact-section.md:76`).
- **Opción B** (log) para dev, migra a A/C en prod (`07-contact-section.md:44`).

Dependencia: Fase 1 (DS). No requiere WP, pero sigue `src/pages/api/revalidate.ts` patrón.

## 2. Estado actual

| Pieza | Estado |
|---|---|
| `src/components/ui/Input.astro` | `label for/id`, `required` con `*`, `focus:ring-accent`, `multiline` textarea. Para React se usa input nativo con mismas clases (no `Input.astro` en isla). |
| `src/components/ui/Button.astro` | `primary/secondary`, `type="submit"` OK. |
| `src/components/ui/Section.astro` | OK. |
| `src/sections/Hero/About/Proyectos/CV.astro` | Creados Fases 3-6. |
| `src/components/ContactForm.tsx`, `src/sections/Contacto.astro`, `src/pages/api/contacto.ts` | **No existen** — crear. |
| `src/pages/api/revalidate.ts:1` | `POST` valida `x-revalidation-secret` + `REVALIDATION_SECRET`, retorna JSON. Referencia para nueva API. |
| `src/pages/index.astro` | `Navbar + Hero + About + Proyectos + CV + footer`. Insertar `Contacto`. |

## 3. Decisiones técnicas

1. **Isla React:** `ContactForm.tsx` `client:load` con `useState` para `nombre/email/mensaje/website(honeypot)` + `errors` + `status:"idle|loading|success|error"` + `message`. Validación client reproduce server (`minLength`, `regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/`). Honeypot hidden `class="hidden"` + `tabIndex=-1` + `autoComplete="off"` + `aria-hidden`. Submit `fetch("/api/contacto", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({nombre,email,mensaje,honeypot:website})})`.
2. **API route:** `src/pages/api/contacto.ts` `export const prerender = false;` `export const POST:APIRoute` valida de nuevo (nunca confiar en cliente), honeypot si `honeypot` truthy → `200 {ok:true}` sin log (bot). `nombre.trim().length<2` / `!emailRegex.test(email)` / `mensaje.trim().length<10` → `400 {error:"..."}`. Si ok → `console.log("[contacto]", {nombre,email,mensaje: mensaje.slice(0,500)})` + opcional `fs.appendFile("contacto.log")` solo dev (no en Vercel). Retorna `200 {ok:true, message:"Mensaje enviado"}`. Sin `nodemailer` para no añadir dep.
3. **UX:** Inputs con `required`, `aria-invalid`, `aria-describedby="error-{id}"`, `role="alert"` para errores, `aria-live="polite"` para success. Botón `disabled` en `loading` con `opacity-50` + texto `Enviando...`. Tras `success`, resetea form y muestra `¡Gracias! Te respondo pronto.` con `bg-accent/10 border-accent/20`.
4. **Links redes:** `GitHub https://github.com/angel`, `LinkedIn https://linkedin.com/in/angel-ayala`, `Email mailto:angel@example.com` (usuario debe editar). `target="_blank" rel="noopener noreferrer"` para externos.
5. **Seguridad:** No `innerHTML` con input usuario, no SQL (no DB), valida server-side, honeypot, `Content-Type` JSON, no expone stack traces.
6. **Estilo:** `Section id="contacto" scroll-mt-16` con grid `md:grid-cols-2` form + links, `bg-surface` card para form.

## 4. Archivos y código exacto

| Acción | Archivo |
|---|---|
| CREAR | `src/components/ContactForm.tsx` |
| CREAR | `src/sections/Contacto.astro` |
| CREAR | `src/pages/api/contacto.ts` |
| EDITAR | `src/pages/index.astro` — insertar `<Contacto />` antes de `footer` |
| NO TOCAR | `src/styles/global.css`, `astro.config.mjs`, `src/lib/*` |

### 4.1 `src/components/ContactForm.tsx`

```tsx
import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";
type Errors = Partial<Record<"nombre" | "email" | "mensaje", string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(nombre: string, email: string, mensaje: string): Errors {
  const e: Errors = {};
  if (nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres";
  if (!emailRegex.test(email.trim())) e.email = "Email inválido";
  if (mensaje.trim().length < 10) e.mensaje = "Mínimo 10 caracteres";
  return e;
}

export default function ContactForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate(nombre, email, mensaje);
    setErrors(v);
    if (Object.keys(v).length) {
      setStatus("error");
      setFeedback("Revisá los campos marcados.");
      return;
    }
    setStatus("loading");
    setFeedback("");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), email: email.trim(), mensaje: mensaje.trim(), honeypot: website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setStatus("success");
      setFeedback(data.message || "¡Mensaje enviado! Te respondo pronto.");
      setNombre(""); setEmail(""); setMensaje(""); setWebsite("");
      setErrors({});
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Error al enviar. Intentá de nuevo.");
    }
  }

  const fieldClass = "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {/* Honeypot — oculto visualmente pero legible por bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">No completar</label>
        <input id="website" name="website" type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-nombre" className="text-sm font-medium text-text">Nombre <span aria-hidden="true" className="text-accent">*</span></label>
        <input id="contact-nombre" name="nombre" type="text" placeholder="Tu nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} aria-invalid={!!errors.nombre} aria-describedby={errors.nombre ? "error-nombre" : undefined} className={fieldClass + (errors.nombre ? " border-red-500 focus:border-red-500 focus:ring-red-500/20" : "")} />
        {errors.nombre && <p id="error-nombre" role="alert" className="text-xs text-red-500">{errors.nombre}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-email" className="text-sm font-medium text-text">Email <span aria-hidden="true" className="text-accent">*</span></label>
        <input id="contact-email" name="email" type="email" placeholder="tu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "error-email" : undefined} className={fieldClass + (errors.email ? " border-red-500 focus:border-red-500 focus:ring-red-500/20" : "")} />
        {errors.email && <p id="error-email" role="alert" className="text-xs text-red-500">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-mensaje" className="text-sm font-medium text-text">Mensaje <span aria-hidden="true" className="text-accent">*</span></label>
        <textarea id="contact-mensaje" name="mensaje" placeholder="Escribe tu mensaje..." required rows={5} value={mensaje} onChange={(e) => setMensaje(e.target.value)} aria-invalid={!!errors.mensaje} aria-describedby={errors.mensaje ? "error-mensaje" : undefined} className={fieldClass + " resize-y min-h-[120px]" + (errors.mensaje ? " border-red-500 focus:border-red-500 focus:ring-red-500/20" : "")} />
        {errors.mensaje && <p id="error-mensaje" role="alert" className="text-xs text-red-500">{errors.mensaje}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-accent text-on-accent hover:bg-accent-hover border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none"
      >
        {status === "loading" ? "Enviando..." : "Enviar mensaje"}
      </button>

      {feedback && (
        <p role="status" aria-live="polite" className={"rounded-lg border px-3 py-2 text-sm " + (status === "success" ? "bg-accent/10 border-accent/20 text-accent" : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400")}>
          {feedback}
        </p>
      )}
    </form>
  );
}
```

Notas: `fieldClass` replica `Input.astro` para consistencia tokens. `useState` <30 líneas por función. `aria-invalid`/`aria-describedby` para a11y.

### 4.2 `src/sections/Contacto.astro`

```astro
---
import Section from "../components/ui/Section.astro";
import ContactForm from "../components/ContactForm";
---

<Section id="contacto" class="scroll-mt-16" aria-labelledby="contacto-heading">
  <div class="mx-auto max-w-[1280px]">
    <h2 id="contacto-heading" class="font-display text-2xl md:text-3xl font-bold text-text">Contacto</h2>
    <p class="mt-2 max-w-2xl text-sm text-text-muted">¿Tenés un proyecto o querés charlar? Escribime y te respondo en 24h.</p>

    <div class="mt-8 grid gap-8 md:grid-cols-2">
      <!-- Form -->
      <div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <ContactForm client:load />
      </div>

      <!-- Links -->
      <div class="flex flex-col gap-6">
        <div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 class="font-display text-lg font-semibold text-text">O encontrame en</h3>
          <ul class="mt-4 flex flex-col gap-3" aria-label="Redes y contacto">
            <li>
              <a href="https://github.com/angel" target="_blank" rel="noopener noreferrer" aria-label="GitHub de Angel (abre en nueva pestaña)" class="inline-flex items-center gap-2 text-sm font-medium text-text hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>
                GitHub — github.com/angel
              </a>
            </li>
            <li>
              <a href="https://linkedin.com/in/angel-ayala" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de Angel" class="inline-flex items-center gap-2 text-sm font-medium text-text hover:text-accent transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5Zm-11 19h-3v-10h3v10Zm-1.5-11.27a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm13.5 11.27h-3v-5.6c0-1.34-.48-2.26-1.68-2.26-.92 0-1.47.62-1.71 1.22-.09.21-.11.5-.11.8v5.84h-3s.04-9.48 0-10.47h3v1.48c.4-.62 1.12-1.5 2.73-1.5 1.99 0 3.47 1.3 3.47 4.09v6.4Z"/></svg>
                LinkedIn — linkedin.com/in/angel-ayala
              </a>
            </li>
            <li>
              <a href="mailto:angel@example.com" aria-label="Enviar email a Angel" class="inline-flex items-center gap-2 text-sm font-medium text-text hover:text-accent transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"/><polyline points="22,6 12,13 2,6"/></svg>
                angel@example.com
              </a>
            </li>
          </ul>
          <p class="mt-4 text-xs text-text-muted">Actualiza los links en <code class="rounded bg-bg border border-border px-1 py-0.5 text-xs">src/sections/Contacto.astro:18</code></p>
        </div>

        <div class="rounded-lg border border-border bg-accent/5 p-4">
          <p class="text-sm text-text-muted"><strong class="text-text">Respuesta rápida:</strong> Si no ves mi respuesta, revisa spam. También podés escribir directo por LinkedIn.</p>
        </div>
      </div>
    </div>
  </div>
</Section>
```

### 4.3 `src/pages/api/contacto.ts`

```ts
import type { APIRoute } from "astro";

export const prerender = false;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Body inválido" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { nombre, email, mensaje, honeypot } = body as {
      nombre?: unknown;
      email?: unknown;
      mensaje?: unknown;
      honeypot?: unknown;
    };

    // Honeypot: bot → silencio 200
    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
      return new Response(JSON.stringify({ ok: true, message: "Mensaje enviado" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const errs: string[] = [];
    if (typeof nombre !== "string" || nombre.trim().length < 2) errs.push("nombre: mínimo 2 caracteres");
    if (typeof email !== "string" || !emailRegex.test(email.trim())) errs.push("email: inválido");
    if (typeof mensaje !== "string" || mensaje.trim().length < 10) errs.push("mensaje: mínimo 10 caracteres");

    if (errs.length) {
      return new Response(JSON.stringify({ error: errs.join(" | ") }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const safeNombre = (nombre as string).trim().slice(0, 100);
    const safeEmail = (email as string).trim().slice(0, 200);
    const safeMensaje = (mensaje as string).trim().slice(0, 2000);

    // Opción B: log (dev) — en Vercel solo console (sin fs)
    console.log(`[contacto] ${new Date().toISOString()} — ${safeNombre} <${safeEmail}>: ${safeMensaje.slice(0, 200)}`);

    // Futuro Opción A/C: aquí iría nodemailer o fetch a Formspree/Web3Forms con env vars
    // if (import.meta.env.SMTP_HOST) { await sendEmail(...) }

    return new Response(JSON.stringify({ ok: true, message: "¡Mensaje enviado! Te respondo pronto." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: `Error interno: ${msg}` }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
```

Notas: `prerender=false` obligatorio para API route con `adapter vercel` `output:'static'`. Sin `fs` en prod para no romper Vercel (`fs` solo funciona local). Sanitiza longitudes.

### 4.4 `src/pages/index.astro` — patch

```astro
---
import Layout from "../components/ui/Layout.astro";
import Navbar from "../components/Navbar.astro";
import Hero from "../sections/Hero.astro";
import About from "../sections/About.astro";
import Proyectos from "../sections/Proyectos.astro";
import CV from "../sections/CV.astro";
import Contacto from "../sections/Contacto.astro";
---

<Layout title="Angel Ayala — Desarrollador Fullstack">
  <Navbar />
  <main>
    <Hero />
    <About />
    <Proyectos />
    <CV />
    <Contacto />
  </main>
  <footer class="border-t border-border py-6">
    <div class="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <p class="text-center text-xs text-text-muted">© {new Date().getFullYear()} Angel Ayala — Portfolio</p>
    </div>
  </footer>
</Layout>
```

## 5. Orden de ejecución

1. Crear `src/pages/api/contacto.ts` (§4.3) — primero para test `curl`
2. Crear `src/components/ContactForm.tsx` (§4.1)
3. Crear `src/sections/Contacto.astro` (§4.2)
4. Editar `src/pages/index.astro` (§4.4)
5. Verificar §6

## 6. Criterios de verificación

### 6.1 Automática

```bash
npm run check && npm run build

# API 400
curl -sf -X POST http://localhost:4321/api/contacto -H "Content-Type: application/json" -d '{"nombre":"a","email":"bad","mensaje":"hi"}' | jq .
# → {"error":"nombre: mínimo 2 | email: inválido | mensaje: mínimo 10"} status 400

# API 200
curl -sf -X POST http://localhost:4321/api/contacto -H "Content-Type: application/json" -d '{"nombre":"Angel","email":"angel@test.com","mensaje":"Hola, me interesa tu portfolio para un proyecto"}' | jq .
# → {"ok":true,"message":"¡Mensaje enviado!"} status 200

# Honeypot silencioso 200
curl -sf -X POST http://localhost:4321/api/contacto -H "Content-Type: application/json" -d '{"nombre":"Bot","email":"bot@spam.com","mensaje":"spam spam spam spam","honeypot":"filled"}' | jq .
# → {"ok":true} sin log de contacto real (solo si se ve console, no debe loguear como contacto)

rg -n "prerender = false" src/pages/api/contacto.ts
```

### 6.2 Manual

| # | Prueba | Esperado |
|---|---|---|
| 1 | Render 320px | Form 1 col, inputs stack, links debajo, sin overflow |
| 2 | Dejar nombre vacío y submit | `Mínimo 2 caracteres` `role="alert"` visible, `aria-invalid` |
| 3 | Email `a@` y submit | `Email inválido` |
| 4 | Mensaje `hola` (<10) | `Mínimo 10` |
| 5 | Válido → Enviar | `Enviando...` disabled, luego `¡Mensaje enviado!` `bg-accent/10` `aria-live` |
| 6 | DevTools Network honeypot | Input `website` hidden, si se llena manual y submit → 200 silencioso |
| 7 | Links GitHub/LinkedIn | `target="_blank" rel="noopener noreferrer"`, Mailto sin target |
| 8 | Tab | Focus ring acento en inputs, textarea, botón, links |

### 6.3 Checklist spec `07-contact-section.md:66`

- [ ] Form renderiza
- [ ] Validación client muestra errores
- [ ] Submit éxito muestra confirmación
- [ ] Submit error muestra error
- [ ] API 200 con válidos
- [ ] API 400 con inválidos
- [ ] Honeypot rechaza silencioso
- [ ] Links abren nueva pestaña
- [ ] A11y labels/focus/aria

## 7. Fuera de alcance

- Envío real email vía SMTP (`nodemailer`) — se deja `console.log` y comentario para migrar a Opción A/C en prod con env `SMTP_HOST`/`RESEND_API_KEY`
- Captcha visible (solo honeypot)
- WP integración (form es independiente)
- Deploy (Fase 8)

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| `fs` en Vercel (`/tmp` efímero) | No usar `fs` en prod, solo `console.log` |
| `Input.astro` no usable en React isla | `ContactForm` usa inputs nativos con `fieldClass` idéntica a `Input.astro` |
| Spam sin rate limit | Honeypot + validación longitud; rate limit se añade en Fase 8 si se requiere |
| `prerender` olvidado | Sin `export const prerender=false` la API retorna 404 en `output:'static'` — incluir siempre |

## 9. Estado

**PLAN GENERADO (2026-08-30) — pendiente de ejecución.** Próximo: Fase 8 (Deploy).
