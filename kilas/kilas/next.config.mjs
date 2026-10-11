/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint dijalankan terpisah; jangan gagalkan build di Vercel karena peringatan <img>
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
