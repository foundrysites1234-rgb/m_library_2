import { z } from 'zod';

export const CONTACT_LIMITS = {
  nameMin: 1,
  nameMax: 120,
  emailMax: 254,
  phoneMax: 40,
  messageMin: 1,
  messageMax: 2000,
  websiteMax: 200,
};

export const BOOK_IDS = [
  'valley',
  'bluehour',
  'river',
  'summer',
  'green',
  'noon',
  'observer',
  'birds',
  'storm',
  'tide',
  'war',
  'door',
];

export const TOPICS = [
  'general',
  'reserve',
  'membership',
  'donate',
  'press',
  'status',
];

const DEFAULT_MESSAGES = {
  nameRequired: 'Please enter your full name.',
  nameTooLong: 'Full name must be 120 characters or fewer.',
  emailInvalid: 'Please enter a valid email address.',
  phoneTooLong: 'Phone number must be 40 characters or fewer.',
  bookRequired: 'Please select a book to reserve.',
  messageRequired: 'Please write a message.',
  messageTooLong: 'Message must be 2000 characters or fewer.',
  consentRequired: 'Please confirm that mlibrary may store these details to reply.',
};

export function makeContactSchema(messages = DEFAULT_MESSAGES) {
  const m = { ...DEFAULT_MESSAGES, ...messages };

  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(CONTACT_LIMITS.nameMin, m.nameRequired)
        .max(CONTACT_LIMITS.nameMax, m.nameTooLong),
      email: z
        .string()
        .trim()
        .email(m.emailInvalid)
        .max(CONTACT_LIMITS.emailMax, m.emailInvalid),
      phone: z
        .string()
        .trim()
        .max(CONTACT_LIMITS.phoneMax, m.phoneTooLong)
        .optional()
        .or(z.literal(''))
        .transform((val) => (val ? val : null)),
      topic: z.enum(TOPICS),
      bookId: z
        .string()
        .trim()
        .optional()
        .nullable()
        .or(z.literal(''))
        .transform((val) => (val ? val : null)),
      message: z
        .string()
        .trim()
        .min(CONTACT_LIMITS.messageMin, m.messageRequired)
        .max(CONTACT_LIMITS.messageMax, m.messageTooLong),
      consent: z.boolean().refine((val) => val === true, {
        message: m.consentRequired,
      }),
      website: z.string().max(CONTACT_LIMITS.websiteMax).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.topic === 'reserve') {
        if (!data.bookId || !BOOK_IDS.includes(data.bookId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['bookId'],
            message: m.bookRequired,
          });
        }
      } else if (data.bookId !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bookId'],
          message: 'bookId is only accepted when topic is reserve.',
        });
      }
    });
}
