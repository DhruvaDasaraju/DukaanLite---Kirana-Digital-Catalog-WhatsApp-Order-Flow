// MongoDB connection + seeding for the "mangoes" database
import { MongoClient } from 'mongodb';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Tiny .env loader (KEY=value lines) so no extra dependency is needed
const envFile = join(ROOT, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
export const DB_NAME = process.env.DB_NAME || 'mangoes';

let client;
let db;

export async function connect() {
  if (db) return db;
  client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  db = client.db(DB_NAME);
  await Promise.all([
    db.collection('products').createIndex({ cat: 1 }),
    db.collection('orders').createIndex({ status: 1, createdAt: -1 }),
    db.collection('orders').createIndex({ assignee: 1, status: 1 }),
  ]);
  return db;
}

export async function close() {
  if (client) await client.close();
  client = null;
  db = null;
}

export const col = (name) => db.collection(name);

/* Load the seed catalogue from the front-end's data.js so there is one source of truth */
export function loadSeed() {
  const ctx = {};
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(readFileSync(join(ROOT, 'public/js/data.js'), 'utf8'), ctx);
  const DL = ctx.DL;
  return {
    products: JSON.parse(JSON.stringify(DL.seedProducts)),
    orders: JSON.parse(JSON.stringify(DL.seedOrders())),
    settings: { ...DL.defaultSettings },
    staff: [...DL.defaultStaff],
  };
}

/* Map between API objects ({ id }) and MongoDB documents ({ _id }) */
export const toDoc = ({ id, ...rest }) => ({ _id: id, ...rest });
export const fromDoc = (doc) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
};

export async function seed({ reset = false } = {}) {
  await connect();
  const products = col('products');
  if (!reset && (await products.estimatedDocumentCount()) > 0) return { seeded: false };
  const data = loadSeed();
  await Promise.all(['products', 'orders', 'settings', 'counters'].map((c) => col(c).deleteMany({})));
  await col('products').insertMany(data.products.map(toDoc));
  await col('orders').insertMany(data.orders.map(toDoc));
  await col('settings').insertOne({ _id: 'shop', settings: data.settings, staff: data.staff });
  const maxId = data.orders.reduce((a, o) => Math.max(a, o.id), 1000);
  await col('counters').insertOne({ _id: 'orderId', seq: maxId });
  return { seeded: true, products: data.products.length, orders: data.orders.length };
}
