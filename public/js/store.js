/* DukanLite — data store
   Server mode (default when the Node server is running): products, orders, settings and staff
   live in MongoDB (database "mangoes"); every device sees the same data and gets live updates.
   This device keeps only its own cart, "my orders" list and saved delivery details.
   Local mode (fallback when opened without the server): everything lives in localStorage. */
window.DL = window.DL || {};

DL.store = (() => {
  const LOCAL_KEY = 'dukaanlite:v2';
  const DEVICE_KEY = 'dukaanlite:device:v1';
  const VERSION = 2;
  const SHARED = ['products', 'orders', 'settings', 'staff', 'nextOrderId'];
  const DEVICE = ['cart', 'myOrders', 'customer'];
  const clientId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const remoteListeners = new Set();
  const statusListeners = new Set();
  let mode = 'local';
  let online = true;
  let state;

  const clone = (v) => JSON.parse(JSON.stringify(v));
  const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o && k in o).map((k) => [k, o[k]]));
  const readJSON = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };
  const deviceDefaults = () => ({ cart: {}, myOrders: [], customer: { name: '', phone: '', address: '' } });

  function seed() {
    return {
      version: VERSION,
      products: clone(DL.seedProducts),
      orders: DL.seedOrders(),
      settings: { ...DL.defaultSettings },
      staff: [...DL.defaultStaff],
      nextOrderId: 1026,
      ...deviceDefaults(),
    };
  }

  function loadLocal() {
    const parsed = readJSON(LOCAL_KEY);
    state = parsed && parsed.version === VERSION && Array.isArray(parsed.products) ? parsed : seed();
    if (!parsed) save();
  }

  function loadDevice() {
    Object.assign(state, deviceDefaults(), pick(readJSON(DEVICE_KEY) || {}, DEVICE));
  }

  function save() {
    try {
      if (mode === 'server') localStorage.setItem(DEVICE_KEY, JSON.stringify(pick(state, DEVICE)));
      else localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    } catch (e) { /* storage full or blocked: keep working in memory */ }
  }

  const emitRemote = () => remoteListeners.forEach((fn) => fn());
  const setOnline = (v) => { if (v !== online) { online = v; statusListeners.forEach((fn) => fn(v)); } };

  async function api(method, path, body) {
    if (mode !== 'server') return null;
    let res;
    try {
      res = await fetch(`/api${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Client-Id': clientId },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store',
      });
    } catch (e) {
      setOnline(false);
      throw new Error('Can’t reach the shop server. Check your internet connection.');
    }
    setOnline(true);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async function pull() {
    if (mode !== 'server') return;
    const d = await api('GET', '/state');
    Object.assign(state, pick(d, SHARED));
  }

  function connectEvents() {
    if (!window.EventSource) return;
    const es = new EventSource('/api/events');
    let dropped = false;
    es.addEventListener('change', async (e) => {
      let d = {};
      try { d = JSON.parse(e.data); } catch (err) { /* ignore */ }
      if (d.clientId === clientId) return; // our own write, already applied
      try { await pull(); emitRemote(); } catch (err) { /* will retry on next event */ }
    });
    es.onerror = () => { dropped = true; setOnline(false); };
    es.onopen = async () => {
      setOnline(true);
      if (dropped) { dropped = false; try { await pull(); emitRemote(); } catch (err) { /* ignore */ } }
    };
  }

  window.addEventListener('storage', (e) => {
    if (mode === 'server' && e.key === DEVICE_KEY) { loadDevice(); emitRemote(); }
    if (mode === 'local' && e.key === LOCAL_KEY) { loadLocal(); emitRemote(); }
  });

  async function init() {
    loadLocal();
    if (location.protocol === 'file:') return;
    try {
      const r = await fetch('/api/health', { cache: 'no-store' });
      if (!r.ok) throw new Error('no api');
      mode = 'server';
      state = { version: VERSION, ...seed() };
      loadDevice();
      await pull();
      connectEvents();
    } catch (e) {
      mode = 'local';
      loadLocal();
    }
  }

  const ready = init();

  return {
    ready,
    get: () => state,
    set(mutator) { mutator(state); save(); },
    api,
    refresh: pull,
    mode: () => mode,
    isOnline: () => online,
    onRemote(fn) { remoteListeners.add(fn); return () => remoteListeners.delete(fn); },
    onStatus(fn) { statusListeners.add(fn); return () => statusListeners.delete(fn); },
    async reset() {
      if (mode === 'server') {
        await api('POST', '/reset');
        await pull();
        Object.assign(state, deviceDefaults());
        save();
      } else {
        state = seed();
        save();
      }
    },
  };
})();
