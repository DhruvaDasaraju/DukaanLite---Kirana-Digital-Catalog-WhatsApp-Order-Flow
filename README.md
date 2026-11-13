# DukaanLite — Kirana digital catalog & WhatsApp order flow

A working, responsive web app built from the *DukaanLite* UI/UX deck (PRD v1.0 · PST_PD_098).
Customers browse a kirana store's catalog, build a cart and send the order on WhatsApp. The shopkeeper
tracks it on an orders board, and the delivery person packs it with a checklist and marks it delivered.

No build step, no backend. It's plain HTML/CSS/JS with [GSAP](https://gsap.com) (ScrollTrigger + Flip) for motion.
Data lives in `localStorage`.

## Run it

```bash
node serve.mjs
```

Then open http://localhost:5510. Any static host works too (GitHub Pages, Netlify, Vercel). Just upload this folder.

> Tip: open the **Shop** in one tab and **Shopkeeper → Orders board** in another. Place an order and watch it land
> on the board live (tabs sync through `localStorage` events).

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

In: 3 demo roles, catalog, search, cart, WhatsApp handoff, local order tracking, delivery checklist, localStorage.
Out: online payments & GST invoices, ONDC & multiple shops, real accounts / OTP, syncing orders across devices.

## Files

```
index.html       App shell (nav, footer, toasts, modal)
css/style.css    Design tokens (white / black / green) + all styles
img/products/    Real product photos (see CREDITS.md)
js/data.js       Seed products, settings, demo orders
js/store.js      localStorage store with cross-tab sync
js/app.js        Router, views and GSAP animations
serve.mjs        Zero-dependency local server
```
