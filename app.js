const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/your_payment_link';
const PAYPAL_CHECKOUT_LINK = 'https://www.paypal.com/checkoutnow?token=YOURTOKEN';

let inventory = [];
let cart = [];

async function getInventory() {
  try {
    const res = await fetch('/data/inventory.json?t=' + Date.now());
    const cars = await res.json();
    if (cars.length > 0) return cars;
  } catch(e) {}
  return [
    {id:1, make:'Toyota', model:'Camry Hybrid', year:2022, price:39990, odo:22000, images:['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'], desc:'Excellent condition, full service history.', fuel:'Hybrid', trans:'Automatic', status:'available'},
    {id:2, make:'Tesla', model:'Model 3', year:2023, price:58990, odo:8000, images:['https://images.unsplash.com/photo-1511396275271-7d1a0e3b86fc?w=800&q=80'], desc:'Like new, single owner.', fuel:'Electric', trans:'Automatic', status:'available'},
    {id:3, make:'Mazda', model:'CX-5', year:2021, price:34990, odo:30000, images:['https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&q=80'], desc:'Great family SUV, RWC included.', fuel:'Petrol', trans:'Automatic', status:'available'},
    {id:4, make:'BMW', model:'X5', year:2020, price:72990, odo:45000, images:['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'], desc:'Luxury SUV, all options.', fuel:'Diesel', trans:'Automatic', status:'available'},
    {id:5, make:'Hyundai', model:'i30 N', year:2022, price:42990, odo:15000, images:['https://images.unsplash.com/photo-1541447271487-09612b3f49f9?w=800&q=80'], desc:'Performance hatch, low kms.', fuel:'Petrol', trans:'Manual', status:'available'}
  ];
}

// ── Car Detail Modal ──────────────────────────────────────────
function openCarDetail(id) {
  const car = inventory.find(c => String(c.id) === String(id));
  if (!car) return;

  const images = car.images && car.images.length ? car.images : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'];
  const videos = car.videos && car.videos.length ? car.videos : [];
  const km = car.odo || car.km || 0;

  // Thumbnail gallery (images + video thumbnails)
  const thumbsHTML = [
    ...images.map((img, i) => `
      <img src="${img}" onclick="switchMainMedia('img','${img}')"
        style="width:70px;height:52px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid ${i===0?'#e8a020':'#ddd'};">`),
    ...videos.map(v => `
      <div onclick="switchMainMedia('video','${v}')"
        style="width:70px;height:52px;border-radius:6px;cursor:pointer;border:2px solid #6c63ff;background:#111;display:flex;align-items:center;justify-content:center;font-size:22px;">
        🎥
      </div>`)
  ].join('');

  const galleryHTML = (images.length > 1 || videos.length > 0)
    ? `<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">${thumbsHTML}</div>`
    : '';

  const payMethods = car.payment && car.payment.methods && car.payment.methods.length
    ? `<div style="margin-top:12px;"><strong>Payment:</strong> ${car.payment.methods.map(m=>`<span style="background:#f0f0f0;padding:3px 10px;border-radius:20px;font-size:13px;margin-right:4px;">${m}</span>`).join('')}</div>`
    : '';

  const statusColor = car.status==='available'?'green':car.status==='sold'?'red':'orange';

  const modalHTML = `
    <div id="carModal" onclick="closeModalOutside(event)" style="
      position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;
      display:flex;align-items:center;justify-content:center;padding:20px;">
      <div style="background:#fff;border-radius:16px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;position:relative;">

        <button onclick="closeCarDetail()" style="
          position:absolute;top:12px;right:12px;background:#333;color:#fff;
          border:none;border-radius:50%;width:32px;height:32px;font-size:18px;
          cursor:pointer;z-index:10;line-height:1;">✕</button>

        <!-- Main media (image or video) -->
        <div id="mainMediaContainer" style="width:100%;height:320px;border-radius:16px 16px 0 0;overflow:hidden;background:#000;">
          <img id="mainCarImg" src="${images[0]}" alt="${car.make} ${car.model}"
            style="width:100%;height:100%;object-fit:cover;">
        </div>

        ${galleryHTML}

        <div style="padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
            <div>
              <h2 style="font-size:22px;font-weight:800;margin:0;">${car.year} ${car.make} ${car.model}${car.variant?' '+car.variant:''}</h2>
              <div style="color:#888;font-size:14px;margin-top:4px;">
                ${car.body||''} ${car.colour?'· '+car.colour:''}
                ${car.status?'· <strong style="color:'+statusColor+'">'+car.status.toUpperCase()+'</strong>':''}
                ${videos.length?'· <span style="color:#6c63ff;font-weight:700;">🎥 Video Available</span>':''}
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:26px;font-weight:800;color:#e8a020;">$${Number(car.price).toLocaleString()}</div>
              ${car.financeWeekly?`<div style="font-size:13px;color:#888;">From $${car.financeWeekly}/week</div>`:''}
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0;background:#f8f8f8;border-radius:10px;padding:16px;">
            ${car.odo?`<div><span style="color:#888;font-size:12px;">ODOMETER</span><br><strong>${Number(km).toLocaleString()} km</strong></div>`:''}
            ${car.trans?`<div><span style="color:#888;font-size:12px;">TRANSMISSION</span><br><strong>${car.trans}</strong></div>`:''}
            ${car.fuel?`<div><span style="color:#888;font-size:12px;">FUEL TYPE</span><br><strong>${car.fuel}</strong></div>`:''}
            ${car.rego?`<div><span style="color:#888;font-size:12px;">REGO</span><br><strong>${car.rego}</strong></div>`:''}
            ${car.sku?`<div><span style="color:#888;font-size:12px;">SKU</span><br><strong>${car.sku}</strong></div>`:''}
            ${car.deposit?`<div><span style="color:#888;font-size:12px;">DEPOSIT</span><br><strong>$${Number(car.deposit).toLocaleString()}</strong></div>`:''}
          </div>

          ${car.desc?`<div style="margin-bottom:16px;"><strong>Description</strong><p style="color:#555;font-size:14px;margin-top:6px;line-height:1.6;">${car.desc}</p></div>`:''}
          ${payMethods}

          <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
            <button onclick="addToCart(${car.id});closeCarDetail();" style="
              flex:1;padding:14px;background:#e8a020;color:#000;border:none;
              border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;">
              🛒 Add to Cart
            </button>
            <a href="tel:+61470469919" style="
              flex:1;padding:14px;background:#222;color:#fff;
              border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;
              text-align:center;text-decoration:none;">
              📞 Call Us
            </a>
          </div>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.body.style.overflow = 'hidden';
}

function switchMainMedia(type, src) {
  const container = document.getElementById('mainMediaContainer');
  if (type === 'img') {
    container.innerHTML = `<img id="mainCarImg" src="${src}" style="width:100%;height:100%;object-fit:cover;">`;
  } else {
    container.innerHTML = `<video src="${src}" controls autoplay style="width:100%;height:100%;object-fit:contain;background:#000;"></video>`;
  }
}

function closeCarDetail() {
  const modal = document.getElementById('carModal');
  if (modal) modal.remove();
  document.body.style.overflow = '';
}

function closeModalOutside(e) {
  if (e.target.id === 'carModal') closeCarDetail();
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
    const hasVideo = car.videos && car.videos.length > 0;
    const card = document.createElement('div');
    card.className = 'card draggable';
    card.draggable = true;
    card.dataset.id = car.id;
    card.innerHTML = `
      <div style="position:relative;cursor:pointer;" onclick="openCarDetail(${JSON.stringify(car.id)})">
        <img src="${img}" alt="${car.make} ${car.model}"
          style="width:100%;height:200px;object-fit:cover;border-radius:8px 8px 0 0;">
        ${hasVideo?'<div style="position:absolute;top:8px;right:8px;background:#6c63ff;color:#fff;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;">🎥 VIDEO</div>':''}
      </div>
      <div class="card-body">
        <div class="badge">Used</div>
        <div class="badge">${car.year}</div>
        <div class="badge">${Number(km).toLocaleString()} km</div>
        ${car.trans?`<div class="badge">${car.trans}</div>`:''}
        ${car.fuel?`<div class="badge">${car.fuel}</div>`:''}
        <h4 style="cursor:pointer;" onclick="openCarDetail(${JSON.stringify(car.id)})">${car.make} ${car.model}${car.variant?' '+car.variant:''}</h4>
        ${car.desc?`<p style="font-size:13px;color:#666;margin:6px 0 8px;">${car.desc.substring(0,100)}${car.desc.length>100?'...':''}</p>`:''}
        <div class="price">$${Number(car.price).toLocaleString()}</div>
        ${car.financeWeekly?`<div style="font-size:13px;color:#888;margin-bottom:8px;">Finance from $${car.financeWeekly}/week</div>`:''}
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(car.id)})">Add to Cart</button>
          <button onclick="openCarDetail(${JSON.stringify(car.id)})"
            style="padding:10px 16px;border:2px solid #e8a020;background:transparent;color:#e8a020;border-radius:6px;cursor:pointer;font-weight:600;">
            View Details
          </button>
        </div>
        <div class="drag-hint">or drag this card into the cart →</div>
      </div>`;
    card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', car.id); });
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
    e.preventDefault(); cartBox.style.background = '';
    addToCart(e.dataTransfer.getData('text/plain'));
  });
}

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

function checkoutStripe()  { window.location.href = STRIPE_PAYMENT_LINK; }
function checkoutPayPal()  { window.location.href = PAYPAL_CHECKOUT_LINK; }

function submitPreApproval(e) {
  e.preventDefault();
  const name=document.getElementById('paName').value.trim(), phone=document.getElementById('paPhone').value.trim(),
    email=document.getElementById('paEmail').value.trim(), suburb=document.getElementById('paSuburb').value.trim(),
    car=document.getElementById('paCar').value.trim(), deposit=document.getElementById('paDeposit').value.trim(),
    term=document.getElementById('paTerm').value, income=document.getElementById('paIncome').value.trim();
  if (!document.getElementById('paConsent').checked) { alert('Please consent to be contacted.'); return false; }
  const body = encodeURIComponent(`Finance Pre-Approval\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nSuburb: ${suburb}\nCar: ${car}\nDeposit: ${deposit}\nTerm: ${term}\nMonthly Income: ${income}`);
  window.location.href = `mailto:sales@premiumcarhub.com.au?subject=Finance%20Pre-Approval&body=${body}`;
  return false;
}

function submitTradeIn(e) {
  e.preventDefault();
  const name=document.getElementById('tiName').value.trim(), phone=document.getElementById('tiPhone').value.trim(),
    email=document.getElementById('tiEmail').value.trim(), suburb=document.getElementById('tiSuburb').value.trim(),
    make=document.getElementById('tiMake').value.trim(), km=document.getElementById('tiKm').value.trim(),
    notes=document.getElementById('tiNotes').value.trim();
  const body = encodeURIComponent(`Trade-In Request\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nSuburb: ${suburb}\nVehicle: ${make}\nKM: ${km}\nNotes: ${notes}`);
  window.location.href = `mailto:sales@premiumcarhub.com.au?subject=Trade-In%20Appraisal&body=${body}`;
  return false;
}

window.addEventListener('DOMContentLoaded', async () => {
  inventory = await getInventory();
  updateMakeFilter();
  renderInventory();
  setupCartDnD();
});
