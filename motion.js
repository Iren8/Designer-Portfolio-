'use strict';

/* =========================
   HELPERS
========================= */
const qs  = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => [...root.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;

/* =========================
   GLOBAL STATE
========================= */
const state = {
  mouse: { x: 0, y: 0 },
  cursor: { x: 0, y: 0 },
  scrollY: 0,
};

/* =========================
   PAGE TRANSITIONS (UNIFIED)
========================= */
function initPageTransitions() {
  const overlay = qs('.page-transition') || qs('#page-overlay');
  if (!overlay) return;

  overlay.style.transformOrigin = 'bottom';

  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');

    if (!href || href.startsWith('#') || href.startsWith('mailto') ||
        href.startsWith('http') || link.target === '_blank') return;

    e.preventDefault();

    overlay.style.transform = 'scaleY(1)';

    setTimeout(() => {
      window.location.href = href;
    }, 500);
  });

  window.addEventListener('pageshow', () => {
    overlay.style.transform = 'scaleY(0)';
  });
}

/* =========================
   UNIFIED OBSERVER
========================= */
function initReveal() {
  const elements = qsa('.reveal, .case-section, .ui-screen');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const delay = entry.target.dataset.delay || 0;

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay * 100);

      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  elements.forEach(el => io.observe(el));
}

/* =========================
   SCROLL SYSTEM (ONE LOOP)
========================= */
function initScrollSystem() {
  const progressBar = qs('.scroll-progress') || qs('#progress-bar');
  const parallaxEls = qsa('[data-parallax]');
  const heroVisual = qs('.hero__visual');
  const nav = qs('.nav');

  let ticking = false;

  window.addEventListener('scroll', () => {
    state.scrollY = window.scrollY;

    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  function update() {
    const scrollY = state.scrollY;

    /* progress */
    if (progressBar) {
      const max = document.body.scrollHeight - window.innerHeight;
      const pct = (scrollY / max) * 100;
      progressBar.style.width = pct + '%';
    }

    /* nav state */
    if (nav) {
      nav.classList.toggle('nav--scrolled', scrollY > 40);
    }

    /* hero parallax */
    if (heroVisual) {
      heroVisual.style.transform = `translateY(${scrollY * 0.12}px)`;
    }

    /* generic parallax */
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });

    ticking = false;
  }
}

/* =========================
   CURSOR
========================= */
function initCursor() {
  const cursor = qs('#cursor');
  if (!cursor || window.innerWidth < 768) return;

  document.addEventListener('mousemove', e => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
  });

  function loop() {
    state.cursor.x = lerp(state.cursor.x, state.mouse.x, 0.15);
    state.cursor.y = lerp(state.cursor.y, state.mouse.y, 0.15);

    cursor.style.transform = `translate(${state.cursor.x}px, ${state.cursor.y}px)`;

    requestAnimationFrame(loop);
  }
  loop();
}

/* =========================
   CARD GLOW (PREVIEW)
========================= */
function initCardGlow() {
  qsa('.case-card').forEach(card => {
    const glow = card.querySelector('.case-card__glow');
    if (!glow) return;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      glow.style.background =
        `radial-gradient(400px circle at ${x}px ${y}px, rgba(255,255,255,0.07), transparent 70%)`;
    });

    card.addEventListener('mouseleave', () => {
      glow.style.background = 'none';
    });
  });
}

/* =========================
   MAGNETIC (FIXED, NO JITTER)
========================= */
function initMagnetic() {
  const cards = qsa('.case, .case-card');

  cards.forEach(card => {
    let tx = 0, ty = 0;
    let raf;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();

      const dx = (e.clientX - (rect.left + rect.width/2)) * 0.04;
      const dy = (e.clientY - (rect.top + rect.height/2)) * 0.04;

      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        tx = lerp(tx, dx, 0.12);
        ty = lerp(ty, dy, 0.12);

        /* сохраняем scale */
        card.style.transform =
          `scale(1.035) translate(${tx}px, ${ty}px)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);

      function reset() {
        tx = lerp(tx, 0, 0.1);
        ty = lerp(ty, 0, 0.1);

        card.style.transform =
          `scale(1) translate(${tx}px, ${ty}px)`;

        if (Math.abs(tx) > 0.1 || Math.abs(ty) > 0.1) {
          raf = requestAnimationFrame(reset);
        } else {
          card.style.transform = '';
        }
      }

      raf = requestAnimationFrame(reset);
    });
  });
}

/* =========================
   SMOOTH SCROLL
========================= */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* =========================
   INIT
========================= */
function init() {
  initPageTransitions();
  initReveal();
  initScrollSystem();
  initCursor();
  initCardGlow();
  initMagnetic();
  initSmoothScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
