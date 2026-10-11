import { createClient } from "@/lib/supabase/server";
import Sidebar from "./Sidebar";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    username = data?.username ?? null;
  }

  return <Sidebar username={username} />;
}
