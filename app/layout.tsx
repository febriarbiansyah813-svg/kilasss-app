import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "OmniSocial — video pendek",
  description: "Tonton dan bagikan video pendek.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-black text-white antialiased">
        <div className="flex h-dvh">
          <Navbar />
          <main className="h-dvh min-w-0 flex-1 overflow-y-auto pb-14 md:pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
