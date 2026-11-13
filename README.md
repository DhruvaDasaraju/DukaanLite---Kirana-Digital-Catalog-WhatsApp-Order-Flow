# Dukan Lite — Kirana digital catalog & WhatsApp order flow

A working, responsive web app built from the *DukaanLite* UI/UX deck (PRD v1.0 · PST_PD_098).
Customers browse a kirana store's catalog, build a cart and send the order on WhatsApp. The shopkeeper
tracks it on an orders board, and the delivery person packs it with a checklist and marks it delivered.

Front end: plain HTML/CSS/JS with [GSAP](https://gsap.com) (ScrollTrigger + Flip). Back end: Node.js + Express +
**MongoDB**. All shop data lives in the MongoDB database **`mangoes`**, so every phone and laptop sees the same
products and orders, with live updates.

## Run it

You need Node.js 20+ and MongoDB.

**1. Start MongoDB** (installed at `~/.local/mongodb` on this Mac; keep this terminal open):

```bash
npm run db
```

**2. Start the website** (in a second terminal, inside this folder):

```bash
npm install
npm start
```

Open http://localhost:5510. On first start the server fills the `mangoes` database with the sample products,
orders and settings automatically.

> Tip: open the **Shop** in one window and **Shopkeeper → Orders board** in another (or on another device on
> your Wi-Fi). Place an order and it appears on the board instantly.

### Using MongoDB Atlas (cloud) instead

Copy `.env.example` to `.env`, set `MONGODB_URI` to your Atlas connection string and keep `DB_NAME=mangoes`.
Then run `npm run seed` once and `npm start`.

### Database: `mangoes`

| Collection | What it holds |
|---|---|
| `products` | Catalogue: name, pack size, price, category, stock, search words, photo (`_id` = `p1`, `p2`, …) |
| `orders` | Every order: customer, address, items (priced by the server), total, status, rider, timeline, packing checklist (`_id` = order number) |
| `settings` | One document `shop`: shop name, WhatsApp number, hours, minimum order, delivery staff |
| `counters` | `orderId`: the last order number used |

Useful commands: `npm run seed` (fill an empty database), `npm run seed:reset` (wipe and refill with sample data).
**Shopkeeper → Settings → Reset demo data** does the same from the website.

### API

| Method & path | Does |
|---|---|
| `GET /api/state` | Products, orders, settings and staff |
| `POST /api/orders` | Place an order. The server checks stock and minimum order and re-prices every line |
| `PATCH /api/orders/:id` | Change status (one step at a time), rider, or packing checklist |
| `PUT /api/products/:id` · `PATCH` · `DELETE` | Add/edit, change price or stock, delete a product |
| `PUT /api/settings` | Shop settings and delivery staff |
| `GET /api/events` | Live updates (Server-Sent Events) |

Each phone keeps only its own cart, "My orders" list and saved delivery details in the browser.
If the site is opened without the server (e.g. by double-clicking `public/index.html`), it falls back to
browser-only storage.

## Pages

| Route | Who | What it does |
|---|---|---|
| `#/` | Everyone | Landing page: animated hero with a self-playing shop demo, personas, how it works, features |
| `#/shop` | Sunita (customer) | Search (Hindi words too, like *doodh*, *chai*), category sidebar, sort, product grid, cart fixed on the right (bottom bar on phones) |
| `#/cart` | Customer | Two-column cart & checkout: quantity steppers, minimum-order check, price formula, delivery form with errors in plain words, **Order on WhatsApp** |
| `#/track/:id`, `#/my-orders` | Customer | Order status timeline (New → Packed → Out for delivery → Delivered) |
| `#/orders` | Mr. Gupta (shopkeeper) | Kanban board with one column per status, assign a rider, move orders forward/back, live stats |
| `#/products` | Shopkeeper | Add / edit / delete products, inline price edit, in-stock toggle |
| `#/settings` | Shopkeeper | Shop name, **WhatsApp number**, hours, minimum order, delivery staff, share link, reset demo data |
| `#/delivery` | Raju (delivery) | Only assigned orders, big packing checklist, call / directions, Start delivery → Mark delivered |

## Make it yours

1. Go to **Shopkeeper → Settings** and set the shop's real WhatsApp number (with country code, like `919876543210`).
   The demo number is a placeholder.
2. Edit products in **Shopkeeper → Products**. Each product can have a real photo: click **Upload photo** and it is resized
   in the browser and saved with the product. Seed photos live in `img/products/` (credits in [CREDITS.md](CREDITS.md)).
3. The theme is white, black and green. Change the tokens at the top of `css/style.css`.

## Animations (GSAP)

- Hero headline line reveals, counters, floating groceries, mouse-parallax 3D mockup, magnetic CTA
- Looping in-mockup demo: cursor adds items, cart total counts up to ₹412, WhatsApp bubble pops in
- Product marquee that speeds up and reverses with scroll direction (ScrollTrigger velocity)
- Scroll-scrubbed "how it works" progress line, batched feature reveals
- **Flip** for category/search filtering, the sliding category pill, and cards moving between board columns
- Add-to-cart "fly to cart" arc with the product photo, badge bounce, animated totals, confetti on order placed / delivered
- Respects `prefers-reduced-motion`

## Scope (from the deck)

In: 3 demo roles, catalog, search, cart, WhatsApp handoff, order tracking, delivery checklist, MongoDB storage with live sync across devices.
Out: online payments & GST invoices, ONDC & multiple shops, real accounts / OTP login.

> **Before going live:** the Shopkeeper and Delivery pages have no login yet, so anyone with the link can open them.
> Add a password or OTP login before putting this on the public internet.

## Files

```
server/index.js        Express API + serves the website
server/db.js           MongoDB connection and seeding (database: mangoes)
server/seed.js         npm run seed / seed:reset
public/index.html      App shell (nav, footer, toasts, modal)
public/css/style.css   Design tokens (white / black / green) + all styles
public/img/products/   Real product photos (see CREDITS.md)
public/js/data.js      Sample products, settings and orders (used to seed MongoDB)
public/js/store.js     Talks to the API, live updates, per-device cart
public/js/app.js       Router, views and GSAP animations
.env.example           MONGODB_URI / DB_NAME / PORT
```
