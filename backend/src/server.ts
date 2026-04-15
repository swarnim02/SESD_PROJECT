import 'dotenv/config';
import { createApp } from './app';
import db from './config/database';

const port = Number(process.env.PORT || 5000);

async function main(): Promise<void> {
  await db.connect();
  console.log('[db] connected to MongoDB');

  const app = createApp();
  app.listen(port, () => {
    console.log(`[server] Lost & Found API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
