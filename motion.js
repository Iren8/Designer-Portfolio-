'use strict';

/* =========================
   SAFE QUERY HELPERS
========================= */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/* =========================
   INIT GUARDS
========================= */
function exists(el) {
  return el !== null && el !== undefined;
}

/* =========================
   PAGE TRANSITIONS (SAFE)
========================= */
function initTransitions() {
  const overlay = $('.page-transition');

  if (!exists(overlay)) return;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');

    if (!href ||
        href.startsWith('#') ||
        href.startsWith('mailto') ||
        link.target === '_blank') return;

    e.preventDefault();

    overlay.style.transform = 'scaleY(1)';

    setTimeout(() => {
      window.location.href = href;
    }, 450);
  });

  window.addEventListener('pageshow', () => {
    overlay.style.transform = 'scaleY(0)';
  });
}

/* =========================
   REVEAL SYSTEM (CRASH SAFE)
========================= */
function initReveal() {
  const items = $$('.reveal, .case-section, .ui-screen');

  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  items.forEach(el => io.observe(el));
}

/* =========================
   SCROLL PROGRESS (SAFE)
========================= */
function initProgress() {
  const bar = $('.scroll-progress');
  if (!exists(bar)) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {
      const max = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / max) * 100;

      bar.style.width = progress + '%';
      ticking = false;
    });
  }, { passive: true });
}

/* =========================
   MAGNETIC HOVER (SAFE)
========================= */
function initMagnetic() {
  const cards = $$('.case, .case-card');

  if (!cards.length) return;

  cards.forEach(card => {

    let x = 0, y = 0;
    let raf;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();

      const dx = (e.clientX - rect.left - rect.width / 2) * 0.04;
      const dy = (e.clientY - rect.top - rect.height / 2) * 0.04;

      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        x = dx;
        y = dy;

        card.style.transform =
          `scale(1.03) translate(${x}px, ${y}px)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
    });

  });
}

/* =========================
   CASE LINK HOVER GRADIENT
========================= */
function initCaseLinks() {
  const links = $$('.case-link');

  if (!links.length) return;

  links.forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      link.style.setProperty('--x', `${x}px`);
      link.style.setProperty('--y', `${y}px`);
    });
  });
}

/* =========================
   SAFE INIT (IMPORTANT)
========================= */
function init() {
  try {
    initTransitions();
    initReveal();
    initProgress();
    initMagnetic();
    initCaseLinks();
  } catch (err) {
    console.warn('Motion system error:', err);
  }
}

/* =========================
   BOOT
========================= */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
