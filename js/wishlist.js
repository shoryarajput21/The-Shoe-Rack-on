(async function load() {
  const grid = $('#grid'), ids = store.get('tsr-wish');
  if (!ids.length) { grid.innerHTML = '<p class="state">Your wishlist is empty. <a href="products.html" style="text-decoration:underline">Browse shoes</a></p>'; return; }
  const { data, error } = await sb.from('products').select(PRODUCT_SELECT).in('id', ids).eq('status', 'published');
  if (error) { grid.innerHTML = '<p class="state">Could not load your wishlist. Please refresh.</p>'; return; }
  grid.innerHTML = data.length ? data.map(productCard).join('') : '<p class="state">Saved items are no longer available.</p>';
  animateCards();
  if (!load.bound) { load.bound = 1; document.addEventListener('click', e => { if (e.target.closest('[data-wish]')) setTimeout(load, 0); }); }
})();
