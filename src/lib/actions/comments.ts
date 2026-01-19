"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createComment(postId: string, content: string) {
  if (!content || content.trim().length === 0) {
    return { error: "댓글 내용을 입력해주세요." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function getComments(postId: string) {
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles:user_id (
        username,
        level
      )
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { comments };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Check if current user owns the comment
  const { data: comment } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  if (comment?.user_id !== user.id) {
    return { 
      error: `본인의 댓글만 삭제할 수 있습니다. (댓글 작성자: ${comment?.user_id}, 현재 사용자: ${user.id})` 
    };
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateComment(commentId: string, content: string) {
  if (!content || content.trim().length === 0) {
    return { error: "댓글 내용을 입력해주세요." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // Check if current user owns the comment
  const { data: comment } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  if (comment?.user_id !== user.id) {
    return { error: "본인의 댓글만 수정할 수 있습니다." };
  }

  const { error } = await supabase
    .from("comments")
    .update({ content: content.trim() })
    .eq("id", commentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
