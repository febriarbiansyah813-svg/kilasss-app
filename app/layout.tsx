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
        <Navbar />
        <main className="h-[calc(100dvh-3.5rem)] overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
