(async () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { if (window.gsap && !reduce) { gsap.from('.hero-copy > *', { y: 28, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out' }); gsap.from('.hero-img', { x: 40, opacity: 0, duration: .9, ease: 'power3.out' }); } } catch {}
  const track = $('#brand-track'), grid = $('#new-grid');
  const { data: brands } = await sb.from('brands').select('name,slug').eq('active', true).order('name');
  const list = brands?.length ? brands : ['Nike','Hoka','Puma','Adidas','New Balance','Asics','Skechers','Reebok','Converse','Vans','Nitro'].map(n => ({ name: n, slug: n.toLowerCase().replace(/ /g, '-') }));
  const html = list.map(b => `<a href="brand.html?slug=${encodeURIComponent(b.slug)}">${esc(b.name)}</a>`).join('');
  track.innerHTML = html + html.replace(/<a /g, '<a aria-hidden="true" tabindex="-1" ');
  grid.innerHTML = '<p class="state">Loading…</p>';
  const { data, error } = await sb.from('products').select(PRODUCT_SELECT).eq('status', 'published').order('created_at', { ascending: false }).limit(8);
  grid.innerHTML = error ? '<p class="state">Could not load products. Check js/config.js.</p>' : data.length ? data.map(productCard).join('') : '<p class="state">New shoes are coming soon.</p>';
  animateCards();
})();
