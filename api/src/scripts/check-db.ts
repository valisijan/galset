import 'dotenv/config';
import { db } from '../lib/db';
import { drafts } from '../lib/db/schema';

async function main() {
  const allDrafts = await db.select().from(drafts);
  console.log('ALL DRAFTS IN DB:', JSON.stringify(allDrafts, null, 2));
  process.exit(0);
}

main().catch(console.error);
