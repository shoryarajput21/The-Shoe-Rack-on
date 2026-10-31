-- Sizes are no longer stored in the admin; customers type their own size.
-- Orders only check the product is published and the quantity is 1-10.
create or replace function create_order_request(p_name text, p_phone text, p_address text, p_items jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare it jsonb; pr record; total numeric:=0; lines jsonb:='[]'::jsonb; oid uuid; q int;
begin
 if length(coalesce(trim(p_name),''))<2 then raise exception 'name required'; end if;
 if jsonb_array_length(p_items)<1 or jsonb_array_length(p_items)>30 then raise exception 'bad items'; end if;
 for it in select value from jsonb_array_elements(p_items) loop
  q:=(it->>'qty')::int;
  select id,name,sku,price into pr from products where id=(it->>'id')::uuid and status='published';
  if not found then raise exception 'product unavailable'; end if;
  if q<1 or q>10 then raise exception 'bad quantity'; end if;
  total:=total+pr.price*q;
  lines:=lines||jsonb_build_object('name',pr.name,'sku',pr.sku,'size',left(coalesce(it->>'size',''),20),'color',it->>'color','qty',q,'price',pr.price);
 end loop;
 insert into orders(customer_name,phone,address,items,total) values(left(trim(p_name),100),left(p_phone,20),left(p_address,500),lines,total) returning id into oid;
 return jsonb_build_object('id',oid,'total',total);
end $$;
grant execute on function create_order_request(text,text,text,jsonb) to anon, authenticated;
