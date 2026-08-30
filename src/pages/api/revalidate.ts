import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const secret = request.headers.get('x-revalidation-secret');
  const REVALIDATION_SECRET = import.meta.env.REVALIDATION_SECRET;

  if (secret !== REVALIDATION_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, type } = body;
    
    // Disparar regeneración en Vercel
    // El build hook de Vercel se configura manualmente
    console.log(`Regenerating: ${type} - ${slug}`);
    
    return new Response(JSON.stringify({ 
      revalidated: true, 
      message: `Regenerated ${type}: ${slug}` 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`Error: ${msg}`, { status: 500 });
  }
};
