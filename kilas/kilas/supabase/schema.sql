-- =====================================================================
-- Kilas — skema database Supabase (PostgreSQL)
-- Cara pakai: Supabase Dashboard -> SQL Editor -> New query -> tempel -> Run
-- Jalankan SEKALI pada project baru.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABEL
-- ---------------------------------------------------------------------

-- Profil publik pengguna. Satu baris per akun di auth.users.
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text not null unique,
  full_name       text,
  avatar_url      text,
  bio             text not null default '',
  followers_count integer not null default 0,
  following_count integer not null default 0,
  videos_count    integer not null default 0,
  created_at      timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_.]{3,24}$'),
  constraint bio_length      check (char_length(bio) <= 200)
);

create table public.videos (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  video_url      text not null,
  storage_path   text not null,            -- path di bucket "videos", dipakai untuk hapus file
  caption        text not null default '',
  likes_count    integer not null default 0,
  comments_count integer not null default 0,
  created_at     timestamptz not null default now(),
  constraint caption_length check (char_length(caption) <= 150)
);
create index videos_created_at_idx on public.videos (created_at desc);
create index videos_user_id_idx    on public.videos (user_id, created_at desc);

create table public.likes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  video_id   uuid not null references public.videos(id)   on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);
create index likes_video_id_idx on public.likes (video_id);

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  video_id   uuid not null references public.videos(id)   on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now(),
  constraint content_length check (char_length(content) between 1 and 300)
);
create index comments_video_id_idx on public.comments (video_id, created_at desc);

create table public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);
create index follows_following_idx on public.follows (following_id);

-- ---------------------------------------------------------------------
-- 2. TRIGGER: buat profil otomatis saat user mendaftar (email ATAU Google)
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wanted         text;
  final_username text;
begin
  -- username yang diminta saat sign up (email+password); Google OAuth tidak mengirimnya
  wanted := lower(regexp_replace(
              coalesce(new.raw_user_meta_data->>'username', ''),
              '[^a-zA-Z0-9_.]', '', 'g'));

  if char_length(wanted) between 3 and 24
     and not exists (select 1 from public.profiles where username = wanted) then
    final_username := wanted;
  else
    -- sengaja TIDAK memakai bagian depan email agar email tidak bocor ke publik
    loop
      final_username := 'user' || floor(random() * 1000000)::int::text;
      exit when not exists (select 1 from public.profiles where username = final_username);
    end loop;
  end if;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    final_username,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name',
                         new.raw_user_meta_data->>'name', '')), ''),
    coalesce(new.raw_user_meta_data->>'avatar_url',
             new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3. TRIGGER: jaga agar kolom counter selalu akurat (dihitung di server)
-- ---------------------------------------------------------------------

create or replace function public.handle_like_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.videos set likes_count = likes_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.videos set likes_count = greatest(likes_count - 1, 0) where id = old.video_id;
  end if;
  return null;
end;
$$;
create trigger on_like_change after insert or delete on public.likes
  for each row execute function public.handle_like_change();

create or replace function public.handle_comment_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.videos set comments_count = comments_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.videos set comments_count = greatest(comments_count - 1, 0) where id = old.video_id;
  end if;
  return null;
end;
$$;
create trigger on_comment_change after insert or delete on public.comments
  for each row execute function public.handle_comment_change();

create or replace function public.handle_follow_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
  elsif tg_op = 'DELETE' then
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    update public.profiles set followers_count = greatest(followers_count - 1, 0) where id = old.following_id;
  end if;
  return null;
end;
$$;
create trigger on_follow_change after insert or delete on public.follows
  for each row execute function public.handle_follow_change();

create or replace function public.handle_video_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set videos_count = videos_count + 1 where id = new.user_id;
  elsif tg_op = 'DELETE' then
    update public.profiles set videos_count = greatest(videos_count - 1, 0) where id = old.user_id;
  end if;
  return null;
end;
$$;
create trigger on_video_change after insert or delete on public.videos
  for each row execute function public.handle_video_change();

-- ---------------------------------------------------------------------
-- 4. HAK AKSES KOLOM
--    Klien hanya boleh mengubah kolom tertentu; counter hanya boleh diubah
--    oleh trigger di atas (security definer), bukan oleh user.
-- ---------------------------------------------------------------------

revoke update on public.profiles from anon, authenticated;
grant  update (username, full_name, avatar_url, bio) on public.profiles to authenticated;

revoke update on public.videos from anon, authenticated;
grant  update (caption) on public.videos to authenticated;

-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.videos   enable row level security;
alter table public.likes    enable row level security;
alter table public.comments enable row level security;
alter table public.follows  enable row level security;

-- profiles: publik dibaca, hanya pemilik yang mengubah (insert hanya via trigger)
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- videos
create policy "videos_select_all"  on public.videos for select using (true);
create policy "videos_insert_own"  on public.videos for insert to authenticated
  with check (auth.uid() = user_id);
create policy "videos_update_own"  on public.videos for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "videos_delete_own"  on public.videos for delete to authenticated
  using (auth.uid() = user_id);

-- likes: hanya terlihat oleh pemiliknya (jumlah publik ada di videos.likes_count)
create policy "likes_select_own" on public.likes for select to authenticated
  using (auth.uid() = user_id);
create policy "likes_insert_own" on public.likes for insert to authenticated
  with check (auth.uid() = user_id);
create policy "likes_delete_own" on public.likes for delete to authenticated
  using (auth.uid() = user_id);

-- comments
create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_own" on public.comments for insert to authenticated
  with check (auth.uid() = user_id);
create policy "comments_delete_own" on public.comments for delete to authenticated
  using (auth.uid() = user_id);

-- follows
create policy "follows_select_all"  on public.follows for select using (true);
create policy "follows_insert_own"  on public.follows for insert to authenticated
  with check (auth.uid() = follower_id);
create policy "follows_delete_own"  on public.follows for delete to authenticated
  using (auth.uid() = follower_id);

-- ---------------------------------------------------------------------
-- 6. STORAGE (bucket publik; upload hanya ke folder milik sendiri)
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('videos',  'videos',  true, 52428800, array['video/mp4','video/webm','video/quicktime']),
  ('avatars', 'avatars', true,  2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- File di bucket publik bisa dibuka lewat URL tanpa policy select.
-- Policy di bawah memastikan user hanya menulis ke folder "<user_id>/..." miliknya.
create policy "storage_insert_own_folder" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('videos', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_select_own_folder" on storage.objects for select to authenticated
  using (
    bucket_id in ('videos', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_delete_own_folder" on storage.objects for delete to authenticated
  using (
    bucket_id in ('videos', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
