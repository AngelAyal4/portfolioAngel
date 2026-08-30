import { fetchGraphQL } from "./wp-client";
import type { Proyecto, ProyectosQueryResult } from "./types";

export const QUERY_PROYECTOS = /* GraphQL */ `
  query Proyectos {
    proyectos(first: 100) {
      nodes {
        id
        title
        slug
        excerpt
        content
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        proyectoFields {
          proyectoUrl
          repoUrl
          techStack
        }
        categoriasProyecto {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

export async function getProyectos(): Promise<Proyecto[]> {
  try {
    const data = await fetchGraphQL<ProyectosQueryResult>(QUERY_PROYECTOS);
    return data.proyectos?.nodes ?? [];
  } catch (err) {
    console.warn("[wp] getProyectos falló — retorna [] para no romper build:", err);
    return [];
  }
}

// Preparado para Fase 5 (detalle por slug), no requerido aún
export const QUERY_PROYECTO_BY_SLUG = /* GraphQL */ `
  query ProyectoBySlug($slug: ID!) {
    proyecto(id: $slug, idType: SLUG) {
      id
      title
      slug
      excerpt
      content
      featuredImage { node { sourceUrl altText } }
      proyectoFields { proyectoUrl repoUrl techStack }
      categoriasProyecto { nodes { name slug } }
    }
  }
`;
