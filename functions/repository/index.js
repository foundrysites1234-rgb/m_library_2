import { createPgRepo } from './pgRepo.js';
import { createSqliteRepo } from './sqliteRepo.js';

export function createRepositoryFromEnv() {
  const databaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim();
  const baseRepo = databaseUrl
    ? createPgRepo(databaseUrl)
    : createSqliteRepo(process.env.DB_PATH || './data/mlibrary.db');

  let initialized = false;
  let initPromise = null;

  async function ensureInit() {
    if (initialized) return;
    if (!initPromise) {
      initPromise = baseRepo
        .init()
        .then(() => {
          initialized = true;
        })
        .catch((err) => {
          initPromise = null;
          throw err;
        });
    }
    await initPromise;
  }

  return {
    kind: baseRepo.kind,

    async init() {
      await ensureInit();
    },

    async createContactMessage(payload) {
      await ensureInit();
      return baseRepo.createContactMessage(payload);
    },

    async subscribeEmail(payload) {
      await ensureInit();
      return baseRepo.subscribeEmail(payload);
    },

    async ping() {
      await baseRepo.ping();
      return true;
    },

    async getCounts() {
      await ensureInit();
      return baseRepo.getCounts();
    },

    async close() {
      initialized = false;
      initPromise = null;
      await baseRepo.close();
    },
  };
}

export const repository = createRepositoryFromEnv();
