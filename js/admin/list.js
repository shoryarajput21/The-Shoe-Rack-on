(async () => {
  if (!await requireAdmin()) return;
  let all = [], busy = false; const rows = $('#rows');
  async function load() {
    const { data, error } = await sb.from('products').select('id,name,slug,sku,price,status,main_image,brand_id,category_id,brands(name),product_variants(size,stock)').order('created_at', { ascending: false });
    if (error) { rows.innerHTML = '<tr><td colspan="6">Could not load products.</td></tr>'; return; }
    all = data; draw();
  }
  function draw() {
    const t = $('#q').value.trim().toLowerCase();
    const list = all.filter(p => !t || `${p.name} ${p.sku} ${p.brands?.name}`.toLowerCase().includes(t));
    $('#cnt').textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
    rows.innerHTML = list.map(p => `<tr><td><img src="${esc(p.main_image || FALLBACK)}" alt="" onerror="this.onerror=null;this.src=FALLBACK"></td>
     <td><b>${esc(p.name)}</b><br><small>${esc(p.sku)}</small></td><td>${esc(p.brands?.name)}</td><td>${inr(p.price)}</td>
     <td><span class="st ${p.status === 'published' ? 'pub' : ''}">${p.status === 'published' ? 'Published' : 'Draft'}</span></td>
     <td><div class="acts"><a class="btn ghost" href="edit-product.html?id=${p.id}">Edit</a><button class="btn ghost" data-a="tog" data-id="${p.id}">${p.status === 'published' ? 'Unpublish' : 'Publish'}</button><button class="btn ghost" data-a="dup" data-id="${p.id}">Duplicate</button><button class="btn ghost del" data-a="del" data-id="${p.id}">Delete</button></div></td></tr>`).join('') || '<tr><td colspan="6">No products found.</td></tr>';
  }
  $('#q').oninput = draw;
  rows.onclick = async e => {
    const b = e.target.closest('[data-a]'); if (!b || busy) return; const p = all.find(x => x.id === b.dataset.id); busy = true;
    try {
      if (b.dataset.a === 'tog') { const s = p.status === 'published' ? 'draft' : 'published'; const { error } = await sb.from('products').update({ status: s }).eq('id', p.id); if (error) throw error; toast(s === 'published' ? 'Published.' : 'Moved to drafts.'); }
      if (b.dataset.a === 'del') { if (!confirm(`Delete "${p.name}" permanently? This cannot be undone.`)) { busy = false; return; } const { error } = await sb.from('products').delete().eq('id', p.id); if (error) throw error; toast('Product deleted.'); }
      if (b.dataset.a === 'dup') {
        const { data: full, error } = await sb.from('products').select('*, product_images(url,position), product_variants(size,stock)').eq('id', p.id).single(); if (error) throw error;
        const { id, created_at, product_images, product_variants, ...c } = full; const r = Math.random().toString(36).slice(2, 6);
        const { data: n, error: e2 } = await sb.from('products').insert({ ...c, name: c.name + ' (copy)', slug: c.slug + '-' + r, sku: c.sku + '-' + r.toUpperCase(), status: 'draft' }).select('id').single(); if (e2) throw e2;
        if (product_variants.length) await sb.from('product_variants').insert(product_variants.map(v => ({ ...v, product_id: n.id })));
        if (product_images.length) await sb.from('product_images').insert(product_images.map(i => ({ ...i, product_id: n.id })));
        toast('Duplicated as a draft.');
      }
      await load();
    } catch (err) { toast('Failed: ' + (err.message || 'error'), true); }
    busy = false;
  };
  load();
})();
