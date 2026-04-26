/* ============================================================
   MOTION.JS — Interaction System
   Premium Portfolio | Irina Shytsik
   ============================================================ */

'use strict';

// ── Helpers ──────────────────────────────────────────────────
const qs  = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => [...root.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;

// ── State ─────────────────────────────────────────────────────
const state = {
  mouse: { x: 0, y: 0 },
  cursor: { x: 0, y: 0 },
  scrollY: 0,
  raf: null,
};

// ── 1. Progress Bar ───────────────────────────────────────────
function initProgressBar() {
  const bar = qs('#progress-bar');
  if (!bar) return;
  function update() {
    const doc  = document.documentElement;
    const scrollTop  = window.scrollY;
    const scrollMax  = doc.scrollHeight - doc.clientHeight;
    const pct = scrollMax > 0 ? (scrollTop / scrollMax) * 100 : 0;
    bar.style.width = `${pct}%`;
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ── 2. Nav scroll state ───────────────────────────────────────
function initNav() {
  const nav = qs('.nav');
  if (!nav) return;
  function update() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ── 3. Mobile menu ────────────────────────────────────────────
function initMobileMenu() {
  const btn    = qs('.nav__mobile-btn');
  const menu   = qs('.mobile-nav');
  const links  = qsa('.mobile-nav__links a');
  if (!btn || !menu) return;

  function toggle() {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', toggle);
  links.forEach(l => l.addEventListener('click', () => {
    menu.classList.remove('open');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }));
}

// ── 4. Custom Cursor ──────────────────────────────────────────
function initCursor() {
  const cursor = qs('#cursor');
  if (!cursor || window.matchMedia('(max-width:768px)').matches) return;

  document.addEventListener('mousemove', e => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
  });

  function loop() {
    state.cursor.x = lerp(state.cursor.x, state.mouse.x, 0.15);
    state.cursor.y = lerp(state.cursor.y, state.mouse.y, 0.15);
    cursor.style.left = state.cursor.x + 'px';
    cursor.style.top  = state.cursor.y + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  const hoverEls = qsa('a, button, .case-card, .expertise__item, .solution-card, .insight-item, .next-case__link');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// ── 5. Scroll Reveal ─────────────────────────────────────────
function initReveal() {
  const els = qsa('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

// ── 6. Parallax ───────────────────────────────────────────────
function initParallax() {
  const elements = qsa('[data-parallax]');
  if (!elements.length) return;

  function update() {
    const scrollY = window.scrollY;
    elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect  = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ── 7. Card Glow (cursor-following gradient) ─────────────────
function initCardGlow() {
  const cards = qsa('.case-card');
  cards.forEach(card => {
    const glow = card.querySelector('.case-card__glow');
    if (!glow) return;

    // Determine color per card type
    let color = '61,139,255';
    if (card.classList.contains('case-card--intelligence')) color = '155,107,255';
    if (card.classList.contains('case-card--control'))      color = '26,219,138';

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(${color},0.07) 0%, transparent 70%)`;
    });
    card.addEventListener('mouseleave', () => {
      glow.style.background = 'none';
    });
  });
}

// ── 8. Magnetic hover on case cards ──────────────────────────
function initMagnetic() {
  const cards = qsa('.case-card');
  const STRENGTH = 0.08; // low intensity = premium feel

  cards.forEach(card => {
    let raf = null;
    let tx = 0, ty = 0;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * STRENGTH;
      const dy = (e.clientY - cy) * STRENGTH;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        tx = lerp(tx, dx, 0.12);
        ty = lerp(ty, dy, 0.12);
        card.style.transform = `translate(${tx}px, ${ty}px)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      function release() {
        tx = lerp(tx, 0, 0.1);
        ty = lerp(ty, 0, 0.1);
        card.style.transform = `translate(${tx}px, ${ty}px)`;
        if (Math.abs(tx) > 0.05 || Math.abs(ty) > 0.05) {
          raf = requestAnimationFrame(release);
        } else {
          card.style.transform = '';
        }
      }
      raf = requestAnimationFrame(release);
    });
  });
}

// ── 9. Page Transitions ───────────────────────────────────────
function initPageTransitions() {
  const overlay = qs('#page-overlay');
  if (!overlay) return;

  // Animate in on load
  overlay.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
  overlay.style.transform = 'translateY(-100%)';

  // Intercept internal links
  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') ||
        href.startsWith('http') || link.target === '_blank') return;

    e.preventDefault();
    overlay.style.transform = 'translateY(0)';

    setTimeout(() => {
      window.location.href = href;
    }, 520);
  });

  // Also animate in fresh on page load
  window.addEventListener('pageshow', () => {
    overlay.style.transform = 'translateY(-100%)';
  });
}

// ── 10. Process Tab Switcher ──────────────────────────────────
function initProcessTabs() {
  const steps   = qsa('.pstep');
  const details = qsa('.pdetail');
  if (!steps.length) return;

  steps.forEach((step, i) => {
    step.addEventListener('click', () => {
      steps.forEach(s => s.classList.remove('active'));
      details.forEach(d => d.classList.remove('active'));
      step.classList.add('active');
      if (details[i]) details[i].classList.add('active');
    });
  });

  // Activate first
  if (steps[0]) steps[0].classList.add('active');
  if (details[0]) details[0].classList.add('active');
}

// ── 11. Smooth Scroll for anchor links ───────────────────────
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ── 12. Case Hero Parallax ────────────────────────────────────
function initHeroParallax() {
  const heroVisual = qs('.hero__visual');
  if (!heroVisual) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroVisual.style.transform = `translateY(${scrollY * 0.12}px)`;
  }, { passive: true });
}

// ── 13. Counter animation ─────────────────────────────────────
function initCounters() {
  const counters = qsa('[data-counter]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);

      const el    = entry.target;
      const end   = parseFloat(el.dataset.counter);
      const dur   = 1400;
      const start = performance.now();
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';

      function tick(now) {
        const elapsed = now - start;
        const pct = Math.min(elapsed / dur, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - pct, 3);
        const value = end < 0
          ? -(Math.abs(end) * eased)
          : end * eased;

        el.textContent = prefix + (Number.isInteger(end)
          ? Math.round(value)
          : value.toFixed(1)) + suffix;

        if (pct < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
}

// ── 14. Sticky progress on case studies ──────────────────────
function initCaseProgress() {
  // Shows reading progress on case pages
  // (Progress bar handles this globally)
}

// ── 15. Typewriter effect (hero title) ───────────────────────
function initTypewriter() {
  const el = qs('[data-typewriter]');
  if (!el) return;

  const words = el.dataset.typewriter.split('|');
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    if (deleting) {
      ci--;
    } else {
      ci++;
    }

    el.textContent = word.slice(0, ci);

    let delay = deleting ? 50 : 80;
    if (!deleting && ci === word.length) { delay = 2000; deleting = true; }
    if (deleting && ci === 0)            { deleting = false; wi = (wi + 1) % words.length; delay = 300; }

    setTimeout(tick, delay);
  }
  tick();
}

// ── INIT ALL ──────────────────────────────────────────────────
function init() {
  initProgressBar();
  initNav();
  initMobileMenu();
  initCursor();
  initReveal();
  initParallax();
  initCardGlow();
  initMagnetic();
  initPageTransitions();
  initProcessTabs();
  initSmoothScroll();
  initHeroParallax();
  initCounters();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
