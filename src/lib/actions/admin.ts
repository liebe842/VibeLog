"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addUserToWhitelist(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!username || !email) {
    return { error: "사용자 이름과 이메일은 필수입니다." };
  }

  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    return { error: "관리자 권한이 필요합니다." };
  }

  // Insert into whitelist table (not profiles)
  // When user logs in, they will be automatically added to profiles
  const { error } = await supabase.from("whitelist").insert({
    email,
    username,
    role: role || "user",
    approved_by: user.id,
  });

  if (error) {
    // Check if email already exists
    if (error.code === "23505") {
      return { error: "이미 등록된 이메일입니다." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function getAllUsers() {
  const supabase = await createClient();
  
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { profiles };
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    return { error: "관리자 권한이 필요합니다." };
  }

  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    return { error: "관리자 권한이 필요합니다." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
