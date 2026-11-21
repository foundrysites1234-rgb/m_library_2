import { repository } from '../repository/index.js';
import { contactSchema } from './validation.js';

export async function handleContact(req, res) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};

  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return res.status(200).json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, code: 'invalid_input' });
  }

  const { requestId, fullName, email, phone, topic, bookId, message, consent } = parsed.data;

  try {
    await repository.createContactMessage({
      requestId,
      fullName,
      email,
      phone,
      topic,
      bookId,
      message,
      consentGiven: consent,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    const code = err && err.code ? String(err.code) : 'db_error';
    console.error(`[api/contact] request_id=${requestId} code=${code}`);
    return res.status(503).json({ ok: false, code: 'unavailable' });
  }
}
