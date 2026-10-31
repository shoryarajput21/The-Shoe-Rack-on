(async () => {
  const box = $('#cart'), form = $('#checkout'); let lines = [], total = 0, busy = false;
  async function render() {
    let cart = store.get('tsr-cart');
    if (!cart.length) { box.innerHTML = '<p class="state">Your cart is empty. <a href="products.html" style="text-decoration:underline">Start shopping</a></p>'; form.hidden = true; counts(); return; }
    box.innerHTML = '<p class="state">Loading…</p>';
    const { data, error } = await sb.from('products').select('id,name,slug,sku,price,main_image,brands(name),product_variants(size,stock)').in('id', [...new Set(cart.map(i => i.id))]).eq('status', 'published');
    if (error) { box.innerHTML = '<p class="state">Could not check prices. Please refresh.</p>'; return; }
    const map = Object.fromEntries(data.map(p => [p.id, p])); let note = '';
    cart = cart.filter(i => { const p = map[i.id]; if (!p) { note = 'Some items were removed because they are no longer available.'; return false; } if (i.qty > 10) { i.qty = 10; note = 'Maximum 10 pairs per item.'; } return true; });
    store.set('tsr-cart', cart); counts();
    if (!cart.length) return render();
    lines = cart.map(i => ({ ...i, p: map[i.id] })); total = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
    box.innerHTML = (note ? `<p class="note">${note}</p>` : '') + lines.map((l, n) => `<div class="crow"><a href="product-details.html?slug=${encodeURIComponent(l.p.slug)}"><img src="${esc(l.p.main_image || FALLBACK)}" alt="${esc(l.p.name)}" onerror="this.onerror=null;this.src=FALLBACK"></a>
     <div><b>${esc(l.p.name)}</b><br><small>${esc(l.p.brands?.name)}${l.color ? ' · ' + esc(l.color) : ''}</small><br><input class="sizein" data-n="${n}" value="${esc(l.size || '')}" placeholder="Your shoe size * (e.g. UK 7)" maxlength="20" aria-label="Shoe size"><div class="qty"><button data-act="m" data-n="${n}" aria-label="Less">−</button><span>${l.qty}</span><button data-act="p" data-n="${n}" aria-label="More">+</button></div></div>
     <div class="ra"><b>${inr(l.p.price * l.qty)}</b><br><button class="lnk" data-act="r" data-n="${n}">Remove</button></div></div>`).join('') + `<p class="total">Subtotal: <b>${inr(total)}</b> &nbsp; Total: <b>${inr(total)}</b></p>`;
    form.hidden = false;
    if (window.gsap && !reduceMotion) try { gsap.from('.crow', { y: 20, opacity: 0, stagger: .07, duration: .4 }); } catch {}
  }
  box.addEventListener('input', e => { const el = e.target.closest('.sizein'); if (!el) return; const n = +el.dataset.n, cart = store.get('tsr-cart'); if (!cart[n]) return; cart[n].size = el.value.trim(); lines[n].size = cart[n].size; store.set('tsr-cart', cart); });
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return; const n = +b.dataset.n, cart = store.get('tsr-cart'), l = lines[n];
    if (b.dataset.act === 'r') cart.splice(n, 1);
    if (b.dataset.act === 'm') cart[n].qty = Math.max(1, cart[n].qty - 1);
    if (b.dataset.act === 'p') { if (cart[n].qty >= 10) return toast('Maximum 10 pairs per item.', true); cart[n].qty++; }
    store.set('tsr-cart', cart); render();
  });
  form.onsubmit = async ev => {
    ev.preventDefault(); if (busy) return; const name = $('#cname').value.trim(); if (name.length < 2) return toast('Please enter your name.', true);
    const phoneDigits = $('#cphone').value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) return toast('Please enter a valid 10-digit mobile number.', true);
    const noSize = lines.findIndex(l => !String(l.size || '').trim()); if (noSize > -1) { $$('.sizein')[noSize]?.focus(); return toast('Please enter your shoe size for each item.', true); }
    if ($('#caddr').value.trim().length < 10) return toast('Please enter your full delivery address.', true);
    busy = true; $('#order').disabled = true; let ref = '', t = total;
    try { const { data } = await sb.rpc('create_order_request', { p_name: name, p_phone: $('#cphone').value.trim(), p_address: $('#caddr').value.trim(), p_items: lines.map(l => ({ id: l.id, size: l.size, color: l.color, qty: l.qty })) }); if (data?.id) { ref = data.id.slice(0, 8).toUpperCase(); t = data.total; } } catch {}
    const msg = ['Hello THE SHOE RACK, I would like to place an order request.', `Name: ${name}`, $('#cphone').value.trim() && `Phone: ${$('#cphone').value.trim()}`, $('#caddr').value.trim() && `Delivery address: ${$('#caddr').value.trim()}`, '',
      ...lines.map((l, i) => `${i + 1}) ${l.p.name} (${l.p.brands?.name}) | SKU ${l.p.sku} | Size ${l.size}${l.color ? ' | ' + l.color : ''} | Qty ${l.qty} x ${inr(l.p.price)} = ${inr(l.p.price * l.qty)}`),
      '', `Subtotal: ${inr(t)}`, `Total: ${inr(t)}`, ref && `Order ref: ${ref}`, '(Order request. Not confirmed until you reply.)'].filter(x => x !== '' && x !== false && x !== undefined || x === '').join('\n');
    busy = false; $('#order').disabled = false; location.href = waLink(msg);
  };
  render();
})();
