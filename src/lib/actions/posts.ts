"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const durationMin = formData.get("duration_min") as string;
  const linkUrl = formData.get("link_url") as string;
  const imageUrl = formData.get("image_url") as string;

  if (!content || !category) {
    return { error: "내용과 카테고리는 필수입니다." };
  }

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Insert post
  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    content,
    category,
    duration_min: durationMin ? parseInt(durationMin) : 0,
    link_url: linkUrl || null,
    image_url: imageUrl || null,
  });

  if (error) {
    return { error: error.message };
  }

  // Update user stats
  const { data: profile } = await supabase
    .from("profiles")
    .select("stats")
    .eq("id", user.id)
    .single();

  if (profile) {
    const currentStats = profile.stats || { streak: 0, total_logs: 0 };
    await supabase
      .from("profiles")
      .update({
        stats: {
          ...currentStats,
          total_logs: (currentStats.total_logs || 0) + 1,
        },
      })
      .eq("id", user.id);
  }

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}

export async function getPosts(limit = 20, offset = 0) {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:user_id (
        username,
        level
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { error: error.message };
  }

  return { posts };
}

export async function getUserPosts(userId: string) {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { posts };
}

export async function deletePost(postId: string) {
  const supabase = await createClient();

  // Check if current user owns the post
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: post } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (post?.user_id !== user.id) {
    return { error: "본인의 포스트만 삭제할 수 있습니다." };
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}
