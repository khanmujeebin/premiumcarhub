const STRIPE_PAYMENT_LINK  = 'https://buy.stripe.com/14A28teIvfcEbBRaxuf7i00';
const PAYPAL_CHECKOUT_LINK = 'https://www.paypal.com/checkoutnow?token=YOURPAYPALTOKEN'; // ← replace YOURPAYPALTOKEN with your real PayPal link

let inventory = [];
let cart = [];

// ── Load inventory ────────────────────────────────────────────
async function getInventory() {
  try {
    const res  = await fetch('/data/inventory.json?t=' + Date.now());
    const cars = await res.json();
    if (cars && cars.length > 0) return cars;
  } catch(e) {}
  return [
    { id:1, make:'Toyota',  model:'Camry Hybrid', year:2022, price:39990, odo:22000, images:['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'], desc:'Excellent condition, full service history.', fuel:'Hybrid',   trans:'Automatic', colour:'Silver', status:'available' },
    { id:2, make:'Tesla',   model:'Model 3',       year:2023, price:58990, odo:8000,  images:['https://images.unsplash.com/photo-1511396275271-7d1a0e3b86fc?w=800&q=80'], desc:'Like new, single owner.',                  fuel:'Electric', trans:'Automatic', colour:'White',  status:'available' },
    { id:3, make:'Mazda',   model:'CX-5',          year:2021, price:34990, odo:30000, images:['https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&q=80'], desc:'Great family SUV, RWC included.',          fuel:'Petrol',   trans:'Automatic', colour:'Red',    status:'available' },
    { id:4, make:'BMW',     model:'X5',            year:2020, price:72990, odo:45000, images:['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'], desc:'Luxury SUV, all options.',                 fuel:'Diesel',   trans:'Automatic', colour:'Black',  status:'available' },
    { id:5, make:'Hyundai', model:'i30 N',         year:2022, price:42990, odo:15000, images:['https://images.unsplash.com/photo-1541447271487-09612b3f49f9?w=800&q=80'], desc:'Performance hatch, low kms.',           fuel:'Petrol',   trans:'Manual',    colour:'Blue',   status:'available' }
  ];
}

// ── Car Detail Modal ──────────────────────────────────────────
function openCarDetail(id) {
  const car = inventory.find(c => String(c.id) === String(id));
  if (!car) return;

  const images = (car.images && car.images.length) ? car.images : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'];
  const videos = (car.videos && car.videos.length) ? car.videos : [];
  const km     = car.odo || car.km || 0;

  const thumbsHTML = [
    ...images.map((img, i) =>
      `<img src="${img}" onclick="switchMainMedia('img','${img}')"
        style="width:72px;height:54px;object-fit:cover;border-radius:6px;cursor:pointer;
               border:2px solid ${i===0?'#e8a020':'#ccc'};">`
    ),
    ...videos.map(v =>
      `<div onclick="switchMainMedia('video','${v}')"
        style="width:72px;height:54px;border-radius:6px;cursor:pointer;
               border:2px solid #6c63ff;background:#111;
               display:flex;align-items:center;justify-content:center;font-size:22px;">🎥</div>`
    )
  ].join('');

  const galleryHTML = (images.length > 1 || videos.length > 0)
    ? `<div style="display:flex;gap:8px;padding:10px 16px;flex-wrap:wrap;background:#f9f9f9;">${thumbsHTML}</div>`
    : '';

  const statusColor = car.status === 'sold' ? '#e74c3c' : car.status === 'reserved' ? '#e67e22' : '#27ae60';

  const specsHTML = [
    car.odo    ? `<div style="background:#f4f4f4;border-radius:8px;padding:12px;"><div style="font-size:11px;color:#888;font-weight:700;letter-spacing:.5px;">ODOMETER</div><div style="font-weight:700;font-size:15px;margin-top:4px;">${Number(km).toLocaleString()} km</div></div>` : '',
    car.trans  ? `<div style="background:#f4f4f4;border-radius:8px;padding:12px;"><div style="font-size:11px;color:#888;font-weight:700;letter-spacing:.5px;">TRANSMISSION</div><div style="font-weight:700;font-size:15px;margin-top:4px;">${car.trans}</div></div>` : '',
    car.fuel   ? `<div style="background:#f4f4f4;border-radius:8px;padding:12px;"><div style="font-size:11px;color:#888;font-weight:700;letter-spacing:.5px;">FUEL TYPE</div><div style="font-weight:700;font-size:15px;margin-top:4px;">${car.fuel}</div></div>` : '',
    car.colour ? `<div style="background:#f4f4f4;border-radius:8px;padding:12px;"><div style="font-size:11px;color:#888;font-weight:700;letter-spacing:.5px;">COLOUR</div><div style="font-weight:700;font-size:15px;margin-top:4px;">${car.colour}</div></div>` : '',
    car.body   ? `<div style="background:#f4f4f4;border-radius:8px;padding:12px;"><div style="font-size:11px;color:#888;font-weight:700;letter-spacing:.5px;">BODY TYPE</div><div style="font-weight:700;font-size:15px;margin-top:4px;">${car.body}</div></div>` : '',
    car.rego   ? `<div style="background:#f4f4f4;border-radius:8px;padding:12px;"><div style="font-size:11px;color:#888;font-weight:700;letter-spacing:.5px;">REGO</div><div style="font-weight:700;font-size:15px;margin-top:4px;">${car.rego}</div></div>` : '',
    car.sku    ? `<div style="background:#f4f4f4;border-radius:8px;padding:12px;"><div style="font-size:11px;color:#888;font-weight:700;letter-spacing:.5px;">SKU</div><div style="font-weight:700;font-size:15px;margin-top:4px;">${car.sku}</div></div>` : '',
    car.deposit? `<div style="background:#f4f4f4;border-radius:8px;padding:12px;"><div style="font-size:11px;color:#888;font-weight:700;letter-spacing:.5px;">DEPOSIT</div><div style="font-weight:700;font-size:15px;margin-top:4px;">$${Number(car.deposit).toLocaleString()}</div></div>` : '',
  ].filter(Boolean).join('');

  const payHTML = (car.payment && car.payment.methods && car.payment.methods.length)
    ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid #eee;">
        <div style="font-size:12px;color:#888;font-weight:700;margin-bottom:8px;">PAYMENT METHODS</div>
        ${car.payment.methods.map(m => `<span style="display:inline-block;background:#f0f0f0;padding:4px 12px;border-radius:20px;font-size:13px;margin:2px;">${m}</span>`).join('')}
       </div>` : '';

  const modal = document.createElement('div');
  modal.id = 'carModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;max-width:680px;width:100%;max-height:92vh;overflow-y:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.4);">

      <!-- Close -->
      <button onclick="closeCarDetail()" style="position:absolute;top:12px;right:12px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:50%;width:34px;height:34px;font-size:18px;cursor:pointer;z-index:10;line-height:1;">✕</button>

      <!-- Main image/video -->
      <div id="mainMediaContainer" style="width:100%;height:300px;border-radius:16px 16px 0 0;overflow:hidden;background:#000;">
        <img src="${images[0]}" alt="${car.make} ${car.model}" style="width:100%;height:100%;object-fit:cover;">
      </div>

      <!-- Thumbnails -->
      ${galleryHTML}

      <!-- Details -->
      <div style="padding:20px 24px 28px;">

        <!-- Title + price -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <div>
            <h2 style="margin:0;font-size:21px;font-weight:800;">${car.year} ${car.make} ${car.model}${car.variant?' '+car.variant:''}</h2>
            <div style="margin-top:5px;font-size:13px;color:#888;">
              ${car.status ? `<span style="background:${statusColor};color:#fff;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;margin-right:6px;">${car.status.toUpperCase()}</span>` : ''}
              ${videos.length ? `<span style="background:#6c63ff;color:#fff;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">🎥 VIDEO</span>` : ''}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:28px;font-weight:800;color:#e8a020;">$${Number(car.price).toLocaleString()}</div>
            ${car.financeWeekly ? `<div style="font-size:13px;color:#888;">From $${car.financeWeekly}/week</div>` : ''}
          </div>
        </div>

        <!-- Specs grid -->
        ${specsHTML ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">${specsHTML}</div>` : ''}

        <!-- Description -->
        ${car.desc ? `<div style="margin-bottom:14px;"><div style="font-size:12px;color:#888;font-weight:700;margin-bottom:6px;">DESCRIPTION</div><p style="margin:0;color:#444;font-size:14px;line-height:1.7;">${car.desc}</p></div>` : ''}

        <!-- Payment -->
        ${payHTML}

        <!-- Buttons -->
        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
          <button onclick="addToCart('${car.id}');closeCarDetail();"
            style="flex:1;min-width:140px;padding:14px;background:#e8a020;color:#000;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;">
            🛒 Add to Cart
          </button>
          <a href="tel:+61470469919"
            style="flex:1;min-width:140px;padding:14px;background:#222;color:#fff;border-radius:10px;font-size:15px;font-weight:700;text-align:center;text-decoration:none;display:block;">
            📞 Call Us
          </a>
        </div>
      </div>
    </div>`;

  modal.addEventListener('click', function(e){ if(e.target === modal) closeCarDetail(); });
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function switchMainMedia(type, src) {
  const c = document.getElementById('mainMediaContainer');
  if (!c) return;
  c.innerHTML = type === 'video'
    ? `<video src="${src}" controls autoplay style="width:100%;height:100%;object-fit:contain;background:#000;"></video>`
    : `<img src="${src}" style="width:100%;height:100%;object-fit:cover;">`;
}

function closeCarDetail() {
  const m = document.getElementById('carModal');
  if (m) m.remove();
  document.body.style.overflow = '';
}

// ── Render inventory grid ─────────────────────────────────────
function renderInventory(list) {
  if (!list) list = inventory.filter(c => c.status === 'available' || !c.status);
  const grid = document.querySelector('#inventoryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = '<p style="color:#888;text-align:center;padding:40px;grid-column:1/-1;">No cars available at this time. Check back soon!</p>';
    return;
  }

  list.forEach(car => {
    const img      = (car.images && car.images[0]) ? car.images[0] : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80';
    const km       = car.odo || car.km || 0;
    const hasVideo = car.videos && car.videos.length > 0;
    const idStr    = JSON.stringify(String(car.id));

    const card = document.createElement('div');
    card.className  = 'card draggable';
    card.draggable  = true;
    card.dataset.id = car.id;
    card.innerHTML  = `
      <div style="position:relative;cursor:pointer;" onclick="openCarDetail(${idStr})">
        <img src="${img}" alt="${car.make} ${car.model}"
          style="width:100%;height:200px;object-fit:cover;border-radius:8px 8px 0 0;display:block;">
        ${hasVideo ? '<div style="position:absolute;top:8px;right:8px;background:#6c63ff;color:#fff;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;">🎥 VIDEO</div>' : ''}
        <div style="position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,.55);color:#fff;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600;">
          ${(car.images && car.images.length > 1) ? '📷 '+car.images.length+' photos' : '📷 1 photo'}
        </div>
      </div>
      <div class="card-body">
        <div class="badge">Used</div>
        <div class="badge">${car.year}</div>
        <div class="badge">${Number(km).toLocaleString()} km</div>
        ${car.trans  ? `<div class="badge">${car.trans}</div>`  : ''}
        ${car.fuel   ? `<div class="badge">${car.fuel}</div>`   : ''}
        ${car.colour ? `<div class="badge">${car.colour}</div>` : ''}
        <h4 style="cursor:pointer;margin:10px 0 6px;" onclick="openCarDetail(${idStr})">
          ${car.make} ${car.model}${car.variant?' '+car.variant:''}
        </h4>
        ${car.desc ? `<p style="font-size:13px;color:#666;margin:0 0 8px;line-height:1.5;">${car.desc.substring(0,100)}${car.desc.length>100?'...':''}</p>` : ''}
        <div class="price">$${Number(car.price).toLocaleString()}</div>
        ${car.financeWeekly ? `<div style="font-size:13px;color:#888;margin-bottom:10px;">Finance from $${car.financeWeekly}/week</div>` : ''}
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn btn-primary" onclick="addToCart(${idStr})">Add to Cart</button>
          <button onclick="openCarDetail(${idStr})"
            style="padding:10px 16px;border:2px solid #e8a020;background:transparent;color:#e8a020;border-radius:6px;cursor:pointer;font-weight:700;font-size:14px;">
            View Details
          </button>
        </div>
        <div class="drag-hint">or drag this card into the cart →</div>
      </div>`;
    card.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', car.id));
    grid.appendChild(card);
  });
}

// ── Cart ──────────────────────────────────────────────────────
function addToCart(id) {
  const car = inventory.find(c => String(c.id) === String(id));
  if (!car) return;
  const existing = cart.find(c => String(c.id) === String(id));
  if (existing) existing.qty++;
  else cart.push({...car, qty:1, mode:'sale'});
  renderCart();
}

function renderCart() {
  const el = document.querySelector('#cartLines');
  if (!el) return;
  el.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item => {
    const km    = item.odo || item.km || 0;
    const price = item.mode === 'sale' ? item.price : Math.round(item.price * 0.0199 * 60);
    subtotal   += price * item.qty;
    const line  = document.createElement('div');
    line.className = 'line';
    line.innerHTML = `
      <div>
        <strong>${item.make} ${item.model}</strong><br>
        <small>${item.year} • ${Number(km).toLocaleString()} km</small>
      </div>
      <div>
        <div class="toggle">
          <button onclick="setMode('${item.id}','sale')"    class="${item.mode==='sale'?'active':''}">Sale</button>
          <button onclick="setMode('${item.id}','finance')" class="${item.mode==='finance'?'active':''}">Finance</button>
        </div>
        <div style="text-align:right;margin-top:6px;"><strong>$${price.toLocaleString()}</strong></div>
      </div>`;
    el.appendChild(line);
  });
  const sub = document.querySelector('#subtotal');
  if (sub) sub.textContent = '$' + subtotal.toLocaleString();
}

function setMode(id, mode) {
  const it = cart.find(i => String(i.id) === String(id));
  if (it) { it.mode = mode; renderCart(); }
}

function setupCartDnD() {
  const cartBox = document.querySelector('#cartBox');
  if (!cartBox) return;
  cartBox.addEventListener('dragover',  e => { e.preventDefault(); cartBox.style.background = '#f2f7ff'; });
  cartBox.addEventListener('dragleave', ()  => { cartBox.style.background = ''; });
  cartBox.addEventListener('drop',      e  => { e.preventDefault(); cartBox.style.background = ''; addToCart(e.dataTransfer.getData('text/plain')); });
}

// ── Filter ────────────────────────────────────────────────────
function filterInventory() {
  const q    = (document.querySelector('#search') || {value:''}).value.toLowerCase();
  const make = (document.querySelector('#make')   || {value:''}).value;
  renderInventory(inventory.filter(c => {
    const available   = c.status === 'available' || !c.status;
    const matchesText = (c.make + ' ' + c.model).toLowerCase().includes(q);
    const matchesMake = !make || c.make === make;
    return available && matchesText && matchesMake;
  }));
}

function updateMakeFilter() {
  const select = document.querySelector('#make');
  if (!select) return;
  const makes = [...new Set(inventory.map(c => c.make))].sort();
  select.innerHTML = '<option value="">All Makes</option>';
  makes.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; select.appendChild(o); });
}

// ── Checkout ──────────────────────────────────────────────────
function checkoutStripe() { window.location.href = STRIPE_PAYMENT_LINK; }
function checkoutPayPal() { window.location.href = PAYPAL_CHECKOUT_LINK; }

// ── Forms ─────────────────────────────────────────────────────
function submitPreApproval(e) {
  e.preventDefault();
  const f = id => document.getElementById(id).value.trim();
  if (!document.getElementById('paConsent').checked) { alert('Please consent to be contacted.'); return false; }
  const body = encodeURIComponent(`Finance Pre-Approval\nName: ${f('paName')}\nPhone: ${f('paPhone')}\nEmail: ${f('paEmail')}\nSuburb: ${f('paSuburb')}\nCar: ${f('paCar')}\nDeposit: ${f('paDeposit')}\nTerm: ${document.getElementById('paTerm').value}\nMonthly Income: ${f('paIncome')}`);
  window.location.href = `mailto:sales@premiumcarhub.com.au?subject=Finance%20Pre-Approval&body=${body}`;
  return false;
}

function submitTradeIn(e) {
  e.preventDefault();
  const f = id => document.getElementById(id).value.trim();
  const body = encodeURIComponent(`Trade-In Request\nName: ${f('tiName')}\nPhone: ${f('tiPhone')}\nEmail: ${f('tiEmail')}\nSuburb: ${f('tiSuburb')}\nVehicle: ${f('tiMake')}\nKM: ${f('tiKm')}\nNotes: ${f('tiNotes')}`);
  window.location.href = `mailto:sales@premiumcarhub.com.au?subject=Trade-In%20Appraisal&body=${body}`;
  return false;
}

// ── Init ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  inventory = await getInventory();
  updateMakeFilter();
  renderInventory();
  setupCartDnD();
});
