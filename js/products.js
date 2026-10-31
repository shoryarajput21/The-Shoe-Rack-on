(async () => {
  const mode = document.body.dataset.filter || 'all', PAGE = 12; let page = 0, busy = false;
  const q = new URLSearchParams(location.search), grid = $('#grid'), more = $('#more'), count = $('#count');
  const f = { search: $('#search'), brand: $('#brand'), sort: $('#sort') };
  f.search.value = q.get('q') || '';
  const { data: bs } = await sb.from('brands').select('name,slug').order('name');
  f.brand.innerHTML = '<option value="">All brands</option>' + (bs || []).map(b => `<option value="${esc(b.slug)}">${esc(b.name)}</option>`).join('');
  f.brand.value = q.get('slug') || '';
  if (mode === 'brand') { const nm = f.brand.selectedOptions[0]?.textContent; if (nm && f.brand.value) { $('main h2').textContent = nm; document.title = nm + ' | THE SHOE RACK'; } }
  async function load(reset) {
    if (busy) return; busy = true;
    if (reset) { page = 0; grid.innerHTML = '<p class="state">Loading…</p>'; }
    let r = sb.from('products').select('*, brands!inner(name,slug), product_variants(size,stock), product_images(url,position)', { count: 'exact' }).eq('status', 'published');
    if (mode === 'new') r = r.eq('is_new', true); if (mode === 'best') r = r.eq('best_seller', true); if (mode === 'sale') r = r.eq('on_sale', true);
    if (f.brand.value) r = r.eq('brands.slug', f.brand.value);
    const term = f.search.value.trim().replace(/[%,()]/g, ' ');
    if (term) r = r.or(`name.ilike.%${term}%,sku.ilike.%${term}%,short_desc.ilike.%${term}%`);
    const s = f.sort.value;
    r = s === 'low' ? r.order('price') : s === 'high' ? r.order('price', { ascending: false }) : s === 'name' ? r.order('name') : s === 'featured' ? r.order('featured', { ascending: false }) : r.order('created_at', { ascending: false });
    const { data, error, count: n } = await r.range(page * PAGE, page * PAGE + PAGE - 1);
    busy = false;
    if (error) { grid.innerHTML = '<p class="state">Something went wrong loading shoes. Please refresh.</p>'; return; }
    if (reset) grid.innerHTML = '';
    if (!data.length && reset) grid.innerHTML = '<p class="state">No shoes match. Try clearing filters.</p>';
    grid.insertAdjacentHTML('beforeend', data.map(productCard).join(''));
    animateCards(); count.textContent = `${n ?? 0} shoe${n === 1 ? '' : 's'}`; more.hidden = (page + 1) * PAGE >= (n ?? 0); page++;
  }
  [f.brand, f.sort].forEach(el => el.addEventListener('change', () => load(true)));
  let t; f.search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => load(true), 300); });
  $('#reset').onclick = () => { f.search.value = ''; f.brand.value = ''; f.sort.value = 'new'; load(true); };
  more.onclick = () => load(false); load(true);
})();
