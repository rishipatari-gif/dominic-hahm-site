/* Dominic Hahm — shared behaviour: sticky nav, mobile drawer, scroll reveal. */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- sticky nav ---- */
  var nav = document.getElementById('nav');
  if (nav) {
    var ticking = false;
    var onScroll = function () {
      if (window.scrollY > 24) nav.classList.add('is-stuck');
      else nav.classList.remove('is-stuck');
    };
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { onScroll(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    onScroll();
  }

  /* ---- mobile drawer ---- */
  var toggle = document.getElementById('navToggle');
  var drawer = document.getElementById('drawer');
  var close = document.getElementById('drawerClose');
  if (toggle && drawer && close) {
    var setDrawer = function (open) {
      drawer.setAttribute('data-open', open ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) close.focus(); else toggle.focus();
    };
    toggle.addEventListener('click', function () { setDrawer(true); });
    close.addEventListener('click', function () { setDrawer(false); });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.getAttribute('data-open') === 'true') setDrawer(false);
    });
  }

  /* ---- reveal on scroll ---- */
  var items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.style.transitionDelay = (en.target.dataset.d || 0) + 'ms';
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  var groups = {};
  items.forEach(function (el) {
    var host = el.closest('section') || el.closest('footer');
    var key = host ? (host.id || host.className.slice(0, 12)) : 'x';
    groups[key] = (groups[key] || 0);
    el.dataset.d = Math.min(groups[key] * 55, 220);
    groups[key]++;
    io.observe(el);
  });

  /* Safety net: never leave content hidden if the observer misfires. */
  window.setTimeout(function () {
    items.forEach(function (el) { el.classList.add('in'); });
  }, 3000);
})();
