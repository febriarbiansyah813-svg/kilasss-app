import { redirect } from "next/navigation";
import UploadForm from "@/components/UploadForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Unggah video — Kilas" };

export default async function UploadPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/upload");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/");

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="mb-4 text-xl font-bold">Unggah video</h1>
      <UploadForm userId={user.id} username={profile.username} />
    </div>
  );
}
