type Props = {
  categorias: string[];
  active: string;
  onChange: (cat: string) => void;
};

export default function ProyectoFilter({ categorias, active, onChange }: Props) {
  return (
    <div role="group" aria-label="Filtrar proyectos por categoría" className="flex flex-wrap gap-2">
      {categorias.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            type="button"
            aria-pressed={isActive}
            aria-label={`Filtrar por ${cat}`}
            onClick={() => onChange(cat)}
            className={
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
              (isActive
                ? "bg-accent text-on-accent border-accent"
                : "bg-surface text-text-muted border-border hover:border-accent/50 hover:text-accent")
            }
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
