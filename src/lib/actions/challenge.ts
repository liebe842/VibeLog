"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createChallengeSettings(formData: FormData) {
  const startDate = formData.get("start_date") as string;
  const totalDays = parseInt(formData.get("total_days") as string);
  const requiredDays = parseInt(formData.get("required_days") as string) || 7;

  if (!startDate || !totalDays || totalDays <= 0) {
    return { error: "시작일과 기간을 올바르게 입력해주세요." };
  }

  if (requiredDays <= 0 || requiredDays > totalDays) {
    return { error: "성공 기준 일수는 1 이상, 총 기간 이하여야 합니다." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Check if current user is admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    return { error: "관리자 권한이 필요합니다." };
  }

  // Calculate end date
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + (totalDays - 1));

  // Deactivate all existing challenges
  await supabase
    .from("challenge_settings")
    .update({ is_active: false })
    .eq("is_active", true);

  // Insert new challenge
  const { data: newChallenge, error } = await supabase
    .from("challenge_settings")
    .insert({
      start_date: startDate,
      end_date: end.toISOString().split("T")[0],
      total_days: totalDays,
      required_days: requiredDays,
      created_by: user.id,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/profile");
  return { success: true, challenge: newChallenge };
}

export async function getActiveChallengeSettings() {
  const supabase = await createClient();

  const { data: challenge, error } = await supabase
    .from("challenge_settings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return { challenge: null };
  }

  return { challenge };
}

export async function calculateChallengeProgress(userId?: string) {
  const supabase = await createClient();
  const { challenge } = await getActiveChallengeSettings();

  if (!challenge) {
    return {
      writtenDays: 0,
      requiredDays: 7,
      totalDays: 14,
      progress: 0,
    };
  }

  // Get user ID if not provided
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    targetUserId = user?.id;
  }

  let writtenDays = 0;

  if (targetUserId) {
    // Get posts created by this user within the challenge period
    const { data: posts } = await supabase
      .from("posts")
      .select("created_at")
      .eq("user_id", targetUserId)
      .gte("created_at", challenge.start_date)
      .lte("created_at", challenge.end_date + "T23:59:59");

    if (posts && posts.length > 0) {
      // Count unique dates (using Set to deduplicate)
      const uniqueDates = new Set(
        posts.map((post) => post.created_at.split("T")[0])
      );
      writtenDays = uniqueDates.size;
    }
  }

  const requiredDays = challenge.required_days || 7;
  const progress = Math.min(100, Math.round((writtenDays / requiredDays) * 100));

  return {
    writtenDays,
    requiredDays,
    totalDays: challenge.total_days,
    progress,
  };
}
