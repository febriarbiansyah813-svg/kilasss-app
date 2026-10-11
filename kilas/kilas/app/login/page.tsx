import AuthForm from "@/components/AuthForm";
import { safeNext } from "@/lib/utils";

export const metadata = { title: "Masuk — Kilas" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <AuthForm
      mode="login"
      next={safeNext(searchParams.next)}
      initialError={searchParams.error ? "Gagal masuk. Silakan coba lagi." : null}
    />
  );
}
