import { useMemo, useState } from "react";
import type { Proyecto } from "../lib/types";
import ProyectoFilter from "./ProyectoFilter";

type Props = {
  proyectos: Proyecto[];
};

export default function ProyectosGrid({ proyectos }: Props) {
  const categorias = useMemo(() => {
    const set = new Set<string>();
    proyectos.forEach((p) => p.categoriasProyecto?.nodes.forEach((n) => set.add(n.name)));
    return ["Todos", ...Array.from(set)];
  }, [proyectos]);

  const [active, setActive] = useState("Todos");

  const filtrados = useMemo(() => {
    if (active === "Todos") return proyectos;
    return proyectos.filter((p) => p.categoriasProyecto?.nodes.some((n) => n.name === active));
  }, [proyectos, active]);

  if (proyectos.length === 0) {
    return (
      <p role="status" className="py-12 text-center text-text-muted">
        No hay proyectos disponibles aún.
      </p>
    );
  }

  return (
    <div>
      <ProyectoFilter categorias={categorias} active={active} onChange={setActive} />

      {filtrados.length === 0 ? (
        <p role="status" className="py-12 text-center text-text-muted">
          No hay proyectos en esta categoría.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((p) => (
            <article key={p.id} className="bg-surface border border-border rounded-xl p-0 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all motion-reduce:transform-none flex flex-col">
              {p.featuredImage?.node.sourceUrl ? (
                <img
                  src={p.featuredImage.node.sourceUrl}
                  alt={p.featuredImage.node.altText || p.title}
                  loading="lazy"
                  decoding="async"
                  className="h-48 w-full object-cover"
                  width={600}
                  height={400}
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center border-b border-border bg-surface text-sm text-text-muted border-dashed">Sin imagen</div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg font-semibold leading-tight text-text line-clamp-2">{p.title}</h3>
                {p.categoriasProyecto?.nodes.length ? (
                  <p className="mt-1 text-xs font-medium text-accent">{p.categoriasProyecto.nodes.map((c) => c.name).join(" · ")}</p>
                ) : null}
                {p.excerpt && <div className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted" dangerouslySetInnerHTML={{ __html: p.excerpt }} />}
                {p.proyectoFields?.techStack?.length ? (
                  <ul aria-label={`Tecnologías de ${p.title}`} className="mt-3 flex flex-wrap gap-1.5">
                    {p.proyectoFields.techStack.slice(0, 4).map((t) => (
                      <li key={t}><span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs font-medium px-2.5 py-0.5 border border-accent/20">{t}</span></li>
                    ))}
                    {p.proyectoFields.techStack.length > 4 && (
                      <li><span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs font-medium px-2.5 py-0.5 border border-accent/20">+{p.proyectoFields.techStack.length - 4}</span></li>
                    )}
                  </ul>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.proyectoFields?.proyectoUrl && (
                    <a href={p.proyectoFields.proyectoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver demo de ${p.title}`} className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-accent text-on-accent hover:bg-accent-hover border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Demo</a>
                  )}
                  {p.proyectoFields?.repoUrl && (
                    <a href={p.proyectoFields.repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ver código de ${p.title}`} className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-transparent text-accent border border-accent hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Código</a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
