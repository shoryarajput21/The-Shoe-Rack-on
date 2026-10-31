const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function animateCards() {
  try {
    if (!window.gsap || reduceMotion) return;
    const els = [...document.querySelectorAll('.card:not([data-a]), .brand-card:not([data-a])')];
    if (!els.length) return; els.forEach(e => e.dataset.a = 1);
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger); gsap.set(els, { opacity: 0, y: 30 });
      ScrollTrigger.batch(els, { start: 'top 94%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, stagger: .07, duration: .5, ease: 'power2.out', overwrite: true }) });
    } else gsap.from(els, { opacity: 0, y: 30, stagger: .07, duration: .5 });
  } catch (e) {}
}
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (!window.gsap || reduceMotion) return;
    gsap.from('#site-header', { y: -30, opacity: 0, duration: .5 });
    document.querySelectorAll('.block > h2, .block > h1, .prose > h1, .pinfo > *').forEach(el => gsap.from(el, { y: 18, opacity: 0, duration: .5, delay: .1 }));
    document.querySelectorAll('.btn').forEach(b => { b.addEventListener('mouseenter', () => gsap.to(b, { scale: 1.04, duration: .15 })); b.addEventListener('mouseleave', () => gsap.to(b, { scale: 1, duration: .15 })); });
    if (window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); gsap.from('.marquee', { scrollTrigger: { trigger: '.marquee', start: 'top 95%' }, opacity: 0, duration: .8 }); }
  } catch (e) {}
});
