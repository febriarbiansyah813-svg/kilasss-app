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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user: SessionUser = null;
  if (authUser) {
    const { data } = await supabase.from("profiles").select("username, avatar_url").eq("id", authUser.id).maybeSingle();
    if (data) user = { id: authUser.id, username: data.username, avatar_url: data.avatar_url };
  }

  return (
    <html lang="id" data-theme="dark">
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
