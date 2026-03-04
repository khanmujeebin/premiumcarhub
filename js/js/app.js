// Replace with your live Payment Links
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/your_payment_link';
const PAYPAL_CHECKOUT_LINK = 'https://www.paypal.com/checkoutnow?token=YOURTOKEN';

let inventory = [];
let cart = [];

// ── Load inventory from data/inventory.json ──────────────────
async function getInventory() {
  try {
    const res = await fetch('/data/inventory.json');
    const cars = await res.json();
    if (cars.length > 0) return cars;
  } catch(e) {}
  // Fallback demo cars if inventory.json is empty
  return [
    {id:1, make:'Toyota', model:'Camry Hybrid', year:2022, price:39990, odo:22000, images:['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'], desc:'Excellent condition, full service history.', fuel:'Hybrid', trans:'Automatic', status:'available'},
    {id:2, make:'Tesla', model:'Model 3', year:2023, price:58990, odo:8000, images:['https://images.unsplash.com/photo-1511396275271-7d1a0e3b86fc?w=800&q=80'], desc:'Like new, single owner.', fuel:'Electric', trans:'Automatic', status:'available'},
    {id:3, make:'Mazda', model:'CX-5', year:2021, price:34990, odo:30000, images:['https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&q=80'], desc:'Great family SUV, RWC included.', fuel:'Petrol', trans:'Automatic', status:'available'},
    {id:4, make:'BMW', model:'X5', year:2020, price:72990, odo:45000, images:['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'], desc:'Luxury SUV, all options.', fuel:'Diesel', trans:'Automatic', status:'available'},
    {id:5, make:'Hyundai', model:'i30 N', year:2022, price:42990, odo:15000, images:['https://images.unsplash.com/photo-1541447271487-09612b3f49f9?w=800&q=80'], desc:'Performance hatch, low kms.', fuel:'Petrol', trans:'Manual', status:'available'}
  ];
}

// ── Render inventory grid ─────────────────────────────────────
function renderInventory(list) {
  if (!list) list = inventory.filter(c => c.status === 'available' || !c.status);
  const grid = document.querySelector('#inventoryGrid');
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = '<p style="color:#888;text-align:center;padding:40px;grid-column:1/-1;">No cars available at this time. Check back soon!</p>';
    return;
  }

  list.forEach(car => {
    const img = car.images && car.images[0] ? car.images[0] : 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80';
    const km = car.odo || car.km || 0;
    const card = document.createElement('div');
    card.className = 'card draggable';
    card.draggable = true;
    card.dataset.id = car.id;
    card.innerHTML = `
      <img src="${img}" alt="${car.make} ${car.model}" style="width:100%;height:200px;object-fit:cover;border-radius:8px 8px 0 0;">
      <div class="card-body">
        <div class="badge">Used</div>
        <div class="badge">${car.year}</div>
        <div class="badge">${Number(km).toLocaleString()} km</div>
        ${car.trans ? `<div class="badge">${car.trans}</div>` : ''}
        ${car.fuel  ? `<div class="badge">${car.fuel}</div>`  : ''}
        ${car.colour? `<div class="badge">${car.colour}</div>`: ''}
        <h4>${car.make} ${car.model}${car.variant ? ' ' + car.variant : ''}</h4>
        ${car.desc ? `<p style="font-size:13px;color:#666;margin:6px 0 8px;">${car.desc.substring(0,120)}${car.desc.length>120?'...':''}</p>` : ''}
        <div class="price">$${Number(car.price).toLocaleString()}</div>
        ${car.financeWeekly ? `<div style="font-size:13px;color:#888;margin-bottom:8px;">Finance from $${car.financeWeekly}/week</div>` : ''}
        <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(car.id)})">Add to Cart</button>
        <div class="drag-hint">or drag this card into the cart →</div>
      </div>`;
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', car.id);
    });
    grid.appendChild(card);
  });
}

// ── Cart ──────────────────────────────────────────────────────
function addToCart(id) {
  const car = inventory.find(c => String(c.id) === String(id));
  if (!car) return;
  const existing = cart.find(c => String(c.id) === String(id));
  if (existing) { existing.qty++; }
  else { cart.push({...car, qty: 1, mode: 'sale'}); }
  renderCart();
}

function renderCart() {
  const el = document.querySelector('#cartLines');
  el.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item => {
    const km = item.odo || item.km || 0;
    const price = item.mode === 'sale' ? item.price : Math.round(item.price * 0.0199 * 60);
    subtotal += price * item.qty;
    const line = document.createElement('div');
    line.className = 'line';
    line.innerHTML = `
      <div>
        <strong>${item.make} ${item.model}</strong><br>
        <small>${item.year} • ${Number(km).toLocaleString()} km</small>
      </div>
      <div>
        <div class='toggle'>
          <button onclick="setMode('${item.id}','sale')" class="${item.mode==='sale'?'active':''}">Sale</button>
          <button onclick="setMode('${item.id}','finance')" class="${item.mode==='finance'?'active':''}">Finance</button>
        </div>
        <div style='text-align:right;margin-top:6px'><strong>$${price.toLocaleString()}</strong></div>
      </div>`;
    el.appendChild(line);
  });
  document.querySelector('#subtotal').textContent = '$' + subtotal.toLocaleString();
}

function setMode(id, mode) {
  const it = cart.find(i => String(i.id) === String(id));
  if (it) { it.mode = mode; }
  renderCart();
}

function setupCartDnD() {
  const cartBox = document.querySelector('#cartBox');
  cartBox.addEventListener('dragover', e => { e.preventDefault(); cartBox.style.background = '#f2f7ff'; });
  cartBox.addEventListener('dragleave', () => cartBox.style.background = '');
  cartBox.addEventListener('drop', e => {
    e.preventDefault();
    cartBox.style.background = '';
    const id = e.dataTransfer.getData('text/plain');
    addToCart(id);
  });
}

// ── Filter ────────────────────────────────────────────────────
function filterInventory() {
  const q    = document.querySelector('#search').value.toLowerCase();
  const make = document.querySelector('#make').value;
  const filtered = inventory.filter(c => {
    const matchesText = (c.make + ' ' + c.model).toLowerCase().includes(q);
    const matchesMake = !make || c.make === make;
    const available   = c.status === 'available' || !c.status;
    return matchesText && matchesMake && available;
  });
  renderInventory(filtered);
}

// ── Update make dropdown with real inventory ──────────────────
function updateMakeFilter() {
  const makes  = [...new Set(inventory.map(c => c.make))].sort();
  const select = document.querySelector('#make');
  if (!select) return;
  select.innerHTML = '<option value="">All Makes</option>';
  makes.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m;
    select.appendChild(opt);
  });
}

// ── Checkout ──────────────────────────────────────────────────
function checkoutStripe()  { window.location.href = STRIPE_PAYMENT_LINK;  }
function checkoutPayPal()  { window.location.href = PAYPAL_CHECKOUT_LINK; }

// ── Pre-Approval form ─────────────────────────────────────────
function submitPreApproval(e) {
  e.preventDefault();
  const name    = document.getElementById('paName').value.trim();
  const phone   = document.getElementById('paPhone').value.trim();
  const email   = document.getElementById('paEmail').value.trim();
  const suburb  = document.getElementById('paSuburb').value.trim();
  const car     = document.getElementById('paCar').value.trim();
  const deposit = document.getElementById('paDeposit').value.trim();
  const term    = document.getElementById('paTerm').value;
  const income  = document.getElementById('paIncome').value.trim();
  if (!document.getElementById('paConsent').checked) { alert('Please consent to be contacted.'); return false; }
  const body = encodeURIComponent(`Finance Pre-Approval\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nSuburb: ${suburb}\nCar: ${car}\nDeposit: ${deposit}\nTerm: ${term}\nMonthly Income: ${income}`);
  window.location.href = `mailto:sales@premiumcarhub.com.au?subject=Finance%20Pre-Approval&body=${body}`;
  return false;
}

// ── Trade-In form ─────────────────────────────────────────────
function submitTradeIn(e) {
  e.preventDefault();
  const name   = document.getElementById('tiName').value.trim();
  const phone  = document.getElementById('tiPhone').value.trim();
  const email  = document.getElementById('tiEmail').value.trim();
  const suburb = document.getElementById('tiSuburb').value.trim();
  const make   = document.getElementById('tiMake').value.trim();
  const km     = document.getElementById('tiKm').value.trim();
  const notes  = document.getElementById('tiNotes').value.trim();
  const body = encodeURIComponent(`Trade-In Request\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nSuburb: ${suburb}\nVehicle: ${make}\nKM: ${km}\nNotes: ${notes}`);
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
