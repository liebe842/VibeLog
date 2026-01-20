"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { createPost } from "@/lib/actions/posts";
import { getProjectColor } from "@/lib/project-colors";

interface Project {
  id: string;
  title: string;
  status: string;
  color?: string;
  icon?: string;
}

interface WriteFormProps {
  projects: Project[];
  initialProjectId?: string;
}

export function WriteForm({ projects, initialProjectId }: WriteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || "");

  const categories = [
    { id: "Coding", label: "코딩", icon: "code_blocks", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { id: "Study", label: "공부", icon: "menu_book", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { id: "Debug", label: "디버그", icon: "bug_report", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  ];

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("category", selectedCategory);
    if (selectedProjectId) {
      formData.set("project_id", selectedProjectId);
    }
    const result = await createPost(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#0d1117] sticky top-0 z-20 backdrop-blur-md bg-opacity-90 border-b border-[#30363d]">
        <button
          onClick={() => router.back()}
          className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full hover:bg-[#161b22] transition-colors text-white"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight text-[#e6edf3]">활동 기록</h1>
        <div className="w-10" />
      </header>

      <motion.form
        onSubmit={handleSubmit}
        className="p-4 md:p-6 lg:p-8 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Project Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            프로젝트 <span className="text-[#8b949e]/50">- 선택</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[{ id: "", title: "미분류", icon: "📋", color: "gray" }, ...projects.filter((p) => p.title !== "미분류")].map((project) => {
              const projectColor = getProjectColor(project.color || "gray");
              const isSelected = selectedProjectId === project.id;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `${projectColor.border} ${projectColor.bgLight}`
                      : "border-[#30363d] bg-[#161b22] hover:border-[#8b949e]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{project.icon || "📁"}</span>
                    <span className="text-sm font-medium text-[#e6edf3] truncate">{project.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            {selectedProject && selectedProject.title !== "미분류" && (
              <Link
                href={`/projects/${selectedProjectId}`}
                className="inline-flex items-center gap-1 text-xs text-[#58a6ff] hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                프로젝트 보기
              </Link>
            )}
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#e6edf3]"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              새 프로젝트 만들기
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            무엇을 작업했나요?
          </label>
          <textarea
            name="content"
            required
            rows={4}
            placeholder="오늘의 활동을 기록하세요..."
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] resize-none transition-all"
          />
        </div>

        {/* Category */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            카테고리
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  selectedCategory === cat.id
                    ? `${cat.color} border-current`
                    : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            소요 시간 (분) <span className="text-[#8b949e]/50">- 선택</span>
          </label>
          <input
            type="number"
            name="duration_min"
            min="0"
            placeholder="45"
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
          />
        </div>

        {/* Link URL */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            링크 <span className="text-[#8b949e]/50">- 선택</span>
          </label>
          <input
            type="url"
            name="link_url"
            placeholder="https://github.com/username/repo"
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            이미지 URL <span className="text-[#8b949e]/50">- 선택</span>
          </label>
          <input
            type="url"
            name="image_url"
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || !selectedCategory}
          className="w-full bg-gradient-to-r from-[#2ea043] to-[#3fb950] hover:from-[#25b060] hover:to-[#34a94b] disabled:from-[#2ea043]/50 disabled:to-[#3fb950]/50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-[#2ea043]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">sync</span>
              기록 중...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">check</span>
              활동 기록하기
            </>
          )}
        </motion.button>
      </motion.form>
    </div>
  );
}
