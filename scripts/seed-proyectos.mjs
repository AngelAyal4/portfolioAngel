// Uso: WP_APP_PASSWORD="xxxx xxxx ..." WP_USER=admin node scripts/seed-proyectos.mjs
// Requiere WP instalado (wizard de :8080 completado) y plugins activos
const WP = (process.env.WP_GRAPHQL_URL || "http://localhost:8080").replace(/\/graphql\/?$/, "");
const USER = process.env.WP_USER || "admin";
const APP_PASS = process.env.WP_APP_PASSWORD;

if (!APP_PASS) { console.error("Falta WP_APP_PASSWORD (generar en WP Admin > Users > Application Passwords)"); process.exit(1); }
const auth = "Basic " + Buffer.from(`${USER}:${APP_PASS}`).toString("base64");

const proyectos = [
  { title:"Portfolio Astro + WP", slug:"portfolio-astro-wp", excerpt:"Portfolio headless con Astro y WPGraphQL", content:"<p>Portfolio headless con Astro, Tailwind y WPGraphQL. SSG + ISR.</p>", proyectoUrl:"https://portfolio.example.com", repoUrl:"https://github.com/angel/portfolio", techStack:["Astro","Tailwind","WordPress","GraphQL"], categoria:"Fullstack", image:"https://picsum.photos/seed/a/800/600" },
  { title:"API Task Manager", slug:"api-task-manager", excerpt:"API REST con auth JWT y CRUD de tareas", content:"<p>API NestJS + PostgreSQL + Docker. Tests con Jest, deploy en Render.</p>", proyectoUrl:"https://api.example.com/docs", repoUrl:"https://github.com/angel/task-api", techStack:["NestJS","PostgreSQL","Docker"], categoria:"Backend", image:"https://picsum.photos/seed/b/800/600" },
  { title:"E-commerce Mobile", slug:"ecommerce-mobile", excerpt:"App de compras con React Native y Stripe", content:"<p>E-commerce con Expo, Stripe y notificaciones push.</p>", proyectoUrl:"https://expo.dev/@angel/app", repoUrl:"https://github.com/angel/shop-mobile", techStack:["React Native","Expo","Stripe"], categoria:"Mobile", image:"https://picsum.photos/seed/c/800/600" },
];

async function wpFetch(path, opts={}) {
  const url = `${WP}/wp-json/wp/v2/${path}`;
  const res = await fetch(url, { headers:{ Authorization: auth, "Content-Type":"application/json", ...(opts.headers||{}) }, ...opts });
  if (!res.ok) throw new Error(`${path} ${res.status} ${await res.text()}`);
  return res.json();
}

async function ensureCategoria(name) {
  const slug = name.toLowerCase();
  const found = await wpFetch(`categoria-proyecto?slug=${slug}`).catch(() => []);
  if (found.length) return found[0].id;
  const created = await wpFetch(`categoria-proyecto`, { method:"POST", body: JSON.stringify({ name, slug }) });
  return created.id;
}

for (const p of proyectos) {
  const catId = await ensureCategoria(p.categoria);
  // Crear post tipo proyecto
  let post;
  try {
    post = await wpFetch(`proyecto`, {
      method: "POST",
      body: JSON.stringify({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        status: "publish",
        "categoria-proyecto": [catId],
        meta: { proyectoUrl: p.proyectoUrl, repoUrl: p.repoUrl, techStack: JSON.stringify(p.techStack) },
      }),
    });
    console.log("Creado", p.slug, "id", post.id);
  } catch (e) {
    console.error("Error creando", p.slug, e.message);
    continue;
  }
  // Sideload imagen destacada (opcional): descargar y POST /media luego PUT /proyecto/{id} con featured_media
}
console.log("Seed OK — 3 proyectos");
