import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider, { type SessionUser } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import MainShell from "@/components/MainShell";
import SearchProvider from "@/components/SearchOverlay";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "OmniSocial — video pendek",
  description: "Tonton dan bagikan video pendek.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

// Terapkan tema tersimpan sebelum halaman digambar (mencegah kedipan gelap -> terang).
const THEME_SCRIPT =
  "try{document.documentElement.dataset.theme=localStorage.getItem('theme')==='light'?'light':'dark'}catch(e){}";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const envOk = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Tanpa kunci Supabase seluruh halaman akan crash; tampilkan petunjuk yang jelas.
  if (!envOk) {
    return (
      <html lang="id" data-theme="dark">
        <body className="grid min-h-dvh place-items-center bg-black p-6 text-white">
          <div className="max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-6">
            <h1 className="text-xl font-extrabold">Konfigurasi Supabase belum diisi</h1>
            <p className="mt-2 text-sm text-neutral-300">
              Buat file <code className="rounded bg-neutral-800 px-1">.env.local</code> di folder utama project (sejajar{" "}
              <code className="rounded bg-neutral-800 px-1">package.json</code>) berisi:
            </p>
            <pre className="mt-3 overflow-x-auto rounded bg-neutral-900 p-3 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
            </pre>
            <p className="mt-3 text-sm text-neutral-400">Lalu restart server (<code>npm run dev</code>).</p>
          </div>
        </body>
      </html>
    );
  }

  let user: SessionUser = null;
  try {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (authUser) {
      const { data } = await supabase.from("profiles").select("username, avatar_url").eq("id", authUser.id).maybeSingle();
      if (data) user = { id: authUser.id, username: data.username, avatar_url: data.avatar_url };
    }
  } catch {
    // Supabase tidak terjangkau: tetap render aplikasi sebagai tamu.
  }

  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="bg-black text-white antialiased">
        <AuthProvider user={user}>
          <SearchProvider>
            <div className="flex h-dvh">
              <Sidebar />
              <MainShell>{children}</MainShell>
            </div>
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
