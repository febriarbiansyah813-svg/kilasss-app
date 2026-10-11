import AuthForm from "@/components/AuthForm";
import { safeNext } from "@/lib/utils";

export const metadata = { title: "Daftar — OmniSocial" };

export default function SignupPage({ searchParams }: { searchParams: { next?: string } }) {
  return <AuthForm mode="signup" next={safeNext(searchParams.next)} />;
}
