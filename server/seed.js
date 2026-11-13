// Put the whole demo catalogue, orders and shop settings into MongoDB.
//   npm run seed          -> only if the database is empty
//   npm run seed:reset    -> wipe and re-seed
import { seed, close, DB_NAME, MONGODB_URI } from './db.js';

const reset = process.argv.includes('--reset');
try {
  const r = await seed({ reset });
  const where = `${MONGODB_URI.replace(/\/\/[^@]*@/, '//***@')} / ${DB_NAME}`;
  if (r.seeded) console.log(`Seeded ${r.products} products and ${r.orders} orders into ${where}`);
  else console.log(`Database ${where} already has data. Use "npm run seed:reset" to start over.`);
} catch (err) {
  console.error('Seeding failed:', err.message);
  process.exitCode = 1;
} finally {
  await close();
}
