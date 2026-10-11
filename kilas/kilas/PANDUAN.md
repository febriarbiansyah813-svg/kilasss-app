# Kilas — Panduan Setup & Deployment

Aplikasi video pendek (mirip TikTok) berbasis **Next.js 14 (App Router) + Tailwind + Supabase** (Auth, PostgreSQL, Storage).

```
Browser ──► Next.js (Vercel) ──► Supabase Auth      (email+password, Google OAuth, sesi via cookie)
   │                         ├─► Supabase Postgres  (profiles, videos, likes, comments, follows + RLS)
   └──────── upload/stream ──┴─► Supabase Storage    (bucket "videos" & "avatars", URL publik)
```

Keamanan ada di **database (Row Level Security)**, bukan di frontend: anon key boleh publik karena setiap tabel dijaga policy.

---

## 1. Persiapan Supabase (±15 menit)

### 1.1 Buat project
1. Daftar di https://supabase.com → **New project**.
2. **Region: Southeast Asia (Singapore)** — paling dekat ke Indonesia.
3. Simpan database password di password manager.

### 1.2 Jalankan skema
1. Dashboard → **SQL Editor → New query**.
2. Tempel seluruh isi `supabase/schema.sql` → **Run** (cukup **sekali**).
3. Cek **Table Editor**: harus ada `profiles, videos, likes, comments, follows`. Cek **Storage**: bucket `videos` dan `avatars`.

### 1.3 Ambil API key
Project Settings → **API** → salin **Project URL** dan **anon / publishable key**.

```bash
cp .env.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
```
> Jangan pernah memakai `service_role` key di frontend atau variabel `NEXT_PUBLIC_*`.

### 1.4 Atur Authentication
**Authentication → URL Configuration**
- **Site URL**: `http://localhost:3000` (nanti ganti ke domain Vercel Anda)
- **Redirect URLs**: tambahkan `http://localhost:3000/**` (nanti tambah `https://NAMA-APP.vercel.app/**`)

**Authentication → Sign In / Providers → Email**
- Biarkan **Confirm email = ON** untuk produksi (mencegah akun palsu). Untuk uji lokal cepat boleh dimatikan sementara.

### 1.5 Aktifkan Google OAuth
1. https://console.cloud.google.com → buat project → **APIs & Services → OAuth consent screen** (External, isi nama app & email).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. **Authorized redirect URIs**: `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
   (alamat persisnya ada di Supabase → Authentication → Providers → Google).
4. Salin **Client ID** dan **Client secret** → tempel di Supabase → Providers → **Google** → Enable → Save.
5. Saat siap publik, ubah consent screen dari *Testing* ke *In production*; kalau tidak, hanya "test users" yang bisa login.

### 1.6 Jalankan lokal
```bash
npm install
npm run dev        # http://localhost:3000
```

---

## 2. Skema Database (ringkas)

Lengkapnya di `supabase/schema.sql` (sudah termasuk trigger, RLS, dan storage).

| Tabel | Kolom utama | Catatan |
|---|---|---|
| `profiles` | `id` (= `auth.users.id`), `username` (unik), `full_name`, `avatar_url`, `bio`, `followers_count`, `following_count`, `videos_count` | Dibuat otomatis oleh trigger saat user daftar (email atau Google) |
| `videos` | `id`, `user_id`, `video_url`, `storage_path`, `caption`, `likes_count`, `comments_count`, `created_at` | Index `created_at desc` untuk feed |
| `likes` | PK `(user_id, video_id)` | Satu like per user per video; hanya terlihat oleh pemiliknya |
| `comments` | `id`, `video_id`, `user_id`, `content` (1–300 huruf) | Publik dibaca |
| `follows` | PK `(follower_id, following_id)` | Dilarang follow diri sendiri (CHECK) |

Hal penting yang sudah ditangani:
- **Counter (likes, komentar, followers, video) dihitung oleh trigger** — user tidak bisa memalsukannya karena hak `UPDATE` pada kolom counter dicabut.
- **RLS aktif di semua tabel**: tulis hanya atas nama diri sendiri (`auth.uid() = user_id`).
- **Storage**: upload hanya ke folder `<user_id>/…`, batas 50 MB (video) dan 2 MB (avatar), hanya MIME yang diizinkan.
- Username otomatis dibuat acak (`user123456`) untuk login Google — **tidak** memakai bagian depan email agar email tidak bocor.

---

## 3. Struktur Kode

```
kilas/
├─ supabase/schema.sql              ← skema, trigger, RLS, storage
├─ middleware.ts                    ← menyegarkan sesi + proteksi /upload & /settings
├─ lib/
│  ├─ supabase/client.ts            ← klien browser
│  ├─ supabase/server.ts            ← klien server (cookie)
│  ├─ supabase/middleware.ts        ← logika sesi & redirect
│  ├─ types.ts · utils.ts · useGlobalMuted.ts
├─ app/
│  ├─ layout.tsx · globals.css
│  ├─ page.tsx                      ← feed utama
│  ├─ login/page.tsx · signup/page.tsx
│  ├─ auth/callback/route.ts        ← tujuan redirect Google OAuth & email konfirmasi
│  ├─ upload/page.tsx               ← halaman upload (diproteksi)
│  ├─ u/[username]/page.tsx         ← profil + grid video
│  ├─ v/[id]/page.tsx               ← satu video
│  └─ settings/profile/page.tsx     ← edit profil & avatar
└─ components/
   ├─ AuthForm.tsx                  ← form login/daftar + tombol Google
   ├─ VideoFeed.tsx                 ← infinite scroll + snap scroll
   ├─ VideoCard.tsx                 ← player (autoplay saat terlihat), like, komentar
   ├─ CommentsPanel.tsx · FollowButton.tsx
   ├─ UploadForm.tsx · ProfileEditForm.tsx
   └─ Navbar.tsx · LogoutButton.tsx · Avatar.tsx · icons.tsx
```

Cara kerja inti:
- **Sesi**: Supabase menyimpan JWT di cookie httpOnly-style via `@supabase/ssr`; `middleware.ts` menyegarkan token tiap request. Keputusan akses memakai `getUser()` (divalidasi ke server), bukan `getSession()`.
- **Feed**: query 5 video per halaman (`range`), `IntersectionObserver` memuat halaman berikut saat ujung daftar mendekat, `scroll-snap` CSS membuat satu video = satu layar. Video hanya diputar saat ≥60% terlihat.
- **Upload**: file diunggah langsung dari browser ke Storage (`<user_id>/<uuid>.mp4`), lalu baris `videos` dibuat. Jika insert gagal, file dihapus agar tidak jadi sampah.
- **Like/Follow**: optimistic UI, rollback jika gagal.

---

## 4. Deployment Gratis (Vercel)

1. Push proyek ke GitHub:
   ```bash
   git init && git add . && git commit -m "Kilas MVP"
   git branch -M main
   git remote add origin https://github.com/USERNAME/kilas.git
   git push -u origin main
   ```
2. https://vercel.com → **Add New → Project** → import repo. Framework terdeteksi otomatis (Next.js).
3. **Environment Variables**: isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **Deploy**.
4. Setelah dapat URL `https://NAMA-APP.vercel.app`, kembali ke Supabase → **Authentication → URL Configuration**:
   - **Site URL** → `https://NAMA-APP.vercel.app`
   - **Redirect URLs** → tambah `https://NAMA-APP.vercel.app/**`
5. Uji: daftar → konfirmasi email → login → upload → like/komentar/follow dari akun kedua.

> **Netlify** juga bisa (butuh plugin `@netlify/plugin-nextjs`, otomatis di import repo). Langkah env var & Redirect URL sama persis.

> **Penting — syarat plan gratis:** Vercel *Hobby* hanya untuk penggunaan **pribadi / non-komersial**. Jika aplikasi dimonetisasi atau dipakai bisnis, Anda perlu plan berbayar (atau host lain). Cek juga batas terbaru di halaman pricing Vercel & Supabase sebelum peluncuran.

---

## 5. Checklist Sebelum Dibuka untuk Publik

Fondasi ini sudah **aman secara akses data**, tetapi "bisa dipakai banyak orang" butuh beberapa hal lagi:

**Biaya & performa video (paling cepat jadi masalah)**
- Supabase Free: storage dan *bandwidth* (egress) kecil, dan batas ukuran file 50 MB. Video yang ramai ditonton akan menghabiskan kuota dalam hitungan hari. Rencanakan pindah penyimpanan/streaming ke **Cloudflare R2, Bunny Stream, Mux, atau Cloudflare Stream** (HLS + transcoding + CDN).
- **Transcoding**: video iPhone (HEVC/MOV) tidak selalu bisa diputar di semua browser. Produksi sebaiknya mengonversi ke H.264/MP4 atau HLS dan membuat thumbnail.
- **Upload besar**: ganti ke resumable upload (TUS) + progress bar.

**Moderasi & keselamatan (wajib untuk platform konten buatan pengguna)**
- Tombol **Laporkan** konten/pengguna + panel admin untuk menghapus.
- Moderasi konten (otomatis + manual), terutama terhadap konten ilegal dan eksploitasi anak. Siapkan prosedur takedown.
- **Rate limiting** (upload, komentar, signup) — mis. via Vercel Firewall / Upstash Ratelimit, plus CAPTCHA (Cloudflare Turnstile) saat signup.
- Email: Supabase SMTP bawaan sangat terbatas; pasang **SMTP sendiri** (Resend, Brevo, dsb.) agar email konfirmasi terkirim ke banyak orang.

**Legal (Indonesia)**
- Halaman **Kebijakan Privasi** dan **Syarat & Ketentuan**; patuhi **UU PDP**.
- Platform konten buatan pengguna umumnya wajib **pendaftaran PSE Lingkup Privat** — pastikan persyaratan terbaru ke Kementerian Komunikasi dan Digital / konsultan hukum sebelum peluncuran publik.

**Fitur yang belum ada (urutan saran)**
1. Hapus video milik sendiri (hapus baris + file di Storage lewat `storage_path`).
2. Feed "Mengikuti" dan "Untukmu" (ranking), pencarian user/hashtag.
3. Notifikasi (like/komentar/follower) via Supabase Realtime.
4. Hitung views, share link + Open Graph preview.
5. Backup database terjadwal (Supabase Pro) dan monitoring error (Sentry).

---

## Troubleshooting cepat

| Gejala | Penyebab umum |
|---|---|
| Login Google balik ke `/login?error=auth` | Redirect URL Supabase belum memuat domain Anda, atau Redirect URI di Google Cloud salah |
| Upload gagal "new row violates row-level security" | `schema.sql` belum dijalankan penuh (policy storage) atau user belum login |
| Upload gagal "object exceeded the maximum allowed size" | File > 50 MB (batas bucket; juga batas plan Free) |
| Email konfirmasi tidak datang | Batas email Supabase bawaan; pasang SMTP sendiri, cek folder spam |
| Video tidak autoplay dengan suara | Aturan browser: mulai senyap, tekan ikon speaker sekali — video berikutnya otomatis bersuara |
| Build Vercel gagal `Invalid supabaseUrl` | Environment variable belum diisi di Vercel (isi lalu Redeploy) |
