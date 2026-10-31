-- 1) Option to allow "Order on WhatsApp" for out-of-stock products
alter table products add column if not exists allow_backorder boolean default false;
-- 2) Public image bucket; only admins can upload or delete
insert into storage.buckets (id, name, public) values ('product-images','product-images',true) on conflict (id) do nothing;
create policy "img admin insert" on storage.objects for insert with check (bucket_id='product-images' and public.is_admin());
create policy "img admin update" on storage.objects for update using (bucket_id='product-images' and public.is_admin());
create policy "img admin delete" on storage.objects for delete using (bucket_id='product-images' and public.is_admin());
