export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string;
  followers_count: number;
  following_count: number;
  videos_count: number;
  created_at: string;
};

export type AuthorInfo = Pick<Profile, "username" | "full_name" | "avatar_url">;

export type FeedVideo = {
  id: string;
  user_id: string;
  video_url: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: AuthorInfo;
};

export type CommentItem = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: Pick<Profile, "username" | "avatar_url">;
};

export const VIDEO_SELECT =
  "id, user_id, video_url, caption, likes_count, comments_count, created_at, profiles(username, full_name, avatar_url)";
