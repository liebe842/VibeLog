"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { updateProject, deleteProject } from "@/lib/actions/projects";
import { PROJECT_COLORS, PROJECT_ICONS, type ProjectColor, type ProjectIcon } from "@/lib/project-colors";

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  color?: string;
  icon?: string;
}

interface ProjectActionsProps {
  project: Project;
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedColor, setSelectedColor] = useState<ProjectColor>((project.color as ProjectColor) || "blue");
  const [selectedIcon, setSelectedIcon] = useState<ProjectIcon>((project.icon as ProjectIcon) || "📁");

  async function handleDelete() {
    if (project.title === "미분류") {
      alert("미분류 프로젝트는 삭제할 수 없습니다.");
      return;
    }

    if (!confirm("정말 삭제하시겠습니까? 이 프로젝트의 개발일지들은 미분류로 이동됩니다.")) return;

    const result = await deleteProject(project.id);
    if (result.error) {
      alert(result.error);
    } else {
      router.push("/projects");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await updateProject(project.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setShowEditModal(false);
      router.refresh();
    }
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>

        <AnimatePresence>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 w-40 bg-[#161b22] border border-[#30363d] rounded-lg shadow-lg overflow-hidden z-50"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowEditModal(true);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-[#e6edf3] hover:bg-[#21262d] flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  수정
                </button>
                {project.title !== "미분류" && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-[#f85149] hover:bg-[#21262d] flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    삭제
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-md p-6 my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#e6edf3]">프로젝트 수정</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                    프로젝트 이름
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={project.title}
                    required
                    disabled={project.title === "미분류"}
                    className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                    설명
                  </label>
                  <textarea
                    name="description"
                    defaultValue={project.description || ""}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] resize-none transition-all"
                  />
                </div>

                {/* Icon Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                    아이콘
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {PROJECT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`p-2 text-xl rounded-lg border-2 transition-all hover:scale-110 ${
                          selectedIcon === icon
                            ? "border-[#2ea043] bg-[#2ea043]/10"
                            : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="icon" value={selectedIcon} />
                </div>

                {/* Color Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                    색상
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(PROJECT_COLORS).map(([key, color]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedColor(key as ProjectColor)}
                        className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedColor === key
                            ? `${color.border} ${color.bgLight}`
                            : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"
                        }`}
                      >
                        <div className={`w-full h-2 rounded-full ${color.bg}`} />
                        <p className="text-[10px] mt-1 text-[#e6edf3] font-medium">{color.name}</p>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="color" value={selectedColor} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                    상태
                  </label>
                  <select
                    name="status"
                    defaultValue={project.status}
                    className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
                  >
                    <option value="active">진행중</option>
                    <option value="completed">완료</option>
                    <option value="paused">중단</option>
                  </select>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 bg-[#21262d] text-[#e6edf3] rounded-xl hover:bg-[#30363d] transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#2ea043] to-[#3fb950] text-white rounded-xl hover:from-[#25b060] hover:to-[#34a94b] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                        저장 중...
                      </>
                    ) : (
                      "저장"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
