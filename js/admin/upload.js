(() => {
  const f = $('#f'), ta = f.extra, main = f.main_image, prev = $('#xprev');
  const lines = () => ta.value.split('\n').map(s => s.trim()).filter(Boolean);
  const draw = () => { prev.innerHTML = lines().map((u, i) => `<button type="button" data-i="${i}" title="Remove this image"><img src="${esc(u)}" alt="" onerror="this.onerror=null;this.src=FALLBACK"><span>✕</span></button>`).join(''); };
  window.drawExtra = draw; ta.addEventListener('input', draw);
  prev.onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; const l = lines(); l.splice(+b.dataset.i, 1); ta.value = l.join('\n'); draw(); };
  $('#files').onchange = async e => {
    const files = [...e.target.files], msg = $('#upmsg'); let n = 0; if (!files.length) return;
    for (const file of files) {
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) { toast(`${file.name}: only images up to 5 MB.`, true); continue; }
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`; msg.textContent = `Uploading ${++n} of ${files.length}…`;
      const { error } = await sb.storage.from('product-images').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
      if (error) { toast('Upload failed: ' + error.message, true); continue; }
      const url = sb.storage.from('product-images').getPublicUrl(path).data.publicUrl;
      if (!main.value.trim()) { main.value = url; main.dispatchEvent(new Event('change')); } else ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + url;
    }
    msg.textContent = 'Done. First image is the main image, the rest are in Additional images.'; draw(); e.target.value = '';
  };
})();
