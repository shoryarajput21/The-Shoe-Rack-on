(async () => {
  if (!await requireAdmin()) return;
  const f = $('#f'), pv = $('#pv');
  const b = await sb.from('brands').select('id,name').order('name');
  $('#brand').innerHTML = (b.data || []).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('');
  $('#img').addEventListener('change', e => { pv.hidden = !e.target.value; pv.src = e.target.value; });
  pv.onerror = () => { pv.onerror = null; pv.src = FALLBACK; toast('Image failed to load. It may be blocked, expired or not a direct image link.', true); };
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let busy = false;
  f.onsubmit = async ev => {
    ev.preventDefault(); if (busy) return;
    const status = ev.submitter?.dataset.status || 'draft', d = Object.fromEntries(new FormData(f)), on = n => f[n].checked;
    if (!d.name.trim() || !d.brand_id || !d.main_image || d.price === '') return toast('Fill in name, brand, main image and price.', true);
    if (d.original_price && +d.original_price < +d.price) return toast('Original price must be at least the selling price.', true);
    busy = true; f.querySelectorAll('button').forEach(x => x.disabled = true);
    try {
      const sku = 'TSR-' + Date.now().toString(36).toUpperCase();
      const { data: p, error } = await sb.from('products').insert({
        name: d.name.trim(), slug: slug(d.name) + '-' + Math.random().toString(36).slice(2, 6), sku, brand_id: d.brand_id,
        short_desc: d.short_desc, price: +d.price, original_price: d.original_price ? +d.original_price : null,
        colors: d.colors.split(',').map(s => s.trim()).filter(Boolean),
        is_new: on('is_new'), best_seller: on('best_seller'), on_sale: on('on_sale'),
        status, main_image: d.main_image }).select('id').single();
      if (error) throw error;
      const extra = d.extra.split('\n').map(s => s.trim()).filter(Boolean).map((url, position) => ({ product_id: p.id, url, position }));
      const jobs = [];
      if (extra.length) jobs.push(sb.from('product_images').insert(extra));
      const bad = (await Promise.all(jobs)).find(r => r.error); if (bad) throw bad.error;
      toast(status === 'published' ? 'Published. It is now live on the website.' : 'Draft saved.'); f.reset(); pv.hidden = true; window.drawExtra && window.drawExtra();
    } catch (err) { toast(err.message?.includes('duplicate') ? 'That SKU already exists.' : 'Could not save: ' + (err.message || 'unknown error'), true); }
    busy = false; f.querySelectorAll('button').forEach(x => x.disabled = false);
  };
})();
