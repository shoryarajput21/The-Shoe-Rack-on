const waLink = t => `https://wa.me/${CONFIG.COUNTRY_CODE}${String(CONFIG.WHATSAPP_NUMBER).replace(/\D/g, '')}?text=${encodeURIComponent(t)}`;
