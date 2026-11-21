import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.resolve(__dirname, '../../db/schema.sqlite.sql');

export function createSqliteRepo(dbPath = './data/mlibrary.db') {
  let db = null;

  function getDb() {
    if (!db) {
      if (dbPath !== ':memory:') {
        fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
      }
      db = new DatabaseSync(dbPath);
      db.exec('PRAGMA journal_mode = WAL;');
    }
    return db;
  }

  return {
    kind: 'sqlite',

    async init() {
      const conn = getDb();
      const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');
      conn.exec(sql);
    },

    async createContactMessage({
      requestId,
      fullName,
      email,
      phone,
      topic,
      bookId,
      message,
      consentGiven,
    }) {
      const conn = getDb();
      const createdAt = new Date().toISOString();
      const stmt = conn.prepare(
        `INSERT INTO contact_messages (
           request_id, full_name, email, phone, topic, book_id, message, consent_given, created_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (request_id) DO NOTHING`
      );
      const info = stmt.run(
        requestId,
        fullName,
        email,
        phone || null,
        topic,
        bookId || null,
        message,
        consentGiven ? 1 : 0,
        createdAt
      );

      if (info.changes === 0) {
        return { created: false, createdAt: null };
      }
      return { created: true, createdAt };
    },

    async subscribeEmail({ email, locale }) {
      const conn = getDb();
      const normalizedEmail = email.trim().toLowerCase();
      const createdAt = new Date().toISOString();
      const stmt = conn.prepare(
        `INSERT INTO newsletter_subscribers (email, locale, created_at)
         VALUES (?, ?, ?)
         ON CONFLICT (email) DO NOTHING`
      );
      const info = stmt.run(normalizedEmail, locale, createdAt);

      if (info.changes === 0) {
        return { created: false, createdAt: null };
      }
      return { created: true, createdAt };
    },

    async ping() {
      const conn = getDb();
      conn.prepare('SELECT 1').get();
      return true;
    },

    async getCounts() {
      const conn = getDb();
      const contactRow = conn.prepare('SELECT COUNT(*) AS count FROM contact_messages').get();
      const newsletterRow = conn.prepare('SELECT COUNT(*) AS count FROM newsletter_subscribers').get();
      return {
        contactMessages: Number(contactRow.count),
        newsletterSubscribers: Number(newsletterRow.count),
      };
    },

    async close() {
      if (db) {
        db.close();
        db = null;
      }
    },
  };
}
