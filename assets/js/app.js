/* =========================================================
   Самоварная, ресторан купеческой кухни.
   Занавес на входе, портьеры раздвигаются над кадром,
   медленная смена залов, лента убранства тянется рукой.
   Без скрипта ничего не спрятано: страница просто стоит.
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var stage = document.getElementById('stageArch');
  var shotA = document.getElementById('shotA');
  var shotB = document.getElementById('shotB');

  /* ---------- 1. Занавес, затем портьеры над кадром ---------- */
  var veil = document.getElementById('veil');
  if (veil) {
    if (reduce) {
      veil.classList.add('is-gone');
    } else {
      var opened = false;
      var open = function () {
        if (opened) return;
        opened = true;
        // сначала гаснет надпись, только потом разъезжаются половины,
        // иначе её хвост висит над уже открывшейся страницей
        veil.classList.add('is-dim');
        window.setTimeout(function () { veil.classList.add('is-open'); }, 380);
        window.setTimeout(function () { veil.classList.add('is-gone'); }, 1700);
      };
      window.setTimeout(open, 320);
      window.addEventListener('scroll', open, { passive: true, once: true });
      window.addEventListener('pointerdown', open, { once: true });
      window.addEventListener('keydown', open, { once: true });
    }
  }

  /* ---------- 2. Медленная смена залов ---------- */
  var SCENES = [
    { img: 'hall-curtains.webp', alt: 'Зал «Самоварной» с красными портьерами и накрытыми столами' },
    { img: 'hall-wide.webp', alt: 'Большой зал с накрытыми столами и полками фарфора' },
    { img: 'hall-stained.webp', alt: 'Зал с витражом и накрытыми столами' },
    { img: 'shelf-samovars.webp', alt: 'Полка с медными самоварами и чайными парами' },
    { img: 'hall-tables.webp', alt: 'Зал с красными портьерами и люстрами' },
    { img: 'hall-cabinet.webp', alt: 'Зал с буфетом и накрытыми столами' }
  ];

  var at = 0, timer = null, live = true;

  // показанный кадр и спрятанный меняются ролями; следующий грузится заранее
  var front = shotA, back = shotB;

  function step() {
    at = (at + 1) % SCENES.length;
    var s = SCENES[at];
    var swap = function () {
      back.alt = s.alt;
      back.classList.add('is-on');
      front.classList.remove('is-on');
      var t = front; front = back; back = t;
      back.alt = '';
    };
    if (back.getAttribute('src') === 'assets/img/' + s.img) { swap(); return; }
    back.onload = function () { back.onload = null; swap(); };
    back.src = 'assets/img/' + s.img;
  }

  if (shotA && shotB && !reduce) {
    var start = function () { if (!timer && live) timer = window.setInterval(step, 5400); };
    var stop = function () { if (timer) { window.clearInterval(timer); timer = null; } };

    if ('IntersectionObserver' in window && stage) {
      new IntersectionObserver(function (e) {
        live = e[0].isIntersecting;
        if (live) start(); else stop();
      }, { threshold: 0.2 }).observe(stage);
    } else {
      start();
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (live) start();
    });
  }

  /* ---------- 3. Лента убранства тянется рукой ---------- */
  var row = document.getElementById('row');
  if (row) {
    var down = false, sx = 0, sl = 0;
    row.addEventListener('pointerdown', function (e) {
      down = true; sx = e.clientX; sl = row.scrollLeft;
      row.setPointerCapture(e.pointerId);
      row.style.cursor = 'grabbing';
    });
    row.addEventListener('pointermove', function (e) {
      if (!down) return;
      row.scrollLeft = sl - (e.clientX - sx);
    });
    var up = function () { down = false; row.style.cursor = ''; };
    row.addEventListener('pointerup', up);
    row.addEventListener('pointercancel', up);
  }

  /* ---------- 4. Появления ---------- */
  var groups = [
    ['.hero__card-in', 0],
    ['.archive__in > .h2', 0], ['.archive__lead', 0], ['.pair__f', 0], ['.rec', 0],
    ['.dishes__head', 0], ['.plate', 0],
    ['.ice__text > *', 0], ['.ice__shot', 0],
    ['.tea__text', 0], ['.tea__f', 0],
    ['.rooms__head', 0], ['.row__i', 0],
    ['.where__shot', 0], ['.where__r', 0], ['.where__go', 0],
    ['.foot__word', 0], ['.foot__cols', 1]
  ];

  var watched = [];
  for (var g = 0; g < groups.length; g++) {
    var list = document.querySelectorAll(groups[g][0]);
    for (var j = 0; j < list.length; j++) {
      list[j].classList.add('r');
      list[j].style.setProperty('--d', Math.min(j, 7) * 80 + 'ms');
      watched.push(list[j]);
    }
  }

  if (reduce || !('IntersectionObserver' in window)) {
    for (var w = 0; w < watched.length; w++) watched[w].classList.add('in');
  } else {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('in');
          io.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    for (var o = 0; o < watched.length; o++) io.observe(watched[o]);
  }

  /* ---------- 5. Мелочи ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
