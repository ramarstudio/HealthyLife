const WA = '51999999999';
let cart = JSON.parse(localStorage.getItem('hl2-cart')||'[]');
let cartOpen = false;
let selPayment = 'Yape';
let selIngredients = [];
let selWeight = 50;

// ── TICKER ──
(function(){
  const items = [
    'Tu cuerpo es tu templo — aliméntalo bien',
    'Comer sano no es dieta, es estilo de vida',
    'Pequeños cambios, grandes resultados',
    'Nutre tu mente, nutre tu cuerpo',
    'La mejor inversión eres tú',
    'Energía natural para días extraordinarios',
    'Lo que comes hoy, lo sientes mañana',
    'Bienestar empieza desde adentro'
  ];
  const el = document.getElementById('ticker-inner');
  const full = [...items,...items].map(t=>`<span class="ticker-item">${t}<span class="ticker-sep"></span></span>`).join('');
  el.innerHTML = full + full;
})();

// ── CART ──
function saveCart(){ localStorage.setItem('hl2-cart', JSON.stringify(cart)); }

function addToCart(name, price){
  const ex = cart.find(i=>i.name===name);
  if(ex){ ex.qty++; } else { cart.push({name,price,qty:1}); }
  saveCart(); renderCart();
  if(!cartOpen) openCart();
  const b = document.getElementById('cart-badge');
  b.style.transform='scale(1.7)';
  setTimeout(()=>{ b.style.transform='scale(1)'; },200);
}

function chQty(name,d){
  const it = cart.find(i=>i.name===name);
  if(!it) return;
  it.qty+=d;
  if(it.qty<=0){ cart=cart.filter(i=>i.name!==name); }
  saveCart(); renderCart();
}

function renderCart(){
  const body = document.getElementById('cart-body');
  const empty = document.getElementById('cart-empty');
  const total = document.getElementById('cart-total');
  const badge = document.getElementById('cart-badge');
  const btn   = document.getElementById('checkout-btn');
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  const totalAmt = cart.reduce((s,i)=>s+i.price*i.qty,0);
  badge.textContent = totalQty;
  totalQty>0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
  total.textContent = 'S/ '+totalAmt.toFixed(2);
  btn.disabled = cart.length===0;
  Array.from(body.querySelectorAll('.cart-item')).forEach(e=>e.remove());
  if(cart.length===0){ empty.style.display=''; }
  else {
    empty.style.display='none';
    cart.forEach(it=>{
      const r=document.createElement('div');
      r.className='cart-item';
      r.innerHTML=`<div class="ci-name">${it.name}</div>
        <div class="ci-qty">
          <button class="q-btn" onclick="chQty('${it.name.replace(/'/g,"\\'")}', -1)">−</button>
          <span style="font-size:.82rem;font-weight:600;min-width:16px;text-align:center;">${it.qty}</span>
          <button class="q-btn" onclick="chQty('${it.name.replace(/'/g,"\\'")}', 1)">+</button>
        </div>
        <div class="ci-price">S/ ${(it.price*it.qty).toFixed(2)}</div>`;
      body.appendChild(r);
    });
  }
}

function toggleCart(){ cartOpen=!cartOpen; document.getElementById('cart-panel').classList.toggle('open',cartOpen); }
function openCart(){ cartOpen=true; document.getElementById('cart-panel').classList.add('open'); }

function selPay(m){
  selPayment=m;
  document.querySelectorAll('.pay-btn').forEach(b=>b.classList.remove('active'));
  const map={Yape:'pb-yape',Efectivo:'pb-efectivo',Contraentrega:'pb-contra'};
  document.getElementById(map[m]).classList.add('active');
}

function checkout(){
  if(!cart.length) return;
  const lines=cart.map(i=>`• ${i.name} x${i.qty} = S/ ${(i.price*i.qty).toFixed(2)}`).join('%0A');
  const tot=cart.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2);
  const msg=`¡Hola! Quiero hacer un pedido:%0A%0A${lines}%0A%0A*Total: S/ ${tot}*%0APago: ${selPayment}%0A%0A¿Cómo coordino la entrega?`;
  window.open(`https://wa.me/${WA}?text=${msg}`,'_blank');
}

// ── NAV + MANCHA WA ──
document.getElementById('nav-wa-btn').addEventListener('click',function(e){
  e.preventDefault();
  const m=encodeURIComponent('¡Hola! Me interesa hacer un pedido de frutos secos. ¿Cuál es su disponibilidad?');
  window.open(`https://wa.me/${WA}?text=${m}`,'_blank');
});
document.getElementById('mancha-wa-btn').addEventListener('click',function(e){
  e.preventDefault();
  const m=encodeURIComponent('¡Hola! Somos un grupo y queremos aprovechar el descuento Pack en Mancha. ¿Cómo lo coordinamos?');
  window.open(`https://wa.me/${WA}?text=${m}`,'_blank');
});

// ── MIX BUILDER ──
function toggleIng(el){
  el.classList.toggle('selected');
  selIngredients=Array.from(document.querySelectorAll('.ing-toggle.selected')).map(e=>e.dataset.name);
  updateBuilderPrice();
  document.getElementById('allergen-note').style.display=selIngredients.length>0?'block':'none';
}

function setW(btn,w){
  selWeight=w;
  document.querySelectorAll('.w-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  updateBuilderPrice();
}

const prices50={'Pasas Rubias':2.50,'Maní':1.00,'Arándanos':2.50,'Nueces':4.00,'Pecanas':4.00,'Almendras':3.50};

function updateBuilderPrice(){
  const el=document.getElementById('b-price');
  if(!selIngredients.length){ el.textContent='—'; return; }
  const avg=selIngredients.reduce((s,n)=>s+prices50[n],0)/selIngredients.length;
  const p=selWeight===50?avg:avg*1.85;
  el.textContent=p.toFixed(2);
}

function addCustomMix(){
  if(!selIngredients.length){ alert('Selecciona al menos un fruto seco para tu mix.'); return; }
  const label=`Mix (${selIngredients.join(', ')}) ${selWeight}gr`;
  const avg=selIngredients.reduce((s,n)=>s+prices50[n],0)/selIngredients.length;
  const p=selWeight===50?avg:avg*1.85;
  addToCart(label,parseFloat(p.toFixed(2)));
}

renderCart();