  const WA_NUMBER = 'XXXXXXXXXX'; // reemplazar con número real, ej. 51987654321

  const PRODUCTS = [
    { name: 'Pasas rubias',            price50: 2.50, price100:  5.00, premium: false, img: 'assets/img/p-pasas.png'     },
    { name: 'Maní',                    price50: 1.00, price100:  2.00, premium: false, img: 'assets/img/p-mani.png'      },
    { name: 'Arándanos deshidratados', price50: 2.50, price100:  5.00, premium: false, img: 'assets/img/p-arandanos.png' },
    { name: 'Nueces',                  price50: 4.00, price100:  8.00, premium: true,  img: 'assets/img/walnut.svg'      },
    { name: 'Pecanas',                 price50: 4.00, price100:  8.00, premium: true,  img: 'assets/img/p-pecanas.png'   },
    { name: 'Almendras',               price50: 3.50, price100:  7.00, premium: true,  img: 'assets/img/p-almendras.png' },
  ];

  const cart = new Map(); // key: name -> {name, price, qty}

  function renderFavGrid() {
    const grid = document.getElementById('favGrid');
    grid.innerHTML = PRODUCTS.map(p => `
      <div class="fruto-chip" data-name="${p.name}" data-price="${p.price50}">
        <div class="chip-dot" style="background-image:url('${p.img}')"></div>
        <div class="chip-info">
          <div class="chip-name">${p.name}</div>
          <div class="chip-price">50 gr · S/ ${p.price50.toFixed(2)}</div>
        </div>
        <div class="chip-qty">
          <button class="qty-btn" data-action="minus">−</button>
          <span class="qty-val">1</span>
          <button class="qty-btn" data-action="plus">+</button>
        </div>
      </div>`).join('');

    grid.querySelectorAll('.fruto-chip').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.qty-btn')) return;
        const name = el.dataset.name;
        const price = parseFloat(el.dataset.price);
        if (cart.has(name)) {
          cart.delete(name);
          el.classList.remove('on');
          el.querySelector('.qty-val').textContent = '1';
        } else {
          cart.set(name, { name, price, qty: 1 });
          el.classList.add('on');
        }
        updateCart();
      });

      el.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const name = el.dataset.name;
          const price = parseFloat(el.dataset.price);
          if (!cart.has(name)) {
            cart.set(name, { name, price, qty: 1 });
            el.classList.add('on');
          }
          const item = cart.get(name);
          if (btn.dataset.action === 'plus') {
            item.qty = Math.min(item.qty + 1, 9);
          } else {
            item.qty -= 1;
            if (item.qty <= 0) {
              cart.delete(name);
              el.classList.remove('on');
              el.querySelector('.qty-val').textContent = '1';
              updateCart();
              return;
            }
          }
          el.querySelector('.qty-val').textContent = item.qty;
          updateCart();
        });
      });
    });
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

  // Size-card toggles
  document.querySelectorAll('.size-card').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.dataset.name;
      const price = parseFloat(el.dataset.price);
      if (cart.has(name)) { cart.delete(name); el.classList.remove('on'); }
      else { cart.set(name, { name, price, qty: 1 }); el.classList.add('on'); }
      updateCart();
    });
  });

  // Duo and Healthy Life toggles
  document.querySelectorAll('.duo-row.fruto-chip, .healthy-row.fruto-chip').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.dataset.name;
      const price = parseFloat(el.dataset.price);
      if (cart.has(name)) { cart.delete(name); el.classList.remove('on'); }
      else { cart.set(name, { name, price, qty: 1 }); el.classList.add('on'); }
      updateCart();
    });
  });

  function updateCart() {
    const allItems = [...cart.values()];
    const count = allItems.reduce((s, i) => s + (i.qty || 1), 0);
    const total = allItems.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    document.getElementById('cartCount').textContent = count === 1 ? '1 producto' : `${count} productos`;
    document.getElementById('cartTotal').textContent = `S/ ${total.toFixed(2)}`;
  }

  function sendToWa() {
    if (cart.size === 0) {
      alert('Selecciona al menos un producto para enviar tu pedido.');
      return;
    }
    const lines = [...cart.values()].map(i => {
      const qty = i.qty || 1;
      const subtotal = (i.price * qty).toFixed(2);
      return qty > 1
        ? `• ${i.name} ×${qty} — S/ ${subtotal}`
        : `• ${i.name} — S/ ${subtotal}`;
    }).join('\n');
    const total = [...cart.values()].reduce((s, i) => s + i.price * (i.qty || 1), 0).toFixed(2);
    const msg = `¡Hola Healthy Life! 🌰\nQuisiera pedir:\n\n${lines}\n\nTotal estimado: S/ ${total}\n\n¿Me ayudan con la coordinación del envío?`;
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
  }

  // Smooth scroll + close mobile menu
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
        document.querySelector('.nav-links')?.classList.remove('open');
      }
    });
  });

  // ═══════ SCROLL REVEAL ANIMATIONS ═══════
  function initReveal() {
    // Add reveal class to key elements
    const revealSelectors = [
      '.section-head',
      '.mix-card',
      '.fruto',
      '.reel',
      '.config-card',
      '.why-card',
      '.step',
      '.testi',
      '.trust-card',
      '.about-hero',
      '.hero-proof',
      '.hero-values',
      '.social-bar',
      '.footer-cta',
      '.mixes-poster',
      '.config-poster',
      '.about-hero-logo',
    ];

    revealSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.classList.add('reveal');
        // Stagger items in grids
        const delay = Math.min(i, 4);
        if (delay > 0) el.classList.add(`reveal-delay-${delay}`);
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ═══════ ANIMATED COUNTERS ═══════
  function initCounters() {
    const counters = document.querySelectorAll('.social-bar .stat .n');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();
          const isPercent = text.includes('%');
          const isStar = text.includes('★');

          if (isStar) {
            const num = parseFloat(text.replace('★ ', ''));
            animateValue(el, 0, num, 1500, '★ ', 1);
          } else if (isPercent) {
            const num = parseInt(text);
            animateValue(el, 0, num, 1200, '', 0, '%');
          } else {
            const num = parseInt(text);
            if (!isNaN(num)) animateValue(el, 0, num, 1000);
          }
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  function animateValue(el, start, end, duration, prefix = '', decimals = 0, suffix = '') {
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = start + (end - start) * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ═══════ NAV SCROLL EFFECT ═══════
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        nav.style.background = 'rgba(10,15,10,.88)';
        nav.style.borderBottomColor = 'rgba(106,163,74,.12)';
      } else {
        nav.style.background = 'rgba(10,15,10,.72)';
        nav.style.borderBottomColor = 'rgba(232,228,218,.06)';
      }
      lastScroll = scrollY;
    }, { passive: true });
  }

  // ═══════ PARALLAX HERO WATERMARK ═══════
  function initParallax() {
    const watermark = document.querySelector('.hero-watermark');
    if (!watermark) return;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      watermark.style.transform = `translateY(${scrollY * 0.15}px)`;
    }, { passive: true });
  }

  // Initialize all
  initReveal();
  initCounters();
  initNavScroll();
  initParallax();
