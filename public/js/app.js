/* =========================================================
   DukaanLite — app (router, views, GSAP motion)
   ========================================================= */
(() => {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, Flip);
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCED) gsap.globalTimeline.timeScale(40);

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
  const rupee = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const store = DL.store;
  const S = () => store.get();
  const fmtHour = (h) => `${h % 12 || 12} ${h < 12 || h === 24 ? 'am' : 'pm'}`;
  const isToday = (ts) => ts && new Date(ts).toDateString() === new Date().toDateString();
  const fmtTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const t = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    return isToday(ts) ? t : `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${t}`;
  };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* line icons (24px grid, stroke = currentColor) */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.6l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>',
    bag: '<path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    store: '<path d="M3 9.5 4.6 4h14.8L21 9.5"/><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>',
    bike: '<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17 9 10h7l2.5 7"/><path d="M12 17l4-7"/><path d="M8 6h3l-2 4"/><path d="M15 6h2.5l-1.5 4"/>',
    package: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z"/><path d="M3.5 7.5 12 12l8.5-4.5"/><path d="M12 12v9"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    phone: '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    nav: '<path d="M3 11 21 3l-8 18-2-8-8-2Z"/>',
    note: '<path d="M5 3h10l4 4v14H5V3Z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    board: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m14 6 4 4"/>',
    trash: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chat: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    list: '<path d="M10 6h11M10 12h11M10 18h11"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
    alert: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M12 8v3M12 13.5v.01"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    stock: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2Z"/><path d="M10 21h4"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    out: '<path d="M7 17 17 7M8 7h9v9"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    cup: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z"/><path d="M16 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v3M12 3v3"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  };
  const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

  /* product photo with a lettered fallback when no image is set or it fails to load */
  const initials = (n) => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const pimg = (p, cls = '') => (p && p.img
    ? `<img class="pimg ${cls}" src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" decoding="async" onerror="this.outerHTML='<span class=&quot;pimg ph ${cls}&quot;>${esc(initials(p.name))}</span>'">`
    : `<span class="pimg ph ${cls}" aria-hidden="true">${esc(initials(p && p.name))}</span>`);

  const STATUSES = [
    { key: 'new', label: 'New', icon: 'receipt' },
    { key: 'packed', label: 'Packed', icon: 'package' },
    { key: 'out', label: 'Out for delivery', icon: 'bike' },
    { key: 'delivered', label: 'Delivered', icon: 'home' },
  ];
  const statusIndex = (k) => STATUSES.findIndex((s) => s.key === k);
  const statusPill = (k) => `<span class="pill pill-${k}">${STATUSES[statusIndex(k)].label}</span>`;

  const productById = (id) => S().products.find((p) => p.id === id);
  const cartLines = () => Object.entries(S().cart)
    .map(([id, qty]) => ({ p: productById(id), qty }))
    .filter((l) => l.p && l.qty > 0);
  const buyable = () => cartLines().filter((l) => l.p.inStock);
  const cartCount = () => buyable().reduce((a, l) => a + l.qty, 0);
  const cartTotal = () => buyable().reduce((a, l) => a + l.qty * l.p.price, 0);
  const itemCount = (o) => o.items.reduce((a, i) => a + i.qty, 0);

  function shopStatus() {
    const { openHour, closeHour } = S().settings;
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    const open = h >= openHour && h < closeHour;
    return { open, label: open ? `Open now · closes ${fmtHour(closeHour)}` : `Closed · opens ${fmtHour(openHour)}` };
  }

  function waLink(o) {
    const s = S().settings;
    const lines = [
      `*New order #${o.id}* for ${s.shopName}`,
      '',
      ...o.items.map((it, i) => `${i + 1}. ${it.name} (${it.unit}) × ${it.qty} = ${rupee(it.price * it.qty)}`),
      '',
      `*Total: ${rupee(o.total)}*`,
      'Payment: cash / UPI on delivery',
      '',
      `Name: ${o.name}`,
      `Phone: ${o.phone}`,
      `Address: ${o.address}`,
    ];
    if (o.note) lines.push(`Note: ${o.note}`);
    return `https://wa.me/${String(s.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  /* ---------- motion helpers ---------- */
  function animateNumber(el, to, fmt = rupee, dur = 0.6) {
    if (!el) return;
    const from = Number(el.dataset.val ?? 0);
    el.dataset.val = to;
    const o = { v: from };
    gsap.to(o, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); } });
  }

  function bump(el, scale = 1.35) {
    if (!el) return;
    gsap.fromTo(el, { scale }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: true });
  }

  function shake(el) {
    if (!el) return;
    gsap.fromTo(el, { x: 0 }, { keyframes: { x: [-8, 8, -6, 6, -3, 0] }, duration: 0.45, ease: 'power1.out' });
  }

  function toast(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    $('#toasts').appendChild(el);
    gsap.fromTo(el, { y: 24, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
    gsap.to(el, { y: -10, opacity: 0, duration: 0.3, delay: 3.4, onComplete: () => el.remove() });
  }

  function confetti(x = innerWidth / 2, y = innerHeight / 3, n = 70) {
    if (REDUCED) return;
    const colors = ['#15803D', '#22C55E', '#0A0A0A', '#86EFAC', '#A3A3A3', '#166534', '#FFFFFF'];
    const layer = document.createElement('div');
    layer.className = 'confetti-layer';
    document.body.appendChild(layer);
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.style.background = colors[i % colors.length];
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      if (i % 3 === 0) p.style.borderRadius = '50%';
      layer.appendChild(p);
      const angle = gsap.utils.random(-Math.PI * 0.95, -Math.PI * 0.05);
      const dist = gsap.utils.random(120, 340);
      gsap.timeline()
        .to(p, { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, rotation: gsap.utils.random(-400, 400), duration: gsap.utils.random(0.5, 0.8), ease: 'power3.out' })
        .to(p, { y: `+=${gsap.utils.random(260, 480)}`, x: `+=${gsap.utils.random(-60, 60)}`, rotation: '+=220', opacity: 0, duration: gsap.utils.random(1.1, 1.7), ease: 'power1.in' });
    }
    gsap.delayedCall(2.8, () => layer.remove());
  }

  function visible(el) { return !!el && el.offsetParent !== null && el.getClientRects().length > 0; }

  function cartTarget() {
    const panel = $('#cartPanelHead');
    if (visible(panel)) return panel;
    return $('#cartBtn');
  }

  function flyToCart(fromEl) {
    const target = cartTarget();
    if (!fromEl || !target || REDUCED) { bump($('#cartBadge')); return; }
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'fly';
    const src = fromEl.querySelector('img');
    ghost.innerHTML = src ? `<img src="${src.getAttribute('src')}" alt="">` : fromEl.innerHTML;
    ghost.style.left = `${a.left + a.width / 2}px`;
    ghost.style.top = `${a.top + a.height / 2}px`;
    document.body.appendChild(ghost);
    gsap.set(ghost, { xPercent: -50, yPercent: -50 });
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    gsap.timeline({ onComplete: () => { ghost.remove(); bump(target, 1.06); bump($('#cartBadge')); } })
      .to(ghost, { x: dx, duration: 0.75, ease: 'power1.inOut' }, 0)
      .to(ghost, { y: dy, duration: 0.75, ease: dy > 0 ? 'back.in(2.2)' : 'power2.in' }, 0)
      .to(ghost, { scale: 0.35, rotation: 25, duration: 0.75, ease: 'power1.in' }, 0)
      .to(ghost, { opacity: 0, duration: 0.15 }, 0.62);
  }

  /* ---------- modal ---------- */
  const modal = $('#modal');
  let modalCloseCb = null;
  function openModal(html, onMount, onClose) {
    modal.innerHTML = `<div class="modal-inner">${html}</div>`;
    modalCloseCb = onClose || null;
    modal.showModal();
    gsap.fromTo(modal, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' });
    if (onMount) onMount(modal);
  }
  function closeModal(result) {
    if (!modal.open) return;
    const cb = modalCloseCb; modalCloseCb = null;
    gsap.to(modal, {
      opacity: 0, y: 16, scale: 0.98, duration: 0.2, ease: 'power1.in',
      onComplete: () => { modal.close(); modal.innerHTML = ''; if (cb) cb(result); },
    });
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-close]')) closeModal(false);
  });
  modal.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(false); });

  function confirmModal({ title, text, ok = 'Confirm', danger = false }) {
    return new Promise((resolve) => {
      openModal(`
        <div class="modal-head"><h2 id="modalTitle">${esc(title)}</h2></div>
        <p class="muted">${esc(text)}</p>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-close>Cancel</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirmOk">${esc(ok)}</button>
        </div>`, (m) => {
        $('#confirmOk', m).addEventListener('click', () => closeModal(true));
        $('#confirmOk', m).focus();
      }, resolve);
    });
  }

  /* ---------- cart state changes ---------- */
  let hooks = {};
  function setQty(id, qty) {
    store.set((s) => {
      if (qty <= 0) delete s.cart[id];
      else s.cart[id] = Math.min(qty, 99);
    });
    updateBadge();
    if (hooks.onCart) hooks.onCart(id);
  }

  /* Send a change to the MongoDB server. On failure: say why, then reload the real data. */
  function save(method, path, body) {
    if (store.mode() !== 'server') return Promise.resolve(null);
    return store.api(method, path, body).catch(async (err) => {
      toast(err.message, 'error');
      try { await store.refresh(); } catch (e) { /* offline */ }
      if (hooks.onRemote) hooks.onRemote(); else rerender();
      return null;
    });
  }

  let lastBadge = null;
  function updateBadge() {
    const n = cartCount();
    const badge = $('#cartBadge');
    badge.textContent = n;
    badge.classList.toggle('is-empty', n === 0);
    $('#cartBtn').setAttribute('aria-label', `Cart, ${n} item${n === 1 ? '' : 's'}`);
    if (lastBadge !== null && n !== lastBadge) bump(badge);
    if (lastBadge !== null && n > lastBadge && typeof logoCheer === 'function') logoCheer();
    lastBadge = n;
  }

  const stepperHTML = (id, qty, name, light = false) => `
    <div class="stepper ${light ? 'light' : ''}">
      <button type="button" data-act="dec" aria-label="Remove one ${esc(name)}">−</button>
      <output aria-live="polite">${qty}</output>
      <button type="button" data-act="inc" aria-label="Add one more ${esc(name)}">+</button>
    </div>`;

  /* =========================================================
     ROUTER
     ========================================================= */
  const routes = [
    { re: /^\/$/, view: viewHome, nav: 'home', title: 'Your kirana, online' },
    { re: /^\/shop$/, view: viewShop, nav: 'shop', title: 'Shop' },
    { re: /^\/cart$/, view: viewCart, nav: 'cart', title: 'Cart & checkout' },
    { re: /^\/track\/(\d+)$/, view: viewTrack, nav: 'my-orders', title: 'Track order' },
    { re: /^\/my-orders$/, view: viewMyOrders, nav: 'my-orders', title: 'My orders' },
    { re: /^\/orders$/, view: viewBoard, nav: 'admin', title: 'Orders board' },
    { re: /^\/products$/, view: viewProducts, nav: 'admin', title: 'Products' },
    { re: /^\/settings$/, view: viewSettings, nav: 'admin', title: 'Shop settings' },
    { re: /^\/delivery$/, view: viewDelivery, nav: 'delivery', title: 'Delivery' },
  ];
  const notFound = { view: viewNotFound, nav: '', title: 'Page not found' };

  const view = $('#view');
  let current = null;
  let navToken = 0;
  let cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);

  function teardown() {
    cleanups.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
    cleanups = [];
    ScrollTrigger.getAll().forEach((t) => t.kill());
    hooks = {};
  }

  function parseHash() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, qs = ''] = raw.split('?');
    return { path: path || '/', query: new URLSearchParams(qs) };
  }

  async function router() {
    const token = ++navToken;
    const { path, query } = parseHash();
    let route = notFound;
    let params = [];
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) { route = r; params = m.slice(1); break; }
    }
    if (modal.open) { modal.close(); modal.innerHTML = ''; }
    if (current) {
      // don't let navigation hang if animation frames are paused (e.g. a background tab)
      await Promise.race([
        gsap.to(view, { opacity: 0, duration: 0.18, ease: 'power1.in' }),
        new Promise((r) => setTimeout(r, 250)),
      ]);
      if (token !== navToken) return;
    }
    teardown();
    current = { route, params, query };
    view.innerHTML = '';
    window.scrollTo(0, 0);
    route.view(view, { params, query, quiet: false });
    document.title = `${route.title} · DukaanLite`;
    setActiveNav(route.nav);
    closeMenu();
    gsap.fromTo(view, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out' });
    const page = view.firstElementChild;
    if (page && route.nav !== 'home') gsap.from(page, { y: 18, duration: 0.5, ease: 'power3.out', clearProps: 'transform' });
    ScrollTrigger.refresh();
  }

  function rerender() {
    if (!current) return;
    const y = window.scrollY;
    teardown();
    view.innerHTML = '';
    current.route.view(view, { params: current.params, query: current.query, quiet: true });
    window.scrollTo(0, y);
  }

  function setActiveNav(key) {
    $$('#navLinks a').forEach((a) => {
      const on = a.dataset.nav === key;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- nav chrome ---------- */
  const menuBtn = $('#menuBtn');
  const navLinks = $('#navLinks');
  function closeMenu() {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  menuBtn.addEventListener('click', () => {
    const open = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) gsap.from($$('a', navLinks), { y: -12, opacity: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out' });
  });
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =========================================================
     ANIMATED LOGO — a little kirana shop front:
     striped awning on top, a "D"-shaped door that swings open,
     a green handle that shows whether the shop is open.
     ========================================================= */
  const logos = [];
  const logoSVG = (uid) => `
    <svg class="logo-svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="logoGlow${uid}" cx="30%" cy="45%" r="75%">
          <stop offset="0" stop-color="#86EFAC"/><stop offset=".55" stop-color="#22C55E"/><stop offset="1" stop-color="#15803D"/>
        </radialGradient>
        <clipPath id="logoClip${uid}"><rect width="48" height="48" rx="13"/></clipPath>
      </defs>
      <g clip-path="url(#logoClip${uid})">
        <rect class="logo-tile" width="48" height="48" rx="13"/>
        <rect class="logo-shine" x="-30" y="-10" width="14" height="70"/>
        <path class="logo-inside" d="M15 23h8a9 8.5 0 0 1 0 17h-8Z" fill="url(#logoGlow${uid})"/>
        <g class="logo-door">
          <path class="logo-door-face" d="M15 23h8a9 8.5 0 0 1 0 17h-8Z"/>
          <circle class="logo-knob" cx="26.5" cy="31.5" r="1.8"/>
        </g>
        <g class="logo-awning">
          ${[0, 1, 2, 3].map((i) => `<path class="logo-stripe ${i % 2 ? 'alt' : ''}" d="M${6 + i * 9} 8h9v7a4.5 4.5 0 0 1-9 0Z"/>`).join('')}
        </g>
        <g class="logo-sparks">
          <circle cx="39" cy="24" r="1.5"/><circle cx="41.5" cy="30" r="1"/><circle cx="37" cy="36" r="1.2"/>
        </g>
      </g>
    </svg>`;

  function splitLetters(el) {
    const wrap = (t) => [...t].map((c) => `<span class="ltr">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
    el.innerHTML = [...el.childNodes].map((n) => (n.nodeType === 3 ? wrap(n.textContent) : `<b>${wrap(n.textContent)}</b>`)).join('');
  }

  function initLogos() {
    $$('.brand').forEach((brand, i) => {
      const mark = $('.brand-mark', brand);
      const name = $('.brand-name', brand);
      if (!mark || !name) return;
      if (!brand.getAttribute('aria-label')) brand.setAttribute('aria-label', 'DukaanLite home');
      mark.innerHTML = logoSVG(i);
      mark.classList.add('is-svg');
      splitLetters(name);

      const q = (sel) => mark.querySelectorAll(sel);
      const stripes = q('.logo-stripe');
      const door = q('.logo-door')[0];
      const inside = q('.logo-inside')[0];
      const sparks = q('.logo-sparks circle');
      const shine = q('.logo-shine')[0];
      const letters = $$('.ltr', name);
      gsap.set(sparks, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(stripes, { svgOrigin: '24 8' });
      gsap.set(door, { svgOrigin: '15 31.5' });
      gsap.set(shine, { rotation: 25, svgOrigin: '0 0', opacity: 0 });

      // hover: awning lifts, door swings open to a green glow, sparks pop, light sweeps across
      const open = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .to(stripes, { y: -2.5, scaleY: 1.12, duration: 0.35, stagger: 0.05 }, 0)
        .to(door, { scaleX: 0.16, skewY: -10, duration: 0.5, ease: 'power3.inOut' }, 0)
        .fromTo(inside, { opacity: 0.6 }, { opacity: 1, duration: 0.4 }, 0)
        .to(sparks, { scale: 1, x: (k) => [3, 4, 3][k], y: (k) => [-3, 0, 3][k], duration: 0.4, stagger: 0.06, ease: 'back.out(3)' }, 0.15);

      const sweep = () => gsap.fromTo(shine, { x: 0, opacity: 1 }, { x: 100, duration: 0.8, ease: 'power2.inOut', onComplete: () => gsap.set(shine, { opacity: 0 }) });
      const wave = () => gsap.fromTo(letters, { y: 0 }, {
        keyframes: { y: [0, -5, 0] }, duration: 0.5, stagger: 0.035, ease: 'sine.inOut', overwrite: true,
      });

      // 3D tilt that follows the pointer
      const rx = gsap.quickTo(mark, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const ry = gsap.quickTo(mark, 'rotationY', { duration: 0.5, ease: 'power3.out' });

      const logo = { brand, mark, stripes, door, sparks, letters, open, hovered: false, sweep, wave };
      logos.push(logo);
      if (REDUCED) return;

      brand.addEventListener('mouseenter', () => { logo.hovered = true; open.play(); sweep(); wave(); });
      brand.addEventListener('mouseleave', () => { logo.hovered = false; open.reverse(); rx(0); ry(0); });
      brand.addEventListener('mousemove', (e) => {
        const r = mark.getBoundingClientRect();
        const px = (e.clientX - (r.left + r.width / 2)) / 60;
        const py = (e.clientY - (r.top + r.height / 2)) / 60;
        ry(gsap.utils.clamp(-1, 1, px) * 22);
        rx(gsap.utils.clamp(-1, 1, -py) * 22);
      });
      // click / tap: squash & stretch + a quick "welcome" door swing
      brand.addEventListener('pointerdown', () => {
        gsap.timeline()
          .to(mark, { scaleX: 1.18, scaleY: 0.82, duration: 0.1, ease: 'power2.out' })
          .to(mark, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.35)' });
        if (!logo.hovered) logoCheer(logo);
      });
    });
  }

  // little celebration: door pops open and shut, sparks fly (used when something goes in the cart)
  function logoCheer(only) {
    if (REDUCED) return;
    (only ? [only] : logos.slice(0, 1)).forEach((l) => {
      if (l.hovered) { l.sweep(); return; }
      gsap.timeline()
        .add(() => l.open.play(0))
        .add(() => l.open.reverse(), 0.6);
      l.wave();
      l.sweep();
    });
  }

  // a gentle awning flutter now and then, so the header feels alive
  function idleFlutter() {
    if (REDUCED) return;
    const l = logos[0];
    if (l && !l.hovered && document.visibilityState === 'visible' && window.scrollY < 400) {
      gsap.fromTo(l.stripes, { scaleY: 1 }, { keyframes: { scaleY: [1, 1.18, 0.94, 1] }, duration: 0.9, stagger: 0.07, ease: 'sine.inOut' });
    }
    gsap.delayedCall(gsap.utils.random(7, 11), idleFlutter);
  }

  // handle colour + tooltip reflect the shop's real opening hours
  function updateLogoStatus() {
    const st = shopStatus();
    logos.forEach((l) => {
      l.mark.classList.toggle('is-closed', !st.open);
      l.brand.title = `${S().settings.shopName} · ${st.open ? 'Open now' : 'Closed now'}`;
    });
  }

  function logoIntro() {
    const l = logos[0];
    if (!l || REDUCED) return;
    gsap.timeline({ defaults: { ease: 'back.out(1.8)' } })
      .from(l.mark, { scale: 0, rotation: -120, duration: 0.8 })
      .from(l.stripes, { y: -16, opacity: 0, duration: 0.5, stagger: 0.07 }, 0.25)
      .from(l.door, { y: 12, opacity: 0, duration: 0.5 }, 0.45)
      .from(l.letters, { yPercent: 110, opacity: 0, duration: 0.5, stagger: 0.035, ease: 'power3.out' }, 0.3)
      .add(() => l.sweep(), 0.9);
  }

  initLogos();

  // Live updates from other tabs (e.g. shop in one tab, orders board in another)
  store.onRemote(() => {
    updateBadge();
    if (hooks.onRemote) hooks.onRemote();
  });

  /* =========================================================
     HOME
     ========================================================= */
  function viewHome(root, ctx) {
    const s = S();
    const personas = [
      { e: 'cart', n: 'Sunita', r: 'Customer', need: 'Wants to see prices and stock, shop without calling, and send a clear order.', res: 'Search, category sidebar, product grid and a cart total that is always visible.', href: '#/shop', cta: 'Shop as Sunita' },
      { e: 'store', n: 'Mr. Gupta', r: 'Shopkeeper', need: 'Needs quick product updates, order visibility and simple status controls.', res: 'An orders board with one column per status and an easy product form.', href: '#/orders', cta: 'Open the orders board' },
      { e: 'bike', n: 'Raju', r: 'Delivery staff', need: 'Needs only assigned orders, a packing checklist, the address and a done button.', res: 'A focused single-column view with large checklist rows.', href: '#/delivery', cta: 'Open Raju’s view' },
    ];
    const steps = [
      { e: 'search', t: 'Browse & search', d: 'Categories, live stock labels, and search in Hindi or English. Try “doodh” or “chai”.' },
      { e: 'cart', t: 'Build the cart', d: 'The total stays in view and the minimum order is checked as you add.' },
      { e: 'chat', t: 'Order on WhatsApp', d: 'One tap opens WhatsApp with a neat, numbered order ready to send.' },
      { e: 'list', t: 'Pack & deliver', d: 'The shop moves it New → Packed → Out → Delivered. Raju ticks a checklist.' },
    ];
    const features = [
      { e: 'stock', t: 'Live stock labels', d: 'In stock or out of stock, in green and red. No more calling to ask.' },
      { e: 'panel', t: 'Total always visible', d: 'On laptops the cart stays fixed on the right. On phones it sits at the bottom.' },
      { e: 'alert', t: 'Errors in plain words', d: '“Phone must be 10 digits”, not “Invalid input”. Big, 48 px tap targets.' },
      { e: 'board', t: 'One-click status board', d: 'Every order at a glance. Move it forward with one click and assign a rider.' },
      { e: 'list', t: 'Packing checklist', d: 'Delivery can’t start until every item is ticked. Fewer missing items.' },
      { e: 'lock', t: 'No accounts, no backend', d: 'Everything lives in this browser. Nothing to install, nothing to sign up for.' },
    ];
    const chips = s.products.filter((p) => p.img).slice(0, 16).map((p) => `<span class="marquee-chip">${pimg(p)} ${esc(p.name)} <b>${rupee(p.price)}</b></span>`).join('');
    const P = (id) => s.products.find((p) => p.id === id) || DL.seedProducts.find((p) => p.id === id);

    root.innerHTML = `
    <div class="page home">
      <section class="hero container">
        <div class="hero-copy">
          <p class="eyebrow hero-eyebrow"><span class="live-dot"></span> Kirana catalog · WhatsApp ordering</p>
          <h1 class="hero-title">
            <span class="ln"><span>Your kirana,</span></span>
            <span class="ln"><span>online in minutes.</span></span>
            <span class="ln"><span>Orders on <em>WhatsApp.</em></span></span>
          </h1>
          <p class="lead hero-lead">Customers browse real prices and stock, build a cart and send a clear order on WhatsApp in under 30 seconds. The shop tracks it from <b>New</b> to <b>Delivered</b>.</p>
          <div class="cta-row hero-cta">
            <a class="btn btn-primary btn-lg magnetic" href="#/shop">Open the demo shop →</a>
            <a class="btn btn-ghost btn-lg" href="#/orders">Shopkeeper view</a>
          </div>
          <ul class="proof hero-proof">
            <li><b><span data-count="30">0</span> sec</b><span>to place an order</span></li>
            <li><b>₹<span data-count="0">0</span></b><span>commission or app fee</span></li>
            <li><b><span data-count="${s.products.length}">0</span></b><span>products in the demo</span></li>
          </ul>
        </div>
        <div class="hero-visual" aria-hidden="true">
          ${['p11', 'p18', 'p9', 'p19', 'p2', 'p23'].map((id, i) => `<span class="floaty f${i + 1}">${pimg(P(id))}</span>`).join('')}
          <div class="mock">
            <div class="mock-bar"><i></i><i></i><i></i><span class="mock-url">dukaanlite.app/shop</span></div>
            <div class="mock-body">
              <div class="mock-store"><b>${esc(s.settings.shopName)}</b><span class="pill pill-ok">● Open now</span></div>
              <div class="mock-search">${icon('search')} Search atta, milk, snacks...</div>
              <div class="mock-chips"><span class="on">All</span><span>Staples</span><span>Dairy</span><span>Snacks</span></div>
              <div class="mock-grid">
                ${[['p1', 'Atta', 265], ['p9', 'Butter', 58], ['p15', 'Good Day', 31]].map(([id, n, p]) => `
                  <div class="mock-tile"><div class="mt-img">${pimg(P(id))}</div><b>${n}</b><span class="mt-price">${rupee(p)}</span><small class="in">In stock</small><span class="mt-add">Add</span></div>`).join('')}
              </div>
              <div class="mock-cart">
                <div><b>Your cart</b><span class="mc-sum"><span class="mc-count">0</span> items • <span class="mc-total">₹0</span></span></div>
                <span class="mock-wa">ORDER ON WHATSAPP ↗</span>
              </div>
            </div>
            <svg class="mock-cursor" viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6-3.6 6.9z" fill="#1C1917" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </div>
          <div class="wa-bubble">
            <div class="wa-head">${esc(s.settings.shopName)}</div>
            <p><b>New order #1026</b><br>1. Aashirvaad Atta × 1<br>2. Amul Butter × 2<br>3. Good Day × 1<br><b>Total: ₹412</b></p>
            <span class="wa-ticks">7:05 pm ✓✓</span>
          </div>
        </div>
      </section>

      <section class="marquee" aria-hidden="true"><div class="marquee-track">${chips}${chips}</div></section>

      <section class="section container">
        <div class="sec-head">
          <p class="eyebrow">Who it’s for</p>
          <h2>One promise, three users</h2>
          <p class="lead">A customer builds an order and sends it on WhatsApp in under 30 seconds; the shop tracks it to Delivered.</p>
        </div>
        <div class="personas">
          ${personas.map((p) => `
            <article class="persona">
              <div class="persona-ico">${icon(p.e)}</div>
              <h3>${p.n}</h3>
              <p class="role">${p.r}</p>
              <p>${p.need}</p>
              <div class="response"><b>How DukaanLite helps</b>${p.res}</div>
              <a class="btn btn-ghost" href="${p.href}">${p.cta} →</a>
            </article>`).join('')}
        </div>
      </section>

      <section class="section how-sec">
        <div class="container">
          <div class="sec-head">
            <p class="eyebrow">How it works</p>
            <h2>From shelf to doorstep in four steps</h2>
          </div>
          <div class="steps">
            <div class="steps-line"><div class="steps-fill"></div></div>
            ${steps.map((st, i) => `
              <div class="step">
                <div class="step-dot">${icon(st.e)}</div>
                <span class="step-num">STEP ${i + 1}</span>
                <h3>${st.t}</h3>
                <p>${st.d}</p>
              </div>`).join('')}
          </div>
        </div>
      </section>

      <section class="section container">
        <div class="sec-head">
          <p class="eyebrow">Built for the counter</p>
          <h2>Small details that make it work</h2>
        </div>
        <div class="features">
          ${features.map((f) => `<div class="feature"><div class="f-ico">${icon(f.e)}</div><h3>${f.t}</h3><p>${f.d}</p></div>`).join('')}
        </div>
      </section>

      <section class="cta-band container">
        <div class="cta-inner">
          <h2>See the whole flow in two minutes</h2>
          <p>Open the shop in one tab and the orders board in another. Place an order and watch it land on the board live.</p>
          <div class="cta-row">
            <a class="btn btn-wa btn-lg" href="#/shop">Start shopping ↗</a>
            <a class="btn btn-light btn-lg" href="#/delivery">Delivery view</a>
          </div>
        </div>
      </section>
    </div>`;

    /* --- hero intro --- */
    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    intro
      .from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.6 })
      .from('.hero-title .ln > span', { yPercent: 115, rotation: 3, duration: 1.1, stagger: 0.12 }, '-=0.35')
      .fromTo('.hero-title em', { '--u': 0 }, { '--u': 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.4')
      .from('.hero-lead', { y: 24, opacity: 0, duration: 0.8 }, '-=0.8')
      .from('.hero-cta > *', { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.6')
      .from('.hero-proof li', { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.5')
      .from('.mock', { y: 80, opacity: 0, rotationX: 18, rotationY: -14, duration: 1.4, ease: 'expo.out' }, 0.15)
      .from('.floaty', { scale: 0, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'back.out(2.2)' }, 0.6);
    $$('[data-count]', root).forEach((el) => {
      const o = { v: 0 };
      intro.to(o, { v: Number(el.dataset.count), duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }, 0.9);
    });
    onCleanup(() => intro.kill());

    /* --- floating groceries --- */
    if (!REDUCED) {
      $$('.floaty', root).forEach((f) => {
        const t = gsap.to(f, {
          y: 'random(-20, 20)', x: 'random(-12, 12)', rotation: 'random(-14, 14)',
          duration: 'random(2.4, 4)', repeat: -1, yoyo: true, repeatRefresh: true, ease: 'sine.inOut', delay: 1.4,
        });
        onCleanup(() => t.kill());
      });
    }

    /* --- mouse parallax on the mockup --- */
    const visual = $('.hero-visual', root);
    const mock = $('.mock', root);
    if (!REDUCED && window.matchMedia('(hover: hover)').matches) {
      const rx = gsap.quickTo(mock, 'rotationX', { duration: 0.8, ease: 'power3.out' });
      const ry = gsap.quickTo(mock, 'rotationY', { duration: 0.8, ease: 'power3.out' });
      const fl = $$('.floaty', root).map((f, i) => ({
        x: gsap.quickTo(f, 'xPercent', { duration: 1, ease: 'power3.out' }),
        y: gsap.quickTo(f, 'yPercent', { duration: 1, ease: 'power3.out' }),
        k: (i % 3 + 1) * 18,
      }));
      const onMove = (e) => {
        const r = visual.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(-py * 8); ry(px * 10);
        fl.forEach((f) => { f.x(px * f.k); f.y(py * f.k); });
      };
      const onLeave = () => { rx(0); ry(0); fl.forEach((f) => { f.x(0); f.y(0); }); };
      const hero = $('.hero', root);
      hero.addEventListener('mousemove', onMove);
      hero.addEventListener('mouseleave', onLeave);
      onCleanup(() => { hero.removeEventListener('mousemove', onMove); hero.removeEventListener('mouseleave', onLeave); });

      // magnetic CTA
      $$('.magnetic', root).forEach((btn) => {
        const mx = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
        const my = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          mx((e.clientX - r.left - r.width / 2) * 0.25);
          my((e.clientY - r.top - r.height / 2) * 0.35);
        });
        btn.addEventListener('mouseleave', () => { mx(0); my(0); });
      });
    }

    /* --- self-playing shop demo inside the mockup --- */
    let demo = null;
    const buildDemo = () => {
      if (demo) { demo.kill(); demo = null; }
      if (!mock.isConnected) return;
      demo = heroDemo(root, mock);
    };
    const startDemo = gsap.delayedCall(1.5, buildDemo);
    const onResize = debounce(buildDemo, 250);
    window.addEventListener('resize', onResize);
    onCleanup(() => { startDemo.kill(); if (demo) demo.kill(); window.removeEventListener('resize', onResize); });

    /* --- marquee that reacts to scroll direction & speed --- */
    const track = $('.marquee-track', root);
    const mq = gsap.to(track, { xPercent: -50, duration: 45, ease: 'none', repeat: -1 });
    onCleanup(() => mq.kill());
    if (!REDUCED) {
      ScrollTrigger.create({
        trigger: '.marquee',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(1, 6, Math.abs(self.getVelocity()) / 250);
          gsap.to(mq, {
            timeScale: self.direction * boost, duration: 0.25, overwrite: true,
            onComplete: () => gsap.to(mq, { timeScale: self.direction, duration: 1, overwrite: true }),
          });
        },
      });
    }

    /* --- scroll reveals --- */
    $$('.sec-head', root).forEach((h) => {
      gsap.from(h.children, {
        y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: h, start: 'top 82%' },
      });
    });
    gsap.from('.persona', {
      y: 90, opacity: 0, rotation: (i) => [-4, 0, 4][i % 3], duration: 1.1, stagger: 0.14, ease: 'power3.out',
      scrollTrigger: { trigger: '.personas', start: 'top 82%' },
    });
    gsap.fromTo('.steps-fill', { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 72%', end: 'bottom 55%', scrub: 0.6 },
    });
    $$('.step', root).forEach((step, i) => {
      gsap.from(step, {
        y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.08,
        scrollTrigger: { trigger: '.steps', start: 'top 80%' },
      });
      ScrollTrigger.create({ trigger: step, start: 'top 68%', toggleClass: { targets: step, className: 'active' } });
    });
    ScrollTrigger.batch('.feature', {
      start: 'top 88%',
      onEnter: (els) => gsap.fromTo(els, { y: 50, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', overwrite: true }),
    });
    gsap.set('.feature', { opacity: 0 });
    gsap.from('.cta-inner', {
      scale: 0.9, opacity: 0, borderRadius: 80, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-inner', start: 'top 85%' },
    });
    gsap.to('.hero-visual', {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  function heroDemo(root, mock) {
    const cursor = $('.mock-cursor', mock);
    const adds = $$('.mt-add', mock);
    const wa = $('.mock-wa', mock);
    const cartBox = $('.mock-cart', mock);
    const bubble = $('.wa-bubble', root);
    const countEl = $('.mc-count', mock);
    const totalEl = $('.mc-total', mock);
    const pos = (el) => {
      let x = 0; let y = 0; let n = el;
      while (n && n !== mock) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x: x + el.offsetWidth * 0.55, y: y + el.offsetHeight * 0.55 };
    };
    const cart = { n: 0, t: 0 };
    const paint = () => { countEl.textContent = Math.round(cart.n); totalEl.textContent = rupee(cart.t); };
    const reset = () => {
      cart.n = 0; cart.t = 0; paint();
      adds.forEach((a) => { a.classList.remove('on'); a.textContent = 'Add'; });
    };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
    tl.call(reset)
      .set(cursor, { x: mock.offsetWidth * 0.82, y: mock.offsetHeight * 0.9, opacity: 0, scale: 1 })
      .set(bubble, { opacity: 0, y: 30, scale: 0.85 })
      .to(cursor, { opacity: 1, duration: 0.3 });
    let n = 0; let t = 0;
    [[0, 265], [1, 58], [1, 58], [2, 31]].forEach(([i, price]) => {
      const p = pos(adds[i]);
      n += 1; t += price;
      const target = { n, t };
      tl.to(cursor, { x: p.x, y: p.y, duration: 0.65, ease: 'power2.inOut' })
        .to(cursor, { scale: 0.78, duration: 0.09, yoyo: true, repeat: 1 })
        .to(adds[i], { scale: 0.9, duration: 0.09, yoyo: true, repeat: 1 }, '<')
        .call(() => { adds[i].classList.add('on'); adds[i].textContent = '✓ Added'; })
        .to(cart, { ...target, duration: 0.45, ease: 'power2.out', onUpdate: paint }, '<')
        .fromTo(cartBox, { scale: 1 }, { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1 }, '<');
    });
    const w = pos(wa);
    tl.to(cursor, { x: w.x, y: w.y, duration: 0.7, ease: 'power2.inOut' }, '+=0.2')
      .to(cursor, { scale: 0.78, duration: 0.09, yoyo: true, repeat: 1 })
      .to(wa, { scale: 0.92, duration: 0.09, yoyo: true, repeat: 1 }, '<')
      .to(bubble, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, '+=0.1')
      .to(cursor, { opacity: 0, duration: 0.4 }, '<')
      .to({}, { duration: 2.4 })
      .to(bubble, { opacity: 0, y: -10, duration: 0.4 });
    return tl;
  }

  /* =========================================================
     SHOP
     ========================================================= */
  const shopUI = { cat: 'All', q: '', sort: 'popular' };

  function cardActionHTML(p, qty) {
    if (!p.inStock) return `<button class="btn btn-ghost" disabled>Out of stock</button>`;
    if (!qty) return `<button class="btn btn-add" data-act="add" aria-label="Add ${esc(p.name)} to cart">Add</button>`;
    return stepperHTML(p.id, qty, p.name);
  }

  function cardHTML(p) {
    const qty = S().cart[p.id] || 0;
    return `
      <article class="card ${p.inStock ? '' : 'oos'}" data-id="${p.id}" data-flip-id="p-${p.id}">
        <div class="card-img">${pimg(p)}</div>
        <h3>${esc(p.name)}</h3>
        <p class="unit">${esc(p.unit)}</p>
        <div class="card-foot">
          <span class="price">${rupee(p.price)}</span>
          <span class="stock ${p.inStock ? 'in' : 'out'}">${p.inStock ? 'In stock' : 'Out of stock'}</span>
        </div>
        <div class="card-action">${cardActionHTML(p, qty)}</div>
      </article>`;
  }

  function minNoteHTML(total) {
    const min = S().settings.minOrder;
    if (total >= min) return `<p class="min-note ok">Minimum order ${rupee(min)} ✓</p>`;
    const pct = Math.max(0, Math.min(1, total / min));
    return `<p class="min-note no">Add ${rupee(min - total)} more to reach the ${rupee(min)} minimum<span class="min-bar"><i style="transform:scaleX(${pct})"></i></span></p>`;
  }

  function cartPanelHTML() {
    const lines = buyable();
    const count = cartCount();
    const head = `<div class="cp-head" id="cartPanelHead"><h2>Your cart</h2><span class="muted">${count} item${count === 1 ? '' : 's'}</span></div>`;
    if (!lines.length) {
      return `${head}<div class="cp-empty"><div class="empty-ico">${icon('cart')}</div><p><b>Your cart is empty</b></p><p class="muted small">Tap <b>Add</b> on any product to start.</p></div>`;
    }
    return `${head}
      <ul class="cp-lines">${lines.map((l) => `
        <li>${pimg(l.p, 'xs')}<div><b>${esc(l.p.name)}</b><small>${l.qty} × ${rupee(l.p.price)}</small></div><span>${rupee(l.qty * l.p.price)}</span></li>`).join('')}
      </ul>
      <div class="cp-total"><span>Total</span><b id="cpTotal">${rupee(cartTotal())}</b></div>
      ${minNoteHTML(cartTotal())}
      <a href="#/cart" class="btn btn-wa btn-block">ORDER ON WHATSAPP ↗</a>`;
  }

  function cartBarHTML() {
    const n = cartCount();
    return `<div><b>${n} item${n === 1 ? '' : 's'} · ${rupee(cartTotal())}</b><small>${cartTotal() >= S().settings.minOrder ? 'Ready to order' : `Min. order ${rupee(S().settings.minOrder)}`}</small></div>
      <a href="#/cart" class="btn btn-wa">View cart →</a>`;
  }

  function matches(p) {
    const catOk = shopUI.cat === 'All' || p.cat === shopUI.cat;
    const q = shopUI.q.trim().toLowerCase();
    if (!q) return catOk;
    const hay = `${p.name} ${p.unit} ${p.cat} ${p.tags || ''}`.toLowerCase();
    return catOk && q.split(/\s+/).every((w) => hay.includes(w));
  }

  function sorted(list) {
    const by = {
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      az: (a, b) => a.name.localeCompare(b.name),
    }[shopUI.sort];
    const withIdx = list.map((p, i) => ({ p, i }));
    withIdx.sort((a, b) => {
      if (a.p.inStock !== b.p.inStock) return a.p.inStock ? -1 : 1; // out of stock last
      return by ? by(a.p, b.p) : a.i - b.i;
    });
    return withIdx.map((x) => x.p);
  }

  function viewShop(root, ctx) {
    const s = S();
    const st = shopStatus();
    const cats = ['All', ...DL.categories];
    const count = (c) => s.products.filter((p) => c === 'All' || p.cat === c).length;
    const catThumb = (c) => {
      if (c === 'All') return `<span class="cat-thumb">${icon('grid')}</span>`;
      const p = s.products.find((x) => x.cat === c && x.img);
      return `<span class="cat-thumb">${p ? pimg(p) : icon('tag')}</span>`;
    };
    if (!cats.includes(shopUI.cat)) shopUI.cat = 'All';

    root.innerHTML = `
      <div class="page shop container">
        <section class="store-head">
          <div class="store-id">
            <div class="store-logo" aria-hidden="true">${icon('store')}</div>
            <div>
              <h1>${esc(s.settings.shopName)}</h1>
              <p class="muted"><span class="pill ${st.open ? 'pill-ok' : 'pill-bad'}">● ${st.label}</span> <span>Open ${fmtHour(s.settings.openHour)} to ${fmtHour(s.settings.closeHour)} · ${esc(s.settings.area)}</span></p>
            </div>
          </div>
          <label class="search">
            ${icon('search')}
            <input id="q" type="search" placeholder="Search atta, milk, snacks..." value="${esc(shopUI.q)}" autocomplete="off" aria-label="Search products">
            <kbd aria-hidden="true">/</kbd>
          </label>
        </section>
        ${st.open ? '' : `<p class="notice">The shop is closed right now. You can still send your order and it will be confirmed after ${fmtHour(s.settings.openHour)}.</p>`}
        <div class="shop-layout">
          <nav class="cats" aria-label="Categories">
            <p class="cats-title">Categories</p>
            <div class="cats-list">
              ${cats.map((c) => `<button class="cat ${c === shopUI.cat ? 'active' : ''}" data-cat="${esc(c)}" aria-pressed="${c === shopUI.cat}">
                ${c === shopUI.cat ? '<span class="cat-indicator"></span>' : ''}<span class="cat-label">${catThumb(c)} ${esc(c)}</span><small>${count(c)}</small></button>`).join('')}
            </div>
          </nav>
          <section class="catalog" aria-label="Products">
            <div class="catalog-meta">
              <p id="resultCount" class="muted" aria-live="polite"></p>
              <label class="sort">Sort
                <select id="sort" class="select">
                  <option value="popular">Popular</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                  <option value="az">Name A–Z</option>
                </select>
              </label>
            </div>
            <div class="grid" id="grid">${s.products.map(cardHTML).join('')}</div>
            <div class="empty" id="emptyGrid" hidden>
              <div class="empty-ico">${icon('search')}</div>
              <p><b>No products match your search.</b></p>
              <p class="muted">Try another word, like “doodh”, “chai” or “biscuit”.</p>
              <button class="btn btn-ghost" id="clearSearch">Clear search</button>
            </div>
          </section>
          <aside class="cart-panel" id="cartPanel" aria-label="Your cart">${cartPanelHTML()}</aside>
        </div>
      </div>
      <div class="cart-bar" id="cartBar">${cartBarHTML()}</div>`;

    const grid = $('#grid', root);
    const cartBar = $('#cartBar', root);
    $('#sort', root).value = shopUI.sort;
    $('#cpTotal', root)?.setAttribute('data-val', cartTotal());
    applyFilter(false);
    gsap.set(cartBar, { yPercent: cartCount() ? 0 : 160 });

    if (!ctx.quiet) {
      gsap.from('.store-head > *', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' });
      gsap.from('.cat', { x: -20, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out', delay: 0.1 });
      gsap.from($$('.card', grid).filter((c) => c.style.display !== 'none').slice(0, 16), {
        y: 40, opacity: 0, scale: 0.94, duration: 0.6, stagger: { each: 0.035, grid: 'auto', from: 'start' }, ease: 'power3.out', delay: 0.15, clearProps: 'transform,opacity',
      });
      gsap.from('#cartPanel', { x: 40, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.25 });
    }

    /* categories with a Flip-animated active pill */
    $('.cats-list', root).addEventListener('click', (e) => {
      const btn = e.target.closest('.cat');
      if (!btn || btn.dataset.cat === shopUI.cat) return;
      const ind = $('.cat-indicator', root);
      const state = ind ? Flip.getState(ind) : null;
      $$('.cat', root).forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      if (ind) { btn.prepend(ind); Flip.from(state, { duration: 0.45, ease: 'power3.inOut' }); }
      shopUI.cat = btn.dataset.cat;
      btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
      applyFilter(true);
    });

    const q = $('#q', root);
    q.addEventListener('input', debounce(() => { shopUI.q = q.value; applyFilter(true); }, 160));
    $('#clearSearch', root).addEventListener('click', () => { q.value = ''; shopUI.q = ''; applyFilter(true); q.focus(); });
    $('#sort', root).addEventListener('change', (e) => { shopUI.sort = e.target.value; applyFilter(true); });

    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== q && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        e.preventDefault(); q.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    onCleanup(() => document.removeEventListener('keydown', onKey));

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const card = btn.closest('.card');
      const id = card.dataset.id;
      const qty = S().cart[id] || 0;
      const act = btn.dataset.act;
      if (act === 'add' || act === 'inc') {
        if (act === 'add') flyToCart($('.card-img', card));
        setQty(id, qty + 1);
      } else if (act === 'dec') {
        setQty(id, qty - 1);
      }
    });

    let lastCount = cartCount();
    hooks.onCart = (id) => {
      const card = id && grid.querySelector(`[data-id="${id}"]`);
      if (card) {
        const hadFocus = card.contains(document.activeElement);
        const focusedAct = hadFocus ? document.activeElement.dataset.act : null;
        const p = productById(id);
        const actionEl = $('.card-action', card);
        actionEl.innerHTML = cardActionHTML(p, S().cart[id] || 0);
        if (hadFocus) {
          const next = $(`[data-act="${focusedAct}"]`, actionEl) || $('[data-act="inc"]', actionEl) || $('[data-act="add"]', actionEl);
          next?.focus();
        }
        const out = $('output', actionEl);
        if (out) gsap.fromTo(out, { scale: 1.5 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
        if (focusedAct === 'add' || !hadFocus) gsap.fromTo(actionEl.firstElementChild, { scale: 0.92 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
      }
      const panel = $('#cartPanel', root);
      const prevTotal = Number($('#cpTotal', panel)?.dataset.val ?? 0);
      panel.innerHTML = cartPanelHTML();
      const totalEl = $('#cpTotal', panel);
      if (totalEl) { totalEl.dataset.val = prevTotal; animateNumber(totalEl, cartTotal()); }
      const bar = $('.min-bar i', panel);
      if (bar) gsap.from(bar, { scaleX: Math.max(0, (prevTotal) / S().settings.minOrder), duration: 0.5, ease: 'power2.out' });
      cartBar.innerHTML = cartBarHTML();
      const n = cartCount();
      if (n && !lastCount) gsap.to(cartBar, { yPercent: 0, duration: 0.5, ease: 'back.out(1.4)' });
      if (!n && lastCount) gsap.to(cartBar, { yPercent: 160, duration: 0.35, ease: 'power2.in' });
      if (n !== lastCount && n) bump(cartBar, 1.04);
      lastCount = n;
    };

    hooks.onRemote = () => rerender();
  }

  function applyFilter(animate) {
    const grid = $('#grid');
    if (!grid) return;
    const cards = $$('.card', grid);
    const state = animate && !REDUCED ? Flip.getState(cards) : null;
    sorted(S().products).forEach((p) => {
      const el = grid.querySelector(`[data-id="${p.id}"]`);
      if (el) grid.appendChild(el);
    });
    let shown = 0;
    cards.forEach((el) => {
      const p = productById(el.dataset.id);
      const ok = !!p && matches(p);
      el.style.display = ok ? '' : 'none';
      if (ok) shown += 1;
    });
    const where = shopUI.cat !== 'All' ? ` in ${shopUI.cat}` : '';
    const forQ = shopUI.q.trim() ? ` for “${shopUI.q.trim()}”` : '';
    $('#resultCount').textContent = `${shown} product${shown === 1 ? '' : 's'}${where}${forQ}`;
    const empty = $('#emptyGrid');
    const wasHidden = empty.hidden;
    empty.hidden = shown > 0;
    if (!empty.hidden && wasHidden) gsap.from(empty, { y: 20, opacity: 0, duration: 0.4, delay: 0.2 });
    if (state) {
      Flip.from(state, {
        duration: 0.55, ease: 'power2.inOut', absolute: true, stagger: 0.012, nested: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.45, stagger: 0.025, ease: 'back.out(1.5)' }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.3 }),
      });
    }
  }

  /* =========================================================
     CART & CHECKOUT
     ========================================================= */
  function viewCart(root, ctx) {
    const lines = cartLines();
    if (!lines.length) {
      root.innerHTML = `
        <div class="page container narrow">
          <a href="#/shop" class="back">← Back to shop</a>
          <div class="empty">
            <div class="empty-ico">${icon('cart')}</div>
            <h1>Your cart is empty</h1>
            <p class="muted">Add atta, milk, snacks and more from ${esc(S().settings.shopName)}.</p>
            <a class="btn btn-primary btn-lg" href="#/shop">Browse products →</a>
          </div>
        </div>`;
      if (!ctx.quiet) gsap.from('.empty-ico', { y: -30, rotation: -20, opacity: 0, duration: 0.8, ease: 'bounce.out' });
      hooks.onRemote = () => { if (cartLines().length) rerender(); };
      return;
    }
    const c = S().customer || {};
    const field = (id, label, input, hint = '') => `
      <div class="field" data-field="${id}">
        <label for="${id}">${label}</label>
        ${input}
        ${hint ? `<p class="hint">${hint}</p>` : ''}
        <p class="err" id="${id}-err" role="alert"></p>
      </div>`;

    root.innerHTML = `
      <div class="page container cart-page">
        <a href="#/shop" class="back">← Continue shopping</a>
        <h1>Cart &amp; checkout</h1>
        <div class="cart-grid">
          <section class="panel" aria-labelledby="itemsH">
            <h2 id="itemsH">Your items</h2>
            <ul class="lines" id="lines"></ul>
            <div class="summary" id="summary"></div>
          </section>
          <section class="panel" aria-labelledby="delH">
            <h2 id="delH">Delivery details</h2>
            <form id="checkout" novalidate>
              ${field('cName', 'Your name', `<input id="cName" name="name" autocomplete="name" value="${esc(c.name)}" aria-describedby="cName-err" required>`)}
              ${field('cPhone', 'Mobile number (10 digits)', `<div class="prefix-input"><span>+91</span><input id="cPhone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="14" value="${esc(c.phone)}" aria-describedby="cPhone-err" required></div>`, 'The shop will call this number if needed.')}
              ${field('cAddr', 'Delivery address', `<textarea id="cAddr" name="address" autocomplete="street-address" aria-describedby="cAddr-err" placeholder="House no., street, landmark" required>${esc(c.address)}</textarea>`)}
              ${field('cNote', 'Note for the shop (optional)', `<input id="cNote" name="note" maxlength="140" placeholder="e.g. Please send fresh bread">`)}
              <button class="btn btn-wa btn-block btn-lg" type="submit" id="placeBtn">ORDER ON WHATSAPP ↗</button>
              <p class="pay-note">${icon('cash')}<span>WhatsApp opens with your order typed out. Just press <b>Send</b>. Pay cash or UPI when it arrives.</span></p>
            </form>
          </section>
        </div>
      </div>`;

    const linesEl = $('#lines', root);
    const summaryEl = $('#summary', root);

    function renderLines() {
      const ls = cartLines();
      linesEl.innerHTML = ls.map((l) => `
        <li data-id="${l.p.id}">
          <span class="line-img">${pimg(l.p)}</span>
          <div class="lname"><b>${esc(l.p.name)}</b><small>${esc(l.p.unit)} • ${rupee(l.p.price)}</small>
            ${l.p.inStock ? '' : '<small class="oos-tag"> · Out of stock, will not be ordered</small>'}</div>
          ${stepperHTML(l.p.id, l.qty, l.p.name, true)}
          <span class="ltotal">${rupee(l.qty * l.p.price)}</span>
        </li>`).join('');
    }

    function renderSummary(animate) {
      const total = cartTotal();
      const parts = buyable().map((l) => (l.qty > 1 ? `${l.qty} × ${rupee(l.p.price)}` : rupee(l.p.price)));
      const prev = Number($('#sumTotal', summaryEl)?.dataset.val ?? total);
      summaryEl.innerHTML = `
        <div class="sum-row total"><span>Total</span><b id="sumTotal" data-val="${prev}">${rupee(prev)}</b></div>
        ${minNoteHTML(total)}
        ${parts.length ? `<p class="formula">${parts.join(' + ')} = <b>${rupee(total)}</b></p>` : ''}`;
      if (animate) animateNumber($('#sumTotal', summaryEl), total); else { const el = $('#sumTotal', summaryEl); el.textContent = rupee(total); el.dataset.val = total; }
      $('#placeBtn', root).setAttribute('aria-disabled', String(total < S().settings.minOrder));
    }

    renderLines();
    renderSummary(false);

    if (!ctx.quiet) {
      gsap.from('.panel', { y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' });
      gsap.from('#lines li', { x: -24, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', delay: 0.2 });
    }

    linesEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const li = btn.closest('li');
      const id = li.dataset.id;
      const qty = S().cart[id] || 0;
      if (btn.dataset.act === 'dec' && qty <= 1) {
        gsap.to(li, {
          height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0, x: 40, duration: 0.35, ease: 'power2.in',
          onComplete: () => { setQty(id, 0); if (!cartLines().length) rerender(); else { renderLines(); renderSummary(true); } },
        });
        return;
      }
      setQty(id, btn.dataset.act === 'dec' ? qty - 1 : qty + 1);
      renderLines();
      renderSummary(true);
      const nli = linesEl.querySelector(`[data-id="${id}"]`);
      $(`[data-act="${btn.dataset.act}"]`, nli)?.focus();
      gsap.fromTo($('output', nli), { scale: 1.5 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
      gsap.fromTo($('.ltotal', nli), { color: '#15803D' }, { color: '#0A0A0A', duration: 0.6 });
    });

    /* validation with errors in words */
    const form = $('#checkout', root);
    const normPhone = (v) => v.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    function validate(d) {
      const errs = {};
      if (!d.name) errs.cName = 'Please enter your name';
      else if (d.name.length < 2) errs.cName = 'Name looks too short';
      const ph = normPhone(d.phone);
      if (!d.phone) errs.cPhone = 'Please enter your mobile number';
      else if (ph.length !== 10) errs.cPhone = 'Phone must be 10 digits';
      else if (!/^[6-9]/.test(ph)) errs.cPhone = 'Mobile numbers start with 6, 7, 8 or 9';
      if (!d.address) errs.cAddr = 'Please add your delivery address';
      else if (d.address.length < 10) errs.cAddr = 'Add a bit more detail: house number, street or landmark';
      return errs;
    }
    function showErrors(errs) {
      ['cName', 'cPhone', 'cAddr'].forEach((id) => {
        const f = $(`[data-field="${id}"]`, form);
        const msg = errs[id] || '';
        $(`#${id}-err`, form).textContent = msg;
        f.classList.toggle('invalid', !!msg);
        $(`#${id}`, form).setAttribute('aria-invalid', String(!!msg));
      });
    }
    const readForm = () => ({
      name: $('#cName', form).value.trim(),
      phone: $('#cPhone', form).value.trim(),
      address: $('#cAddr', form).value.trim(),
      note: $('#cNote', form).value.trim(),
    });
    // live re-validate fields that already show an error
    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field');
      if (f && f.classList.contains('invalid')) {
        const errs = validate(readForm());
        const id = f.dataset.field;
        $(`#${id}-err`, form).textContent = errs[id] || '';
        f.classList.toggle('invalid', !!errs[id]);
      }
    });

    let sending = false;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      const d = readForm();
      const errs = validate(d);
      showErrors(errs);
      const firstBad = Object.keys(errs)[0];
      if (firstBad) {
        shake($(`[data-field="${firstBad}"]`, form));
        $(`#${firstBad}`, form).focus();
        return;
      }
      const total = cartTotal();
      const min = S().settings.minOrder;
      if (!buyable().length) { toast('Your cart has no items that are in stock', 'error'); return; }
      if (total < min) {
        toast(`Add ${rupee(min - total)} more. The minimum order is ${rupee(min)}.`, 'error');
        shake(summaryEl);
        return;
      }
      const btn = $('#placeBtn', form);
      const label = btn.innerHTML;
      // open the WhatsApp tab right away (inside the click) so pop-up blockers allow it
      const win = store.mode() === 'server' ? window.open('', '_blank') : null;
      if (win) { try { win.opener = null; win.document.title = 'Opening WhatsApp…'; } catch (err) { /* ignore */ } }
      sending = true;
      btn.disabled = true;
      btn.textContent = 'Sending order…';
      try {
        const order = await placeOrder({ ...d, phone: normPhone(d.phone) });
        if (win) win.location.href = waLink(order);
        else window.open(waLink(order), '_blank', 'noopener');
        location.hash = `#/track/${order.id}?new=1`;
      } catch (err) {
        if (win) win.close();
        toast(err.message || 'Could not place the order. Please try again.', 'error');
        sending = false;
        btn.disabled = false;
        btn.innerHTML = label;
      }
    });

    hooks.onRemote = () => { if (!cartLines().length) { rerender(); return; } renderLines(); renderSummary(true); };
  }

  async function placeOrder(d) {
    if (store.mode() === 'server') {
      // the server checks stock, re-prices every line and gives the order its number
      const order = await store.api('POST', '/orders', {
        name: d.name, phone: d.phone, address: d.address, note: d.note || '',
        items: buyable().map((l) => ({ id: l.p.id, qty: l.qty })),
      });
      store.set((s) => {
        s.orders = [order, ...s.orders.filter((o) => o.id !== order.id)];
        s.myOrders = [order.id, ...(s.myOrders || []).filter((x) => x !== order.id)];
        s.customer = { name: d.name, phone: d.phone, address: d.address };
        const keep = {};
        Object.entries(s.cart).forEach(([id, qty]) => { const p = s.products.find((x) => x.id === id); if (p && !p.inStock) keep[id] = qty; });
        s.cart = keep;
      });
      updateBadge();
      return order;
    }
    let order;
    store.set((s) => {
      const items = Object.entries(s.cart)
        .map(([id, qty]) => ({ p: s.products.find((p) => p.id === id), qty }))
        .filter((l) => l.p && l.p.inStock && l.qty > 0)
        .map((l) => ({ id: l.p.id, name: l.p.name, unit: l.p.unit, price: l.p.price, img: l.p.img || '', qty: l.qty }));
      const now = Date.now();
      order = {
        id: s.nextOrderId,
        name: d.name, phone: d.phone, address: d.address, note: d.note || '',
        items, total: items.reduce((a, i) => a + i.qty * i.price, 0),
        status: 'new', assignee: '', createdAt: now, history: { new: now }, checked: [],
      };
      s.nextOrderId += 1;
      s.orders.unshift(order);
      s.myOrders = [order.id, ...(s.myOrders || [])];
      s.customer = { name: d.name, phone: d.phone, address: d.address };
      // keep out-of-stock lines in the cart, clear the rest
      const keep = {};
      Object.entries(s.cart).forEach(([id, qty]) => { const p = s.products.find((x) => x.id === id); if (p && !p.inStock) keep[id] = qty; });
      s.cart = keep;
    });
    updateBadge();
    return order;
  }

  /* =========================================================
     TRACK & MY ORDERS
     ========================================================= */
  function viewTrack(root, ctx) {
    const id = Number(ctx.params[0]);
    const o = S().orders.find((x) => x.id === id);
    if (!o) { viewNotFound(root, ctx, `We couldn’t find order #${id} on this device.`); return; }
    const idx = statusIndex(o.status);
    const isNew = ctx.query.has('new');
    const shop = S().settings.shopName;

    root.innerHTML = `
      <div class="page container narrow track">
        ${isNew ? `
          <section class="success">
            <div class="success-check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
            <h1>Order sent to ${esc(shop)}!</h1>
            <p>WhatsApp should have opened with your order typed out. Press <b>Send</b> there so the shop gets it.</p>
            <a class="btn btn-wa" href="${waLink(o)}" target="_blank" rel="noopener">Didn’t open? Send on WhatsApp ↗</a>
          </section>` : `<div><a class="back" href="#/my-orders">← My orders</a></div>`}
        <section class="panel">
          <div class="track-head"><h2>Order #${o.id}</h2>${statusPill(o.status)}</div>
          <ol class="timeline" aria-label="Order progress">
            <div class="tl-line" aria-hidden="true"><div class="tl-fill"></div></div>
            ${STATUSES.map((st, i) => `
              <li class="${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}" ${i === idx ? 'aria-current="step"' : ''}>
                <span class="tl-dot" aria-hidden="true">${icon(i < idx ? 'check' : st.icon)}</span>
                <b>${st.label}</b>
                <small>${o.history && o.history[st.key] ? fmtTime(o.history[st.key]) : ''}</small>
              </li>`).join('')}
          </ol>
          <p class="track-meta">${{
            new: `${esc(shop)} has your order and will start packing soon.`,
            packed: `Your order is packed${o.assignee ? ` and ${esc(o.assignee)} will bring it` : ''}.`,
            out: `${esc(o.assignee || 'Our delivery person')} is on the way with your order.`,
            delivered: 'Delivered. Thank you for shopping local!',
          }[o.status]}</p>
        </section>
        <section class="panel">
          <h2>Items</h2>
          <ul class="mini-lines">${o.items.map((i) => `<li><span class="ml-name">${pimg(i, 'xs')}<span>${i.qty} × ${esc(i.name)} <small class="muted">${esc(i.unit)}</small></span></span><b>${rupee(i.qty * i.price)}</b></li>`).join('')}</ul>
          <div class="sum-row total" style="margin-top:12px"><span>Total</span><b>${rupee(o.total)}</b></div>
        </section>
        <section class="panel">
          <h2>Delivery details</h2>
          <dl class="kv">
            <dt>Name</dt><dd>${esc(o.name)}</dd>
            <dt>Phone</dt><dd>+91 ${esc(o.phone)}</dd>
            <dt>Address</dt><dd>${esc(o.address)}</dd>
            ${o.note ? `<dt>Note</dt><dd>${esc(o.note)}</dd>` : ''}
            <dt>Placed</dt><dd>${fmtTime(o.createdAt)}</dd>
          </dl>
        </section>
        <div class="cta-row" style="margin:0"><a class="btn btn-primary" href="#/shop">Continue shopping</a><a class="btn btn-ghost" href="#/my-orders">All my orders</a></div>
      </div>`;

    if (isNew) history.replaceState(null, '', `#/track/${o.id}`);
    const fill = $('.tl-fill', root);
    gsap.fromTo(fill, { scaleX: 0 }, { scaleX: idx / (STATUSES.length - 1), duration: ctx.quiet ? 0.6 : 1.2, ease: 'power3.inOut', delay: ctx.quiet ? 0 : 0.4 });
    if (!ctx.quiet) {
      gsap.from('.timeline li', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(1.6)', delay: 0.2 });
      gsap.from('.track > section, .track > .cta-row', { y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' });
    }
    if (isNew && !ctx.quiet) {
      gsap.timeline({ delay: 0.25 })
        .from('.success-check', { scale: 0, rotation: -90, duration: 0.7, ease: 'back.out(2)' })
        .fromTo('.success-check path', { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, '-=0.25')
        .call(() => { const r = $('.success-check')?.getBoundingClientRect(); if (r) confetti(r.left + r.width / 2, r.top + r.height / 2); });
    }
    const cur = $('.timeline li.current .tl-dot', root);
    if (cur && o.status !== 'delivered' && !REDUCED) {
      const pulse = gsap.to(cur, { boxShadow: '0 0 0 14px rgba(21,128,61,0)', duration: 1.4, repeat: -1, ease: 'power1.out' });
      onCleanup(() => pulse.kill());
    }
    hooks.onRemote = () => {
      const before = o.status;
      const after = S().orders.find((x) => x.id === id)?.status;
      rerender();
      if (after && after !== before) toast(`Order #${id} is now ${STATUSES[statusIndex(after)].label.toLowerCase()}`, 'ok');
    };
  }

  function viewMyOrders(root, ctx) {
    const s = S();
    const mine = (s.myOrders || []).map((id) => s.orders.find((o) => o.id === id)).filter(Boolean);
    root.innerHTML = `
      <div class="page container narrow">
        <p class="eyebrow">Customer</p>
        <h1>My orders</h1>
        <p class="muted">Orders you placed from this device. Status updates as ${esc(s.settings.shopName)} packs and delivers them.</p>
        ${mine.length ? `<div class="olist">${mine.map((o) => `
          <a class="orow" href="#/track/${o.id}">
            <span class="oid">#${o.id}</span>
            <span><b>${itemCount(o)} items · ${rupee(o.total)}</b><br><small class="muted">${fmtTime(o.createdAt)}</small></span>
            ${statusPill(o.status)}
            <span aria-hidden="true">→</span>
          </a>`).join('')}</div>` : `
          <div class="empty">
            <div class="empty-ico">${icon('package')}</div>
            <p><b>No orders yet</b></p>
            <p class="muted">When you order on WhatsApp, it shows up here so you can track it.</p>
            <a class="btn btn-primary" href="#/shop">Start shopping →</a>
          </div>`}
      </div>`;
    if (!ctx.quiet) gsap.from('.orow', { y: 24, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' });
    hooks.onRemote = () => rerender();
  }

  /* =========================================================
     SHOPKEEPER — orders board
     ========================================================= */
  const openDetails = new Set();

  function adminTop(active) {
    const tabs = [['orders', 'board', 'Orders board'], ['products', 'package', 'Products'], ['settings', 'sliders', 'Settings']];
    return `
      <div class="admin-top">
        <div><p class="eyebrow">Shopkeeper · ${esc(S().settings.shopName)}</p><h1>${{ orders: 'Orders board', products: 'Products', settings: 'Shop settings' }[active]}</h1></div>
        <nav class="tabs" aria-label="Shopkeeper sections">
          ${tabs.map(([k, ic, l]) => `<a href="#/${k}" class="tab ${k === active ? 'active' : ''}" ${k === active ? 'aria-current="page"' : ''}>${icon(ic)}${l}</a>`).join('')}
        </nav>
      </div>`;
  }

  function ocardHTML(o) {
    const staff = S().staff;
    const next = { new: 'Mark packed →', packed: 'Send out →', out: 'Delivered ✓' }[o.status];
    const idx = statusIndex(o.status);
    return `
      <article class="ocard" data-flip-id="o-${o.id}" data-id="${o.id}">
        <header><b>#${o.id}</b><span class="oname">${esc(o.name)}</span></header>
        <p class="ometa">${itemCount(o)} items • <b>${rupee(o.total)}</b> • ${fmtTime(o.createdAt)}</p>
        <details ${openDetails.has(o.id) ? 'open' : ''}>
          <summary>Items &amp; address</summary>
          <ul>${o.items.map((i) => `<li><span>${i.qty} × ${esc(i.name)}</span><span>${rupee(i.qty * i.price)}</span></li>`).join('')}</ul>
          <p class="irow">${icon('pin')}<span>${esc(o.address)}</span></p>
          ${o.note ? `<p class="irow">${icon('note')}<span>${esc(o.note)}</span></p>` : ''}
          <p class="irow">${icon('phone')}<span><a href="tel:+91${esc(o.phone)}">${esc(o.phone)}</a> · <a href="https://wa.me/91${esc(o.phone)}" target="_blank" rel="noopener">WhatsApp</a></span></p>
        </details>
        <div class="oactions">
          ${o.status !== 'delivered'
    ? `<label class="assign">Assign <select data-assign aria-label="Delivery person for order ${o.id}"><option value="">—</option>${staff.map((n) => `<option ${o.assignee === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`
    : `<span class="done-chip">Done ✓${o.assignee ? ` · ${esc(o.assignee)}` : ''}</span>`}
          <div class="obtns">
            ${idx > 0 ? `<button class="icon-btn" data-back aria-label="Move order ${o.id} back to ${STATUSES[idx - 1].label}" title="Move back">${icon('undo')}</button>` : ''}
            ${next ? `<button class="btn btn-sm ${o.status === 'out' ? 'btn-ok' : 'btn-primary'}" data-advance>${next}</button>` : ''}
          </div>
        </div>
      </article>`;
  }

  function viewBoard(root, ctx) {
    root.innerHTML = `
      <div class="page container admin">
        ${adminTop('orders')}
        <div class="stats" id="stats"></div>
        <p class="tip">${icon('bell')}<span>Open the <a href="#/shop" target="_blank" rel="noopener">shop in a new tab</a>, place an order, and watch it land here live.</span></p>
        <div class="board" id="board"></div>
      </div>`;
    const board = $('#board', root);

    function renderBoard() {
      const orders = S().orders;
      board.innerHTML = STATUSES.map((st) => {
        const list = orders.filter((o) => o.status === st.key)
          .sort((a, b) => (b.history?.[st.key] || b.createdAt) - (a.history?.[st.key] || a.createdAt));
        return `
          <section class="col col-${st.key}" aria-label="${st.label}">
            <header><h2>${st.label}</h2><span class="count" data-status="${st.key}">${list.length}</span></header>
            <div class="col-body">${list.map(ocardHTML).join('') || '<p class="col-empty">No orders</p>'}</div>
          </section>`;
      }).join('');
    }

    function renderStats(animate) {
      const orders = S().orders;
      const today = orders.filter((o) => isToday(o.createdAt));
      const pending = orders.filter((o) => o.status !== 'delivered').length;
      const out = orders.filter((o) => o.status === 'out').length;
      const revenue = orders.filter((o) => o.status === 'delivered' && isToday(o.history?.delivered)).reduce((a, o) => a + o.total, 0);
      const tiles = [['Orders today', today.length, String], ['Pending', pending, String], ['Out for delivery', out, String], ['Delivered value today', revenue, rupee]];
      const stats = $('#stats', root);
      if (!stats.children.length) {
        stats.innerHTML = tiles.map(([l], i) => `<div class="stat"><span>${l}</span><b data-i="${i}" data-val="0">0</b></div>`).join('');
      }
      tiles.forEach(([, v, fmt], i) => {
        const el = $(`[data-i="${i}"]`, stats);
        if (animate) animateNumber(el, v, (n) => fmt(Math.round(n)), 0.9);
        else { el.textContent = fmt(v); el.dataset.val = v; }
      });
    }

    function flipUpdate(highlightId) {
      const counts = Object.fromEntries($$('.count', board).map((c) => [c.dataset.status, c.textContent]));
      const state = Flip.getState('.ocard');
      renderBoard();
      renderStats(true);
      Flip.from(state, {
        targets: '.ocard', duration: 0.65, ease: 'power3.inOut', absolute: true, zIndex: 5,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85, y: -20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }),
      });
      $$('.count', board).forEach((c) => { if (counts[c.dataset.status] !== c.textContent) bump(c, 1.5); });
      if (highlightId) {
        const card = board.querySelector(`[data-id="${highlightId}"]`);
        if (card) {
          card.classList.add('glow');
          gsap.delayedCall(1.6, () => card.classList.remove('glow'));
        }
      }
    }

    renderBoard();
    renderStats(!ctx.quiet);
    if (!ctx.quiet) {
      gsap.from('.stat', { y: 24, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' });
      gsap.from('.col', { y: 40, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.1 });
      gsap.from('.ocard', { y: 20, opacity: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out', delay: 0.35 });
    }

    board.addEventListener('toggle', (e) => {
      const card = e.target.closest?.('.ocard');
      if (!card || e.target.tagName !== 'DETAILS') return;
      const id = Number(card.dataset.id);
      if (e.target.open) openDetails.add(id); else openDetails.delete(id);
    }, true);

    board.addEventListener('change', (e) => {
      const sel = e.target.closest('select[data-assign]');
      if (!sel) return;
      const id = Number(sel.closest('.ocard').dataset.id);
      store.set((s) => { const o = s.orders.find((x) => x.id === id); if (o) o.assignee = sel.value; });
      save('PATCH', `/orders/${id}`, { assignee: sel.value });
      toast(sel.value ? `Order #${id} assigned to ${sel.value}` : `Order #${id} unassigned`, 'ok');
    });

    board.addEventListener('click', (e) => {
      const adv = e.target.closest('[data-advance]');
      const back = e.target.closest('[data-back]');
      if (!adv && !back) return;
      const card = e.target.closest('.ocard');
      const id = Number(card.dataset.id);
      const o = S().orders.find((x) => x.id === id);
      if (!o) return;
      const idx = statusIndex(o.status);
      if (adv) {
        if (o.status === 'packed' && !o.assignee) {
          toast('Choose who will deliver it first', 'error');
          const sel = $('select[data-assign]', card);
          shake(sel.parentElement); sel.focus();
          return;
        }
        const nextKey = STATUSES[idx + 1].key;
        store.set((s) => {
          const x = s.orders.find((y) => y.id === id);
          x.status = nextKey;
          x.history = { ...(x.history || {}), [nextKey]: Date.now() };
          if (nextKey === 'out' || nextKey === 'delivered') x.checked = x.items.map((i) => i.id);
        });
        save('PATCH', `/orders/${id}`, { status: nextKey });
        flipUpdate(id);
        if (nextKey === 'delivered') {
          const r = board.querySelector(`[data-id="${id}"]`)?.getBoundingClientRect();
          gsap.delayedCall(0.6, () => { if (r) confetti(r.left + r.width / 2, r.top + 20, 40); });
          toast(`Order #${id} delivered`, 'ok');
        } else {
          toast(`Order #${id} → ${STATUSES[idx + 1].label}`, 'ok');
        }
      } else if (back && idx > 0) {
        const prevKey = STATUSES[idx - 1].key;
        store.set((s) => {
          const x = s.orders.find((y) => y.id === id);
          if (x.history) delete x.history[x.status];
          x.status = prevKey;
        });
        save('PATCH', `/orders/${id}`, { status: prevKey });
        flipUpdate(id);
        toast(`Order #${id} moved back to ${STATUSES[idx - 1].label}`);
      }
    });

    let knownIds = new Set(S().orders.map((o) => o.id));
    hooks.onRemote = () => {
      const fresh = S().orders.filter((o) => !knownIds.has(o.id));
      knownIds = new Set(S().orders.map((o) => o.id));
      flipUpdate(fresh[0]?.id);
      fresh.forEach((o) => toast(`New order #${o.id} from ${o.name} · ${rupee(o.total)}`, 'wa'));
    };
  }

  /* =========================================================
     SHOPKEEPER — products
     ========================================================= */
  const prodUI = { q: '', cat: 'All' };

  function viewProducts(root, ctx) {
    root.innerHTML = `
      <div class="page container admin">
        ${adminTop('products')}
        <div class="toolbar">
          <label class="search sm">${icon('search')}<input id="pq" type="search" placeholder="Search products" value="${esc(prodUI.q)}" aria-label="Search products"></label>
          <select id="pcat" class="select" aria-label="Filter by category">
            ${['All', ...DL.categories].map((c) => `<option ${c === prodUI.cat ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          <button class="btn btn-primary" id="addProduct">+ Add product</button>
        </div>
        <p class="muted small" id="pcount"></p>
        <div class="ptable" id="ptable"></div>
      </div>`;
    const table = $('#ptable', root);

    function rows() {
      const q = prodUI.q.trim().toLowerCase();
      return S().products.filter((p) => (prodUI.cat === 'All' || p.cat === prodUI.cat)
        && (!q || `${p.name} ${p.unit} ${p.tags || ''}`.toLowerCase().includes(q)));
    }
    function rowHTML(p) {
      return `
        <div class="prow" data-id="${p.id}" data-flip-id="pr-${p.id}">
          <span class="pthumb">${pimg(p)}</span>
          <div class="pname"><b>${esc(p.name)}</b><small>${esc(p.unit)} · ${esc(p.cat)}</small></div>
          <label class="price-edit"><span>₹</span><input type="number" min="1" step="1" inputmode="numeric" value="${p.price}" data-price aria-label="Price of ${esc(p.name)}"></label>
          <label class="switch"><input type="checkbox" data-stock ${p.inStock ? 'checked' : ''} aria-label="${esc(p.name)} in stock"><span class="slider"></span><span class="${p.inStock ? 's-in' : 's-out'}">${p.inStock ? 'In stock' : 'Out of stock'}</span></label>
          <div class="prow-actions">
            <button class="icon-btn" data-edit aria-label="Edit ${esc(p.name)}">${icon('edit')}</button>
            <button class="icon-btn danger" data-del aria-label="Delete ${esc(p.name)}">${icon('trash')}</button>
          </div>
        </div>`;
    }
    function render(animate) {
      const list = rows();
      const state = animate && !REDUCED ? Flip.getState('.prow') : null;
      table.innerHTML = list.length ? list.map(rowHTML).join('') : `<div class="empty"><div class="empty-ico">${icon('package')}</div><p>No products found.</p></div>`;
      $('#pcount', root).textContent = `${list.length} of ${S().products.length} products · ${S().products.filter((p) => !p.inStock).length} out of stock`;
      if (state) {
        Flip.from(state, {
          targets: '.prow', duration: 0.45, ease: 'power2.inOut',
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.02 }),
        });
      }
    }
    render(false);
    if (!ctx.quiet) gsap.from('.prow', { y: 20, opacity: 0, duration: 0.45, stagger: 0.025, ease: 'power2.out', delay: 0.1 });

    $('#pq', root).addEventListener('input', debounce((e) => { prodUI.q = e.target.value; render(true); }, 150));
    $('#pcat', root).addEventListener('change', (e) => { prodUI.cat = e.target.value; render(true); });
    $('#addProduct', root).addEventListener('click', () => productModal(null, (id) => { render(true); flash(id); }));

    function flash(id) {
      const row = table.querySelector(`[data-id="${id}"]`);
      if (row) gsap.fromTo(row, { backgroundColor: '#DCFCE7' }, { backgroundColor: '#FFFFFF', duration: 1.4, delay: 0.3, clearProps: 'backgroundColor' });
    }

    table.addEventListener('change', (e) => {
      const row = e.target.closest('.prow');
      if (!row) return;
      const id = row.dataset.id;
      const p = productById(id);
      if (e.target.matches('[data-price]')) {
        const v = Math.round(Number(e.target.value));
        if (!v || v < 1) { toast('Price must be at least ₹1', 'error'); e.target.value = p.price; shake(e.target.parentElement); return; }
        store.set((s) => { s.products.find((x) => x.id === id).price = v; });
        save('PATCH', `/products/${id}`, { price: v });
        toast(`${p.name} is now ${rupee(v)}`, 'ok');
        flash(id);
      }
      if (e.target.matches('[data-stock]')) {
        const on = e.target.checked;
        store.set((s) => { s.products.find((x) => x.id === id).inStock = on; });
        save('PATCH', `/products/${id}`, { inStock: on });
        const lbl = e.target.parentElement.lastElementChild;
        lbl.className = on ? 's-in' : 's-out';
        lbl.textContent = on ? 'In stock' : 'Out of stock';
        gsap.fromTo(lbl, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
        updateBadge();
        $('#pcount', root).textContent = `${rows().length} of ${S().products.length} products · ${S().products.filter((x) => !x.inStock).length} out of stock`;
        toast(`${p.name}: ${on ? 'back in stock' : 'marked out of stock'}`, on ? 'ok' : 'info');
      }
    });

    table.addEventListener('click', async (e) => {
      const row = e.target.closest('.prow');
      if (!row) return;
      const id = row.dataset.id;
      const p = productById(id);
      if (e.target.closest('[data-edit]')) productModal(p, () => { render(false); flash(id); });
      if (e.target.closest('[data-del]')) {
        const ok = await confirmModal({ title: `Delete ${p.name}?`, text: 'Customers will no longer see it in the shop. Past orders keep their copy of it.', ok: 'Delete product', danger: true });
        if (!ok) return;
        gsap.to(row, {
          height: 0, opacity: 0, x: 60, paddingTop: 0, paddingBottom: 0, marginBottom: -10, duration: 0.4, ease: 'power2.in',
          onComplete: () => {
            store.set((s) => { s.products = s.products.filter((x) => x.id !== id); delete s.cart[id]; });
            save('DELETE', `/products/${id}`);
            updateBadge();
            render(true);
            toast(`${p.name} deleted`);
          },
        });
      }
    });

    hooks.onRemote = () => { if (!modal.open) render(false); };
  }

  function productModal(p, onSaved) {
    const isNew = !p;
    const d = p || { img: '', name: '', unit: '', price: '', cat: DL.categories[0], inStock: true, tags: '' };
    let photo = d.img || '';
    const f = (id, label, input, cls = '') => `<div class="field ${cls}" data-field="${id}"><label for="${id}">${label}</label>${input}<p class="err" id="${id}-err" role="alert"></p></div>`;
    openModal(`
      <form id="pform" novalidate>
        <div class="modal-head"><h2 id="modalTitle">${isNew ? 'Add a product' : `Edit ${esc(d.name)}`}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
        <div class="form-grid">
          <div class="field full photo-field">
            <span class="label">Product photo</span>
            <div class="photo-pick">
              <div class="photo-preview" id="fPreview">${pimg(d)}</div>
              <div>
                <label class="btn btn-ghost btn-sm" for="fPhoto">${icon('image')} ${d.img ? 'Change photo' : 'Upload photo'}</label>
                <input id="fPhoto" type="file" accept="image/*" class="sr-only">
                <p class="hint">A clear photo of the pack on a plain background works best.</p>
              </div>
            </div>
          </div>
          ${f('fName', 'Product name', `<input id="fName" value="${esc(d.name)}" placeholder="e.g. Amul Taaza Milk">`, 'full')}
          ${f('fUnit', 'Pack size', `<input id="fUnit" value="${esc(d.unit)}" placeholder="e.g. 500 ml">`)}
          ${f('fPrice', 'Price (₹)', `<input id="fPrice" type="number" min="1" inputmode="numeric" value="${esc(d.price)}">`)}
          ${f('fCat', 'Category', `<select id="fCat">${DL.categories.map((c) => `<option ${c === d.cat ? 'selected' : ''}>${c}</option>`).join('')}</select>`)}
          ${f('fTags', 'Search words', `<input id="fTags" value="${esc(d.tags)}" placeholder="doodh, milk">`)}
          <label class="check-row full"><input type="checkbox" id="fStock" ${d.inStock ? 'checked' : ''}> In stock</label>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn btn-ghost" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">${isNew ? 'Add product' : 'Save changes'}</button>
        </div>
      </form>`, (m) => {
      const form = $('#pform', m);
      $('#fName', m).focus();
      $('#fPhoto', m).addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast('Please choose an image file', 'error'); return; }
        try {
          photo = await shrinkImage(file, 480);
          $('#fPreview', m).innerHTML = pimg({ img: photo, name: $('#fName', m).value || 'New' });
          gsap.fromTo('#fPreview', { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.8)' });
        } catch (err) {
          toast('Could not read that photo. Try another one.', 'error');
        }
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = {
          img: photo,
          name: $('#fName', m).value.trim(),
          unit: $('#fUnit', m).value.trim(),
          price: Math.round(Number($('#fPrice', m).value)),
          cat: $('#fCat', m).value,
          tags: $('#fTags', m).value.trim(),
          inStock: $('#fStock', m).checked,
        };
        const errs = {};
        if (!v.name) errs.fName = 'Please enter a product name';
        if (!v.unit) errs.fUnit = 'Add the pack size, like 1 kg or 500 ml';
        if (!v.price || v.price < 1) errs.fPrice = 'Price must be at least ₹1';
        ['fName', 'fUnit', 'fPrice'].forEach((id) => {
          $(`#${id}-err`, m).textContent = errs[id] || '';
          $(`[data-field="${id}"]`, m).classList.toggle('invalid', !!errs[id]);
        });
        const first = Object.keys(errs)[0];
        if (first) { shake($(`[data-field="${first}"]`, m)); $(`#${first}`, m).focus(); return; }
        let id = p && p.id;
        store.set((s) => {
          if (isNew) {
            const max = s.products.reduce((a, x) => Math.max(a, Number(String(x.id).replace(/\D/g, '')) || 0), 0);
            id = `p${max + 1}`;
            s.products.unshift({ id, ...v });
          } else {
            Object.assign(s.products.find((x) => x.id === id), v);
          }
        });
        save('PUT', `/products/${id}`, S().products.find((x) => x.id === id));
        updateBadge();
        closeModal(true);
        toast(isNew ? `${v.name} added to the shop` : `${v.name} saved`, 'ok');
        onSaved && onSaved(id);
      });
    });
  }

  /* =========================================================
     SHOPKEEPER — settings
     ========================================================= */
  function viewSettings(root, ctx) {
    const s = S();
    const hours = (from, to, sel) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
      .map((h) => `<option value="${h}" ${h === sel ? 'selected' : ''}>${fmtHour(h)}</option>`).join('');
    const f = (id, label, input, hint = '') => `<div class="field" data-field="${id}"><label for="${id}">${label}</label>${input}${hint ? `<p class="hint">${hint}</p>` : ''}<p class="err" id="${id}-err" role="alert"></p></div>`;
    const shopLink = `${location.origin}${location.pathname}#/shop`;
    root.innerHTML = `
      <div class="page container admin">
        ${adminTop('settings')}
        <div class="settings-grid">
          <form class="panel" id="sform" novalidate>
            <h2>Shop details</h2>
            ${f('sName', 'Shop name', `<input id="sName" value="${esc(s.settings.shopName)}">`)}
            ${f('sArea', 'Area / locality', `<input id="sArea" value="${esc(s.settings.area)}">`)}
            ${f('sWa', 'WhatsApp number for orders', `<input id="sWa" type="tel" inputmode="numeric" value="${esc(s.settings.whatsapp)}">`, 'With country code, no spaces or +. Example: 919876543210')}
            <div class="form-grid">
              ${f('sOpen', 'Opens at', `<select id="sOpen">${hours(5, 12, s.settings.openHour)}</select>`)}
              ${f('sClose', 'Closes at', `<select id="sClose">${hours(13, 23, s.settings.closeHour)}</select>`)}
            </div>
            ${f('sMin', 'Minimum order (₹)', `<input id="sMin" type="number" min="0" inputmode="numeric" value="${s.settings.minOrder}">`)}
            ${f('sStaff', 'Delivery staff', `<input id="sStaff" value="${esc(s.staff.join(', '))}">`, 'Separate names with commas.')}
            <button class="btn btn-primary btn-lg" type="submit">Save settings</button>
          </form>
          <div style="display:grid;gap:20px">
            <section class="panel">
              <h2>Share your shop</h2>
              <p class="muted">Send this link to customers on WhatsApp or print it as a QR code at the counter.</p>
              <div class="field"><input class="input" id="shopLink" value="${esc(shopLink)}" readonly aria-label="Shop link"></div>
              <div class="cta-row" style="margin:0">
                <button class="btn btn-ghost" id="copyLink">${icon('copy')} Copy link</button>
                <a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Order from ${s.settings.shopName} on WhatsApp: ${shopLink}`)}">Share on WhatsApp ↗</a>
              </div>
            </section>
            <section class="panel danger-zone">
              <h2>Demo data</h2>
              <p class="muted">Bring back the sample products and orders. This clears everything saved in this browser.</p>
              <button class="btn btn-danger" id="resetDemo">Reset demo data</button>
            </section>
          </div>
        </div>
      </div>`;
    if (!ctx.quiet) gsap.from('.panel', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' });

    $('#sform', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const v = {
        shopName: $('#sName', root).value.trim(),
        area: $('#sArea', root).value.trim(),
        whatsapp: $('#sWa', root).value.replace(/\D/g, ''),
        openHour: Number($('#sOpen', root).value),
        closeHour: Number($('#sClose', root).value),
        minOrder: Math.max(0, Math.round(Number($('#sMin', root).value) || 0)),
      };
      const staff = $('#sStaff', root).value.split(',').map((x) => x.trim()).filter(Boolean);
      const errs = {};
      if (!v.shopName) errs.sName = 'Please enter the shop name';
      if (v.whatsapp.length < 11 || v.whatsapp.length > 15) errs.sWa = 'Use the full number with country code, like 919876543210';
      if (!staff.length) errs.sStaff = 'Add at least one delivery person';
      ['sName', 'sWa', 'sStaff'].forEach((id) => {
        $(`#${id}-err`, root).textContent = errs[id] || '';
        $(`[data-field="${id}"]`, root).classList.toggle('invalid', !!errs[id]);
      });
      const first = Object.keys(errs)[0];
      if (first) { shake($(`[data-field="${first}"]`, root)); $(`#${first}`, root).focus(); return; }
      store.set((s2) => { s2.settings = { ...s2.settings, ...v }; s2.staff = staff; });
      save('PUT', '/settings', { settings: S().settings, staff });
      toast('Settings saved', 'ok');
      gsap.fromTo('.admin-top h1', { color: '#15803D' }, { color: '#0A0A0A', duration: 1 });
    });

    $('#copyLink', root).addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(shopLink); toast('Shop link copied', 'ok'); } catch (err) { $('#shopLink', root).select(); toast('Press Ctrl/Cmd + C to copy'); }
    });

    $('#resetDemo', root).addEventListener('click', async () => {
      const ok = await confirmModal({ title: 'Reset demo data?', text: 'All products, orders, cart and settings in this browser go back to the sample data. This cannot be undone.', ok: 'Reset everything', danger: true });
      if (!ok) return;
      try { await store.reset(); } catch (err) { toast(err.message, 'error'); return; }
      updateBadge();
      rerender();
      toast('Demo data restored', 'ok');
    });
  }

  /* =========================================================
     DELIVERY
     ========================================================= */
  let rider = null;

  function viewDelivery(root, ctx) {
    const s = S();
    if (!rider || !s.staff.includes(rider)) rider = s.staff[0];
    const mine = s.orders.filter((o) => o.assignee === rider && (o.status === 'packed' || o.status === 'out'))
      .sort((a, b) => (a.status === 'out' ? -1 : 1) - (b.status === 'out' ? -1 : 1) || a.createdAt - b.createdAt);
    const doneToday = s.orders.filter((o) => o.assignee === rider && o.status === 'delivered' && isToday(o.history?.delivered)).length;

    root.innerHTML = `
      <div class="page container narrow delivery">
        <p class="eyebrow">Delivery staff</p>
        <h1>Hi ${esc(rider)}</h1>
        <div class="seg" role="group" aria-label="Who is delivering">
          ${s.staff.map((n) => `<button class="seg-btn ${n === rider ? 'active' : ''}" data-rider="${esc(n)}" aria-pressed="${n === rider}">${icon('bike')} ${esc(n)}</button>`).join('')}
        </div>
        <div class="dstats">
          <div><b>${mine.length}</b><span>to deliver</span></div>
          <div><b>${doneToday}</b><span>delivered today</span></div>
        </div>
        <div class="dlist" id="dlist">
          ${mine.length ? mine.map(dcardHTML).join('') : `
            <div class="empty">
              <div class="empty-ico">${icon('cup')}</div>
              <p><b>No deliveries assigned right now.</b></p>
              <p class="muted">When the shop assigns you an order, it shows up here.</p>
            </div>`}
        </div>
      </div>`;

    if (!ctx.quiet) {
      gsap.from('.dstats > div', { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' });
      gsap.from('.dcard, .delivery .empty', { y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out', delay: 0.15 });
    }

    $('.seg', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-rider]');
      if (!b || b.dataset.rider === rider) return;
      rider = b.dataset.rider;
      rerender();
      gsap.from('.dcard, .delivery .empty', { x: 30, opacity: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' });
    });

    const list = $('#dlist', root);
    list.addEventListener('change', (e) => {
      const input = e.target.closest('input[data-item]');
      if (!input) return;
      const card = input.closest('.dcard');
      const id = Number(card.dataset.id);
      const itemId = input.dataset.item;
      store.set((s2) => {
        const o = s2.orders.find((x) => x.id === id);
        const set = new Set(o.checked || []);
        if (input.checked) set.add(itemId); else set.delete(itemId);
        o.checked = [...set];
      });
      save('PATCH', `/orders/${id}`, { checked: S().orders.find((x) => x.id === id).checked });
      const label = input.closest('.check');
      label.classList.toggle('checked', input.checked);
      const path = $('path', label);
      if (input.checked) {
        gsap.fromTo(path, { strokeDashoffset: 24 }, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' });
        gsap.fromTo($('.box', label), { scale: 0.7 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
      }
      refreshCardProgress(card);
    });

    list.addEventListener('click', (e) => {
      const start = e.target.closest('[data-start]');
      const done = e.target.closest('[data-delivered]');
      if (!start && !done) return;
      const card = e.target.closest('.dcard');
      const id = Number(card.dataset.id);
      if (start) {
        store.set((s2) => { const o = s2.orders.find((x) => x.id === id); o.status = 'out'; o.history = { ...(o.history || {}), out: Date.now() }; });
        save('PATCH', `/orders/${id}`, { status: 'out' });
        toast(`On the way with #${id}`, 'ok');
        gsap.to(card, { x: 12, duration: 0.12, yoyo: true, repeat: 1, onComplete: () => rerender() });
      } else {
        store.set((s2) => { const o = s2.orders.find((x) => x.id === id); o.status = 'delivered'; o.history = { ...(o.history || {}), delivered: Date.now() }; });
        save('PATCH', `/orders/${id}`, { status: 'delivered' });
        const r = done.getBoundingClientRect();
        confetti(r.left + r.width / 2, r.top);
        toast(`Order #${id} delivered. Great job, ${rider}!`, 'ok');
        gsap.to(card, {
          scale: 0.94, opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, marginBottom: -18, duration: 0.55, ease: 'power3.in', delay: 0.25,
          onComplete: () => rerender(),
        });
      }
    });

    hooks.onRemote = () => rerender();
  }

  function dcardHTML(o) {
    const checked = new Set(o.checked || []);
    const done = o.items.filter((i) => checked.has(i.id)).length;
    const all = done === o.items.length;
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${o.address}, ${S().settings.area}`)}`;
    return `
      <article class="dcard" data-id="${o.id}">
        <header><div><b>#${o.id}</b> ${esc(o.name)}</div>${statusPill(o.status)}</header>
        <p class="addr">${icon('pin')}<span>${esc(o.address)}</span></p>
        <div class="dlinks">
          <a class="btn btn-ghost" href="tel:+91${esc(o.phone)}">${icon('phone')} Call</a>
          <a class="btn btn-ghost" href="${maps}" target="_blank" rel="noopener">${icon('nav')} Directions</a>
        </div>
        ${o.note ? `<p class="notice irow">${icon('note')}<span>${esc(o.note)}</span></p>` : ''}
        <h3>Packing checklist <span class="muted" data-progress>${done} of ${o.items.length} packed</span></h3>
        <div class="progress"><i style="transform:scaleX(${o.items.length ? done / o.items.length : 0})"></i></div>
        <ul class="checklist">
          ${o.items.map((it) => `
            <li><label class="check ${checked.has(it.id) ? 'checked' : ''}">
              <input type="checkbox" data-item="${esc(it.id)}" ${checked.has(it.id) ? 'checked' : ''} ${o.status === 'out' ? 'disabled' : ''}>
              <span class="box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
              ${pimg(it, 'xs')}
              <span class="ctext"><b>${it.qty} ×</b> ${esc(it.name)} <small>${esc(it.unit)}</small></span>
            </label></li>`).join('')}
        </ul>
        <p class="collect">Collect <b>${rupee(o.total)}</b> · cash or UPI</p>
        ${o.status === 'packed'
    ? `<button class="btn btn-primary btn-block btn-lg" data-start ${all ? '' : 'disabled'}>${icon('bike')} Start delivery</button>
             <p class="hint" data-hint>${all ? 'All packed. Ready to go!' : 'Tick every item to start the delivery'}</p>`
    : '<button class="btn btn-ok btn-block btn-lg" data-delivered>Mark delivered ✓</button>'}
      </article>`;
  }

  function refreshCardProgress(card) {
    const boxes = $$('input[data-item]', card);
    const done = boxes.filter((b) => b.checked).length;
    $('[data-progress]', card).textContent = `${done} of ${boxes.length} packed`;
    gsap.to($('.progress i', card), { scaleX: boxes.length ? done / boxes.length : 0, duration: 0.45, ease: 'power2.out' });
    const start = $('[data-start]', card);
    if (start) {
      const all = done === boxes.length;
      const was = start.disabled;
      start.disabled = !all;
      $('[data-hint]', card).textContent = all ? 'All packed. Ready to go!' : 'Tick every item to start the delivery';
      if (all && was) gsap.fromTo(start, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    }
  }

  /* =========================================================
     404
     ========================================================= */
  function viewNotFound(root, ctx, msg) {
    root.innerHTML = `
      <div class="page container narrow">
        <div class="empty">
          <div class="empty-ico">${icon('compass')}</div>
          <h1>Page not found</h1>
          <p class="muted">${esc(msg || 'That page isn’t on our shelves.')}</p>
          <a class="btn btn-primary" href="#/">Go home</a>
        </div>
      </div>`;
  }

  /* resize an uploaded photo to a small JPEG data URL so it fits in localStorage */
  function shrinkImage(file, max) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const im = new Image();
        im.onerror = reject;
        im.onload = () => {
          const k = Math.min(1, max / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k);
          c.height = Math.round(im.height * k);
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(im, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.8));
        };
        im.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- boot ---------- */
  store.onStatus((isOnline) => {
    if (isOnline) toast('Back online. Data is up to date.', 'ok');
    else toast('Connection to the shop server lost. Retrying…', 'error');
  });
  view.innerHTML = '<div class="page container"><p class="muted loading">Loading the shop…</p></div>';
  store.ready.then(() => {
    updateLogoStatus();
    setInterval(updateLogoStatus, 60000);
    logoIntro();
    gsap.delayedCall(6, idleFlutter);
    updateBadge();
    window.addEventListener('hashchange', router);
    router();
  });
})();
