(async () => {
  const box = $('#pd'), slug = new URLSearchParams(location.search).get('slug');
  const nf = m => box.innerHTML = `<p class="state">${m} <a href="products.html" style="text-decoration:underline">Browse all shoes</a></p>`;
  if (!slug) return nf('No product selected.');
  box.innerHTML = '<p class="state">Loading…</p>';
  const { data: p, error } = await sb.from('products').select('*, brands(name,slug), product_variants(size,stock), product_images(url,position)').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error) return nf('Could not load this product. Please refresh.');
  if (!p) return nf('This product is not available.');
  document.title = `${p.seo_title || p.name} | THE SHOE RACK`;
  const md = $('meta[name=description]'); if (md) md.content = p.seo_desc || p.short_desc || p.name;
  const key = s => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;
  const vars = [...(p.product_variants || [])].sort((a, b) => key(a.size) - key(b.size));
  const imgs = [...new Set([p.main_image, ...(p.product_images || []).sort((a, b) => a.position - b.position).map(i => i.url)].filter(Boolean))];
  const off = p.original_price > p.price ? Math.round(100 - p.price / p.original_price * 100) : 0;
  const inStock = true, canAsk = false; // all sizes are always available
  let color = (p.colors || []).length === 1 ? p.colors[0] : '', qty = 1;
  box.innerHTML = `<div class="pd"><div class="gal"><div class="mainimg"><img id="mi" src="${esc(imgs[0] || FALLBACK)}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src=FALLBACK">${imgs.length > 1 ? '<button class="nav prev" aria-label="Previous image">‹</button><button class="nav next" aria-label="Next image">›</button>' : ''}</div>
   ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((u, i) => `<button data-i="${i}" aria-label="Image ${i + 1}"><img src="${esc(u)}" alt="" loading="lazy" onerror="this.onerror=null;this.src=FALLBACK"></button>`).join('')}</div>` : ''}</div>
   <div class="pinfo"><a class="crumb" href="brand.html?slug=${encodeURIComponent(p.brands?.slug || '')}">${esc(p.brands?.name)}</a><h1>${esc(p.name)}</h1>
   <p class="price big"><b>${inr(p.price)}</b> ${off ? `<s>${inr(p.original_price)}</s> <i class="off">-${off}%</i>` : ''}</p><p>${esc(p.short_desc)}</p>
   ${(p.colors || []).length ? `<h3>Colour</h3><div class="opts" id="colors">${p.colors.map(c => `<button data-color="${esc(c)}" ${p.colors.length === 1 ? 'class="on"' : ''}>${esc(c)}</button>`).join('')}</div>` : ''}
   <h3>Quantity</h3><div class="qty"><button id="qm" aria-label="Less">−</button><span id="qv">1</span><button id="qp" aria-label="More">+</button></div>
   <div class="cta">${canAsk ? '' : `<button class="btn" id="add" ${inStock ? '' : 'disabled'}>${inStock ? 'Add to cart' : 'Out of stock'}</button>`}<button class="btn ${canAsk ? '' : 'ghost'}" id="wa" ${inStock || canAsk ? '' : 'disabled'}>${canAsk ? 'Order on WhatsApp' : 'Buy on WhatsApp'}</button><button class="btn ghost" data-wish="${p.id}" id="wl">${store.get('tsr-wish').includes(p.id) ? '♥' : '♡'} Wishlist</button></div>
   <p class="note">${canAsk ? 'This pair is currently out of stock. Tap Order on WhatsApp to ask about availability. ' : ''}Buy on WhatsApp asks you to fill your shoe size, name, mobile number and address, then sends the order request. For Add to cart, you enter the size in your cart. It is confirmed only after we reply.</p>
   <dl class="meta"><dt>SKU</dt><dd>${esc(p.sku)}</dd>${p.material ? `<dt>Material</dt><dd>${esc(p.material)}</dd>` : ''}${p.gender ? `<dt>For</dt><dd>${esc(p.gender)}</dd>` : ''}</dl>
   ${p.description ? `<div class="desc">${esc(p.description).replace(/\n/g, '<br>')}</div>` : ''}</div></div>`;
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku, image: imgs, brand: { '@type': 'Brand', name: p.brands?.name }, description: p.short_desc || p.name, offers: { '@type': 'Offer', priceCurrency: 'INR', price: p.price, availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } });
  document.head.append(ld);
  const stockOf = s => 10;
  const pick = (sel, attr, set) => $$(sel + ' button').forEach(b => b.onclick = () => { $$(sel + ' button').forEach(x => x.classList.remove('on')); b.classList.add('on'); set(b.dataset[attr]); });
  if ($('#colors')) pick('#colors', 'color', v => color = v);
  let gi = 0; const show = i => { gi = (i + imgs.length) % imgs.length; $('#mi').src = imgs[gi]; $$('.thumbs button').forEach((b, n) => b.classList.toggle('on', n === gi)); };
  $$('.thumbs button').forEach(b => b.onclick = () => show(+b.dataset.i)); show(0);
  if ($('.prev')) { $('.prev').onclick = () => show(gi - 1); $('.next').onclick = () => show(gi + 1); }
  let sx = 0; const mim = $('.mainimg'); mim.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  mim.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40 && imgs.length > 1) show(gi + (dx < 0 ? 1 : -1)); });
  $('#qm').onclick = () => { qty = Math.max(1, qty - 1); $('#qv').textContent = qty; };
  $('#qp').onclick = () => { if (qty < 10) qty++; else toast('Maximum 10 pairs per order. For bulk orders, message us on WhatsApp.', true); $('#qv').textContent = qty; };
  const check = () => { if ((p.colors || []).length && !color) { toast('Please select a colour.', true); return false; } return true; };
  if ($('#add')) $('#add').onclick = () => {
    if (!check()) return;
    const cart = store.get('tsr-cart'), ex = cart.find(i => i.id === p.id && i.color === color);
    if (ex) ex.qty = Math.min(ex.qty + qty, 10); else cart.push({ id: p.id, slug: p.slug, size: '', color, qty });
    store.set('tsr-cart', cart); counts(); toast('Added to cart.');
    if (window.gsap && !reduceMotion) try { gsap.fromTo('[data-cart-count]', { scale: 1.8 }, { scale: 1, duration: .4 }); } catch {}
  };
  $('#wa').onclick = () => {
    if ((p.colors || []).length && !color) { toast('Please select a colour.', true); return; }
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<form class="mbox" role="dialog" aria-modal="true" aria-label="Your details"><h3>Your details</h3>
      <p class="note">${esc(p.name)}${color ? ' · ' + esc(color) : ''} · Qty ${qty}</p>
      <input id="wsize" placeholder="Your shoe size * (e.g. UK 7)" required maxlength="20">
      <input id="wname" placeholder="Your name *" required maxlength="100" autocomplete="name">
      <input id="wphone" placeholder="Mobile number *" required maxlength="15" autocomplete="tel" inputmode="tel">
      <textarea id="waddr" rows="3" placeholder="Full delivery address (house no, area, city, pincode) *" required maxlength="500" autocomplete="street-address"></textarea>
      <button class="btn" type="submit">Continue to WhatsApp</button><button class="lnk" type="button" id="wcancel">Cancel</button></form>`;
    document.body.append(m); $('#wname', m).focus();
    const close = () => m.remove();
    $('#wcancel', m).onclick = close; m.addEventListener('click', e => { if (e.target === m) close(); });
    m.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    m.querySelector('form').onsubmit = ev => {
      ev.preventDefault();
      const name = $('#wname', m).value.trim(), addr = $('#waddr', m).value.trim();
      const phone = $('#wphone', m).value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
      const wsize = $('#wsize', m).value.trim();
      if (!wsize) return toast('Please enter your shoe size.', true);
      if (name.length < 2) return toast('Please enter your name.', true);
      if (!/^[6-9]\d{9}$/.test(phone)) return toast('Please enter a valid 10-digit mobile number.', true);
      if (addr.length < 10) return toast('Please enter your full delivery address.', true);
      const msg = ['Hello THE SHOE RACK, I want to order:', `Name: ${name}`, `Mobile: ${phone}`, `Delivery address: ${addr}`, '', `Product: ${p.name}`, `Brand: ${p.brands?.name}`, `SKU: ${p.sku}`, `Size: ${wsize}`, color ? `Color: ${color}` : null, `Quantity: ${qty}`, `Price: ${inr(p.price)}`, `Total: ${inr(p.price * qty)}`, `Link: ${location.href}`, '', '(Order request. Please confirm availability.)'].filter(x => x !== null).join('\n');
      location.href = waLink(msg);
    };
  };
})();
