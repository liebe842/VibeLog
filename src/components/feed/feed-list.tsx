"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { deletePost, likePost, getPostLikers } from "@/lib/actions/posts";
import { getComments } from "@/lib/actions/comments";
import { useRouter, useSearchParams } from "next/navigation";
import { CommentSection } from "@/components/comments/comment-section";
import { PostEditModal } from "@/components/feed/post-edit-modal";
import { LinkPreviewCard } from "@/components/feed/link-preview-card";
import { getProjectColor } from "@/lib/project-colors";

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
  project_id?: string;
  ai_help_score?: number | null;
  time_saved?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  og_site_name?: string | null;
  profiles?: {
    username: string;
    level?: number;
    avatar_url?: string;
  };
  projects?: {
    id: string;
    title: string;
    color?: string;
    icon?: string;
  };
}

interface Project {
  id: string;
  title: string;
  status?: string;
  color?: string;
  icon?: string;
}

interface FeedListProps {
  posts: Post[];
  stats?: {
    streak: number;
    total_logs: number;
    level: number;
    writtenDays?: number;
    requiredDays?: number;
  };
  currentUserId?: string;
  isAdmin?: boolean;
  initialSearch?: string;
  initialSearchType?: "content" | "user";
  projects?: Project[];
}

const categoryColors: Record<string, string> = {
  Planning: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Development: "bg-green-500/20 text-green-400 border-green-500/30",
  Design: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Debug: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  // Legacy categories for existing posts
  Coding: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Study: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const categoryBorderColors: Record<string, string> = {
  Planning: "border-l-blue-500",
  Development: "border-l-green-500",
  Design: "border-l-purple-500",
  Debug: "border-l-orange-500",
  Other: "border-l-gray-500",
  // Legacy
  Coding: "border-l-blue-500",
  Study: "border-l-purple-500",
};

const categoryBadgeColors: Record<string, string> = {
  Planning: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  Development: "border-green-500/30 text-green-400 bg-green-500/10",
  Design: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  Debug: "border-orange-500/30 text-orange-400 bg-orange-500/10",
  Other: "border-gray-500/30 text-gray-400 bg-gray-500/10",
  // Legacy
  Coding: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  Study: "border-purple-500/30 text-purple-400 bg-purple-500/10",
};

const categoryIcons: Record<string, string> = {
  Planning: "description",
  Development: "code_blocks",
  Design: "palette",
  Debug: "bug_report",
  Other: "more_horiz",
  // Legacy
  Coding: "code_blocks",
  Study: "menu_book",
};

const categoryLabels: Record<string, string> = {
  Planning: "기획 및 PRD 작성",
  Development: "핵심 기능 구현",
  Design: "UI 디자인 및 개선",
  Debug: "디버깅 및 배포",
  Other: "기타",
  // Legacy
  Coding: "코딩",
  Study: "공부",
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
  const writtenDays = stats?.writtenDays || 0;
  const requiredDays = stats?.requiredDays || 7;
  const progress = Math.min((writtenDays / requiredDays) * 100, 100);

  return (
    <motion.section
      className="bg-gradient-to-br from-[#161b22] to-[#1c2128] border border-[#30363d] rounded-md p-4 flex flex-col gap-4 shadow-sm"
      variants={itemVariants}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-[#e6edf3] text-base font-semibold">오늘의 진행상황</h2>
        <span className="text-[#3fb950] text-sm font-mono bg-[#2ea043]/10 px-3 py-1.5 rounded border border-[#2ea043]/30">
          {writtenDays}일 작성 / {requiredDays}일 목표
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm text-[#8b949e] mb-1">
          <span>레벨 {level}: 코딩 챌린지</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2ea043] to-[#3fb950] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-[#0d1117] rounded border border-[#30363d] p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[#e6edf3] text-3xl font-bold font-mono">{streak}</span>
          <span className="text-[#8b949e] text-sm mt-1.5">연속 일수</span>
        </div>
        <div className="bg-[#0d1117] rounded border border-[#30363d] p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[#e6edf3] text-3xl font-bold font-mono">{totalLogs}</span>
          <span className="text-[#8b949e] text-sm mt-1.5">활동 기록</span>
        </div>
      </div>
    </motion.section>
  );
}

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

function SearchBar({
  initialSearch,
  initialSearchType,
}: {
  initialSearch?: string;
  initialSearchType?: "content" | "user";
}) {
  const router = useRouter();
  const [searchType, setSearchType] = useState<"content" | "user">(initialSearchType || "content");
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sync searchQuery with initialSearch prop (e.g., when navigating to "/" to clear search)
  useEffect(() => {
    setSearchQuery(initialSearch || "");
  }, [initialSearch]);

  const searchTypeLabels = {
    content: "내용",
    user: "사용자",
  };

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
      params.set("type", searchType);
    }
    router.push(`/?${params.toString()}`);
  }

  function handleClear() {
    setSearchQuery("");
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-1.5 sm:gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-0.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#e6edf3] text-xs sm:text-sm hover:border-[#8b949e] transition-colors"
        >
          <span>{searchTypeLabels[searchType]}</span>
          <span className="material-symbols-outlined text-[14px] sm:text-[16px]">expand_more</span>
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-[#21262d] border border-[#30363d] rounded-lg shadow-lg z-50 min-w-[80px]">
            <button
              type="button"
              onClick={() => {
                setSearchType("content");
                setIsDropdownOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-[#30363d] transition-colors ${
                searchType === "content" ? "text-[#3fb950]" : "text-[#e6edf3]"
              }`}
            >
              내용
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchType("user");
                setIsDropdownOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-[#30363d] transition-colors ${
                searchType === "user" ? "text-[#3fb950]" : "text-[#e6edf3]"
              }`}
            >
              사용자
            </button>
          </div>
        )}
      </div>
      <div className="relative w-24 sm:w-32 md:w-40">
        <span className="material-symbols-outlined absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-[#8b949e] text-[16px] sm:text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="검색..."
          className="w-full pl-7 sm:pl-9 pr-6 sm:pr-8 py-1.5 sm:py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-[#e6edf3] text-xs sm:text-sm placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">close</span>
          </button>
        )}
      </div>
      <button
        type="submit"
        className="px-2 sm:px-3 py-1.5 sm:py-2 bg-[#2ea043] hover:bg-[#3fb950] text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
      >
        검색
      </button>
    </form>
  );
}

export function FeedList({ posts, stats, currentUserId, isAdmin, initialSearch, initialSearchType, projects = [] }: FeedListProps) {
  const router = useRouter();
  const [localPosts, setLocalPosts] = useState(posts);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({});
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Update localPosts when posts prop changes (e.g., after search)
  // Using JSON.stringify to detect deep changes in the posts array
  useEffect(() => {
    setLocalPosts(posts);
  }, [JSON.stringify(posts.map(p => p.id))]);

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
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[#e6edf3] text-base font-semibold">개발 로그</h3>
          <SearchBar initialSearch={initialSearch} initialSearchType={initialSearchType} />
        </div>

        {initialSearch && (
          <div className="flex items-center justify-between text-sm text-[#8b949e] px-1">
            <span>&quot;{initialSearch}&quot; 검색 결과: {localPosts.length}개</span>
            <button
              onClick={() => {
                router.push("/");
                router.refresh();
              }}
              className="text-[#58a6ff] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              전체 보기
            </button>
          </div>
        )}

        {localPosts.length === 0 ? (
          <motion.article
            className="bg-[#161b22] border border-[#30363d] rounded-md p-6 text-center"
            variants={itemVariants}
          >
            <p className="text-[#8b949e] mb-4">
              {initialSearch ? "검색 결과가 없습니다." : "아직 등록된 활동이 없습니다."}
            </p>
            {!initialSearch && (
              <Link href="/write" className="text-[#2ea043] hover:underline font-medium">
                첫 번째 활동을 기록해보세요! →
              </Link>
            )}
          </motion.article>
        ) : (
          localPosts.map((post) => (
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryBadgeColors[post.category] || "bg-[#8b949e]/10 text-[#8b949e] border-[#8b949e]/30"}`}>
                        {categoryLabels[post.category] || post.category}
                        {post.duration_min > 0 && ` (${post.duration_min}분)`}
                      </span>
                      {post.projects && post.projects.title !== "미분류" && (() => {
                        const projectColor = getProjectColor(post.projects.color || "gray");
                        return (
                          <Link
                            href={`/projects/${post.projects.id}`}
                            className={`text-xs px-2 py-0.5 rounded-full border-2 inline-flex items-center gap-1 hover:scale-105 transition-transform ${projectColor.border} ${projectColor.bgLight}`}
                          >
                            <span>{post.projects.icon || "📁"}</span>
                            <span>{post.projects.title}</span>
                          </Link>
                        );
                      })()}
                    </div>
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
                <LinkPreviewCard
                  url={post.link_url}
                  title={post.og_title}
                  description={post.og_description}
                  image={post.og_image}
                  siteName={post.og_site_name}
                />
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

      {/* Post Edit Modal */}
      {editingPost && (
        <PostEditModal
          isOpen={!!editingPost}
          onClose={() => {
            setEditingPost(null);
            // Refresh to get updated data from server
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
            project_id: editingPost.project_id,
            ai_help_score: editingPost.ai_help_score,
            time_saved: editingPost.time_saved,
          }}
          projects={projects}
        />
      )}
    </motion.div>
  );
}

export function FloatingActionButton() {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
      <Link href="/write">
        <motion.button
          className="bg-gradient-to-br from-[#2ea043] to-[#3fb950] hover:from-[#25b060] hover:to-[#34a94b] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_20px_rgba(46,160,67,0.4)]"
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
