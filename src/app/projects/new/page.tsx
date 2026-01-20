"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createProject } from "@/lib/actions/projects";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createProject(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/projects");
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
        <h1 className="text-lg font-bold tracking-tight text-[#e6edf3]">새 프로젝트</h1>
        <div className="w-10" />
      </header>

      <motion.form
        onSubmit={handleSubmit}
        className="p-4 md:p-6 lg:p-8 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Project Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            프로젝트 이름 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="예: VibeLog 개발"
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            프로젝트 설명 <span className="text-[#8b949e]/50">- 선택</span>
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="이 프로젝트에 대해 간단히 설명해주세요..."
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] resize-none transition-all"
          />
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-400 text-[20px] mt-0.5">info</span>
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">프로젝트를 만들면:</p>
              <ul className="list-disc list-inside text-blue-300/80 space-y-1">
                <li>개발일지 작성 시 프로젝트를 선택할 수 있어요</li>
                <li>프로젝트별로 개발일지를 모아볼 수 있어요</li>
                <li>다른 사람들도 프로젝트를 볼 수 있어요</li>
              </ul>
            </div>
          </div>
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
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#2ea043] to-[#3fb950] hover:from-[#25b060] hover:to-[#34a94b] disabled:from-[#2ea043]/50 disabled:to-[#3fb950]/50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-[#2ea043]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">sync</span>
              생성 중...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">add</span>
              프로젝트 만들기
            </>
          )}
        </motion.button>
      </motion.form>
    </div>
  );
}
