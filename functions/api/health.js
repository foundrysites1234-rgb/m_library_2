import { repository } from '../repository/index.js';

export async function handleHealth(_req, res) {
  try {
    await repository.ping();
    return res.status(200).json({ ok: true });
  } catch (err) {
    const code = err && err.code ? String(err.code) : 'db_error';
    console.error(`[api/health] code=${code}`);
    return res.status(503).json({ ok: false, code: 'unavailable' });
  }
}
