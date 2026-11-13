// DukanLite API + static site, backed by MongoDB (database "mangoes")
import express from 'express';
import { join } from 'node:path';
import { connect, seed, col, toDoc, fromDoc, ROOT, DB_NAME } from './db.js';

const PORT = Number(process.env.PORT) || 5510;
const STATUSES = ['new', 'packed', 'out', 'delivered'];
const CATEGORIES = ['Staples', 'Dairy', 'Snacks', 'Beverages', 'Household'];

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' })); // product photos are stored as small JPEG data URLs

/* ---------- live updates (Server-Sent Events) ---------- */
const clients = new Set();
function broadcast(type, req, extra = {}) {
  const payload = `event: change\ndata: ${JSON.stringify({ type, clientId: req.get('x-client-id') || '', ...extra })}\n\n`;
  for (const res of clients) res.write(payload);
}
app.get('/api/events', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  res.write('retry: 3000\n\n');
  clients.add(res);
  req.on('close', () => clients.delete(res));
});
setInterval(() => { for (const res of clients) res.write(': ping\n\n'); }, 25000).unref();

/* ---------- helpers ---------- */
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const bad = (msg) => { throw new HttpError(400, msg); };
const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const normPhone = (v) => String(v || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');

async function getShop() {
  const doc = await col('settings').findOne({ _id: 'shop' });
  return doc || { settings: {}, staff: [] };
}
async function nextOrderId() {
  const c = await col('counters').findOne({ _id: 'orderId' });
  return (c?.seq || 1000) + 1;
}

function cleanProduct(id, body) {
  const p = {
    id,
    name: str(body.name, 80),
    unit: str(body.unit, 30),
    price: Math.round(Number(body.price)),
    cat: CATEGORIES.includes(body.cat) ? body.cat : bad('Choose a valid category'),
    inStock: body.inStock !== false,
    tags: str(body.tags, 200),
    img: typeof body.img === 'string' ? body.img : '',
  };
  if (!p.name) bad('Please enter a product name');
  if (!p.unit) bad('Add the pack size, like 1 kg or 500 ml');
  if (!Number.isFinite(p.price) || p.price < 1 || p.price > 100000) bad('Price must be at least ₹1');
  if (p.img && !/^(img\/products\/[\w-]+\.(jpg|jpeg|png|webp)|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+)$/.test(p.img)) bad('Product photo is not a valid image');
  if (p.img.length > 1_500_000) bad('Product photo is too large');
  return p;
}

/* ---------- API ---------- */
app.get('/api/health', (req, res) => res.json({ ok: true, db: DB_NAME }));

app.get('/api/state', wrap(async (req, res) => {
  const [products, orders, shop, nextId] = await Promise.all([
    col('products').find().toArray(),
    col('orders').find().sort({ createdAt: -1 }).toArray(),
    getShop(),
    nextOrderId(),
  ]);
  res.set('Cache-Control', 'no-store');
  res.json({ products: products.map(fromDoc), orders: orders.map(fromDoc), settings: shop.settings, staff: shop.staff, nextOrderId: nextId });
}));

// Products: create or update (id comes from the client so the UI can update instantly)
app.put('/api/products/:id', wrap(async (req, res) => {
  const id = req.params.id;
  if (!/^[\w-]{1,40}$/.test(id)) bad('Invalid product id');
  const p = cleanProduct(id, req.body || {});
  await col('products').replaceOne({ _id: id }, toDoc(p), { upsert: true });
  broadcast('products', req);
  res.json(p);
}));

app.patch('/api/products/:id', wrap(async (req, res) => {
  const b = req.body || {};
  const set = {};
  if ('price' in b) {
    const price = Math.round(Number(b.price));
    if (!Number.isFinite(price) || price < 1 || price > 100000) bad('Price must be at least ₹1');
    set.price = price;
  }
  if ('inStock' in b) set.inStock = !!b.inStock;
  if (!Object.keys(set).length) bad('Nothing to update');
  const r = await col('products').findOneAndUpdate({ _id: req.params.id }, { $set: set }, { returnDocument: 'after' });
  if (!r) throw new HttpError(404, 'Product not found');
  broadcast('products', req);
  res.json(fromDoc(r));
}));

app.delete('/api/products/:id', wrap(async (req, res) => {
  const r = await col('products').deleteOne({ _id: req.params.id });
  if (!r.deletedCount) throw new HttpError(404, 'Product not found');
  broadcast('products', req);
  res.json({ ok: true });
}));

// Orders: the server re-prices every line from the database, so totals can't be tampered with
app.post('/api/orders', wrap(async (req, res) => {
  const b = req.body || {};
  const name = str(b.name, 80);
  const phone = normPhone(b.phone);
  const address = str(b.address, 300);
  const note = str(b.note, 140);
  if (name.length < 2) bad('Please enter your name');
  if (phone.length !== 10) bad('Phone must be 10 digits');
  if (!/^[6-9]/.test(phone)) bad('Mobile numbers start with 6, 7, 8 or 9');
  if (address.length < 10) bad('Add a bit more detail to the address: house number, street or landmark');
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 60) bad('Your cart is empty');

  const wanted = new Map();
  for (const it of b.items) {
    const qty = Math.round(Number(it && it.qty));
    if (typeof it?.id === 'string' && qty >= 1 && qty <= 99) wanted.set(it.id, qty);
  }
  const products = await col('products').find({ _id: { $in: [...wanted.keys()] }, inStock: true }).toArray();
  const items = products.map((p) => ({ id: p._id, name: p.name, unit: p.unit, price: p.price, img: p.img || '', qty: wanted.get(p._id) }));
  if (!items.length) bad('None of the items in your cart are in stock right now');
  const total = items.reduce((a, i) => a + i.price * i.qty, 0);
  const { settings } = await getShop();
  const min = Number(settings.minOrder) || 0;
  if (total < min) bad(`Add ₹${min - total} more. The minimum order is ₹${min}.`);

  const counter = await col('counters').findOneAndUpdate({ _id: 'orderId' }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
  const now = Date.now();
  const order = {
    id: counter.seq, name, phone, address, note, items, total,
    status: 'new', assignee: '', createdAt: now, history: { new: now }, checked: [],
  };
  await col('orders').insertOne(toDoc(order));
  broadcast('orders', req, { newOrder: order.id });
  res.status(201).json(order);
}));

// Orders: status / assignee / packing checklist changes from the shopkeeper and delivery views
app.patch('/api/orders/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const current = await col('orders').findOne({ _id: id });
  if (!current) throw new HttpError(404, 'Order not found');
  const b = req.body || {};
  const set = {};
  const unset = {};
  if ('assignee' in b) {
    const { staff } = await getShop();
    const a = str(b.assignee, 40);
    if (a && !staff.includes(a)) bad('That delivery person is not in the staff list');
    set.assignee = a;
  }
  if ('checked' in b) {
    if (!Array.isArray(b.checked)) bad('Invalid checklist');
    const ids = new Set(current.items.map((i) => i.id));
    set.checked = [...new Set(b.checked.filter((x) => ids.has(x)))];
  }
  if ('status' in b) {
    const to = STATUSES.indexOf(b.status);
    const from = STATUSES.indexOf(current.status);
    if (to < 0) bad('Unknown status');
    if (to !== from) {
      if (to > from + 1) bad('Orders move one step at a time');
      const assignee = set.assignee ?? current.assignee;
      if (b.status === 'out' && !assignee) bad('Choose who will deliver it first');
      set.status = b.status;
      if (to > from) set[`history.${b.status}`] = Date.now();
      else STATUSES.slice(to + 1).forEach((k) => { unset[`history.${k}`] = ''; });
      if (to >= 2) set.checked = current.items.map((i) => i.id);
    }
  }
  if (!Object.keys(set).length && !Object.keys(unset).length) bad('Nothing to update');
  const update = { ...(Object.keys(set).length ? { $set: set } : {}), ...(Object.keys(unset).length ? { $unset: unset } : {}) };
  const r = await col('orders').findOneAndUpdate({ _id: id }, update, { returnDocument: 'after' });
  broadcast('orders', req);
  res.json(fromDoc(r));
}));

// Shop settings + delivery staff
app.put('/api/settings', wrap(async (req, res) => {
  const b = req.body || {};
  const s = b.settings || {};
  const settings = {
    shopName: str(s.shopName, 80) || bad('Please enter the shop name'),
    area: str(s.area, 120),
    whatsapp: String(s.whatsapp || '').replace(/\D/g, ''),
    openHour: Math.min(23, Math.max(0, Math.round(Number(s.openHour)))),
    closeHour: Math.min(24, Math.max(1, Math.round(Number(s.closeHour)))),
    minOrder: Math.max(0, Math.round(Number(s.minOrder) || 0)),
  };
  if (settings.whatsapp.length < 11 || settings.whatsapp.length > 15) bad('Use the full WhatsApp number with country code, like 919876543210');
  const staff = Array.isArray(b.staff) ? [...new Set(b.staff.map((x) => str(x, 40)).filter(Boolean))] : [];
  if (!staff.length) bad('Add at least one delivery person');
  await col('settings').replaceOne({ _id: 'shop' }, { settings, staff }, { upsert: true });
  broadcast('settings', req);
  res.json({ settings, staff });
}));

// Demo reset: put the sample data back
app.post('/api/reset', wrap(async (req, res) => {
  await seed({ reset: true });
  broadcast('reset', req);
  res.json({ ok: true });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

/* ---------- static site ---------- */
app.use(express.static(join(ROOT, 'public'), { extensions: ['html'], maxAge: '1h', setHeaders: (res, path) => { if (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css')) res.setHeader('Cache-Control', 'no-cache'); } }));

/* ---------- errors ---------- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || (err.type === 'entity.too.large' ? 413 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong on the server. Please try again.' : err.message });
});

/* ---------- start ---------- */
try {
  await connect();
  const r = await seed();
  if (r.seeded) console.log(`Seeded ${r.products} products and ${r.orders} orders into "${DB_NAME}"`);
  app.listen(PORT, () => console.log(`Dukan Lite running at http://localhost:${PORT}  (MongoDB database: ${DB_NAME})`));
} catch (err) {
  console.error(`\nCould not connect to MongoDB: ${err.message}`);
  console.error('Start it first with:  npm run db   (or set MONGODB_URI in .env to use MongoDB Atlas)\n');
  process.exit(1);
}
