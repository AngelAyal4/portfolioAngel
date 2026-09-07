---
name: dev-cache-vite
description: Reglas dev/build con Vite/Astro para no envenenar la caché del optimizador
metadata:
  type: project
---

## Regla: build y dev no se mezclan

- **Why:** `npm run build` con el dev levantado pisa `node_modules/.vite/deps` con bundles de producción (`jsxDEV = void 0`); las islas React mueren al hidratar con `TypeError: _jsxDEV is not a function` (incidente 2026-09-06, ProyectosGrid + ContactForm). Además build y dev comparten hashes de caché: reiniciar el dev tras un build **reutiliza** la caché envenenada sin re-optimizar.
- **How to apply:** secuencia obligatoria: `astro dev stop` (mata huérfanos: el `kill` al shell padre deja vivo al nodo hijo) → `npm run build` → borrar caché del optimizador → `npm run dev`. Verificar con el head de `react_jsx-dev-runtime.js` (`development` vs `production`) + hidratación en navegador (forms/articles presentes, 0 excepciones).

## React como dependencia directa

- **Why:** `react`/`react-dom` usados en `src/components/*.tsx` entraban solo como peer hoisteado de `@astrojs/react`; frágil ante el prebundle de Vite.
- **How to apply:** siempre declarados en `dependencies` de `package.json`, pineados a la versión instalada.
