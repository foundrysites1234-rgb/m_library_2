import assert from 'node:assert/strict';
import test from 'node:test';
import { createSqliteRepo } from '../functions/repository/sqliteRepo.js';

test('sqliteRepo inserts contact message and deduplicates duplicate request_id', async () => {
  const repo = createSqliteRepo(':memory:');
  await repo.init();

  const requestId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
  const first = await repo.createContactMessage({
    requestId,
    fullName: 'Sarnai Dorj',
    email: 'sarnai@example.com',
    phone: '+976 9900 1122',
    topic: 'reserve',
    bookId: 'valley',
    message: 'Looking to read The Silent Valley.',
    consentGiven: true,
  });

  assert.equal(first.created, true);
  assert.ok(typeof first.createdAt === 'string' && first.createdAt.endsWith('Z'));

  const duplicate = await repo.createContactMessage({
    requestId,
    fullName: 'Sarnai Dorj',
    email: 'sarnai@example.com',
    phone: '+976 9900 1122',
    topic: 'reserve',
    bookId: 'valley',
    message: 'Looking to read The Silent Valley.',
    consentGiven: true,
  });

  assert.equal(duplicate.created, false);
  const counts = await repo.getCounts();
  assert.equal(counts.contactMessages, 1);

  await repo.close();
});

test('sqliteRepo subscribes email and deduplicates duplicate newsletter email', async () => {
  const repo = createSqliteRepo(':memory:');
  await repo.init();

  const first = await repo.subscribeEmail({
    email: 'Reader@Example.com',
    locale: 'mn',
  });
  assert.equal(first.created, true);
  assert.ok(typeof first.createdAt === 'string' && first.createdAt.endsWith('Z'));

  const duplicate = await repo.subscribeEmail({
    email: 'reader@example.com',
    locale: 'en',
  });
  assert.equal(duplicate.created, false);

  const counts = await repo.getCounts();
  assert.equal(counts.newsletterSubscribers, 1);
  assert.equal(await repo.ping(), true);

  await repo.close();
});
