"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { profile };
}

export async function getUserActivityHeatmap(userId: string) {
  const supabase = await createClient();

  // Get all posts from the last year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data: posts, error } = await supabase
    .from("posts")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", oneYearAgo.toISOString());

  if (error) {
    return { error: error.message };
  }

  // Group by date
  const activityByDate: Record<string, number> = {};
  
  posts?.forEach((post) => {
    const date = new Date(post.created_at).toISOString().split("T")[0];
    activityByDate[date] = (activityByDate[date] || 0) + 1;
  });

  return { activityByDate };
}

export async function getUserRecentActivities(userId: string, limit = 10) {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  return { posts };
}

export async function updateStreak(userId: string) {
  const supabase = await createClient();

  // Get user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!posts || posts.length === 0) {
    return { streak: 0 };
  }

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = posts.map((p) => {
    const d = new Date(p.created_at);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (uniqueDates[i] === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  // Update profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("stats")
    .eq("id", userId)
    .single();

  if (profile) {
    await supabase
      .from("profiles")
      .update({
        stats: {
          ...profile.stats,
          streak,
        },
      })
      .eq("id", userId);
  }

  return { streak };
}
