
// Replace with your live Payment Links
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/14A28teIvfcEbBRaxuf7i00';
const PAYPAL_CHECKOUT_LINK = 'https://www.paypal.com/checkoutnow?token=TESTTOKEN';

const inventory = [
  {id:1, make:'Toyota', model:'Camry Hybrid', year:2022, price:39990, km:22000, img:'car1.jpg'},
  {id:2, make:'Tesla', model:'Model 3', year:2023, price:58990, km:8000, img:'car2.jpg'},
  {id:3, make:'Mazda', model:'CX-5', year:2021, price:34990, km:30000, img:'car3.jpg'},
  {id:4, make:'BMW', model:'X5', year:2020, price:72990, km:45000, img:'car4.jpg'},
  {id:5, make:'Hyundai', model:'i30 N', year:2022, price:42990, km:15000, img:'car5.jpg'}
];
let cart = [];

function renderInventory(list=inventory){
  const grid = document.querySelector('#inventoryGrid');
  grid.innerHTML = '';
  list.forEach(car => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="/assets/${car.img}" alt="${car.make} ${car.model}">
      <div class="card-body">
        <div class="badge">Used</div>
        <div class="badge">${car.year}</div>
        <div class="badge">${car.km.toLocaleString()} km</div>
        <h4>${car.make} ${car.model}</h4>
        <div class="price">$${car.price.toLocaleString()}</div>
        <button class="btn btn-primary" onclick="addToCart(${car.id})">Add to Cart</button>
      </div>`;
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
    const price = item.mode==='sale' ? item.price : Math.round(item.price*0.0199*60);
    subtotal += price*item.qty;
    const line = document.createElement('div');
    line.style.display='flex';
    line.style.justifyContent='space-between';
    line.style.gap='6px';
    line.innerHTML = `
      <div>
        <strong>${item.make} ${item.model}</strong><br>
        <small>${item.year} • ${item.km.toLocaleString()} km</small>
      </div>
      <div>
        <div>
          <button class="btn ${item.mode==='sale'?'btn-primary':''}" onclick="setMode(${item.id},'sale')">Sale</button>
          <button class="btn ${item.mode==='finance'?'btn-primary':''}" onclick="setMode(${item.id},'finance')">Finance</button>
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

function checkoutStripe(){ window.open(STRIPE_PAYMENT_LINK,'_blank'); }
function checkoutPayPal(){ window.open(PAYPAL_CHECKOUT_LINK,'_blank'); }

function submitPreApproval(e){
  e.preventDefault();
  const body = encodeURIComponent(`Finance Pre-Approval
Name: ${paName.value}
Phone: ${paPhone.value}
Email: ${paEmail.value}
Suburb: ${paSuburb.value}
Car: ${paCar.value}
Deposit: ${paDeposit.value}
Term: ${paTerm.value}
Monthly Income: ${paIncome.value}`);
  window.location.href = `mailto:sales@premiumcarhub.com.au?subject=Finance%20Pre-Approval&body=${body}`;
}

function submitTradeIn(e){
  e.preventDefault();
  const body = encodeURIComponent(`Trade-In Request
Name: ${tiName.value}
Phone: ${tiPhone.value}
Email: ${tiEmail.value}
Suburb: ${tiSuburb.value}
Vehicle: ${tiMake.value}
KM: ${tiKm.value}
Notes: ${tiNotes.value}`);
  window.location.href = `mailto:sales@premiumcarhub.com.au?subject=Trade-In%20Appraisal&body=${body}`;
}

window.addEventListener('DOMContentLoaded', ()=>{ renderInventory(); });
