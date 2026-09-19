-- Up to four additional product images; the existing cover_url remains the primary image.
alter table public.books add column if not exists gallery_urls text[] not null default '{}'::text[];
alter table public.books drop constraint if exists books_gallery_urls_max_four;
alter table public.books add constraint books_gallery_urls_max_four check (coalesce(cardinality(gallery_urls),0) <= 4);

create or replace view public.storefront_books with (security_invoker=true) as
select b.id,b.sku,b.isbn,b.title,b.slug,b.short_description,b.description,b.price,b.compare_at_price,
  b.cover_url,b.cover_theme,b.stock_quantity,b.track_stock,b.is_featured,b.is_bestseller,b.is_preorder,
  b.release_date,b.created_at,a.name author_name,c.name category_name,p.name publisher_name,b.currency,
  b.format,b.language,b.pages,c.slug category_slug,b.gallery_urls
from public.books b
left join public.authors a on a.id=b.author_id
left join public.categories c on c.id=b.category_id
left join public.publishers p on p.id=b.publisher_id
where b.status='published';
