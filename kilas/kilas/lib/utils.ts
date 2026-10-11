// Hanya izinkan redirect ke path internal (cegah open-redirect).
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  return value;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "tahun"],
    [60 * 60 * 24 * 30, "bulan"],
    [60 * 60 * 24 * 7, "minggu"],
    [60 * 60 * 24, "hari"],
    [60 * 60, "jam"],
    [60, "menit"],
  ];
  for (const [size, label] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)} ${label} lalu`;
  }
  return "baru saja";
}

export function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email atau password salah.";
  if (m.includes("email not confirmed")) return "Email belum dikonfirmasi. Cek kotak masuk Anda.";
  if (m.includes("already registered")) return "Email ini sudah terdaftar. Silakan masuk.";
  if (m.includes("password should be")) return "Password minimal 8 karakter.";
  if (m.includes("rate limit")) return "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
  return message;
}
