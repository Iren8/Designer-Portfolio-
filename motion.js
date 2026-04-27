/* =========================
   PAGE TRANSITIONS
========================= */
const overlay = document.querySelector(".page-transition");

document.querySelectorAll("a[href]").forEach(link => {
  link.addEventListener("click", (e) => {

    const url = link.getAttribute("href");

    if (!url || url.startsWith("#")) return;

    e.preventDefault();

    overlay.style.transform = "scaleY(1)";

    setTimeout(() => {
      window.location.href = url;
    }, 500);
  });
});

window.addEventListener("pageshow", () => {
  overlay.style.transform = "scaleY(0)";
});

/* =========================
   REVEAL + STAGGER
========================= */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      const delay = entry.target.dataset.delay || 0;

      setTimeout(() => {
        entry.target.classList.add("visible");
      }, delay * 120);

    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal, .ui-screen")
  .forEach(el => observer.observe(el));

/* =========================
   SCROLL PROGRESS
========================= */
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;

  const bar = document.querySelector(".scroll-progress");
  if (bar) bar.style.width = progress + "%";
});


document.querySelectorAll(".case-link").forEach(link => {

  link.addEventListener("mousemove", (e) => {
    const rect = link.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    link.style.setProperty("--x", `${x}px`);
    link.style.setProperty("--y", `${y}px`);
  });

});
