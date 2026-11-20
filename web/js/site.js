(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) document.documentElement.classList.add('js');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Página actual ---------- */
  var current = document.body.dataset.page || 'inicio';
  $$('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.dataset.nav === current); });

  /* ---------- Cabecera y menú ---------- */
  var top = $('#top'), mbar = $('#mbar'), menu = $('#menu'), burger = $('#burger'), mclose = $('#menuClose');
  function setMenu(o) { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o)); mclose.hidden = !o; document.body.style.overflow = o ? 'hidden' : ''; }
  burger.addEventListener('click', function () { setMenu(true); });
  mclose.addEventListener('click', function () { setMenu(false); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  var heroEl = document.querySelector('.hero');
  function sync() {
    var y = window.scrollY;
    var over = current === 'inicio' && !!heroEl && y < heroEl.offsetHeight - 90;
    top.classList.toggle('over', over);
    top.classList.toggle('scrolled', !over && y > 10);
    var show = current !== 'contacto' && current !== 'packs' && y > window.innerHeight * 0.6;
    mbar.classList.toggle('on', show);
  }
  window.addEventListener('scroll', sync, { passive: true });

  /* ---------- Vídeo de portada ---------- */
  if (document.getElementById('heroVideo')) {
    var hv = $('#heroVideo');
    var tall = window.matchMedia('(max-width: 700px) and (max-aspect-ratio: 1/1)').matches;
    var cn = navigator.connection || {};
    var slow = !!cn.saveData || /(^|-)2g|3g/.test(cn.effectiveType || '');
    /* Decisión de Martín (20/11): 4K en ordenador y tableta; el móvil en vertical ya va a su resolución máxima útil (1080x1920) */
    var q = tall ? (slow ? 'm' : 'm1080') : slow ? 'd' : 'd2160';
    var force = (location.search.match(/[?&]hero=(m|d|m1080|d1440|d2160)\b/) || [])[1];
    if (force) q = force;
    hv.poster = q.charAt(0) === 'm' ? 'v/hero_mhq.jpg' : 'v/hero_hq.jpg';
    hv.addEventListener('error', function () { hv.style.display = 'none'; });
    hv.src = 'v/hero_' + q + '.mp4';
    hv.dataset.q = q;
    /* Red de seguridad: si un ordenador antiguo no mueve el 4K con fluidez, pasa a 1440p sin cortar */
    if (q === 'd2160' && hv.getVideoPlaybackQuality) {
      setTimeout(function () {
        var pq = hv.getVideoPlaybackQuality();
        if (pq.totalVideoFrames > 40 && pq.droppedVideoFrames / pq.totalVideoFrames > 0.15) {
          var t = hv.currentTime; hv.src = 'v/hero_d1440.mp4'; hv.dataset.q = 'd1440';
          hv.addEventListener('loadedmetadata', function () { try { hv.currentTime = t; } catch (e) {} }, { once: true });
          var p1 = hv.play(); if (p1 && p1.catch) p1.catch(function () {});
        }
      }, 5000);
    }
    var p0 = hv.play(); if (p0 && p0.catch) p0.catch(function () {});
  }

  /* ---------- Vídeos: solo se reproducen en pantalla ---------- */
  var vio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { if (!v.getAttribute('src')) { v.addEventListener('error', function () { v.removeAttribute('src'); v.load(); }, { once: true }); v.src = v.dataset.src; } var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else if (!v.paused) v.pause();
    });
  }, { rootMargin: '150px 0px', threshold: 0.01 });
  $$('video[data-src]').forEach(function (v) { vio.observe(v); });

  /* ---------- Apariciones ---------- */
  var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { threshold: 0.12 });
  function revealScan() { $$('.view.on [data-r]:not(.in)').forEach(function (el) { rio.observe(el); }); }

  /* ---------- Cifras que cuentan ---------- */
  if (document.getElementById('stats')) {
    var stl = $('#stats');
    $$('li', stl).forEach(function (li) { var c = li.cloneNode(true); c.classList.add('dup'); c.setAttribute('aria-hidden', 'true'); $$('a', c).forEach(function (x) { x.tabIndex = -1; }); stl.appendChild(c); });
    var why = $('.hstats'), nums = $$('#stats .n'), running = false, firstRun = true, nOrig = $$('#stats li:not(.dup)').length;
    function fmtN(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
    document.documentElement.classList.add('cnt');
    nums.forEach(function (el, i) {
      var fin = el.textContent; el.textContent = '';
      var g = document.createElement('span'); g.className = 'g'; g.setAttribute('aria-hidden', 'true'); g.textContent = fin;
      var v = document.createElement('span'); v.className = 'v'; v.textContent = (el.dataset.pre || '') + '0' + (el.dataset.suf || '');
      el.appendChild(g); el.appendChild(v); el._v = v;
    });
    function runStats() {
      var base = firstRun ? Math.max(0, (document.documentElement.classList.contains('nointro') ? 450 : 1800) - performance.now()) : 0; firstRun = false;
      running = true;
      nums.forEach(function (el, i) { el.parentNode.style.transitionDelay = ((base + (i % nOrig) * 140) / 1000) + 's'; });
      why.classList.add('go');
      nums.forEach(function (el, i) {
        var to = +el.dataset.to, pre = el.dataset.pre || '', suf = el.dataset.suf || '', d = 2000, wait = base + (i % nOrig) * 140 + 150, t0 = null;
        cancelAnimationFrame(el._r);
        function step(t) { if (t0 === null) t0 = t + wait; var k = Math.max(0, Math.min(1, (t - t0) / d)); k = 1 - Math.pow(1 - k, 3); el._v.textContent = pre + fmtN(Math.round(to * k)) + suf; if (k < 1) el._r = requestAnimationFrame(step); }
        el._r = requestAnimationFrame(step);
      });
    }
    function resetStats() {
      running = false; why.classList.remove('go');
      nums.forEach(function (el) { cancelAnimationFrame(el._r); el._v.textContent = (el.dataset.pre || '') + '0' + (el.dataset.suf || ''); });
    }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio >= 0.3) { if (!running) runStats(); } else if (!e.isIntersecting && running) resetStats(); });
    }, { threshold: [0, 0.3, 0.6] }).observe(why);
  }

  /* ---------- Filtro de trabajos ---------- */
  var activeFilter = 'all';
  function setFilter(f) {
    activeFilter = f;
    $$('#filters .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.f === f)); });
    $$('.proj').forEach(function (p) { p.hidden = !(f === 'all' || p.dataset.k === f); });
    revealScan();
  }
  $$('#filters .chip').forEach(function (c) { c.addEventListener('click', function () { setFilter(c.dataset.f); }); });

  /* ---------- Carruseles: flechas, arrastre y contador ---------- */
  $$('.car').forEach(function (car) {
    var tr = $('.track', car), items = tr.children.length;
    var bar = document.createElement('div'); bar.className = 'nav-btns';
    bar.innerHTML = '<span class="count"></span><button class="arrow" type="button" aria-label="Anterior">←</button><button class="arrow" type="button" aria-label="Siguiente">→</button>';
    car.appendChild(bar);
    var prev = bar.children[1], next = bar.children[2], count = bar.children[0];
    function upd() {
      var max = tr.scrollWidth - tr.clientWidth - 2;
      prev.disabled = tr.scrollLeft <= 2; next.disabled = tr.scrollLeft >= max;
      var idx = 0, kids = tr.children;
      for (var i = 0; i < kids.length; i++) { if (kids[i].offsetLeft - tr.offsetLeft <= tr.scrollLeft + 24) idx = i; }
      if (tr.scrollLeft >= max) idx = items - 1;
      count.textContent = (idx + 1) + ' / ' + items;
    }
    prev.addEventListener('click', function () { tr.scrollBy({ left: -tr.clientWidth * 0.8 }); });
    next.addEventListener('click', function () { tr.scrollBy({ left: tr.clientWidth * 0.8 }); });
    tr.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd);
    $$('img', tr).forEach(function (im) { im.addEventListener('load', upd); });
    var down = false, sx = 0, sl = 0, moved = false;
    tr.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft; tr.classList.add('drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; tr.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; tr.classList.remove('drag'); });
    tr.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    tr.addEventListener('dragstart', function (e) { e.preventDefault(); });
    upd(); setTimeout(upd, 400);
  });

  /* ---------- Antes / después ---------- */
  $$('.compare').forEach(function (cmp) {
    var rng = cmp.querySelector('input[type=range]');
    function setPos(v) { cmp.style.setProperty('--pos', v + '%'); }
    rng.addEventListener('input', function () { setPos(rng.value); }); setPos(50);
    if (reduce) return;
    var hinted = false;
    new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || hinted) return; hinted = true;
      var seq = [[50, 30, 700], [30, 70, 1000], [70, 50, 700]], i = 0;
      function run() { if (i >= seq.length) return; var a = seq[i][0], b = seq[i][1], d = seq[i][2], t0 = null;
        function st(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / d); k = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; var v = a + (b - a) * k; setPos(v); rng.value = v; if (k < 1) requestAnimationFrame(st); else { i++; run(); } }
        requestAnimationFrame(st); }
      run();
    }, { threshold: 0.6 }).observe(cmp);
  });

  /* ---------- Packs y carrito ---------- */
  if (document.getElementById('extras-list')) {
    /* Precios sin IVA por tramo de superficie construida: hasta 150 · 150–300 · 300–500 m². Más de 500 m², a medida. */
    var SIZES = ['Hasta 150 m²', '150–300 m²', '300–500 m²', 'Más de 500 m²'];
    var PACKS = {
      esencial: { n: 'Esencial', p: [139, 179, 219], f: [25, 35, 45], inc: [] },
      visual: { n: 'Visual', p: [299, 369, 439], f: [30, 40, 50], inc: [] },
      aereo: { n: 'Aéreo', p: [429, 499, 569], f: [30, 40, 50], inc: ['dron'] },
      elite: { n: 'Élite', p: [629, 749, 879], f: [30, 40, 50], inc: ['dron', 'tour', 'plano', 'cert'] },
      firma: { n: 'Firma', p: [949, 1069, 1199], f: [40, 50, 60], inc: ['dron', 'd360', 'tour', 'plano', 'cert'] }
    };
    var EXTRAS = [
      { id: 'amueblado', n: 'Amueblado virtual', p: 19, u: '/ img', d: 'Sobre la foto real de una estancia vacía, entregado como imagen virtual.' },
      { id: 'atardecer', n: 'Atardecer virtual', p: 19, u: '/ foto', d: 'Cielo de atardecer aplicado en edición.' },
      { id: 'fotos', n: '+10 fotos', p: 39, u: '', d: 'Diez fotos HDR más en alta resolución.' },
      { id: 'reel', n: 'Reel vertical', p: 59, u: '', d: 'Versión 9:16 para Reels, TikTok y Stories.' },
      { id: 'dron', n: 'Dron exterior', p: 149, u: '', d: 'Fotos y vídeo aéreos del exterior y el entorno.', one: true },
      { id: 'd360', n: 'Dron FPV', p: 219, u: '', d: 'Un plano secuencia por escalera, patio o azotea.', one: true },
      { id: 'tour', n: 'Tour virtual 3D', p: [99, 129, 159], u: '', d: 'Recorrido 3D con 6 meses de alojamiento.', one: true },
      { id: 'plano', n: 'Plano 2D', p: 49, u: '', d: 'Se saca del tour; solo junto al tour.', one: true, needs: 'tour' },
      { id: 'cert', n: 'Certificado energético', p: [79, 99, 129], u: '', d: 'Técnico colegiado y registro oficial.', one: true }
    ];
    var st = { pack: null, size: 0, q: {} };
    var custom = function () { return st.size === 3; };
    var tier = function () { return Math.min(st.size, 2); };
    var xPrice = function (x) { return typeof x.p === 'number' ? x.p : x.p[tier()]; };
    function eur(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
    EXTRAS.forEach(function (x) { st.q[x.id] = 0; });
    var list = $('#extras-list');
    EXTRAS.forEach(function (x) {
      var li = document.createElement('li'); li.dataset.x = x.id;
      li.innerHTML = '<div><b>' + x.n + '</b><span class="xp"></span></div><div class="stepper"><button type="button" aria-label="Quitar ' + x.n + '">−</button><output>0</output><button type="button" aria-label="Añadir ' + x.n + '">+</button></div><p>' + x.d + '</p><span class="why-off" hidden></span>';
      var bs = li.querySelectorAll('button');
      bs[0].addEventListener('click', function () { st.q[x.id] = Math.max(0, st.q[x.id] - 1); if (x.id === 'tour' && st.q.tour === 0) st.q.plano = 0; render(); });
      bs[1].addEventListener('click', function () { st.q[x.id] = x.one ? 1 : st.q[x.id] + 1; render(); });
      list.appendChild(li);
    });
    $$('.pk').forEach(function (b) { b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); } }); b.addEventListener('click', function () { st.pack = st.pack === b.dataset.pack ? null : b.dataset.pack; render(); }); });
    $$('[data-size]').forEach(function (c) { c.addEventListener('click', function () { st.size = +c.dataset.size; render(); }); });
    function render() {
      var pk = st.pack ? PACKS[st.pack] : null, t = tier(), med = custom();
      $$('[data-size]').forEach(function (c) { c.setAttribute('aria-pressed', String(+c.dataset.size === st.size)); });
      $$('.pk').forEach(function (b) {
        var P = PACKS[b.dataset.pack];
        b.setAttribute('aria-pressed', String(b.dataset.pack === st.pack));
        $('.pr', b).innerHTML = med ? '<small>desde</small>' + eur(P.p[2]) : eur(P.p[t]);
        $$('[data-f]', b).forEach(function (f) { f.textContent = P.f[t]; });
      });
      var lines = [], total = 0;
      if (pk) { total += pk.p[t]; lines.push(['Pack ' + pk.n + ' · ' + SIZES[st.size], med ? 'a medida' : eur(pk.p[t])]); }
      EXTRAS.forEach(function (x) {
        var li = list.querySelector('[data-x="' + x.id + '"]'), off = !pk, why = '', xp = xPrice(x);
        li.querySelector('.xp').textContent = '+' + (med && typeof x.p !== 'number' ? 'desde ' : '') + xp + ' € ' + x.u;
        if (pk && pk.inc.indexOf(x.id) >= 0) { off = true; why = 'Ya incluido en el pack ' + pk.n + '.'; }
        if (pk && x.needs && st.q[x.needs] === 0 && pk.inc.indexOf(x.needs) < 0) { off = true; why = 'Añade antes el tour.'; }
        if (!pk) why = 'Elige primero un pack.';
        if (off) st.q[x.id] = 0;
        li.classList.toggle('off', off);
        var w = li.querySelector('.why-off'); w.hidden = !why || !off; w.textContent = why;
        var bs = li.querySelectorAll('button'); bs[0].disabled = off || st.q[x.id] === 0; bs[1].disabled = off || (x.one && st.q[x.id] >= 1);
        li.querySelector('output').textContent = st.q[x.id];
        if (st.q[x.id] > 0) { var s = xp * st.q[x.id]; total += s; lines.push([x.n + (st.q[x.id] > 1 ? ' × ' + st.q[x.id] : ''), med && typeof x.p !== 'number' ? 'a medida' : eur(s)]); }
      });
      $('#o-title').textContent = pk ? 'Pack ' + pk.n : 'Elige un pack';
      $('#o-lines').innerHTML = lines.map(function (l) { return '<li><span>' + l[0] + '</span><span>' + l[1] + '</span></li>'; }).join('');
      $('#o-empty').hidden = !!pk;
      $('#o-total').textContent = pk && med ? 'A medida' : eur(total);
      var send = $('#o-send');
      send.textContent = med ? 'Pedir presupuesto por WhatsApp' : 'Pedir por WhatsApp';
      if (pk) {
        var txt = (med ? 'Hola, quiero un presupuesto a medida para una propiedad de más de 500 m²:\n' : 'Hola, quiero pedir:\n') + lines.map(function (l) { return '· ' + l[0] + ': ' + l[1]; }).join('\n') + (med ? '' : '\nTotal: ' + $('#o-total').textContent + ' (sin IVA)');
        send.href = 'https://wa.me/34634323162?text=' + encodeURIComponent(txt); send.removeAttribute('aria-disabled');
      } else { send.href = 'https://wa.me/34634323162'; send.setAttribute('aria-disabled', 'true'); }
    }
    render();
  }

  /* ---------- Formulario de contacto ---------- */
  if (document.getElementById('cform')) {
    var fsend = $('#f-send');
    function fupd() {
      var who = ($('input[name="who"]:checked') || {}).value || '';
      var t = 'Hola, soy ' + ($('#f-name').value.trim() || '[tu nombre]') + ' (' + who + ').';
      if ($('#f-pack').value) t += '\nMe interesa: ' + $('#f-pack').value + '.';
      if ($('#f-msg').value.trim()) t += '\n' + $('#f-msg').value.trim();
      fsend.href = 'https://wa.me/34634323162?text=' + encodeURIComponent(t);
    }
    $('#cform').addEventListener('input', fupd); $('#cform').addEventListener('change', fupd);
    $('#cform').addEventListener('submit', function (e) { e.preventDefault(); });
    fupd();
  }

  /* ---------- Visor de fotos ---------- */
  if (document.getElementById('lb')) {
    var lb = $('#lb'), lbImg = $('#lbImg'), lbC = $('.lb-c', lb), group = [], gi = 0;
    function lbShow(i) { gi = (i + group.length) % group.length; lbImg.src = group[gi].src; lbImg.alt = group[gi].alt; lbC.textContent = (gi + 1) + ' / ' + group.length; }
    function lbClose() { lb.hidden = true; document.body.style.overflow = ''; }
    $$('[data-lb]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        group = $$('[data-lb="' + btn.dataset.lb + '"] img');
        lb.hidden = false; document.body.style.overflow = 'hidden';
        lbShow(group.indexOf(btn.querySelector('img')));
      });
    });
    $('.lb-x', lb).addEventListener('click', lbClose);
    $('.lb-p', lb).addEventListener('click', function () { lbShow(gi - 1); });
    $('.lb-n', lb).addEventListener('click', function () { lbShow(gi + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
    document.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Escape') lbClose(); if (e.key === 'ArrowLeft') lbShow(gi - 1); if (e.key === 'ArrowRight') lbShow(gi + 1); });
    var lx = null;
    lb.addEventListener('pointerdown', function (e) { lx = e.clientX; });
    lb.addEventListener('pointerup', function (e) { if (lx === null) return; var dx = e.clientX - lx; lx = null; if (Math.abs(dx) > 40) lbShow(gi + (dx < 0 ? 1 : -1)); });
  }

  /* ---------- Arranque y anclas ---------- */
  revealScan(); sync();
  if (location.hash) {
    var tgt = document.getElementById(location.hash.slice(1));
    if (tgt) {
      requestAnimationFrame(function () { tgt.scrollIntoView({ block: 'start' }); });
      window.addEventListener('load', function () { if (Math.abs(tgt.getBoundingClientRect().top) > 4) tgt.scrollIntoView({ block: 'start' }); }, { once: true });
    }
  }
})();
