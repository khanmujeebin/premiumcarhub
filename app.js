
// Replace with your live Payment Links
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/your_payment_link';
const PAYPAL_CHECKOUT_LINK = 'https://www.paypal.com/checkoutnow?token=YOURTOKEN';

const inventory = [
  {id:1, make:'Toyota', model:'Camry Hybrid', year:2022, price:39990, km:22000, img:'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'},
  {id:2, make:'Tesla', model:'Model 3', year:2023, price:58990, km:8000, img:'https://images.unsplash.com/photo-1511396275271-7d1a0e3b86fc'},
  {id:3, make:'Mazda', model:'CX-5', year:2021, price:34990, km:30000, img:'https://images.unsplash.com/photo-1549924231-f129b911e442'},
  {id:4, make:'BMW', model:'X5', year:2020, price:72990, km:45000, img:'https://images.unsplash.com/photo-1555215695-3004980ad54e'},
  {id:5, make:'Hyundai', model:'i30 N', year:2022, price:42990, km:15000, img:'https://images.unsplash.com/photo-1541447271487-09612b3f49f9'}
];
let cart = [];

function renderInventory(list=inventory){
  const grid = document.querySelector('#inventoryGrid');
  grid.innerHTML = '';
  list.forEach(car => {
    const card = document.createElement('div');
    card.className = 'card draggable';
    card.draggable = true;
    card.dataset.id = car.id;
    card.innerHTML = `
      <img src="${car.img}&w=800&q=80" alt="${car.make} ${car.model}">
      <div class="card-body">
        <div class="badge">Used</div>
        <div class="badge">${car.year}</div>
        <div class="badge">${car.km.toLocaleString()} km</div>
        <h4>${car.make} ${car.model}</h4>
        <div class="price">$${car.price.toLocaleString()}</div>
        <button class="btn btn-primary" onclick="addToCart(${car.id})">Add to Cart</button>
        <div class="drag-hint">or drag this card into the cart →</div>
      </div>`;
    card.addEventListener('dragstart', e=>{
      e.dataTransfer.setData('text/plain', car.id);
    });
    grid.appendChild(card);
  });
}

function addToCart(id){
  const existing = cart.find(c=>c.id===id);
  if(existing){ existing.qty++; }
  else{ cart.push({...inventory.find(c=>c.id===id), qty:1, mode:'sale'}); }
  renderCart();
}

function renderCart(){
  const el = document.querySelector('#cartLines');
  el.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item=>{
    const price = item.mode==='sale' ? item.price : Math.round(item.price*0.0199*60); // demo finance calc
    subtotal += price*item.qty;
    const line = document.createElement('div');
    line.className='line';
    line.innerHTML = `
      <div>
        <strong>${item.make} ${item.model}</strong><br>
        <small>${item.year} • ${item.km.toLocaleString()} km</small>
      </div>
      <div>
        <div class='toggle'>
          <button onclick="setMode(${item.id},'sale')" class="${item.mode==='sale'?'active':''}">Sale</button>
          <button onclick="setMode(${item.id},'finance')" class="${item.mode==='finance'?'active':''}">Finance</button>
        </div>
        <div style='text-align:right;margin-top:6px'><strong>$${price.toLocaleString()}</strong></div>
      </div>`;
    el.appendChild(line);
  });
  document.querySelector('#subtotal').textContent = '$'+subtotal.toLocaleString();
}

function setMode(id, mode){
  const it = cart.find(i=>i.id===id);
  if(it){ it.mode = mode; }
  renderCart();
}

function setupCartDnD(){
  const cartBox = document.querySelector('#cartBox');
  cartBox.addEventListener('dragover', e=>{e.preventDefault(); cartBox.style.background='#f2f7ff';});
  cartBox.addEventListener('dragleave', ()=> cartBox.style.background='');
  cartBox.addEventListener('drop', e=>{
    e.preventDefault();
    cartBox.style.background='';
    const id = parseInt(e.dataTransfer.getData('text/plain'),10);
    addToCart(id);
  });
}

function filterInventory(){
  const q = document.querySelector('#search').value.toLowerCase();
  const make = document.querySelector('#make').value;
  const filtered = inventory.filter(c=>{
    const matchesText = (c.make+' '+c.model).toLowerCase().includes(q);
    const matchesMake = !make || c.make===make;
    return matchesText && matchesMake;
  });
  renderInventory(filtered);
}

function checkoutStripe(){
  window.location.href = STRIPE_PAYMENT_LINK;
}
function checkoutPayPal(){
  window.location.href = PAYPAL_CHECKOUT_LINK;
}

function submitPreApproval(e){
  e.preventDefault();
  const name = document.getElementById('paName').value.trim();
  const phone = document.getElementById('paPhone').value.trim();
  const email = document.getElementById('paEmail').value.trim();
  const suburb = document.getElementById('paSuburb').value.trim();
  const car = document.getElementById('paCar').value.trim();
  const deposit = document.getElementById('paDeposit').value.trim();
  const term = document.getElementById('paTerm').value;
  const income = document.getElementById('paIncome').value.trim();
  if(!document.getElementById('paConsent').checked){ alert('Please consent to be contacted.'); return false; }
  const body = encodeURIComponent(`Finance Pre-Approval
Name: ${name}
Phone: ${phone}
Email: ${email}
Suburb: ${suburb}
Car: ${car}
Deposit: ${deposit}
Term: ${term}
Monthly Income: ${income}`);
  window.location.href = `mailto:sales@premiumcarhub.com.au?subject=Finance%20Pre-Approval&body=${body}`;
  return false;
}

function submitTradeIn(e){
  e.preventDefault();
  const name = document.getElementById('tiName').value.trim();
  const phone = document.getElementById('tiPhone').value.trim();
  const email = document.getElementById('tiEmail').value.trim();
  const suburb = document.getElementById('tiSuburb').value.trim();
  const make = document.getElementById('tiMake').value.trim();
  const km = document.getElementById('tiKm').value.trim();
  const notes = document.getElementById('tiNotes').value.trim();
  const body = encodeURIComponent(`Trade-In Request
Name: ${name}
Phone: ${phone}
Email: ${email}
Suburb: ${suburb}
Vehicle: ${make}
KM: ${km}
Notes: ${notes}`);
  window.location.href = `mailto:sales@premiumcarhub.com.au?subject=Trade-In%20Appraisal&body=${body}`;
  return false;
}

window.addEventListener('DOMContentLoaded', ()=>{
  renderInventory();
  setupCartDnD();
});
