import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import search from './api/search.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'SERPAPI_');
  process.env.SERPAPI_API_KEY ||= env.SERPAPI_API_KEY;

  return {
    plugins: [react(), tailwindcss(), {
      name: 'local-search-api',
      configureServer(server) {
        // Executa a mesma função da Vercel no servidor local do Vite.
        server.middlewares.use('/api/search', (req, res, next) => {
          const url = new URL(req.url, 'http://localhost');
          if (url.pathname !== '/') return next();
          req.query = { q: url.searchParams.getAll('q') };
          if (req.query.q.length === 1) req.query.q = req.query.q[0];
          res.status = (code) => { res.statusCode = code; return res; };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(data));
          };
          search(req, res).catch(next);
        });
      },
    }],
  };
});
