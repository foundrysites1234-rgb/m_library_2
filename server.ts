import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleContact } from './functions/api/contact.js';
import { handleHealth } from './functions/api/health.js';
import { handleNewsletter } from './functions/api/newsletter.js';
import { repository } from './functions/repository/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', handleHealth);
  app.post('/api/contact', handleContact);
  app.post('/api/newsletter', handleNewsletter);

  app.all('/api/*splat', (_req, res) => {
    res.status(404).json({ ok: false, code: 'not_found' });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const indexPath = path.join(distDir, 'index.html');
    app.use(express.static(distDir));
    app.get('*splat', (_req, res) => {
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      return res.status(404).send('Build output not found.');
    });
  }

  try {
    await repository.init();
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : 'init_error';
    console.error(`[db] init failed code=${code}; serving static site in degraded mode`);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`mlibrary server listening on port ${port}`);
  });
}

startServer();
