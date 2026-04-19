  const WA_NUMBER = 'XXXXXXXXXX'; // reemplazar con número real, ej. 51987654321

  const PRODUCTS = [
    { name: 'Pasas rubias',            price50: 2.50, price100:  5.00, premium: false, img: 'assets/img/p-pasas.png'     },
    { name: 'Maní',                    price50: 1.00, price100:  2.00, premium: false, img: 'assets/img/p-mani.png'      },
    { name: 'Arándanos deshidratados', price50: 2.50, price100:  5.00, premium: false, img: 'assets/img/p-arandanos.png' },
    { name: 'Nueces',                  price50: 4.00, price100:  8.00, premium: true,  img: 'assets/img/walnut.svg'      },
    { name: 'Pecanas',                 price50: 4.00, price100:  8.00, premium: true,  img: 'assets/img/p-pecanas.png'   },
    { name: 'Almendras',               price50: 3.50, price100:  7.00, premium: true,  img: 'assets/img/p-almendras.png' },
  ];

  function renderFavGrid() {
    const grid = document.getElementById('favGrid');
    grid.innerHTML = PRODUCTS.map(p => `
      <div class="fruto-chip" data-name="${p.name}" data-price="${p.price50}">
        <div class="chip-dot" style="background-image:url('${p.img}')"></div>
        <div class="chip-info">
          <div class="chip-name">${p.name}</div>
          <div class="chip-price">50 gr · S/ ${p.price50.toFixed(2)}</div>
        </div>
      </div>`).join('');
  }
  renderFavGrid();

  function renderFrutos() {
    const grid = document.getElementById('frutosGrid');
    grid.innerHTML = PRODUCTS.map(p => `
      <div class="fruto${p.premium ? ' premium' : ''}">
        <div class="fruto-img" style="background-image:url('${p.img}')"></div>
        <h4>${p.name}</h4>
        <p class="prices">50 gr · <b>S/ ${p.price50.toFixed(2)}</b><br/>100 gr · <b>S/ ${p.price100.toFixed(2)}</b></p>
      </div>`).join('');
  }
  renderFrutos();

  // Cart logic
  const cart = new Map(); // key: name -> {name, price}
  document.querySelectorAll('.fruto-chip').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.dataset.name;
      const price = parseFloat(el.dataset.price);
      if (cart.has(name)) { cart.delete(name); el.classList.remove('on'); }
      else { cart.set(name, {name, price}); el.classList.add('on'); }
      updateCart();
    });
  });
  document.querySelectorAll('.size-card').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.dataset.name;
      const price = parseFloat(el.dataset.price);
      if (cart.has(name)) { cart.delete(name); el.classList.remove('on'); }
      else { cart.set(name, {name, price}); el.classList.add('on'); }
      updateCart();
    });
  });
  function updateCart(){
    const count = cart.size;
    const total = [...cart.values()].reduce((s,i)=>s+i.price, 0);
    document.getElementById('cartCount').textContent = count === 1 ? '1 producto' : `${count} productos`;
    document.getElementById('cartTotal').textContent = `S/ ${total.toFixed(2)}`;
  }
  function sendToWa(){
    if(cart.size === 0){
      alert('Selecciona al menos un producto para enviar tu pedido.');
      return;
    }
    const lines = [...cart.values()].map(i=>`• ${i.name} — S/ ${i.price.toFixed(2)}`).join('\n');
    const total = [...cart.values()].reduce((s,i)=>s+i.price, 0).toFixed(2);
    const msg = `¡Hola Healthy Life! 🌰\nQuisiera pedir:\n\n${lines}\n\nTotal estimado: S/ ${total}\n\n¿Me ayudan con la coordinación del envío?`;
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
  }

  // Smooth scroll + close mobile menu
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({top: target.offsetTop - 70, behavior:'smooth'});
        document.querySelector('.nav-links')?.classList.remove('open');
      }
    });
  });
