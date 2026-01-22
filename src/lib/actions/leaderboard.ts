"use server";

import { createClient } from "@/lib/supabase/server";

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  total_logs: number;
  rank: number;
}

export async function getLeaderboard(): Promise<{
  users?: LeaderboardUser[];
  currentUserId?: string;
  error?: string;
}> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get all users with their post counts
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, level");

  if (profilesError) {
    return { error: profilesError.message };
  }

  if (!profiles || profiles.length === 0) {
    return { users: [], currentUserId: user?.id };
  }

  // Get post counts for all users
  const userIds = profiles.map((p) => p.id);
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("user_id")
    .in("user_id", userIds);

  if (postsError) {
    return { error: postsError.message };
  }

  // Count posts per user
  const postCounts: Record<string, number> = {};
  posts?.forEach((post) => {
    postCounts[post.user_id] = (postCounts[post.user_id] || 0) + 1;
  });

  // Combine profiles with post counts and sort by total_logs
  const usersWithLogs = profiles
    .map((profile) => ({
      id: profile.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      level: profile.level,
      total_logs: postCounts[profile.id] || 0,
      rank: 0,
    }))
    .sort((a, b) => b.total_logs - a.total_logs);

  // Assign ranks
  usersWithLogs.forEach((user, index) => {
    user.rank = index + 1;
  });

  return { users: usersWithLogs, currentUserId: user?.id };
}
