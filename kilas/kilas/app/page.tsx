import VideoFeed from "@/components/VideoFeed";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <VideoFeed userId={user?.id ?? null} />;
}
