(async () => {
  const el = $('#content'); if (!el) return;
  try { const { data } = await sb.from('pages').select('body').eq('slug', el.dataset.slug).maybeSingle();
    if (data?.body?.trim()) el.innerHTML = data.body.split(/\n\s*\n/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join(''); } catch {}
})();
