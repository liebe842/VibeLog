"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title) {
    return { error: "프로젝트 이름은 필수입니다." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/projects");
  return { success: true, project };
}

export async function getProjects(limit = 20, offset = 0) {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      profiles:user_id (
        username,
        level,
        avatar_url
      )
    `
    )
    .neq("title", "미분류")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { error: error.message };
  }

  // Get post counts for each project
  if (projects) {
    const projectIds = projects.map((p) => p.id);
    const { data: postCounts } = await supabase
      .from("posts")
      .select("project_id")
      .in("project_id", projectIds);

    const countMap: Record<string, number> = {};
    postCounts?.forEach((p) => {
      if (p.project_id) {
        countMap[p.project_id] = (countMap[p.project_id] || 0) + 1;
      }
    });

    const projectsWithCounts = projects.map((project) => ({
      ...project,
      post_count: countMap[project.id] || 0,
    }));

    return { projects: projectsWithCounts };
  }

  return { projects };
}

export async function getUserProjects(userId: string) {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { projects };
}

export async function getMyProjects() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { projects };
}

export async function getProject(projectId: string) {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      profiles:user_id (
        username,
        level,
        avatar_url
      )
    `
    )
    .eq("id", projectId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { project };
}

export async function getProjectPosts(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:user_id (
        username,
        level,
        avatar_url
      )
    `
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  // If user is logged in, check which posts they liked
  if (user && posts) {
    const postIds = posts.map((p) => p.id);
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);

    const likedPostIds = new Set(likes?.map((l) => l.post_id) || []);

    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      liked_by_user: likedPostIds.has(post.id),
    }));

    return { posts: postsWithLikeStatus };
  }

  return { posts };
}

export async function updateProject(projectId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;

  console.log("[updateProject]", { title, description, status, color, icon });

  if (!title) {
    return { error: "프로젝트 이름은 필수입니다." };
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

  // Check if current user owns the project
  const { data: project } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();

  if (project?.user_id !== user.id && !isAdmin) {
    return { error: "본인의 프로젝트만 수정할 수 있습니다." };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      title,
      description: description || null,
      status: status || "active",
      color: color || "gray",
      icon: icon || "📁",
    })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteProject(projectId: string) {
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

  // Check if current user owns the project
  const { data: project } = await supabase
    .from("projects")
    .select("user_id, title")
    .eq("id", projectId)
    .single();

  if (project?.user_id !== user.id && !isAdmin) {
    return { error: "본인의 프로젝트만 삭제할 수 있습니다." };
  }

  // Prevent deleting "미분류" project
  if (project?.title === "미분류") {
    return { error: "미분류 프로젝트는 삭제할 수 없습니다." };
  }

  // Move posts to "미분류" project instead of deleting them
  const { data: defaultProject } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", "미분류")
    .single();

  if (defaultProject) {
    await supabase
      .from("posts")
      .update({ project_id: defaultProject.id })
      .eq("project_id", projectId);
  }

  // Now delete the project
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/projects");
  return { success: true };
}

export async function getDefaultProject() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", "미분류")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { project };
}

// Feature management actions
export async function addFeature(
  projectId: string,
  title: string,
  type: "planned" | "completed"
) {
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

  // Get current project
  const { data: project } = await supabase
    .from("projects")
    .select("user_id, features")
    .eq("id", projectId)
    .single();

  if (project?.user_id !== user.id && !isAdmin) {
    return { error: "본인의 프로젝트만 수정할 수 있습니다." };
  }

  const features = project.features || { planned: [], completed: [] };
  const newFeature = {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
  };

  features[type] = [...(features[type] || []), newFeature];

  const { error } = await supabase
    .from("projects")
    .update({ features })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function moveFeature(
  projectId: string,
  featureId: string,
  from: "planned" | "completed",
  to: "planned" | "completed"
) {
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

  // Get current project
  const { data: project } = await supabase
    .from("projects")
    .select("user_id, features")
    .eq("id", projectId)
    .single();

  if (project?.user_id !== user.id && !isAdmin) {
    return { error: "본인의 프로젝트만 수정할 수 있습니다." };
  }

  const features = project.features || { planned: [], completed: [] };
  const feature = features[from]?.find((f: any) => f.id === featureId);

  if (!feature) {
    return { error: "기능을 찾을 수 없습니다." };
  }

  // Remove from source
  features[from] = features[from].filter((f: any) => f.id !== featureId);

  // Add to destination
  features[to] = [...(features[to] || []), feature];

  const { error } = await supabase
    .from("projects")
    .update({ features })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteFeature(
  projectId: string,
  featureId: string,
  type: "planned" | "completed"
) {
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

  // Get current project
  const { data: project } = await supabase
    .from("projects")
    .select("user_id, features")
    .eq("id", projectId)
    .single();

  if (project?.user_id !== user.id && !isAdmin) {
    return { error: "본인의 프로젝트만 수정할 수 있습니다." };
  }

  const features = project.features || { planned: [], completed: [] };
  features[type] = features[type].filter((f: any) => f.id !== featureId);

  const { error } = await supabase
    .from("projects")
    .update({ features })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function reorderFeatures(
  projectId: string,
  type: "planned" | "completed",
  features: any[]
) {
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

  // Get current project
  const { data: project } = await supabase
    .from("projects")
    .select("user_id, features")
    .eq("id", projectId)
    .single();

  if (project?.user_id !== user.id && !isAdmin) {
    return { error: "본인의 프로젝트만 수정할 수 있습니다." };
  }

  const updatedFeatures = project.features || { planned: [], completed: [] };
  updatedFeatures[type] = features;

  const { error } = await supabase
    .from("projects")
    .update({ features: updatedFeatures })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
