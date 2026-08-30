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
