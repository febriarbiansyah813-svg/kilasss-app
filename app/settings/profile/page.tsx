import { redirect } from "next/navigation";
import ProfileEditForm from "@/components/ProfileEditForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Edit profil — OmniSocial" };

export default async function EditProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/");

  return (
    <div className="mx-auto max-w-md px-4 pb-4 pt-16 md:pt-4">
      <h1 className="mb-4 text-xl font-bold">Edit profil</h1>
      <ProfileEditForm profile={profile} />
    </div>
  );
}
