"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { deletePost, likePost } from "@/lib/actions/posts";
import { getComments } from "@/lib/actions/comments";
import { useRouter } from "next/navigation";
import { CommentSection } from "@/components/comments/comment-section";

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
  };
}

interface FeedListProps {
  posts: Post[];
  stats?: {
    streak: number;
    total_logs: number;
    level: number;
  };
  currentUserId?: string;
}

const categoryColors: Record<string, string> = {
  Coding: "bg-blue-500/20 text-blue-400",
  Study: "bg-purple-500/20 text-purple-400",
  Debug: "bg-orange-500/20 text-orange-400",
};

const categoryIcons: Record<string, string> = {
  Coding: "code_blocks",
  Study: "menu_book",
  Debug: "bug_report",
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

function ProgressCard({ stats }: { stats?: FeedListProps["stats"] }) {
  const streak = stats?.streak || 0;
  const totalLogs = stats?.total_logs || 0;
  const level = stats?.level || 1;
  const progress = Math.min((streak / 30) * 100, 100);

  return (
    <motion.section
      className="bg-[#161b22] border border-[#30363d] rounded-md p-4 flex flex-col gap-4 shadow-sm"
      variants={itemVariants}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-[#e6edf3] text-sm font-semibold">Today's Progress</h2>
        <span className="text-[#2ea043] text-xs font-mono bg-[#2ea043]/10 px-2 py-1 rounded">
          Day {streak}/30
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-[#8b949e] mb-1">
          <span>Level {level}: 코딩 챌린지</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
          <motion.div
            className="h-full bg-[#2ea043] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-[#0d1117] rounded border border-[#30363d] p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[#e6edf3] text-xl font-bold font-mono">{streak}</span>
          <span className="text-[#8b949e] text-xs mt-1">Day Streak</span>
        </div>
        <div className="bg-[#0d1117] rounded border border-[#30363d] p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[#e6edf3] text-xl font-bold font-mono">{totalLogs}</span>
          <span className="text-[#8b949e] text-xs mt-1">Challenges</span>
        </div>
      </div>
    </motion.section>
  );
}

export function FeedList({ posts, stats, currentUserId }: FeedListProps) {
  const router = useRouter();
  const [localPosts, setLocalPosts] = useState(posts);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({});

  async function handleDelete(postId: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const result = await deletePost(postId);
    if (result.error) {
      alert(result.error);
    } else {
      // Optimistically remove from UI
      setLocalPosts((prev) => prev.filter((p) => p.id !== postId));
      router.refresh();
    }
  }

  async function handleLike(postId: string) {
    const post = localPosts.find((p) => p.id === postId);
    if (!post) return;

    const wasLiked = post.liked_by_user;

    // Optimistic update
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
      // Revert on error
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
      // Load comments if not already loaded
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
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <ProgressCard stats={stats} />

      <div className="flex flex-col gap-4">
        <h3 className="text-[#e6edf3] text-sm font-semibold px-1">Community Activity</h3>

        {localPosts.length === 0 ? (
          <motion.article
            className="bg-[#161b22] border border-[#30363d] rounded-md p-6 text-center"
            variants={itemVariants}
          >
            <p className="text-[#8b949e] mb-4">아직 등록된 활동이 없습니다.</p>
            <Link href="/write" className="text-[#2ea043] hover:underline font-medium">
              첫 번째 활동을 기록해보세요! →
            </Link>
          </motion.article>
        ) : (
          localPosts.map((post) => (
            <motion.article
              key={post.id}
              className="bg-[#161b22] border border-[#30363d] rounded-md p-4 flex flex-col gap-3"
              variants={itemVariants}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#e6edf3] font-bold">
                    {post.profiles?.username?.[0] || "U"}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[#e6edf3] text-sm font-semibold">
                        {post.profiles?.username || "Unknown"}
                      </span>
                      <span className="w-1 h-1 bg-[#8b949e] rounded-full" />
                      <span className="text-[#8b949e] text-xs">{formatTimeAgo(post.created_at)}</span>
                    </div>
                    <span className="text-[#8b949e] text-xs">{post.category} Path</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentUserId && currentUserId === post.user_id && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => alert("수정 기능은 준비 중입니다.")}
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
                  {post.duration_min > 0 && (
                    <div className="border border-[#2ea043]/30 text-[#2ea043] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {post.duration_min}분
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[#e6edf3] text-sm leading-relaxed">{post.content}</p>

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
                <motion.button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 transition-colors group ${
                    post.liked_by_user
                      ? "text-[#2ea043]"
                      : "text-[#8b949e] hover:text-[#2ea043]"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                    {post.liked_by_user ? "thumb_up" : "thumb_up"}
                  </span>
                  <span className="text-xs font-medium">{post.likes || 0}</span>
                </motion.button>
                <motion.button
                  onClick={() => handleToggleComments(post.id)}
                  className="flex items-center gap-1.5 text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                  <span className="text-xs font-medium">{post.comments_count || 0}</span>
                </motion.button>
                <motion.button
                  className="ml-auto text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                </motion.button>
              </div>

              {/* Comments Section */}
              {expandedComments.has(post.id) && (
                <CommentSection
                  postId={post.id}
                  comments={commentsData[post.id] || []}
                  currentUserId={currentUserId}
                />
              )}
            </motion.article>
          ))
        )}
      </div>
    </motion.div>
  );
}

export function FloatingActionButton() {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
      <Link href="/write">
        <motion.button
          className="bg-[#2ea043] hover:bg-[#25b060] text-[#0d1117] rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_15px_rgba(46,160,67,0.3)]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </motion.button>
      </Link>
    </div>
  );
}
