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
    /* Precios sin IVA por tramo de superficie construida (catastro): hasta 90 · 90–150 · 150–300 · 300–500 · más de 500 m². Máximo 40 fotos por pack. */
    var SIZES = ['Hasta 90 m²', '90–150 m²', '150–300 m²', '300–500 m²', 'Más de 500 m²'];
    var PACKS = {
      esencial: { n: 'Esencial', p: [139, 159, 179, 199, 219], f: [25, 30, 35, 40, 50], inc: [] },
      visual: { n: 'Visual', p: [299, 339, 379, 419, 459], f: [30, 35, 40, 50, 60], inc: [] },
      integral: { n: 'Integral', p: [499, 569, 639, 709, 779], f: [30, 35, 40, 50, 60], inc: ['tour', 'plano', 'cert'] },
      elite: { n: 'Élite', p: [629, 719, 809, 899, 989], f: [30, 35, 40, 50, 60], inc: ['dron', 'tour', 'plano', 'cert'] },
    };
    var EXTRAS = [
      { id: 'amueblado', n: 'Amueblado virtual', p: 19, u: '/ img', d: 'Sobre la foto real de una estancia vacía, entregado como imagen virtual.' },
      { id: 'atardecer', n: 'Atardecer virtual', p: 19, u: '/ foto', d: 'Cielo de atardecer aplicado en edición.' },
      { id: 'fotos', n: '+10 fotos', p: 39, u: '', d: 'Diez fotos HDR más en alta resolución.' },
      { id: 'reel', n: 'Reel vertical', p: 59, u: '', d: 'Versión 9:16 para Reels, TikTok y Stories.' },
      { id: 'dron', n: 'Dron exterior', p: [149, 169, 189, 209, 229], u: '', d: 'Fotos aéreas y vídeo aéreo del exterior y el entorno.', one: true },
      { id: 'd360', n: 'Dron 360', p: 249, u: '', d: 'Un plano secuencia por escalera, patio o azotea.', one: true },
      { id: 'fpvint', n: 'Vuelo FPV interior', soon: true, d: 'Un recorrido completo por dentro de la vivienda, sin cortes.' },
      { id: 'tour', n: 'Tour virtual 3D', p: [99, 114, 129, 144, 159], u: '', d: 'Recorrido 3D con 6 meses de alojamiento.', one: true },
      { id: 'plano', n: 'Plano 2D', p: 49, u: '', d: 'Se saca del tour; solo junto al tour.', one: true, needs: 'tour' },
      { id: 'cert', n: 'Certificado energético', p: [99, 119, 139, 159, 179], u: '', d: 'Técnico colegiado y registro oficial.', one: true }
    ];
    var st = { pack: null, size: 0, q: {}, tipo: 'piso', loc: null };
    var custom = function () { return false; };
    var tier = function () { return st.size; };
    /* Boceto 27/11 (importes de ejemplo): el desplazamiento va incluido en el precio, sin línea aparte.
       Distancia en línea recta desde Sol. Gratis en Madrid capital y hasta 10 km; luego 10 € por cada 10 km. Más de 60 km: a consultar.
       Si el pedido lleva certificado, se suma también el desplazamiento del técnico (0 dentro de la M-40 ≈ 9 km; +10 € hasta 20 km y +10 € cada 10 km). */
    var FEE_STEP = 10, CASA_CERT = 50, MAX_KM = 60;
    var DRON_F = [6, 8, 10, 12, 15];   /* fotos aéreas por tramo; el dron suma 30 s de tomas aéreas al vídeo (60 → 90 s) */
    var r9 = function (n) { return Math.ceil((n + 1) / 10) * 10 - 1; };
    var casaCert = function () { return st.tipo === 'casa' ? CASA_CERT : 0; };
    var tooFar = function () { return !!st.loc && st.loc.d > MAX_KM; };
    var ownFee = function () { if (!st.loc || st.loc.cap || st.loc.d <= 10) return 0; return FEE_STEP * Math.floor(Math.min(st.loc.d, MAX_KM) / 10); };
    var techFee = function () { if (!st.loc) return 0; var d = st.loc.d; return d <= 9 ? 0 : d <= 20 ? 10 : 10 * (Math.ceil(Math.min(d, MAX_KM) / 10) - 1); };
    var pkPrice = function (P) { return r9(P.p[tier()] + (P.inc.indexOf('cert') >= 0 ? casaCert() + techFee() : 0) + ownFee()); };
    var xPrice = function (x) { if (x.soon) return 0; var v = typeof x.p === 'number' ? x.p : x.p[tier()]; return x.id === 'cert' ? r9(v + casaCert() + techFee()) : v; };
    function km(n) { return n.toFixed(1).replace('.', ',') + ' km'; }
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
    $$('[data-tipo]').forEach(function (c) { c.addEventListener('click', function () { st.tipo = c.dataset.tipo; render(); }); });
    function render() {
      var pk = st.pack ? PACKS[st.pack] : null, t = tier(), med = custom();
      $$('[data-size]').forEach(function (c) { c.setAttribute('aria-pressed', String(+c.dataset.size === st.size)); });
      $$('[data-tipo]').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.tipo === st.tipo)); });
      var th = $('#tipo-help'); if (th) th.hidden = st.tipo !== 'casa';
      $$('.pk').forEach(function (b) {
        var P = PACKS[b.dataset.pack];
        b.setAttribute('aria-pressed', String(b.dataset.pack === st.pack));
        $('.pr', b).innerHTML = tooFar() ? 'Consultar' : (st.loc ? '' : '<small>desde</small> ') + eur(pkPrice(P)) + ' <small>+ IVA</small>';
        $$('[data-f]', b).forEach(function (f) { f.textContent = P.f[t]; });
        $$('[data-a]', b).forEach(function (f) { f.textContent = DRON_F[t]; });
        $$('[data-v]', b).forEach(function (f) { f.textContent = st.pack === b.dataset.pack && st.q.dron > 0 ? 90 : 60; });
      });
      var lines = [], total = 0;
      if (pk) { total += pkPrice(pk); lines.push(['Pack ' + pk.n + ' · ' + (st.tipo === 'casa' ? 'Casa o chalé' : 'Piso') + ' · ' + SIZES[st.size], eur(pkPrice(pk))]); }
      EXTRAS.forEach(function (x) {
        var li = list.querySelector('[data-x="' + x.id + '"]'), off = !pk, why = '', xp = xPrice(x);
        if (x.id === 'dron') li.querySelector('p').textContent = DRON_F[t] + ' fotos aéreas' + (pk && pk.n === 'Esencial' ? ' y un vídeo aéreo de 30 s.' : ' y 30 s de tomas aéreas dentro del vídeo, que pasa a 90 s.');
        li.querySelector('.xp').textContent = x.soon ? 'Próximamente' : '+' + (med && typeof x.p !== 'number' ? 'desde ' : '') + xp + ' € ' + x.u;
        if (x.soon) { li.classList.add('off', 'soon-x'); st.q[x.id] = 0; li.querySelectorAll('button').forEach(function (bt) { bt.disabled = true; }); li.querySelector('.why-off').hidden = true; return; }
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
      var calc = $('#calc');
      if (calc) {
        var CP = pk || PACKS.visual, hasC = CP.inc.indexOf('cert') >= 0, cr = [['Pack ' + CP.n + (pk ? '' : ' (ejemplo: elige un pack)') + ' · ' + (st.tipo === 'casa' ? 'casa o chalé' : 'piso') + ' · ' + SIZES[st.size], CP.p[t]]];
        if (hasC) cr.push(['Certificado incluido: recargo por casa o chalé', casaCert()]);
        cr.push(['Tu desplazamiento' + (st.loc ? ' · ' + km(st.loc.d) + ' desde Sol' + (st.loc.cap ? ' (Madrid capital)' : '') : ' · falta la dirección'), ownFee()]);
        if (hasC) cr.push(['Desplazamiento del técnico del certificado', techFee()]);
        var sum = cr.reduce(function (a, r) { return a + r[1]; }, 0), shown = pkPrice(CP);
        calc.innerHTML = '<table>' + cr.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + (r[1] ? '+ ' + eur(r[1]) : '0 €') + '</td></tr>'; }).join('').replace('+ ' + eur(CP.p[t]), eur(CP.p[t]))
          + '<tr class="sum"><td>Suma</td><td>' + eur(sum) + '</td></tr><tr><td>Redondeo hacia arriba a un precio terminado en 9</td><td>+ ' + eur(shown - sum) + '</td></tr>'
          + '<tr class="tot"><td>Precio que ve el cliente</td><td>' + (tooFar() ? 'A consultar' : eur(shown) + ' + IVA') + '</td></tr></table>';
      }
      var on = $('#o-note'); if (on) on.textContent = !st.loc ? 'Indica la dirección para cerrar el precio.' : tooFar() ? 'Te respondemos con un presupuesto a medida.' : 'Precio cerrado, desplazamiento incluido.';
      var ctx = $('#pk-ctx');
      if (ctx) ctx.innerHTML = !st.loc ? 'Precios en Madrid capital. Escribe la dirección para ver tu precio cerrado.' : tooFar() ? 'Esta dirección está fuera de nuestra zona habitual. Cuéntanos tu proyecto y te respondemos.' : 'Tu precio cerrado para <b>' + st.loc.label + '</b> · desplazamiento incluido';
      $('#o-title').textContent = pk ? 'Pack ' + pk.n : 'Elige un pack';
      $('#o-lines').innerHTML = lines.map(function (l) { return '<li><span>' + l[0] + '</span><span>' + l[1] + '</span></li>'; }).join('');
      $('#o-empty').hidden = !!pk;
      $('#o-total').textContent = pk && tooFar() ? 'A consultar' : eur(total) + ' + IVA';
      var send = $('#o-send');
      send.textContent = tooFar() ? 'Consultar por WhatsApp' : 'Pedir por WhatsApp';
      if (pk && st.loc) {
        var txt = (tooFar() ? 'Hola, quiero consultar este trabajo:\n' : 'Hola, quiero pedir:\n') + lines.map(function (l) { return '· ' + l[0] + ': ' + (tooFar() ? '' : l[1]); }).join('\n') + (tooFar() ? '' : '\nTotal: ' + $('#o-total').textContent + ' (desplazamiento incluido)') + '\nDirección: ' + st.loc.label + (st.loc.muni && st.loc.label.indexOf(st.loc.muni) < 0 ? ', ' + st.loc.muni : '');
        send.href = 'https://wa.me/34634323162?text=' + encodeURIComponent(txt); send.removeAttribute('aria-disabled');
      } else { send.href = 'https://wa.me/34634323162'; send.setAttribute('aria-disabled', 'true'); if (pk) send.textContent = 'Indica la dirección'; }
    }
    /* ---------- Ubicación: mapa con anillos y buscador ---------- */
    var svg = $('#loc-svg'), MAP = null, NS = 'http://www.w3.org/2000/svg';
    var LON0 = -3.7038, LAT0 = 40.4168, KX = 111.32 * Math.cos(LAT0 * Math.PI / 180), KY = 110.57;
    var toKm = function (lon, lat) { return [(lon - LON0) * KX, -(lat - LAT0) * KY]; };
    var ringD = function (r) { return r.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ',' + p[1]; }).join('') + 'Z'; };
    var circ = function (r) { return 'M' + r + ',0A' + r + ',' + r + ' 0 1 0 ' + (-r) + ',0A' + r + ',' + r + ' 0 1 0 ' + r + ',0Z'; };
    var norm = function (t) { return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); };
    function el(tag, at) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); return e; }
    function inRing(x, y, r) { var c = false; for (var i = 0, j = r.length - 1; i < r.length; j = i++) { var a = r[i], b = r[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
    function muniAt(x, y) { if (!MAP) return null; for (var i = 0; i < MAP.m.length; i++) { var m = MAP.m[i]; if (x < m.bb[0] || x > m.bb[2] || y < m.bb[1] || y > m.bb[3]) continue; for (var k = 0; k < m.r.length; k++) if (inRing(x, y, m.r[k])) return m; } return null; }
    function drawMap() {
      svg.innerHTML = '';
      var defs = el('defs', {}), cp = el('clipPath', { id: 'cm' }); cp.appendChild(el('path', { d: MAP.o.map(ringD).join('') })); defs.appendChild(cp); svg.appendChild(defs);
      var g = el('g', { 'clip-path': 'url(#cm)' });
      g.appendChild(el('rect', { x: -80, y: -90, width: 145, height: 160, fill: 'rgba(18,63,53,.05)' }));
      svg.appendChild(g);
      MAP.m.forEach(function (m) { m.el = el('path', { class: 'mun' + (m.n === 'Madrid' ? ' mad' : ''), d: m.r.map(ringD).join('') }); svg.appendChild(m.el); });
      svg.appendChild(el('path', { d: MAP.o.map(ringD).join(''), fill: 'none', stroke: '#123f35', 'stroke-width': 1.3, 'vector-effect': 'non-scaling-stroke' }));
      var pin = el('g', { id: 'pin', class: 'pin', visibility: 'hidden' });
      pin.appendChild(el('path', { d: 'M0,0 C-1.2,-2.6 -3.4,-4 -3.4,-6.6 A3.4,3.4 0 1 1 3.4,-6.6 C3.4,-4 1.2,-2.6 0,0Z', fill: '#a8895f', stroke: '#fffdf9', 'stroke-width': 1.2, 'vector-effect': 'non-scaling-stroke' }));
      pin.appendChild(el('circle', { cx: 0, cy: -6.6, r: 1.3, fill: '#fffdf9' }));
      svg.appendChild(pin);
    }
    function setLoc(x, y, label) {
      var d = Math.hypot(x, y), m = muniAt(x, y);
      st.loc = { x: x, y: y, d: d, cap: !!m && m.n === 'Madrid', muni: m ? m.n : '', label: label || (m ? m.n : 'Punto del mapa') };
      if (MAP) {
        MAP.m.forEach(function (o) { o.el.classList.toggle('hit', o === m); });
        var pin = $('#pin'); pin.setAttribute('transform', 'translate(' + x + ',' + y + ')'); pin.setAttribute('visibility', 'visible');
      }
      $('#loc-res').innerHTML = '<b>' + st.loc.label + '</b>' + (st.loc.muni && st.loc.label.indexOf(st.loc.muni) < 0 ? ' · ' + st.loc.muni : '');
      render();
    }
    function svgPt(e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; var q = p.matrixTransform(svg.getScreenCTM().inverse()); return [q.x, q.y]; }
    if (svg) {
      fetch('data/madrid.json?v=1').then(function (r) { return r.json(); }).then(function (d) {
        d.m.forEach(function (m) { var xs = [], ys = []; m.r.forEach(function (r) { r.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); }); m.bb = [Math.min.apply(0, xs), Math.min.apply(0, ys), Math.max.apply(0, xs), Math.max.apply(0, ys)]; m.k = norm(m.n); });
        MAP = d; drawMap(); if (st.loc) setLoc(st.loc.x, st.loc.y, st.loc.label);
      }).catch(function () { $('#loc-res').textContent = 'No se pudo cargar el mapa. Escribe tu municipio.'; });
      var tip = $('#loc-tip'), down = null, raf = 0;
      svg.addEventListener('pointerdown', function (e) { down = [e.clientX, e.clientY]; });
      svg.addEventListener('pointerup', function (e) { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return; seq++; var q = svgPt(e); setLoc(q[0], q[1]); if (inp) inp.value = st.loc.muni || ''; tip.hidden = true; });
      svg.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || raf) return;
        raf = requestAnimationFrame(function () { raf = 0; var q = svgPt(e), m = muniAt(q[0], q[1]), r = svg.parentNode.getBoundingClientRect();
          if (!m) { tip.hidden = true; return; } tip.hidden = false; tip.textContent = m.n; tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top) + 'px'; });
      });
      svg.addEventListener('pointerleave', function () { tip.hidden = true; });
    }
    /* Buscador: municipios (sin conexión) + direcciones de CartoCiudad (IGN) cuando está disponible */
    var inp = $('#loc-q'), sug = $('#loc-sug'), items = [], msg = '', act = -1, seq = 0, tmr = 0, jn = 0;
    var tc = function (t) { return t.toLowerCase().replace(/(^|[\s,(\/-])([a-záéíóúüñ])/g, function (m, a, b) { return a + b.toUpperCase(); }).replace(/ (De|Del|La|Las|Los|Y|E)(?= )/g, function (w) { return w.toLowerCase(); }); };
    function jsonp(url, cb) {
      var name = '__cc' + (++jn), s = document.createElement('script'), done = false, prev = window.callback;
      function end(d) { if (done) return; done = true; window[name] = function () {}; window.callback = prev; s.remove(); cb(d); }
      window[name] = end; window.callback = end;
      s.onerror = function () { end(null); }; setTimeout(function () { end(null); }, 7000);
      s.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'callback=' + name; document.head.appendChild(s);
    }
    function showSug() {
      sug.innerHTML = items.map(function (it, i) { return '<li role="option" id="sg' + i + '" aria-selected="' + (i === act) + '">' + it.t + '<small>' + it.s + '</small></li>'; }).join('') + (msg ? '<li class="msg" aria-disabled="true">' + msg + '</li>' : '');
      sug.hidden = !items.length && !msg; inp.setAttribute('aria-expanded', String(!sug.hidden));
      $$('li[role="option"]', sug).forEach(function (li, i) { li.addEventListener('mousedown', function (e) { e.preventDefault(); pick(i); }); });
    }
    function pick(i) {
      var it = items[i], my = ++seq; if (!it) return; items = []; msg = ''; showSug(); inp.value = it.t;
      if (it.kind === 'mun') { setLoc(it.m.c[0], it.m.c[1], it.m.n); return; }
      if (typeof it.lat === 'number' && (it.lat || it.lng)) { var p = toKm(it.lng, it.lat); setLoc(p[0], p[1], it.t); return; }
      $('#loc-res').textContent = 'Buscando ' + it.t + '…';
      jsonp('https://www.cartociudad.es/geocoder/api/geocoder/findJsonp?id=' + encodeURIComponent(it.id) + '&type=' + encodeURIComponent(it.type), function (d) {
        if (my !== seq) return;
        if (d && typeof d.lat === 'number' && (d.lat || d.lng)) { var q = toKm(d.lng, d.lat); setLoc(q[0], q[1], it.t); }
        else { var m = MAP && MAP.m.filter(function (o) { return o.k === norm(it.s); })[0]; if (m) setLoc(m.c[0], m.c[1], it.t); }
      });
    }
    function localSug(q) {
      if (!MAP) return []; var k = norm(q);
      return MAP.m.filter(function (m) { return m.k.indexOf(k) >= 0; }).sort(function (a, b) { return (b.k.indexOf(k) === 0) - (a.k.indexOf(k) === 0) || a.k.length - b.k.length; }).slice(0, 5)
        .map(function (m) { return { kind: 'mun', t: m.n, s: 'Municipio', m: m }; });
    }
    if (inp) {
      inp.addEventListener('input', function () {
        var q = inp.value.trim(), my = ++seq; act = -1;
        items = q.length >= 2 ? localSug(q) : []; msg = q.length >= 4 ? 'Buscando direcciones…' : ''; showSug();
        clearTimeout(tmr); if (q.length < 4) return;
        tmr = setTimeout(function () {
          var base = 'https://www.cartociudad.es/geocoder/api/geocoder/candidatesJsonp?q=' + encodeURIComponent(q) + '&no_process=municipio,provincia,comunidad%20autonoma,poblacion,toponimo,expendeduria,punto_recarga_electrica,ngbe,carretera';
          var got = [], left = 3, fail = 0, nq = norm(q), loc = localSug(q);
          var townFirst = !/\d/.test(q) && loc.length && loc[0].m.k.indexOf(nq) === 0;
          var named = function (c) { return c.muni && nq.indexOf(norm(c.muni)) >= 0 ? 1 : 0; };
          var draw = function () {
            if (my !== seq) return;
            if (!got.length) {
              if (left) { items = loc; msg = 'Buscando direcciones…'; showSug(); return; }
              items = loc; msg = items.length ? '' : fail < 3 ? 'No encontramos esa dirección. Prueba con el municipio o toca el mapa.' : 'El buscador de calles no responde ahora. Escribe el municipio o toca el mapa.'; showSug(); return;
            }
            var dir = got.slice().sort(function (a, b) { return named(b) - named(a) || (b.muni === 'Madrid') - (a.muni === 'Madrid') || (b.province === 'Madrid') - (a.province === 'Madrid') || a._r - b._r; }).slice(0, 5)
              .map(function (c) { return { kind: 'dir', t: tc(c.address), s: (c.postalCode ? c.postalCode + ' · ' : '') + (c.province && c.province !== 'Madrid' ? c.province + ' · ' : '') + (c.type === 'portal' ? 'Dirección' : 'Calle'), id: c.id, type: c.type, lat: c.lat, lng: c.lng }; });
            msg = ''; items = (townFirst ? loc.slice(0, 2).concat(dir) : dir.concat(loc)).slice(0, 7); showSug();
          };
          var add = function (k) { return function (d) { left--; if (d === null) fail++; else (d || []).forEach(function (c, i) { if (!got.some(function (g) { return g.id === c.id; })) { c._r = k * 100 + i; got.push(c); } }); draw(); }; };
          jsonp(base + '&limit=6&provincia_filter=Madrid', add(0));
          jsonp(base + '&limit=6&provincia_filter=Toledo', add(1));
          jsonp(base + '&limit=6&provincia_filter=Guadalajara,Segovia,Avila,Cuenca', add(2));
        }, 280);
      });
      inp.addEventListener('keydown', function (e) {
        if (!items.length) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); act = (act + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length; showSug(); }
        else if (e.key === 'Enter') { e.preventDefault(); pick(act < 0 ? 0 : act); }
        else if (e.key === 'Escape') { items = []; showSug(); }
      });
      inp.addEventListener('blur', function () { setTimeout(function () { items = []; msg = ''; showSug(); }, 150); });
    }
    render();
    var bases = $('#bases');
    if (bases) {
      $$('a[href="#bases"]').forEach(function (a) { a.addEventListener('click', function () { bases.open = true; }); });
      if (location.hash === '#bases') bases.open = true;
    }
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
