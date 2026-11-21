import assert from 'node:assert/strict';
import test from 'node:test';
import { contactSchema, newsletterSchema } from '../functions/api/validation.js';

const validUuid = '11111111-2222-4333-8444-555555555555';

test('contactSchema accepts valid general inquiry', () => {
  const result = contactSchema.safeParse({
    requestId: validUuid,
    fullName: '  Sarnai Dorj  ',
    email: 'sarnai@example.com',
    phone: '',
    topic: 'general',
    bookId: '',
    message: 'Hello from Ulaanbaatar.',
    consent: true,
  });

  assert.equal(result.success, true);
  assert.equal(result.data.fullName, 'Sarnai Dorj');
  assert.equal(result.data.phone, null);
  assert.equal(result.data.bookId, null);
});

test('contactSchema requires valid bookId when topic is reserve', () => {
  const missingBook = contactSchema.safeParse({
    requestId: validUuid,
    fullName: 'Enkhjin',
    email: 'enkhjin@example.com',
    topic: 'reserve',
    bookId: '',
    message: 'Please reserve Noon in Ashes.',
    consent: true,
  });
  assert.equal(missingBook.success, false);

  const invalidBook = contactSchema.safeParse({
    requestId: validUuid,
    fullName: 'Enkhjin',
    email: 'enkhjin@example.com',
    topic: 'reserve',
    bookId: 'unknown-book',
    message: 'Please reserve Noon in Ashes.',
    consent: true,
  });
  assert.equal(invalidBook.success, false);

  const validReserve = contactSchema.safeParse({
    requestId: validUuid,
    fullName: 'Enkhjin',
    email: 'enkhjin@example.com',
    topic: 'reserve',
    bookId: 'noon',
    message: 'Please reserve Noon in Ashes.',
    consent: true,
  });
  assert.equal(validReserve.success, true);
  assert.equal(validReserve.data.bookId, 'noon');
});

test('contactSchema rejects bookId when topic is not reserve', () => {
  const result = contactSchema.safeParse({
    requestId: validUuid,
    fullName: 'Enkhjin',
    email: 'enkhjin@example.com',
    topic: 'general',
    bookId: 'noon',
    message: 'Hello.',
    consent: true,
  });
  assert.equal(result.success, false);
});

test('contactSchema requires consent === true and respects max lengths', () => {
  const noConsent = contactSchema.safeParse({
    requestId: validUuid,
    fullName: 'Bat',
    email: 'bat@example.com',
    topic: 'membership',
    message: 'Membership inquiry',
    consent: false,
  });
  assert.equal(noConsent.success, false);

  const tooLongMessage = contactSchema.safeParse({
    requestId: validUuid,
    fullName: 'Bat',
    email: 'bat@example.com',
    topic: 'membership',
    message: 'x'.repeat(2001),
    consent: true,
  });
  assert.equal(tooLongMessage.success, false);
});

test('newsletterSchema normalizes email to lowercase and validates locale', () => {
  const valid = newsletterSchema.safeParse({
    email: '  Reader@Example.COM ',
    locale: 'mn',
  });
  assert.equal(valid.success, true);
  assert.equal(valid.data.email, 'reader@example.com');
  assert.equal(valid.data.locale, 'mn');

  const invalid = newsletterSchema.safeParse({
    email: 'not-an-email',
    locale: 'en',
  });
  assert.equal(invalid.success, false);
});
