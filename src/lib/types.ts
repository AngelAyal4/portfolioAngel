export interface FeaturedImageNode {
  sourceUrl: string;
  altText: string | null;
}

export interface ProyectoFields {
  proyectoUrl: string | null;
  repoUrl: string | null;
  techStack: string[];
}

export interface CategoriaProyecto {
  name: string;
  slug: string;
}

export interface Proyecto {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: { node: FeaturedImageNode } | null;
  proyectoFields: ProyectoFields | null;
  categoriasProyecto: { nodes: CategoriaProyecto[] } | null;
}

export interface ProyectosQueryResult {
  proyectos: { nodes: Proyecto[] };
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: unknown }>;
}
