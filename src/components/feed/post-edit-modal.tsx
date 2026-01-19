"use client";

import { useState } from "react";
import { updatePost } from "@/lib/actions/posts";
import { useRouter } from "next/navigation";

interface PostEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    category: string;
    duration_min: number;
    link_url?: string;
    image_url?: string;
  };
}

const categories = [
  { id: "Coding", label: "코딩" },
  { id: "Study", label: "공부" },
  { id: "Debug", label: "디버그" },
];

export function PostEditModal({ isOpen, onClose, post }: PostEditModalProps) {
  const router = useRouter();
  const [content, setContent] = useState(post.content);
  const [category, setCategory] = useState(post.category);
  const [durationMin, setDurationMin] = useState(post.duration_min.toString());
  const [linkUrl, setLinkUrl] = useState(post.link_url || "");
  const [imageUrl, setImageUrl] = useState(post.image_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("category", category);
      formData.append("duration_min", durationMin);
      formData.append("link_url", linkUrl);
      formData.append("image_url", imageUrl);

      const result = await updatePost(post.id, formData);

      setIsSubmitting(false);

      if (result.error) {
        setError(result.error);
      } else {
        // Close modal - parent will handle refresh
        onClose();
      }
    } catch (err) {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#30363d]">
          <h2 className="text-xl font-bold text-[#e6edf3]">게시물 수정</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#21262d] transition-colors text-[#8b949e]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#8b949e]">카테고리</label>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    category === cat.id
                      ? "bg-[#2ea043] text-white"
                      : "bg-[#21262d] text-[#8b949e] hover:bg-[#30363d]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#8b949e]">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="오늘의 활동을 기록하세요..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all resize-none"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#8b949e]">소요 시간 (분)</label>
            <input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              min="0"
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
            />
          </div>

          {/* Link URL */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#8b949e]">링크 URL (선택)</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#8b949e]">이미지 URL (선택)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-semibold rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#2ea043] to-[#3fb950] hover:from-[#25b060] hover:to-[#34a94b] disabled:from-[#8b949e]/20 disabled:to-[#8b949e]/20 disabled:text-[#8b949e] text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
