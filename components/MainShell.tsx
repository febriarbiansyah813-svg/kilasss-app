"use client";

import { usePathname } from "next/navigation";

// Halaman feed video tampil layar penuh di HP (bottom nav menumpuk di atas video);
// halaman lain diberi ruang bawah agar tidak tertutup bottom nav.
export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = pathname === "/" || pathname === "/following" || pathname.startsWith("/v/");
  return (
    <main className={`h-dvh min-w-0 flex-1 overflow-y-auto ${immersive ? "" : "pb-14 md:pb-0"}`}>{children}</main>
  );
}
