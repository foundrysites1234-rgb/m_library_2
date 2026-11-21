import 'dotenv/config';
import { repository } from '../functions/repository/index.js';

async function main() {
  try {
    await repository.init();
    await repository.ping();
    const counts = await repository.getCounts();
    console.log(
      `db:check ok (${repository.kind}) contact_messages=${counts.contactMessages} newsletter_subscribers=${counts.newsletterSubscribers}`
    );
    await repository.close();
    process.exit(0);
  } catch (err) {
    const code = err && err.code ? String(err.code) : 'db_error';
    console.error(`db:check failed code=${code}`);
    try {
      await repository.close();
    } catch {
      // ignore close errors
    }
    process.exit(1);
  }
}

main();
