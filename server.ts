import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleContact } from './functions/api/contact.js';
import { handleHealth } from './functions/api/health.js';
import { handleNewsletter } from './functions/api/newsletter.js';
import { repository } from './functions/repository/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createApiRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ ok: false, code: 'rate_limited' });
    },
  });
}

export async function createApp(options: { distDir?: string; isProduction?: boolean } = {}) {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === 'production';
  const distDir = options.distDir ? path.resolve(options.distDir) : path.resolve(__dirname, 'dist');
  const indexPath = path.join(distDir, 'index.html');

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // CSP and frameguard stay off because AI Studio preview embeds the app in an iframe and media loads from external hosts.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      frameguard: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );

  app.use(express.json({ limit: '32kb' }));

  const contactLimiter = createApiRateLimiter();
  const newsletterLimiter = createApiRateLimiter();

  app.get('/api/health', handleHealth);
  app.post('/api/contact', contactLimiter, handleContact);
  app.post('/api/newsletter', newsletterLimiter, handleNewsletter);

  app.use('/api', (_req, res) => {
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
    app.use('/assets', express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(distDir, { index: false, maxAge: '1h' }));

    app.use((req, res, next) => {
      if ((req.method !== 'GET' && req.method !== 'HEAD') || path.extname(req.path)) return next();
      if (!fs.existsSync(indexPath)) {
        return res.status(404).send('Build output not found.');
      }
      res.setHeader('Cache-Control', 'no-cache');
      return res.sendFile(indexPath);
    });
  }

  app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) return next(err);
    const errObj = err && typeof err === 'object' ? (err as { type?: string }) : {};
    if ((err instanceof SyntaxError && 'body' in (err as object)) || errObj.type === 'entity.parse.failed') {
      return res.status(400).json({ ok: false, code: 'invalid_json' });
    }
    return res.status(500).json({ ok: false, code: 'server_error' });
  });

  return app;
}

async function startServer() {
  const port = Number(process.env.PORT) || 3000;
  const app = await createApp();

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

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  startServer();
}
