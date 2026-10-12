# OmniSocial

Aplikasi video pendek berbasis Next.js + Supabase.

## Menjalankan
1. `npm install`
2. Buat file **`.env.local`** di folder utama (sejajar `package.json`), isi dari `.env.example`.
   (Jangan di subfolder, dan nama filenya harus persis `.env.local`.)
3. Di Supabase → SQL Editor, jalankan `supabase/bookmarks.sql` (untuk tombol Simpan).
4. `npm run dev`, lalu cek tipe dengan `npm run typecheck`.

## Data contoh
- Mini drama & LIVE memakai data/video demo di `lib/mock.ts` dan `components/LiveRoom.tsx`.
- Alamat email laporan masalah: `components/ReportForm.tsx`.
