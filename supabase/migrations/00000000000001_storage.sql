-- Create "banners" bucket
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true);

-- Enable RLS (Usually already enabled by Supabase)
-- alter table storage.objects enable row level security;

-- Policies for "banners" bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'banners' );

create policy "Admins can upload"
  on storage.objects for insert
  with check ( 
    bucket_id = 'banners' 
    and (select role from public.user_roles where user_id = auth.uid()) = 'admin'
  );

create policy "Admins can update"
  on storage.objects for update
  using ( 
    bucket_id = 'banners' 
    and (select role from public.user_roles where user_id = auth.uid()) = 'admin'
  );

create policy "Admins can delete"
  on storage.objects for delete
  using ( 
    bucket_id = 'banners' 
    and (select role from public.user_roles where user_id = auth.uid()) = 'admin'
  );
