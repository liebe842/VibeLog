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

  // Get actual post count from database
  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Update profile with actual count
  if (profile && profile.stats) {
    profile.stats.total_logs = postCount || 0;
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

  console.log(`[updateStreak] User ${userId} has ${posts?.length || 0} posts`);

  if (!posts || posts.length === 0) {
    // Update profile to reset streak to 0
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
            streak: 0,
          },
        })
        .eq("id", userId);
    }

    console.log(`[updateStreak] Reset streak to 0 for user ${userId}`);
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

  console.log(`[updateStreak] Updated streak to ${streak} for user ${userId}`);
  return { streak };
}

export async function recalculateCurrentUserStreak() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const result = await updateStreak(user.id);
  return { success: true, streak: result.streak };
}

export async function updateProfile(data: {
  username?: string;
  bio?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Build update object with only provided fields
  const updateData: Record<string, string> = {};
  if (data.username !== undefined) updateData.username = data.username;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;

  if (Object.keys(updateData).length === 0) {
    return { error: "업데이트할 정보가 없습니다." };
  }

  // Check if username is taken (if username is being updated)
  if (data.username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username)
      .neq("id", user.id)
      .single();

    if (existing) {
      return { error: "이미 사용 중인 사용자 이름입니다." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) {
    return { error: "파일을 선택해주세요." };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "이미지 파일만 업로드 가능합니다." };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "파일 크기는 5MB 이하여야 합니다." };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  // Delete old avatar if exists
  const { data: oldFiles } = await supabase.storage
    .from("avatars")
    .list(user.id);

  if (oldFiles && oldFiles.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(oldFiles.map((f) => `${user.id}/${f.name}`));
  }

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true, avatar_url: publicUrl };
}
