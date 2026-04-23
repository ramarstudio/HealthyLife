(() => {
  'use strict';

  // ═══════ CONFIGURATION ═══════
  // Centralizes all magic numbers and settings in one place
  const CONFIG = {
    waNumber: '51XXXXXXXXX',   // TODO: reemplazar con número real
    maxItemQty: 9,
    navScrollThreshold: 100,
    navHeight: 70,
    parallaxFactor: 0.15,
    reveal: { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    counterThreshold: 0.5,
  };

  // ═══════ PRODUCT DATA — single source of truth ═══════
  const PRODUCTS = [
    { name: 'Pasas rubias',            price50: 2.50, price100:  5.00, premium: false, img: 'assets/img/p-pasas.png'     },
    { name: 'Maní',                    price50: 1.00, price100:  2.00, premium: false, img: 'assets/img/p-mani.png'      },
    { name: 'Arándanos deshidratados', price50: 2.50, price100:  5.00, premium: false, img: 'assets/img/p-arandanos.png' },
    { name: 'Nueces',                  price50: 4.00, price100:  8.00, premium: true,  img: 'assets/img/walnut.svg'      },
    { name: 'Pecanas',                 price50: 4.00, price100:  8.00, premium: true,  img: 'assets/img/p-pecanas.png'   },
    { name: 'Almendras',               price50: 3.50, price100:  7.00, premium: true,  img: 'assets/img/p-almendras.png' },
  ];

  // ═══════ DOM HELPERS ═══════
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ═══════ CART STATE ═══════
  const cart = new Map();

  /**
   * Calculates cart totals from current state.
   * Single source of truth — used by both updateCart() and sendToWa().
   */
  function getCartTotals() {
    const items = [...cart.values()];
    const count = items.reduce((s, i) => s + (i.qty || 1), 0);
    const total = items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    return { items, count, total };
  }

  /**
   * Toggles an item in/out of the cart.
   * Replaces 3 duplicated toggle patterns throughout the codebase.
   */
  function toggleCartItem(el) {
    const name = el.dataset.name;
    const price = parseFloat(el.dataset.price);
    if (!name || isNaN(price)) return;

    if (cart.has(name)) {
      cart.delete(name);
      el.classList.remove('on');
      const qtyEl = $('.qty-val', el);
      if (qtyEl) qtyEl.textContent = '1';
    } else {
      cart.set(name, { name, price, qty: 1 });
      el.classList.add('on');
    }
    updateCart();
  }

  /** Updates the sticky cart UI with current totals. */
  function updateCart() {
    const { count, total } = getCartTotals();
    $('#cartCount').textContent = count === 1 ? '1 producto' : `${count} productos`;
    $('#cartTotal').textContent = `S/ ${total.toFixed(2)}`;
  }

  /** Builds the WhatsApp message and opens the chat. */
  function sendToWa() {
    if (cart.size === 0) {
      alert('Selecciona al menos un producto para enviar tu pedido.');
      return;
    }
    const { items, total } = getCartTotals();
    const lines = items.map(i => {
      const qty = i.qty || 1;
      const subtotal = (i.price * qty).toFixed(2);
      return qty > 1
        ? `• ${i.name} ×${qty} — S/ ${subtotal}`
        : `• ${i.name} — S/ ${subtotal}`;
    }).join('\n');

    const msg = `¡Hola Healthy Life! 🌰\nQuisiera pedir:\n\n${lines}\n\nTotal estimado: S/ ${total.toFixed(2)}\n\n¿Me ayudan con la coordinación del envío?`;
    window.open(`https://wa.me/${CONFIG.waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // ═══════ RENDERERS ═══════

  /** Renders the "Tu favorito" interactive grid in the configurator. */
  function renderFavGrid() {
    const grid = $('#favGrid');
    if (!grid) return;

    grid.innerHTML = PRODUCTS.map(p => `
      <div class="fruto-chip" role="button" tabindex="0"
           data-name="${p.name}" data-price="${p.price50}"
           aria-label="${p.name} — S/ ${p.price50.toFixed(2)} por 50 gr">
        <div class="chip-dot" style="background-image:url('${p.img}')"></div>
        <div class="chip-info">
          <div class="chip-name">${p.name}</div>
          <div class="chip-price">50 gr · S/ ${p.price50.toFixed(2)}</div>
        </div>
        <div class="chip-qty">
          <button class="qty-btn" data-action="minus" aria-label="Reducir cantidad de ${p.name}">−</button>
          <span class="qty-val">1</span>
          <button class="qty-btn" data-action="plus" aria-label="Aumentar cantidad de ${p.name}">+</button>
        </div>
      </div>`).join('');

    $$('.fruto-chip', grid).forEach(el => {
      // Toggle selection (click or keyboard)
      const handleToggle = (e) => {
        if (e.target.closest('.qty-btn')) return;
        toggleCartItem(el);
      };

      el.addEventListener('click', handleToggle);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle(e);
        }
      });

      // Quantity buttons
      $$('.qty-btn', el).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const name = el.dataset.name;
          const price = parseFloat(el.dataset.price);
          if (isNaN(price)) return;

          if (!cart.has(name)) {
            cart.set(name, { name, price, qty: 1 });
            el.classList.add('on');
          }
          const item = cart.get(name);
          if (btn.dataset.action === 'plus') {
            item.qty = Math.min(item.qty + 1, CONFIG.maxItemQty);
          } else {
            item.qty -= 1;
            if (item.qty <= 0) {
              cart.delete(name);
              el.classList.remove('on');
              $('.qty-val', el).textContent = '1';
              updateCart();
              return;
            }
          }
          $('.qty-val', el).textContent = item.qty;
          updateCart();
        });
      });
    });
  }

  /** Renders the individual fruits showcase section. */
  function renderFrutos() {
    const grid = $('#frutosGrid');
    if (!grid) return;

    grid.innerHTML = PRODUCTS.map(p => `
      <div class="fruto${p.premium ? ' premium' : ''}">
        <div class="fruto-img" style="background-image:url('${p.img}')"></div>
        <h4>${p.name}</h4>
        <p class="prices">50 gr · <b>S/ ${p.price50.toFixed(2)}</b><br/>100 gr · <b>S/ ${p.price100.toFixed(2)}</b></p>
      </div>`).join('');
  }

  // ═══════ GENERIC TOGGLE BINDING ═══════
  /**
   * Binds click + keyboard toggle to all elements matching a selector.
   * Adds ARIA role and tabindex for accessibility.
   */
  function initToggleListeners(selector) {
    $$(selector).forEach(el => {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');

      el.addEventListener('click', () => toggleCartItem(el));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCartItem(el);
        }
      });
    });
  }

  // ═══════ SMOOTH SCROLL ═══════
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = $(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.offsetTop - CONFIG.navHeight, behavior: 'smooth' });
          $('.nav-links')?.classList.remove('open');
        }
      });
    });
  }

  // ═══════ MOBILE MENU ═══════
  function initMobileMenu() {
    const toggle = $('.mobile-toggle');
    const navLinks = $('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // ═══════ CART CTA BINDING ═══════
  function initCartCta() {
    const cta = $('#cartCta');
    if (!cta) return;
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      sendToWa();
    });
  }

  // ═══════ SCROLL REVEAL ANIMATIONS ═══════
  function initReveal() {
    const revealSelectors = [
      '.section-head', '.mix-card', '.fruto', '.reel',
      '.config-card', '.why-card', '.step', '.testi',
      '.trust-card', '.about-hero', '.hero-proof',
      '.hero-values', '.social-bar', '.footer-cta',
      '.mixes-poster', '.config-poster', '.about-hero-logo',
    ];

    revealSelectors.forEach(sel => {
      $$(sel).forEach((el, i) => {
        el.classList.add('reveal');
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
      threshold: CONFIG.reveal.threshold,
      rootMargin: CONFIG.reveal.rootMargin,
    });

    $$('.reveal').forEach(el => observer.observe(el));
  }

  // ═══════ ANIMATED COUNTERS ═══════
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

  function initCounters() {
    const counters = $$('.social-bar .stat .n');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();

          if (text.includes('★')) {
            animateValue(el, 0, parseFloat(text.replace('★ ', '')), 1500, '★ ', 1);
          } else if (text.includes('%')) {
            animateValue(el, 0, parseInt(text), 1200, '', 0, '%');
          } else {
            const num = parseInt(text);
            if (!isNaN(num)) animateValue(el, 0, num, 1000);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: CONFIG.counterThreshold });

    counters.forEach(el => observer.observe(el));
  }

  // ═══════ NAV SCROLL EFFECT ═══════
  // Uses CSS class toggle instead of inline style manipulation
  function initNavScroll() {
    const nav = $('.nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > CONFIG.navScrollThreshold);
    }, { passive: true });
  }

  // ═══════ PARALLAX HERO WATERMARK ═══════
  // Throttled with requestAnimationFrame to avoid layout thrashing
  function initParallax() {
    const watermark = $('.hero-watermark');
    if (!watermark) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          watermark.style.transform = `translateY(${window.scrollY * CONFIG.parallaxFactor}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ═══════ LAZY VIDEO LOADING ═══════
  // Videos load only when approaching the viewport, saving ~6.6MB on initial load
  function initLazyVideos() {
    const videos = $$('video[data-src]');
    if (!videos.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          video.src = video.dataset.src;
          video.removeAttribute('data-src');
          video.load();
          observer.unobserve(video);
        }
      });
    }, { rootMargin: '300px' });

    videos.forEach(v => observer.observe(v));
  }

  // ═══════ INITIALIZE EVERYTHING ═══════
  renderFavGrid();
  renderFrutos();

  initToggleListeners('.size-card');
  initToggleListeners('.duo-row.fruto-chip');
  initToggleListeners('.healthy-row.fruto-chip');

  initSmoothScroll();
  initMobileMenu();
  initCartCta();
  initReveal();
  initCounters();
  initNavScroll();
  initParallax();
  initLazyVideos();
})();
