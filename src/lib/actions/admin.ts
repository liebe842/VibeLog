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

  // Insert into profiles (whitelist)
  // Note: This creates a "pre-registration" entry
  // The user doesn't exist in auth.users yet
  // When they login with Google, the trigger will try to insert but fail on duplicate email
  // So we need a different approach: just store their info and check on login
  
  // Actually, let's use a simpler approach:
  // We'll insert a profile with a dummy UUID for now
  // When user logs in, we'll update it with their real auth ID
  
  const { error } = await supabase.from("profiles").insert({
    // We need to generate a temporary ID or use email as unique identifier
    // Better approach: create without id, let trigger handle it on first login
    // But trigger needs auth.users record first...
    
    // REVISED: We'll just store username, email, role
    // And rely on trigger to create profile on login
    // But we need a way to set the role...
    
    // BEST APPROACH: Insert with a placeholder UUID
    // When user logs in, check if email matches, update the UUID
    id: crypto.randomUUID(), // Temporary, will be replaced on first login
    username,
    email,
    role: role || "user",
  });

  if (error) {
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
