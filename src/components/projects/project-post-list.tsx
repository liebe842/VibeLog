"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { deletePost, likePost, getPostLikers } from "@/lib/actions/posts";
import { getComments } from "@/lib/actions/comments";
import { useRouter } from "next/navigation";
import { CommentSection } from "@/components/comments/comment-section";
import { PostEditModal } from "@/components/feed/post-edit-modal";

interface Post {
  id: string;
  content: string;
  category: string;
  duration_min: number;
  link_url?: string;
  image_url?: string;
  likes: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  liked_by_user?: boolean;
  profiles?: {
    username: string;
    level?: number;
    avatar_url?: string;
  };
}

interface ProjectPostListProps {
  posts: Post[];
  currentUserId?: string;
  isAdmin?: boolean;
}

const categoryBorderColors: Record<string, string> = {
  Coding: "border-l-blue-500",
  Study: "border-l-purple-500",
  Debug: "border-l-orange-500",
};

const categoryBadgeColors: Record<string, string> = {
  Coding: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  Study: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  Debug: "border-orange-500/30 text-orange-400 bg-orange-500/10",
};

const categoryLabels: Record<string, string> = {
  Coding: "코딩",
  Study: "공부",
  Debug: "디버그",
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  return date.toLocaleDateString("ko-KR");
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function LikeButton({
  postId,
  likes,
  likedByUser,
  onLike,
}: {
  postId: string;
  likes: number;
  likedByUser?: boolean;
  onLike: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [likers, setLikers] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleMouseEnter() {
    if (likes === 0) return;
    setShowTooltip(true);
    if (likers === null && !loading) {
      setLoading(true);
      const result = await getPostLikers(postId);
      if (result.usernames) {
        setLikers(result.usernames);
      }
      setLoading(false);
    }
  }

  function handleMouseLeave() {
    setShowTooltip(false);
  }

  return (
    <div className="relative">
      <motion.button
        onClick={onLike}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`flex items-center gap-1.5 transition-colors group ${
          likedByUser ? "text-[#3fb950]" : "text-[#8b949e] hover:text-[#3fb950]"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
          thumb_up
        </span>
        <span className="text-xs font-medium">{likes || 0}</span>
      </motion.button>
      {showTooltip && likes > 0 && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <div className="bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 shadow-lg min-w-[120px]">
            {loading ? (
              <span className="text-[#8b949e] text-xs">로딩 중...</span>
            ) : likers && likers.length > 0 ? (
              <div className="flex flex-col gap-1">
                {likers.map((username, idx) => (
                  <span key={idx} className="text-[#e6edf3] text-xs">
                    {username}
                  </span>
                ))}
                {likes > likers.length && (
                  <span className="text-[#8b949e] text-xs">
                    외 {likes - likers.length}명
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[#8b949e] text-xs">좋아요 {likes}개</span>
            )}
          </div>
          <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#30363d]" />
        </div>
      )}
    </div>
  );
}

export function ProjectPostList({ posts, currentUserId, isAdmin }: ProjectPostListProps) {
  const router = useRouter();
  const [localPosts, setLocalPosts] = useState(posts);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({});
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  async function handleDelete(postId: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const result = await deletePost(postId);
    if (result.error) {
      alert(result.error);
    } else {
      setLocalPosts((prev) => prev.filter((p) => p.id !== postId));
      router.refresh();
    }
  }

  async function handleLike(postId: string) {
    const post = localPosts.find((p) => p.id === postId);
    if (!post) return;

    const wasLiked = post.liked_by_user;

    setLocalPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: wasLiked ? p.likes - 1 : p.likes + 1,
              liked_by_user: !wasLiked,
            }
          : p
      )
    );

    const result = await likePost(postId);
    if (result.error) {
      alert(result.error);
      setLocalPosts(posts);
    } else {
      router.refresh();
    }
  }

  async function handleToggleComments(postId: string) {
    const newExpanded = new Set(expandedComments);

    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!commentsData[postId]) {
        const result = await getComments(postId);
        if (result.comments) {
          setCommentsData((prev) => ({ ...prev, [postId]: result.comments || [] }));
        }
      }
    }

    setExpandedComments(newExpanded);
  }

  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {localPosts.map((post) => (
        <motion.article
          key={post.id}
          className={`bg-[#161b22] border border-[#30363d] ${categoryBorderColors[post.category]} border-l-4 rounded-md p-4 flex flex-col gap-3`}
          variants={itemVariants}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#e6edf3] font-bold overflow-hidden">
                {post.profiles?.avatar_url ? (
                  <img src={post.profiles.avatar_url} alt={post.profiles.username} className="w-full h-full object-cover" />
                ) : (
                  post.profiles?.username?.[0] || "U"
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[#e6edf3] text-sm font-semibold">
                    {post.profiles?.username || "Unknown"}
                  </span>
                  <span className="w-1 h-1 bg-[#8b949e] rounded-full" />
                  <span className="text-[#8b949e] text-xs">{formatTimeAgo(post.created_at)}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryBadgeColors[post.category] || "bg-[#8b949e]/10 text-[#8b949e] border-[#8b949e]/30"}`}>
                  {categoryLabels[post.category] || post.category}
                  {post.duration_min > 0 && ` (${post.duration_min}분)`}
                </span>
              </div>
            </div>
            {currentUserId && (currentUserId === post.user_id || isAdmin) && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingPost(post)}
                  className="text-[#8b949e] hover:text-[#58a6ff] transition-colors p-1"
                  aria-label="Edit post"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-[#8b949e] hover:text-[#f85149] transition-colors p-1"
                  aria-label="Delete post"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            )}
          </div>

          <p className="text-[#e6edf3] text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post image"
              className="rounded-md max-w-full h-auto border border-[#30363d]"
            />
          )}

          {post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-[#58a6ff] hover:underline"
            >
              <span className="material-symbols-outlined text-base mr-1">link</span>
              결과물 보러가기
            </a>
          )}

          <div className="flex items-center gap-6 pt-2 border-t border-[#30363d]/50 mt-1">
            <LikeButton
              postId={post.id}
              likes={post.likes}
              likedByUser={post.liked_by_user}
              onLike={() => handleLike(post.id)}
            />
            <motion.button
              onClick={() => handleToggleComments(post.id)}
              className="flex items-center gap-1.5 text-[#8b949e] hover:text-[#58a6ff] transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">chat_bubble</span>
              <span className="text-xs font-medium">{post.comments_count || 0}</span>
            </motion.button>
            <motion.button
              className="ml-auto text-[#8b949e] hover:text-[#f778ba] transition-colors group"
              whileHover={{ scale: 1.1 }}
            >
              <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">share</span>
            </motion.button>
          </div>

          {expandedComments.has(post.id) && (
            <CommentSection
              postId={post.id}
              comments={commentsData[post.id] || []}
              currentUserId={currentUserId}
            />
          )}
        </motion.article>
      ))}

      {editingPost && (
        <PostEditModal
          isOpen={!!editingPost}
          onClose={() => {
            setEditingPost(null);
            setTimeout(() => {
              router.refresh();
            }, 100);
          }}
          post={{
            id: editingPost.id,
            content: editingPost.content,
            category: editingPost.category,
            duration_min: editingPost.duration_min,
            link_url: editingPost.link_url,
            image_url: editingPost.image_url,
          }}
        />
      )}
    </motion.div>
  );
}
