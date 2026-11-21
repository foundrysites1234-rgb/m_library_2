import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { repository } from '../functions/repository/index.js';
import { createApp } from '../server.ts';

test('production server SPA fallback, JSON error handling, and rate limits', async () => {
  await repository.init();
  const tmpDist = fs.mkdtempSync(path.join(os.tmpdir(), 'mlibrary-dist-'));
  const htmlMarker = '<!doctype html><html><body>mlibrary test</body></html>';
  fs.writeFileSync(path.join(tmpDist, 'index.html'), htmlMarker, 'utf8');

  const app = await createApp({ distDir: tmpDist, isProduction: true });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    // Deep link returns SPA HTML 200
    const deepRes = await fetch(`${baseUrl}/books/valley`);
    assert.equal(deepRes.status, 200);
    assert.equal(await deepRes.text(), htmlMarker);

    // Unknown API route returns JSON 404
    const apiNopeRes = await fetch(`${baseUrl}/api/nope`);
    assert.equal(apiNopeRes.status, 404);
    assert.deepEqual(await apiNopeRes.json(), { ok: false, code: 'not_found' });

    // Missing file with extension returns real 404
    const missingAssetRes = await fetch(`${baseUrl}/assets/missing.js`);
    assert.equal(missingAssetRes.status, 404);

    // Malformed JSON returns 400 JSON
    const badJsonRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"broken":',
    });
    assert.equal(badJsonRes.status, 400);
    assert.deepEqual(await badJsonRes.json(), { ok: false, code: 'invalid_json' });

    // 11th request in a row triggers 429 rate limit
    for (let i = 0; i < 10; i++) {
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      assert.notEqual(res.status, 429);
    }
    const limitedRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(limitedRes.status, 429);
    assert.deepEqual(await limitedRes.json(), { ok: false, code: 'rate_limited' });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(tmpDist, { recursive: true, force: true });
  }
});
