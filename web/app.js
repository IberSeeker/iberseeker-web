/* ============================================
   IberSeeker Visual — JS interacciones
   ============================================ */

(function () {
  // v21: marcamos que JS cargó — el CSS usa html.js-ready para
  // permitir reveals ocultos por defecto (sin JS, todo queda visible)
  document.documentElement.classList.add('js-ready');

  // Header scroll state
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.classList.remove('is-open');
      document.body.style.overflow = '';
    }));
  }

  // Active nav link based on path
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });

  // Reveal on scroll (v21: con stagger para hijos de .reveal-group)
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    // v21: aplicamos --stagger-i a hijos directos de contenedores .reveal-group
    document.querySelectorAll('.reveal-group').forEach(function (group) {
      let i = 0;
      Array.prototype.forEach.call(group.children, function (child) {
        if (child.classList.contains('reveal')) {
          child.style.setProperty('--stagger-i', i);
          i++;
        }
      });
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Gallery filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
        document.querySelectorAll('.gallery-item').forEach(item => {
          if (cat === 'all' || item.dataset.cat === cat) item.style.display = '';
          else item.style.display = 'none';
        });
      });
    });
  }

  // Pre-select pack from query string (form select)
  const params = new URLSearchParams(window.location.search);
  const packParam = params.get('pack');
  const packSelect = document.getElementById('pack');
  if (packParam && packSelect) {
    const opt = Array.from(packSelect.options).find(o => o.value === packParam);
    if (opt) packSelect.value = packParam;
  }

  // Contact form -> mailto
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const pack = (data.get('pack') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      const subject = encodeURIComponent('Solicitud de presupuesto — ' + (name || 'Web IberSeeker Visual'));
      const bodyLines = [
        'Hola IberSeeker Visual,',
        '',
        'Me llamo ' + (name || '[nombre]') + ' y me gustaría solicitar información.',
        pack ? 'Pack de interés: ' + pack : null,
        'Email: ' + (email || '[email]'),
        phone ? 'Teléfono: ' + phone : null,
        '',
        'Mensaje:',
        message || '[escribe aquí los detalles del inmueble: ubicación, tamaño, fecha deseada]',
        '',
        '— Enviado desde iberseeker.com',
      ].filter(Boolean).join('%0D%0A');

      window.location.href = 'mailto:grupo@iberseeker.net?subject=' + subject + '&body=' + bodyLines;
    });
  }

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================
     CART (estilo McDonald's) — página packs
     - Items "extra": múltiples, con cantidad
     - Items "pack": mutuamente exclusivos
     ============================================ */
  const cartEl = document.getElementById('cart');
  if (cartEl) {
    const items = new Map();
    let currentPackId = null;

    const itemsList = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('cart-checkout');
    const whatsappBtn = document.getElementById('cart-whatsapp');

    const formatEUR = function (n) { return n + '€'; };

    function render() {
      itemsList.innerHTML = '';
      let total = 0;
      let count = 0;

      const ordered = Array.from(items.values()).sort(function (a, b) {
        if (a.type === b.type) return 0;
        return a.type === 'pack' ? -1 : 1;
      });

      ordered.forEach(function (item) {
        total += item.price * item.qty;
        count += item.qty;
        const li = document.createElement('li');
        li.className = 'cart-item' + (item.type === 'pack' ? ' cart-item--pack' : '');
        const meta = item.type === 'pack'
          ? '<div class="cart-item-meta">Pack base</div>'
          : '<div class="cart-item-meta">' + item.qty + ' × ' + formatEUR(item.price) + '</div>';
        li.innerHTML =
          '<div>' +
            '<div class="cart-item-name">' + item.name + '</div>' +
            meta +
            '<button class="cart-item-remove" data-remove="' + item.id + '" type="button">Quitar</button>' +
          '</div>' +
          '<div class="cart-item-price">' + formatEUR(item.price * item.qty) + '</div>';
        itemsList.appendChild(li);
      });

      const hasItems = items.size > 0;
      cartEmpty.style.display = hasItems ? 'none' : '';
      itemsList.hidden = !hasItems;
      cartCount.textContent = count;
      cartTotal.textContent = formatEUR(total);
      checkoutBtn.disabled = !hasItems;
      whatsappBtn.disabled = !hasItems;
      cartEl.classList.toggle('has-items', hasItems);
    }

    function syncExtraCard(id) {
      const card = document.querySelector('.extra-card[data-id="' + id + '"]');
      if (!card) return;
      const item = items.get(id);
      if (item) {
        card.classList.add('is-added');
        card.querySelector('.qty-value').textContent = item.qty;
      } else {
        card.classList.remove('is-added');
        card.querySelector('.qty-value').textContent = '1';
      }
    }

    function syncPackCard(id) {
      document.querySelectorAll('.pack[data-pack-id]').forEach(function (card) {
        card.classList.toggle('is-added', card.dataset.packId === id);
      });
    }

    function pulse(card) {
      if (!card) return;
      card.classList.add('just-added');
      setTimeout(function () { card.classList.remove('just-added'); }, 450);
    }

    function addExtra(id, name, price) {
      if (items.has(id)) {
        items.get(id).qty += 1;
      } else {
        items.set(id, { id: id, name: name, price: price, qty: 1, type: 'extra' });
      }
      pulse(document.querySelector('.extra-card[data-id="' + id + '"]'));
      syncExtraCard(id);
      render();
    }

    function changeQty(id, delta) {
      const item = items.get(id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) items.delete(id);
      syncExtraCard(id);
      render();
    }

    function removeItem(id) {
      const item = items.get(id);
      items.delete(id);
      if (item && item.type === 'pack') {
        currentPackId = null;
        syncPackCard(null);
      } else {
        syncExtraCard(id);
      }
      render();
    }

    function togglePack(id, name, price) {
      if (currentPackId === id) {
        items.delete(id);
        currentPackId = null;
        syncPackCard(null);
        render();
        return;
      }
      if (currentPackId && items.has(currentPackId)) {
        items.delete(currentPackId);
      }
      items.set(id, { id: id, name: name, price: price, qty: 1, type: 'pack' });
      currentPackId = id;
      pulse(document.querySelector('.pack[data-pack-id="' + id + '"]'));
      syncPackCard(id);
      render();
      if (window.innerWidth < 1024) {
        cartEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    document.querySelectorAll('.extra-card').forEach(function (card) {
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price, 10);
      card.querySelector('.add-btn').addEventListener('click', function () { addExtra(id, name, price); });
      card.querySelector('.qty-plus').addEventListener('click', function () { changeQty(id, +1); });
      card.querySelector('.qty-minus').addEventListener('click', function () { changeQty(id, -1); });
    });

    document.querySelectorAll('.pack[data-pack-id]').forEach(function (card) {
      const id = card.dataset.packId;
      const name = card.dataset.packName;
      const price = parseInt(card.dataset.packPrice, 10);
      const btn = card.querySelector('.pack-add-btn');
      if (btn) btn.addEventListener('click', function () { togglePack(id, name, price); });
    });

    itemsList.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-remove]');
      if (btn) removeItem(btn.dataset.remove);
    });

    function summary() {
      const packItems = [];
      const extraItems = [];
      let total = 0;
      items.forEach(function (item) {
        const sub = item.price * item.qty;
        total += sub;
        if (item.type === 'pack') {
          packItems.push('• ' + item.name + ' — ' + sub + '€');
        } else {
          extraItems.push('• ' + item.name + ' × ' + item.qty + ' — ' + sub + '€');
        }
      });
      const lines = ['Hola IberSeeker Visual,', '', 'Me gustaría solicitar presupuesto para el siguiente pedido:', ''];
      if (packItems.length) { lines.push('PACK:'); lines.push.apply(lines, packItems); lines.push(''); }
      if (extraItems.length) { lines.push('EXTRAS:'); lines.push.apply(lines, extraItems); lines.push(''); }
      lines.push('TOTAL: ' + total + '€ (IVA no incluido)', '', 'Datos del inmueble:', '— Ubicación:', '— Tamaño aproximado:', '— Fecha deseada:', '', 'Gracias.');
      return lines;
    }

    checkoutBtn.addEventListener('click', function () {
      if (!items.size) return;
      const subject = encodeURIComponent('Solicitud de presupuesto — Web IberSeeker Visual');
      const body = encodeURIComponent(summary().join('\n'));
      window.location.href = 'mailto:grupo@iberseeker.net?subject=' + subject + '&body=' + body;
    });

    whatsappBtn.addEventListener('click', function () {
      if (!items.size) return;
      const text = encodeURIComponent(summary().join('\n'));
      window.open('https://wa.me/34634323162?text=' + text, '_blank', 'noopener');
    });

    const packParam2 = (new URLSearchParams(window.location.search)).get('pack');
    if (packParam2) {
      const map = {
        'Esencial': 'pack-esencial', 'esencial': 'pack-esencial',
        'Visual': 'pack-visual', 'visual': 'pack-visual',
        'Aereo': 'pack-aereo', 'aereo': 'pack-aereo', 'Aéreo': 'pack-aereo',
        'Elite': 'pack-elite', 'elite': 'pack-elite', 'Élite': 'pack-elite'
      };
      const targetId = map[packParam2];
      if (targetId) {
        const card = document.querySelector('.pack[data-pack-id="' + targetId + '"]');
        if (card) togglePack(targetId, card.dataset.packName, parseInt(card.dataset.packPrice, 10));
      }
    }

    render();
  }

  /* ============================================
     BEFORE / AFTER SLIDER
     ============================================ */
  const baSlider = document.getElementById('ba-slider');
  if (baSlider) {
    const before = baSlider.querySelector('.ba-before');
    const handle = baSlider.querySelector('.ba-handle');
    let dragging = false;

    function setPos(percent) {
      const p = Math.max(0, Math.min(100, percent));
      before.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
      handle.style.left = p + '%';
    }
    function onMove(clientX) {
      const rect = baSlider.getBoundingClientRect();
      setPos(((clientX - rect.left) / rect.width) * 100);
    }
    baSlider.addEventListener('mousedown', function (e) { dragging = true; onMove(e.clientX); e.preventDefault(); });
    window.addEventListener('mousemove', function (e) { if (dragging) onMove(e.clientX); });
    window.addEventListener('mouseup', function () { dragging = false; });
    baSlider.addEventListener('touchstart', function (e) { dragging = true; if (e.touches[0]) onMove(e.touches[0].clientX); }, { passive: true });
    baSlider.addEventListener('touchmove', function (e) { if (dragging && e.touches[0]) onMove(e.touches[0].clientX); }, { passive: true });
    baSlider.addEventListener('touchend', function () { dragging = false; });

    setPos(50);
    let step = 0;
    const intro = setInterval(function () {
      step++;
      if (step === 1) setPos(35);
      else if (step === 2) setPos(65);
      else if (step === 3) { setPos(50); clearInterval(intro); }
    }, 700);
  }

  /* ============================================
     STICKY CTA
     ============================================ */
  const stickyCta = document.getElementById('sticky-cta');
  if (stickyCta) {
    const onCtaScroll = function () {
      const scrolled = window.scrollY;
      const showAfter = window.innerHeight * 0.7;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const nearBottom = scrolled + winH > docH - 240;
      stickyCta.classList.toggle('is-visible', scrolled > showAfter && !nearBottom);
    };
    window.addEventListener('scroll', onCtaScroll, { passive: true });
    onCtaScroll();
  }

  /* ============================================
     v20 — NÚMEROS ANIMADOS (stats-hook)
     Cuenta de 0 al valor final cuando entra en viewport.
     Detecta "97%", "+400%", "+11.200€", "3 seg", "68%", etc.
     ============================================ */
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const parseStat = function (raw) {
      // Extrae el número, el prefijo (+), el sufijo (%, €, " seg"), y el separador de miles
      const text = raw.trim();
      const match = text.match(/^(\+?)([\d\.\,]+)(.*)$/);
      if (!match) return null;
      const prefix = match[1] || '';
      const numStr = match[2];
      const suffix = match[3] || '';
      // "11.200" → 11200 (punto español como separador de miles)
      const hasThousandsDot = /^\d{1,3}(\.\d{3})+$/.test(numStr);
      const value = hasThousandsDot ? parseInt(numStr.replace(/\./g, ''), 10) : parseFloat(numStr.replace(',', '.'));
      if (isNaN(value)) return null;
      return { prefix, value, suffix, hasThousandsDot, original: text };
    };

    const formatValue = function (current, meta) {
      let out;
      if (meta.hasThousandsDot) {
        out = Math.round(current).toLocaleString('es-ES');
      } else if (Number.isInteger(meta.value)) {
        out = Math.round(current).toString();
      } else {
        out = current.toFixed(1).replace('.', ',');
      }
      return meta.prefix + out + meta.suffix;
    };

    const animateNumber = function (el, meta) {
      const duration = 1400;
      const start = performance.now();
      const easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
      el.classList.add('is-counting');
      const tick = function (now) {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const current = meta.value * easeOut(t);
        el.textContent = formatValue(current, meta);
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = meta.original;
          el.classList.add('is-done');
        }
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.counted === '1') return;
        el.dataset.counted = '1';
        const meta = parseStat(el.textContent);
        if (!meta) { io.unobserve(el); return; }
        if (prefersReduced) {
          el.classList.add('is-counting', 'is-done');
          io.unobserve(el);
          return;
        }
        // Guardo el texto original y arranco desde 0
        el.textContent = formatValue(0, meta);
        animateNumber(el, meta);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });

    statNumbers.forEach(function (el) { io.observe(el); });
  }

  /* ============================================
     v20 — FEEDBACK "AÑADIDO" EN BOTONES
     Al pulsar "Añadir al pedido" o "+ Añadir", el botón
     cambia a estado is-added por 1.4s (visual). La lógica
     de carrito ya está gestionada arriba por sus propios listeners.
     ============================================ */
  const wireAddedFeedback = function (selector) {
    document.querySelectorAll(selector).forEach(function (btn) {
      // Inyecto el check si el botón es .pack-v2-add-btn y no lo tiene ya
      if (btn.classList.contains('pack-v2-add-btn') && !btn.querySelector('.add-check')) {
        const check = document.createElement('span');
        check.className = 'add-check';
        check.setAttribute('aria-hidden', 'true');
        check.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Añadido';
        btn.appendChild(check);
      }
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-added')) return;
        btn.classList.add('is-added');
        setTimeout(function () { btn.classList.remove('is-added'); }, 1400);
      });
    });
  };
  wireAddedFeedback('.pack-v2-add-btn');
  wireAddedFeedback('.extra-card .add-btn, .extras-mcd-grid .add-btn');

  /* ============================================
     v21 — PARALLAX SUAVE EN HERO (index.html)
     La imagen se desplaza a la mitad de velocidad del scroll,
     dando profundidad. Sólo en escritorio (móvil desactivado por CSS).
     ============================================ */
  const heroImage = document.querySelector('.hero .hero-image');
  const heroSection = document.querySelector('.hero');
  if (heroImage && heroSection) {
    const prefersReducedP = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedP) {
      let heroTicking = false;
      const updateHeroParallax = function () {
        const rect = heroSection.getBoundingClientRect();
        // Sólo calculamos mientras el hero está en/cerca de viewport
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          heroTicking = false;
          return;
        }
        // Cuanto más scroll, más translate. 0.35 = velocidad relativa
        const offset = Math.round(window.scrollY * 0.35);
        heroImage.style.setProperty('--hero-parallax', offset + 'px');
        heroTicking = false;
      };
      window.addEventListener('scroll', function () {
        if (!heroTicking) {
          window.requestAnimationFrame(updateHeroParallax);
          heroTicking = true;
        }
      }, { passive: true });
      updateHeroParallax();
    }
  }

  /* v21 — Cursor personalizado eliminado a petición del usuario */
})();
