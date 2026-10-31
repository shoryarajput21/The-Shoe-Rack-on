# THE SHOE RACK
1. Supabase SQL Editor: run supabase/migrations/001_init.sql, 002_orders_rpc.sql, 003_backorder_and_images.sql, 004_no_stock_check.sql, then 005_no_size_check.sql.
2. Authentication > Users: create your admin user, then run: insert into admins(user_id) select id from auth.users limit 1;
3. js/config.js already holds the public URL and publishable key. Never add a secret key.
4. Run: python -m http.server 8000, open /admin/login.html, add a product, check the site.
5. Upload to GitHub / Netlify. All paths are relative. Products live in Supabase.
Edit policy pages: Supabase Table Editor > pages (slug, title, body). FAQs: table faqs.
