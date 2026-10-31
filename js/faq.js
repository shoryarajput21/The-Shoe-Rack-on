(async () => {
  let items = [['How do I order?', 'Choose a shoe, pick your size, and tap Buy on WhatsApp or use the cart. Your order request opens in WhatsApp for us to confirm.'], ['Is my order confirmed when WhatsApp opens?', 'No. It is an order request. It is confirmed only after we reply and confirm with you.'], ['How do I choose my size?', 'See our Size Guide page, or message us on WhatsApp.'], ['How is payment and delivery arranged?', 'We confirm payment options and delivery details with you on WhatsApp.'], ['What if I get the wrong size?', 'Message us on WhatsApp with your order details and we will help.']];
  try { const { data } = await sb.from('faqs').select('question,answer').order('position'); if (data?.length) items = data.map(d => [d.question, d.answer]); } catch {}
  $('#faq').innerHTML = items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
})();
