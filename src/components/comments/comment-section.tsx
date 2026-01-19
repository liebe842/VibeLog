"use client";

import { useState } from "react";
import { createComment, deleteComment } from "@/lib/actions/comments";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    level?: number;
  };
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  return date.toLocaleDateString("ko-KR");
}

export function CommentSection({ postId, comments: initialComments, currentUserId }: CommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await createComment(postId, content);

    if (result.error) {
      alert(result.error);
      setIsSubmitting(false);
    } else {
      setContent("");
      setIsSubmitting(false);
      
      // Refresh to get actual data from server immediately
      router.refresh();
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    const result = await deleteComment(commentId);
    if (result.error) {
      alert(result.error);
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4 pt-4 border-t border-[#30363d]">
      {/* Comment Form */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] text-sm placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] transition-all"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-4 py-2 bg-[#2ea043] hover:bg-[#2c974b] disabled:bg-[#8b949e]/20 disabled:text-[#8b949e] text-white text-sm font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {isSubmitting ? "..." : "등록"}
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-[#8b949e] text-sm text-center py-4">
            첫 댓글을 작성해보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-3 bg-[#0d1117]/50 rounded-lg border border-[#30363d]/50"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#e6edf3] font-bold text-xs shrink-0">
                {comment.profiles?.username?.[0] || "U"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#e6edf3] text-sm font-semibold">
                    {comment.profiles?.username || "Unknown"}
                  </span>
                  <span className="text-[#8b949e] text-xs">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-[#e6edf3] text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>

              {/* Delete Button */}
              {currentUserId && currentUserId === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-[#8b949e] hover:text-[#f85149] transition-colors shrink-0"
                  aria-label="Delete comment"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
