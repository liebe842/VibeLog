import { getProjects } from "@/lib/actions/projects";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import Link from "next/link";

export default async function ProjectsPage() {
  const result = await getProjects(50);
  const projects = result.projects || [];

  let currentUserId: string | undefined;
  try {
    const profileResult = await getCurrentUserProfile();
    if (profileResult.profile) {
      currentUserId = profileResult.profile.id;
    }
  } catch {
    // Not logged in
  }

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#e6edf3]">프로젝트</h1>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2ea043] to-[#3fb950] hover:from-[#25b060] hover:to-[#34a94b] text-white font-medium rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          새 프로젝트
        </Link>
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <div className="text-center py-12 text-[#8b949e]">
          <span className="material-symbols-outlined text-[48px] mb-4 block">folder_off</span>
          <p>아직 프로젝트가 없습니다.</p>
          <p className="text-sm mt-2">새 프로젝트를 만들어보세요!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block p-5 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#8b949e] transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-[#8b949e] group-hover:text-[#e6edf3] transition-colors">
                      folder
                    </span>
                    <h2 className="text-lg font-semibold text-[#e6edf3] truncate">
                      {project.title}
                    </h2>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                        statusColors[project.status] || statusColors.active
                      }`}
                    >
                      {statusLabels[project.status] || "진행중"}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-[#8b949e] line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                    <div className="flex items-center gap-1">
                      <img
                        src={project.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${project.profiles?.username}`}
                        alt=""
                        className="w-5 h-5 rounded-full"
                      />
                      <span>{project.profiles?.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">article</span>
                      <span>{project.post_count || 0}개의 개발일지</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>
                        {new Date(project.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#8b949e] group-hover:text-[#e6edf3] transition-colors">
                  chevron_right
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
