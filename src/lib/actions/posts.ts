"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { updateStreak } from "./profile";

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return { error: "파일이 없습니다." };
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { error: "지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)" };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: "파일 크기는 5MB를 초과할 수 없습니다." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Create unique filename with timestamp
  const timestamp = Date.now();
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${timestamp}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("post-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return { error: "이미지 업로드에 실패했습니다." };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("post-images").getPublicUrl(data.path);

  return { success: true, url: publicUrl };
}

export async function createPost(formData: FormData) {
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const durationMin = formData.get("duration_min") as string;
  const linkUrl = formData.get("link_url") as string;
  const imageUrl = formData.get("image_url") as string;
  const projectId = formData.get("project_id") as string;
  const aiHelpScore = formData.get("ai_help_score") as string;
  const timeSaved = formData.get("time_saved") as string;

  if (!content || !category) {
    return { error: "내용과 카테고리는 필수입니다." };
  }

  if (!durationMin || parseInt(durationMin) < 1) {
    return { error: "소요 시간을 입력해주세요." };
  }

  if (aiHelpScore === null || aiHelpScore === "") {
    return { error: "AI 도움 점수를 선택해주세요." };
  }

  if (!timeSaved) {
    return { error: "시간 절약 정도를 선택해주세요." };
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
    project_id: projectId || null,
    ai_help_score: parseInt(aiHelpScore),
    time_saved: timeSaved,
  });

  if (error) {
    return { error: error.message };
  }

  // Update user stats with streak calculation
  const { data: profile } = await supabase
    .from("profiles")
    .select("stats")
    .eq("id", user.id)
    .single();

  if (profile) {
    const currentStats = profile.stats || { streak: 0, last_activity_date: null };
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const lastActivityDate = currentStats.last_activity_date;

    let newStreak = 1; // Default: first activity or reset

    if (lastActivityDate) {
      const lastDate = new Date(lastActivityDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day - keep current streak
        newStreak = currentStats.streak || 1;
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = (currentStats.streak || 0) + 1;
      } else {
        // Gap in days - reset streak to 1
        newStreak = 1;
      }
    }

    await supabase
      .from("profiles")
      .update({
        stats: {
          ...currentStats,
          streak: newStreak,
          last_activity_date: today,
        },
      })
      .eq("id", user.id);
  }

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}

export async function getPosts(
  limit = 20,
  offset = 0,
  search?: string,
  searchType?: "content" | "user"
) {
  const supabase = await createClient();

  // Get current user if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select(
      `
      *,
      profiles:user_id (
        username,
        level,
        avatar_url
      ),
      projects:project_id (
        id,
        title
      )
    `
    )
    .order("created_at", { ascending: false });

  // Apply search filter
  if (search && search.trim()) {
    if (searchType === "user") {
      // Search by username - need to filter after fetching due to join limitation
    } else {
      // Default: search by content
      query = query.ilike("content", `%${search.trim()}%`);
    }
  }

  const { data: posts, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("[getPosts] Error:", error);
    return { error: error.message };
  }

  console.log(`[getPosts] Found ${posts?.length || 0} posts`);

  // Filter by username if searching by user (post-fetch filter due to join)
  let filteredPosts = posts;
  if (search && search.trim() && searchType === "user" && posts) {
    const searchLower = search.trim().toLowerCase();
    filteredPosts = posts.filter((post: any) =>
      post.profiles?.username?.toLowerCase().includes(searchLower)
    );
  }

  // If user is logged in, check which posts they liked
  if (user && filteredPosts) {
    const postIds = filteredPosts.map((p: any) => p.id);
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);

    const likedPostIds = new Set(likes?.map((l) => l.post_id) || []);

    const postsWithLikeStatus = filteredPosts.map((post: any) => ({
      ...post,
      liked_by_user: likedPostIds.has(post.id),
      likes: post.likes_count || post.likes || 0,
    }));

    return { posts: postsWithLikeStatus };
  }

  return { posts: filteredPosts };
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

  // Check if current user is admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = currentProfile?.role === "admin";

  const { data: post } = await supabase
    .from("posts")
    .select("user_id, image_url")
    .eq("id", postId)
    .single();

  if (post?.user_id !== user.id && !isAdmin) {
    return { error: "본인의 포스트만 삭제할 수 있습니다." };
  }

  // Delete image from storage if exists
  if (post?.image_url && post.image_url.includes("post-images")) {
    const urlParts = post.image_url.split("/post-images/");
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from("post-images").remove([filePath]);
    }
  }

  // Delete related comments first
  const { error: commentsError } = await supabase
    .from("comments")
    .delete()
    .eq("post_id", postId);

  if (commentsError) {
    console.error("Comments deletion error:", commentsError);
    return { error: "댓글 삭제 중 오류가 발생했습니다: " + commentsError.message };
  }

  // Delete related likes
  const { error: likesError } = await supabase
    .from("likes")
    .delete()
    .eq("post_id", postId);

  if (likesError) {
    console.error("Likes deletion error:", likesError);
    return { error: "좋아요 삭제 중 오류가 발생했습니다: " + likesError.message };
  }

  // Now delete the post
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    console.error("Post deletion error:", error);
    return { error: "게시물 삭제 중 오류가 발생했습니다: " + error.message };
  }

  // Recalculate streak after deletion
  await updateStreak(user.id);

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}

export async function likePost(postId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Check if user already liked this post
  const { data: existingLike } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  if (existingLike) {
    // Unlike (remove like)
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return { success: true, liked: false };
  } else {
    // Like (add like)
    const { error } = await supabase
      .from("likes")
      .insert({
        user_id: user.id,
        post_id: postId,
      });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return { success: true, liked: true };
  }
}

export async function getPostLikers(postId: string) {
  const supabase = await createClient();

  const { data: likes, error } = await supabase
    .from("likes")
    .select(
      `
      profiles:user_id (
        username
      )
    `
    )
    .eq("post_id", postId)
    .limit(10);

  if (error) {
    return { error: error.message };
  }

  const usernames = likes
    ?.map((like: any) => like.profiles?.username)
    .filter(Boolean) as string[];

  return { usernames };
}

export async function updatePost(postId: string, formData: FormData) {
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const durationMin = formData.get("duration_min") as string;
  const linkUrl = formData.get("link_url") as string;
  const imageUrl = formData.get("image_url") as string;
  const projectId = formData.get("project_id") as string;
  const aiHelpScore = formData.get("ai_help_score") as string;
  const timeSaved = formData.get("time_saved") as string;

  if (!content || !category) {
    return { error: "내용과 카테고리는 필수입니다." };
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

  const isAdmin = currentProfile?.role === "admin";

  // Check if current user owns the post
  const { data: post } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (post?.user_id !== user.id && !isAdmin) {
    return { error: "본인의 포스트만 수정할 수 있습니다." };
  }

  const { error } = await supabase
    .from("posts")
    .update({
      content,
      category,
      duration_min: durationMin ? parseInt(durationMin) : 0,
      link_url: linkUrl || null,
      image_url: imageUrl || null,
      project_id: projectId || null,
      ai_help_score: aiHelpScore ? parseInt(aiHelpScore) : null,
      time_saved: timeSaved || null,
    })
    .eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}
