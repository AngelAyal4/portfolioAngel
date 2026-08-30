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
