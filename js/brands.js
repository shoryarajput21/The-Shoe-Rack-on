(async () => {
  const g = $('#brands'); g.innerHTML = '<p class="state">Loading…</p>';
  const { data, error } = await sb.from('brands').select('name,slug').eq('active', true).order('name');
  g.innerHTML = error ? '<p class="state">Could not load brands.</p>' : (data.length ? data : []).map(b => `<a class="brand-card" href="brand.html?slug=${encodeURIComponent(b.slug)}">${esc(b.name)}</a>`).join('') || '<p class="state">No brands yet.</p>';
  animateCards();
})();
