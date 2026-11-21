import { z } from 'zod';
import { BOOK_IDS, CONTACT_LIMITS, TOPICS, makeContactSchema } from '../validation/contactRules.js';

export { BOOK_IDS, CONTACT_LIMITS, TOPICS, makeContactSchema };

export const contactSchema = makeContactSchema().and(
  z.object({
    requestId: z.string().uuid(),
  })
);

export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(CONTACT_LIMITS.emailMax)
    .transform((val) => val.toLowerCase()),
  locale: z.enum(['mn', 'en']).default('mn'),
});
