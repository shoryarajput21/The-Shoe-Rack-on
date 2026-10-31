-- THE SHOE RACK schema. Run in Supabase > SQL Editor.
create extension if not exists pgcrypto;
create table admins(user_id uuid primary key references auth.users on delete cascade);
create function is_admin() returns boolean language sql security definer set search_path=public stable
as $$ select exists(select 1 from admins where user_id=auth.uid()) $$;
create table brands(id uuid primary key default gen_random_uuid(), name text unique not null, slug text unique not null, logo_url text, active boolean default true);
create table categories(id uuid primary key default gen_random_uuid(), name text unique not null, slug text unique not null);
create table products(
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name)>1), slug text unique not null, sku text unique not null,
 brand_id uuid references brands on delete restrict, category_id uuid references categories on delete set null,
 short_desc text, description text,
 price numeric(10,2) not null check(price>=0), original_price numeric(10,2) check(original_price is null or original_price>=price),
 colors text[] default '{}', material text, gender text check(gender in('men','women','unisex','kids')),
 featured boolean default false, is_new boolean default false, best_seller boolean default false, on_sale boolean default false,
 status text not null default 'draft' check(status in('draft','published')), verified boolean default false,
 main_image text, transparent_image text, seo_title text, seo_desc text, created_at timestamptz default now());
create table product_private(product_id uuid primary key references products on delete cascade, cost_price numeric(10,2));
create table product_images(id uuid primary key default gen_random_uuid(), product_id uuid references products on delete cascade, url text not null, position int default 0);
create table product_variants(id uuid primary key default gen_random_uuid(), product_id uuid references products on delete cascade, size text not null, stock int not null default 0 check(stock>=0), unique(product_id,size));
create table orders(id uuid primary key default gen_random_uuid(), customer_name text, phone text, address text, items jsonb not null, total numeric(10,2), status text default 'request' check(status in('request','confirmed','paid','shipped','cancelled')), created_at timestamptz default now());
create table profiles(id uuid primary key references auth.users on delete cascade, full_name text, phone text);
create table site_settings(key text primary key, value jsonb not null);
create table faqs(id uuid primary key default gen_random_uuid(), question text not null, answer text not null, position int default 0);
create table pages(slug text primary key, title text not null, body text not null default '');
create index on products(status,created_at desc); create index on products(brand_id); create index on products(category_id);
create index on product_variants(product_id); create index on product_images(product_id);
do $$ declare t text; begin
 foreach t in array array['admins','brands','categories','products','product_private','product_images','product_variants','orders','profiles','site_settings','faqs','pages'] loop
  execute format('alter table %I enable row level security',t); end loop;
 foreach t in array array['brands','categories','products','product_private','product_images','product_variants','orders','site_settings','faqs','pages'] loop
  execute format('create policy "admin all" on %I for all using(is_admin()) with check(is_admin())',t); end loop;
 foreach t in array array['brands','categories','site_settings','faqs','pages'] loop
  execute format('create policy "public read" on %I for select using(true)',t); end loop;
end $$;
create policy "own admin row" on admins for select using(user_id=auth.uid());
create policy "own profile" on profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy "read published" on products for select using(status='published');
create policy "read images" on product_images for select using(exists(select 1 from products p where p.id=product_id and p.status='published'));
create policy "read variants" on product_variants for select using(exists(select 1 from products p where p.id=product_id and p.status='published'));
insert into brands(name,slug) values ('Nike','nike'),('Hoka','hoka'),('Puma','puma'),('Adidas','adidas'),('New Balance','new-balance'),('Asics','asics'),('Skechers','skechers'),('Reebok','reebok'),('Converse','converse'),('Vans','vans'),('Nitro','nitro');
insert into categories(name,slug) values ('Sneakers','sneakers'),('Running','running'),('Casual','casual'),('Sports','sports');
