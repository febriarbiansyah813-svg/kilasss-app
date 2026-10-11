import VideoFeed from "@/components/VideoFeed";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Mengikuti — OmniSocial" };

export default async function FollowingPage() {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return <VideoFeed userId={user?.id ?? null} mode="following" />;
}
