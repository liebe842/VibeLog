import { getProject, getProjectPosts } from "@/lib/actions/projects";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectPostList } from "@/components/projects/project-post-list";
import { ProjectActions } from "@/components/projects/project-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [projectResult, postsResult] = await Promise.all([
    getProject(id),
    getProjectPosts(id),
  ]);

  if (projectResult.error || !projectResult.project) {
    notFound();
  }

  const project = projectResult.project;
  const posts = postsResult.posts || [];

  let currentUserId: string | undefined;
  try {
    const profileResult = await getCurrentUserProfile();
    if (profileResult.profile) {
      currentUserId = profileResult.profile.id;
    }
  } catch {
    // Not logged in
  }

  const isOwner = currentUserId === project.user_id;

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  const statusLabels: Record<string, string> = {
    active: "진행중",
    completed: "완료",
    paused: "중단",
  };

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full pb-24 md:pb-8">
      {/* Back Button */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors w-fit"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        <span className="text-sm">프로젝트 목록</span>
      </Link>

      {/* Project Header */}
      <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[32px] text-[#8b949e]">folder</span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#e6edf3]">{project.title}</h1>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                    statusColors[project.status] || statusColors.active
                  }`}
                >
                  {statusLabels[project.status] || "진행중"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-[#8b949e]">
                <img
                  src={project.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${project.profiles?.username}`}
                  alt=""
                  className="w-5 h-5 rounded-full"
                />
                <span>{project.profiles?.username}</span>
                <span>·</span>
                <span>{new Date(project.created_at).toLocaleDateString("ko-KR")} 시작</span>
              </div>
            </div>
          </div>
          {isOwner && <ProjectActions project={project} />}
        </div>
        {project.description && (
          <p className="text-[#8b949e] leading-relaxed">{project.description}</p>
        )}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#30363d]">
          <div className="flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-[20px] text-[#8b949e]">article</span>
            <span className="text-[#e6edf3] font-medium">{posts.length}</span>
            <span className="text-[#8b949e]">개발일지</span>
          </div>
        </div>
      </div>

      {/* Write Button */}
      {isOwner && (
        <Link
          href={`/write?project=${id}`}
          className="flex items-center justify-center gap-2 p-4 bg-[#161b22] border border-dashed border-[#30363d] rounded-xl text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>이 프로젝트에 개발일지 작성하기</span>
        </Link>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#e6edf3]">개발일지</h2>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-[#8b949e] bg-[#161b22] border border-[#30363d] rounded-xl">
            <span className="material-symbols-outlined text-[48px] mb-4 block">description</span>
            <p>아직 개발일지가 없습니다.</p>
            {isOwner && (
              <p className="text-sm mt-2">첫 번째 개발일지를 작성해보세요!</p>
            )}
          </div>
        ) : (
          <ProjectPostList posts={posts} currentUserId={currentUserId} />
        )}
      </div>
    </main>
  );
}
