import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.resolve(__dirname, '../../db/schema.postgres.sql');

function buildConnectionConfig(databaseUrl) {
  const parsed = new URL(databaseUrl);
  parsed.searchParams.delete('sslmode');

  const config = {
    connectionString: parsed.toString(),
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  };

  if (process.env.PG_CA_CERT && process.env.PG_CA_CERT.trim()) {
    config.ssl = {
      ca: process.env.PG_CA_CERT.replace(/\\n/g, '\n'),
      rejectUnauthorized: true,
    };
  } else if (process.env.NODE_ENV === 'production') {
    config.ssl = {
      rejectUnauthorized: true,
    };
  }

  return config;
}

export function createPgRepo(databaseUrl) {
  const pool = new Pool(buildConnectionConfig(databaseUrl));

  pool.on('error', (err) => {
    const code = err && err.code ? err.code : 'PG_POOL_ERROR';
    console.error(`[db] pool error code=${code}`);
  });

  return {
    kind: 'postgres',

    async init() {
      const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');
      await pool.query(sql);
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
      const result = await pool.query(
        `INSERT INTO contact_messages (
           request_id, full_name, email, phone, topic, book_id, message, consent_given
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (request_id) DO NOTHING
         RETURNING id, created_at`,
        [
          requestId,
          fullName,
          email,
          phone || null,
          topic,
          bookId || null,
          message,
          Boolean(consentGiven),
        ]
      );

      if (result.rowCount === 0) {
        return { created: false, createdAt: null };
      }
      const row = result.rows[0];
      return {
        created: true,
        createdAt: new Date(row.created_at).toISOString(),
      };
    },

    async subscribeEmail({ email, locale }) {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await pool.query(
        `INSERT INTO newsletter_subscribers (email, locale)
         VALUES ($1, $2)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, created_at`,
        [normalizedEmail, locale]
      );

      if (result.rowCount === 0) {
        return { created: false, createdAt: null };
      }
      const row = result.rows[0];
      return {
        created: true,
        createdAt: new Date(row.created_at).toISOString(),
      };
    },

    async ping() {
      await pool.query('SELECT 1');
      return true;
    },

    async getCounts() {
      const contactRes = await pool.query('SELECT COUNT(*)::int AS count FROM contact_messages');
      const newsletterRes = await pool.query('SELECT COUNT(*)::int AS count FROM newsletter_subscribers');
      return {
        contactMessages: contactRes.rows[0].count,
        newsletterSubscribers: newsletterRes.rows[0].count,
      };
    },

    async close() {
      await pool.end();
    },
  };
}
