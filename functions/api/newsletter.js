import { repository } from '../repository/index.js';
import { newsletterSchema } from './validation.js';

export async function handleNewsletter(req, res) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return res.status(400).json({ ok: false, code: 'invalid_email' });
  }

  const { email, locale } = parsed.data;

  try {
    await repository.subscribeEmail({ email, locale });
    return res.status(200).json({ ok: true });
  } catch (err) {
    const code = err && err.code ? String(err.code) : 'db_error';
    console.error(`[api/newsletter] code=${code}`);
    return res.status(503).json({ ok: false, code: 'unavailable' });
  }
}
