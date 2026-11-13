/* DukaanLite — tiny localStorage store with cross-tab sync */
window.DL = window.DL || {};

DL.store = (() => {
  const KEY = 'dukaanlite:v2';
  const VERSION = 2;
  const remoteListeners = new Set();
  let state;

  const clone = (v) => JSON.parse(JSON.stringify(v));

  function seed() {
    return {
      version: VERSION,
      products: clone(DL.seedProducts),
      orders: DL.seedOrders(),
      cart: {},
      settings: { ...DL.defaultSettings },
      staff: [...DL.defaultStaff],
      nextOrderId: 1026,
      myOrders: [],
      customer: { name: '', phone: '', address: '' },
    };
  }

  function load() {
    let parsed = null;
    try { parsed = JSON.parse(localStorage.getItem(KEY)); } catch (e) { parsed = null; }
    state = parsed && parsed.version === VERSION && Array.isArray(parsed.products) ? parsed : seed();
    if (!parsed) save();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked: keep working in memory */ }
  }

  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    load();
    remoteListeners.forEach((fn) => fn());
  });

  load();

  return {
    get: () => state,
    set(mutator) { mutator(state); save(); },
    onRemote(fn) { remoteListeners.add(fn); return () => remoteListeners.delete(fn); },
    reset() { state = seed(); save(); },
  };
})();
