const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23ddd'/%3E%3Ctext x='200' y='155' text-anchor='middle' fill='%23888' font-family='sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";
const store = { get: k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
(function () { let t; try { t = localStorage.getItem('tsr-theme'); } catch {}
  document.documentElement.dataset.theme = t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); })();
function toast(msg, bad) { const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.setAttribute('role', 'status'); t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 3500); }
function counts() { $$('[data-cart-count]').forEach(e => e.textContent = store.get('tsr-cart').reduce((a, i) => a + i.qty, 0)); $$('[data-wish-count]').forEach(e => e.textContent = store.get('tsr-wish').length); }
function renderChrome() {
  const h = $('#site-header'), f = $('#site-footer'); if (!h) return;
  const links = [['products.html','All Shoes'],['brands.html','Brands'],['new-arrivals.html','New Arrivals'],['sale.html','Sale']];
  const here = location.pathname.split('/').pop() || 'index.html';
  h.innerHTML = `<div class="bar wrap"><a class="logo" href="index.html">THE SHOE RACK</a>
   <nav id="nav" aria-label="Main">${links.map(([u,l]) => `<a href="${u}" ${u===here?'aria-current="page"':''}>${l}</a>`).join('')}</nav>
   <form class="hsearch" action="search.html" method="get" role="search"><input type="search" name="q" placeholder="Search shoes, brands, SKU" aria-label="Search shoes" autocomplete="off"><button type="submit" aria-label="Search">&#128269;</button></form>
   <div class="tools"><a href="admin/login.html">Account</a>
   <a href="wishlist.html" aria-label="Wishlist">♡ <b data-wish-count>0</b></a><a href="cart.html" aria-label="Cart">Cart <b data-cart-count>0</b></a>
   <button id="theme" aria-label="Toggle theme">◐</button><button id="burger" aria-label="Menu" aria-expanded="false">☰</button></div></div>`;
  f.innerHTML = `<div class="wrap fgrid">
   <div><h4>Shop</h4><a href="products.html">All Shoes</a><a href="brand.html?slug=nike">Nike</a><a href="brand.html?slug=hoka">Hoka</a><a href="brand.html?slug=puma">Puma</a><a href="new-arrivals.html">New Arrivals</a><a href="best-sellers.html">Best Sellers</a></div>
   <div><h4>Customer service</h4><a href="contact.html">Contact Us</a><a href="faq.html">FAQ</a><a href="size-guide.html">Size Guide</a><a href="shipping-policy.html">Shipping Policy</a><a href="returns-policy.html">Returns and Refunds</a></div>
   <div><h4>Information</h4><a href="about.html">About Us</a><a href="privacy-policy.html">Privacy Policy</a><a href="terms.html">Terms and Conditions</a></div>
   <div><h4>THE SHOE RACK</h4><p>${CONFIG.TAGLINE}</p><a href="mailto:${CONFIG.CONTACT_EMAIL}">${CONFIG.CONTACT_EMAIL}</a><a href="${waLink('Hello THE SHOE RACK')}">Chat on WhatsApp</a></div></div><p class="wrap copy">© ${new Date().getFullYear()} THE SHOE RACK</p>`;
  $('#theme').onclick = () => { const n = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = n; try { localStorage.setItem('tsr-theme', n); } catch {} };
  $('#burger').onclick = e => { const o = $('#nav').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
  const fab=document.createElement('a');fab.className='wa-fab';fab.href=waLink('Hello THE SHOE RACK');fab.setAttribute('aria-label','Chat on WhatsApp');fab.textContent='WhatsApp';document.body.append(fab);
  counts();
}
function productCard(p) {
  const off = p.original_price > p.price ? Math.round(100 - p.price / p.original_price * 100) : 0;
  const w = store.get('tsr-wish').includes(p.id);
  const alt = [...(p.product_images || [])].sort((a, b) => a.position - b.position).map(i => i.url).find(u => u && u !== p.main_image);
  return `<article class="card"><a class="img" href="product-details.html?slug=${encodeURIComponent(p.slug)}">
   <img loading="lazy" src="${esc(p.main_image || FALLBACK)}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src=FALLBACK">
   ${alt ? `<img class="alt" loading="lazy" src="${esc(alt)}" alt="" onerror="this.remove()">` : ''}<span class="badges">${off ? `<i>-${off}%</i>` : ''}${p.is_new ? '<i>New</i>' : ''}${p.best_seller ? '<i>Best Seller</i>' : ''}</span></a>
   <button class="wish" data-wish="${p.id}" aria-pressed="${w}" aria-label="Wishlist">${w ? '♥' : '♡'}</button>
   <div class="info"><small>${esc(p.brands?.name)}${p.colors?.length ? ' · ' + esc(p.colors[0]) : ''}</small><h3>${esc(p.name)}</h3>
   <p class="price"><b>${inr(p.price)}</b> ${off ? `<s>${inr(p.original_price)}</s>` : ''}</p>
   <a class="btn sm" href="product-details.html?slug=${encodeURIComponent(p.slug)}">View shoe</a></div></article>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-wish]'); if (!b) return;
  let w = store.get('tsr-wish'); const id = b.dataset.wish;
  w = w.includes(id) ? w.filter(x => x !== id) : [...w, id]; store.set('tsr-wish', w);
  const on = w.includes(id); b.textContent = on ? '♥' : '♡'; b.setAttribute('aria-pressed', on); counts();
});
const PRODUCT_SELECT = '*, brands(name,slug), product_variants(size,stock), product_images(url,position)';
document.addEventListener('DOMContentLoaded', renderChrome);
