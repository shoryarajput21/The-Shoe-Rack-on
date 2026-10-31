(async () => {
  if (!await requireAdmin()) return;
  const f = $('#f'), pv = $('#pv'), id = new URLSearchParams(location.search).get('id');
  if (!id) return location.replace('products.html');
  const [b, pr, im] = await Promise.all([sb.from('brands').select('id,name').order('name'),
    sb.from('products').select('*').eq('id', id).maybeSingle(), sb.from('product_images').select('url,position').eq('product_id', id).order('position')]);
  const p = pr.data; if (!p) { toast('Product not found.', true); return setTimeout(() => location.replace('products.html'), 1200); }
  $('#brand').innerHTML = (b.data || []).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('');
  const set = (n, v) => { if (f[n]) f[n].value = v ?? ''; };
  ['name', 'brand_id', 'short_desc', 'main_image', 'price', 'original_price'].forEach(n => set(n, p[n]));
  set('colors', (p.colors || []).join(', ')); set('extra', (im.data || []).map(i => i.url).join('\n'));
  window.drawExtra && window.drawExtra();
  ['is_new', 'best_seller', 'on_sale'].forEach(n => f[n].checked = !!p[n]);
  pv.src = p.main_image || FALLBACK; pv.hidden = !p.main_image;
  $('#img').addEventListener('change', e => { pv.hidden = !e.target.value; pv.src = e.target.value; });
  pv.onerror = () => { pv.onerror = null; pv.src = FALLBACK; toast('Image failed to load. It may be blocked or expired.', true); };
  let busy = false;
  f.onsubmit = async ev => {
    ev.preventDefault(); if (busy) return;
    const status = ev.submitter?.dataset.status || p.status, d = Object.fromEntries(new FormData(f)), on = n => f[n].checked;
    if (!d.name.trim() || !d.brand_id || !d.main_image || d.price === '') return toast('Fill in name, brand, main image and price.', true);
    if (d.original_price && +d.original_price < +d.price) return toast('Original price must be at least the selling price.', true);
    busy = true; f.querySelectorAll('button').forEach(x => x.disabled = true);
    try {
      const { error } = await sb.from('products').update({ name: d.name.trim(), brand_id: d.brand_id, short_desc: d.short_desc,
        price: +d.price, original_price: d.original_price ? +d.original_price : null, colors: d.colors.split(',').map(s => s.trim()).filter(Boolean),
        is_new: on('is_new'), best_seller: on('best_seller'), on_sale: on('on_sale'), status, main_image: d.main_image }).eq('id', id);
      if (error) throw error;
      const extra = d.extra.split('\n').map(s => s.trim()).filter(Boolean).map((url, position) => ({ product_id: id, url, position }));
      let r = await sb.from('product_images').delete().eq('product_id', id); if (r.error) throw r.error;
      if (extra.length) { r = await sb.from('product_images').insert(extra); if (r.error) throw r.error; }
      toast('Saved. Changes are live on the website.'); setTimeout(() => location.href = 'products.html', 900);
    } catch (err) { toast(err.message?.includes('duplicate') ? 'That SKU already exists.' : 'Could not save: ' + (err.message || 'unknown error'), true); busy = false; f.querySelectorAll('button').forEach(x => x.disabled = false); }
  };
})();
