"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createChallengeSettings(formData: FormData) {
  const startDate = formData.get("start_date") as string;
  const totalDays = parseInt(formData.get("total_days") as string);

  if (!startDate || !totalDays || totalDays <= 0) {
    return { error: "시작일과 기간을 올바르게 입력해주세요." };
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

export async function calculateChallengeProgress() {
  const { challenge } = await getActiveChallengeSettings();

  if (!challenge) {
    return {
      currentDay: 0,
      totalDays: 30,
      progress: 0,
    };
  }

  const today = new Date();
  const startDate = new Date(challenge.start_date);
  const daysPassed = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const currentDay = Math.max(0, Math.min(daysPassed, challenge.total_days));
  const progress = Math.round((currentDay / challenge.total_days) * 100);

  return {
    currentDay,
    totalDays: challenge.total_days,
    progress,
  };
}
