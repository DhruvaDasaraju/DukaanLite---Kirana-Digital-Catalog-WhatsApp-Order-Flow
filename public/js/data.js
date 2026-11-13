/* DukaanLite — seed catalogue, settings and demo orders */
window.DL = window.DL || {};

DL.categories = ['Staples', 'Dairy', 'Snacks', 'Beverages', 'Household'];

DL.seedProducts = [
  // Staples
  { id: 'p1', name: 'Aashirvaad Atta', unit: '5 kg', price: 265, cat: 'Staples', inStock: true, tags: 'atta aata flour wheat gehu' },
  { id: 'p2', name: 'Tata Salt', unit: '1 kg', price: 28, cat: 'Staples', inStock: true, tags: 'namak salt' },
  { id: 'p3', name: 'Tata Sampann Toor Dal', unit: '1 kg', price: 165, cat: 'Staples', inStock: true, tags: 'arhar dal lentil' },
  { id: 'p4', name: 'India Gate Basmati Rice', unit: '1 kg', price: 145, cat: 'Staples', inStock: true, tags: 'chawal rice basmati' },
  { id: 'p5', name: 'Fortune Sunflower Oil', unit: '1 L', price: 155, cat: 'Staples', inStock: true, tags: 'tel oil refined' },
  { id: 'p6', name: 'Sugar', unit: '1 kg', price: 48, cat: 'Staples', inStock: true, tags: 'cheeni chini shakkar' },
  { id: 'p8', name: 'Tata Sampann Poha', unit: '500 g', price: 42, cat: 'Staples', inStock: true, tags: 'chivda flattened rice' },
  // Dairy
  { id: 'p9', name: 'Amul Butter', unit: '100 g', price: 58, cat: 'Dairy', inStock: true, tags: 'makhan butter' },
  { id: 'p10', name: 'Fresh Paneer', unit: '200 g', price: 80, cat: 'Dairy', inStock: false, tags: 'cottage cheese paneer' },
  { id: 'p11', name: 'Amul Taaza Milk', unit: '1 L', price: 68, cat: 'Dairy', inStock: true, tags: 'doodh milk' },
  { id: 'p12', name: 'Amul Masti Dahi', unit: '400 g', price: 35, cat: 'Dairy', inStock: true, tags: 'dahi curd yogurt' },
  { id: 'p13', name: 'Amul Cheese Slices', unit: '200 g', price: 145, cat: 'Dairy', inStock: true, tags: 'cheese' },
  { id: 'p14', name: 'Farm Eggs', unit: '6 pcs', price: 48, cat: 'Dairy', inStock: true, tags: 'anda egg' },
  // Snacks
  { id: 'p15', name: 'Britannia Good Day', unit: '100 g', price: 31, cat: 'Snacks', inStock: true, tags: 'biscuit cookies' },
  { id: 'p16', name: "Lay's Classic Salted", unit: '52 g', price: 20, cat: 'Snacks', inStock: true, tags: 'chips wafers lays' },
  { id: 'p17', name: "Haldiram's Aloo Bhujia", unit: '200 g', price: 55, cat: 'Snacks', inStock: true, tags: 'namkeen bhujia' },
  { id: 'p7', name: "Haldiram's Moong Dal", unit: '200 g', price: 50, cat: 'Snacks', inStock: false, tags: 'namkeen moong dal' },
  { id: 'p18', name: 'Parle-G', unit: '250 g', price: 25, cat: 'Snacks', inStock: true, tags: 'biscuit glucose parle' },
  { id: 'p19', name: 'Maggi Masala Noodles', unit: '4 pack', price: 56, cat: 'Snacks', inStock: true, tags: 'noodles instant maggi' },
  { id: 'p20', name: 'Sunfeast Dark Fantasy', unit: '75 g', price: 40, cat: 'Snacks', inStock: true, tags: 'biscuit chocolate' },
  // Beverages
  { id: 'p21', name: 'Tata Tea Gold', unit: '250 g', price: 160, cat: 'Beverages', inStock: true, tags: 'chai tea patti' },
  { id: 'p22', name: 'Bru Instant Coffee', unit: '50 g', price: 110, cat: 'Beverages', inStock: true, tags: 'coffee' },
  { id: 'p23', name: 'Frooti Mango Drink', unit: '600 ml', price: 35, cat: 'Beverages', inStock: true, tags: 'mango juice drink' },
  { id: 'p24', name: 'Coca-Cola', unit: '750 ml', price: 40, cat: 'Beverages', inStock: true, tags: 'cold drink soda coke' },
  { id: 'p25', name: 'Bisleri Water', unit: '1 L', price: 20, cat: 'Beverages', inStock: true, tags: 'pani water bottle' },
  // Household
  { id: 'p26', name: 'Surf Excel Easy Wash', unit: '1 kg', price: 135, cat: 'Household', inStock: true, tags: 'detergent washing powder' },
  { id: 'p27', name: 'Vim Bar', unit: '3 pack', price: 30, cat: 'Household', inStock: true, tags: 'dishwash bartan' },
  { id: 'p28', name: 'Colgate Toothpaste', unit: '200 g', price: 105, cat: 'Household', inStock: true, tags: 'toothpaste manjan' },
  { id: 'p29', name: 'Lifebuoy Handwash', unit: '190 ml', price: 99, cat: 'Household', inStock: true, tags: 'sabun soap handwash' },
  { id: 'p30', name: 'Harpic Bathroom Cleaner', unit: '500 ml', price: 99, cat: 'Household', inStock: true, tags: 'toilet bathroom cleaner' },
].map((p) => ({ ...p, img: `img/products/${p.id}.jpg` }));

DL.defaultSettings = {
  shopName: 'Gupta General Store',
  area: 'Shastri Nagar, Jaipur',
  whatsapp: '919876543210',
  openHour: 8,
  closeHour: 21,
  minOrder: 200,
};

DL.defaultStaff = ['Raju', 'Sonu'];

DL.seedOrders = () => {
  const now = Date.now();
  const MIN = 60000;
  const flow = ['new', 'packed', 'out', 'delivered'];
  const P = (id) => DL.seedProducts.find((p) => p.id === id);
  const mk = (id, name, phone, address, pairs, status, assignee, agoMin) => {
    const items = pairs.map(([pid, qty]) => {
      const p = P(pid);
      return { id: pid, name: p.name, unit: p.unit, price: p.price, img: p.img, qty };
    });
    const createdAt = now - agoMin * MIN;
    const idx = flow.indexOf(status);
    const history = {};
    flow.slice(0, idx + 1).forEach((k, i) => { history[k] = createdAt + i * 12 * MIN; });
    let checked = [];
    if (idx >= 2) checked = items.map((i) => i.id);
    else if (status === 'packed') checked = [items[0].id];
    return {
      id, name, phone, address, items, note: '',
      total: items.reduce((a, i) => a + i.qty * i.price, 0),
      status, assignee, createdAt, history, checked,
    };
  };
  return [
    mk(1025, 'Anil Verma', '9812345670', 'B-14, Shastri Nagar, near Hanuman Mandir', [['p11', 2], ['p14', 1], ['p18', 2]], 'new', '', 3),
    mk(1024, 'Sunita Sharma', '9876501234', '22/3 Gandhi Path, 2nd floor, blue gate', [['p1', 1], ['p9', 2], ['p15', 1]], 'new', '', 8),
    mk(1023, 'Rahul Kumar', '9900112233', 'Flat 301, Shanti Apartments, Sector 5', [['p21', 1], ['p6', 1], ['p17', 1], ['p25', 2]], 'packed', 'Raju', 30),
    mk(1021, 'Kavita Joshi', '9123456780', '7 Nehru Colony, opposite park', [['p26', 1], ['p29', 1], ['p27', 2]], 'packed', 'Sonu', 35),
    mk(1022, 'Meena Devi', '9988776655', 'House 45, Gali No. 3, Shastri Nagar', [['p4', 1], ['p3', 1], ['p5', 1]], 'out', 'Raju', 50),
    mk(1020, 'Imran Khan', '9765432109', '12 Lake View Road, ground floor', [['p19', 2], ['p24', 1], ['p16', 3]], 'delivered', 'Sonu', 150),
    mk(1019, 'Pooja Singh', '9654321098', 'C-9 Vidhyadhar Nagar, behind school', [['p1', 1], ['p11', 2], ['p12', 1]], 'delivered', 'Raju', 180),
  ];
};
