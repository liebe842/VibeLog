"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { deletePost, likePost, getPostLikers } from "@/lib/actions/posts";
import { getComments } from "@/lib/actions/comments";
import { CommentSection } from "@/components/comments/comment-section";
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

interface UserProfileContentProps {
  profile: any;
  stats: any;
  posts: Post[];
  streakDays: any[];
  currentUserId?: string;
}

const categoryBorderColors: Record<string, string> = {
  Planning: "border-l-blue-500",
  Development: "border-l-green-500",
  Design: "border-l-purple-500",
  Debug: "border-l-orange-500",
  Other: "border-l-gray-500",
  Coding: "border-l-blue-500",
  Study: "border-l-purple-500",
};

const categoryBadgeColors: Record<string, string> = {
  Planning: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  Development: "border-green-500/30 text-green-400 bg-green-500/10",
  Design: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  Debug: "border-orange-500/30 text-orange-400 bg-orange-500/10",
  Other: "border-gray-500/30 text-gray-400 bg-gray-500/10",
  Coding: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  Study: "border-purple-500/30 text-purple-400 bg-purple-500/10",
};

const categoryLabels: Record<string, string> = {
  Planning: "기획 및 PRD 작성",
  Development: "핵심 기능 구현",
  Design: "UI 디자인 및 개선",
  Debug: "디버깅 및 배포",
  Other: "기타",
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

export function UserProfileContent({ profile, stats, posts, streakDays, currentUserId }: UserProfileContentProps) {
  const router = useRouter();
  const [localPosts, setLocalPosts] = useState(posts);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({});

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
    <div className="relative flex min-h-screen w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto flex-col bg-[#0d1117] pb-24 md:pb-8 overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#0d1117] sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
        <button
          onClick={() => router.back()}
          className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full hover:bg-[#161b22] transition-colors text-white"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight text-[#e6edf3]">{profile.username}</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Profile Card */}
      <section className="flex flex-col items-center px-6 pt-4 pb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#21262d] border-4 border-[#161b22] shadow-xl flex items-center justify-center text-4xl font-bold text-[#e6edf3] overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              profile.username[0]
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#2ea043] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#0d1117]">
            Lvl {profile.level}
          </div>
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold leading-tight text-[#e6edf3]">{profile.username}</h2>
          <p className="text-[#8b949e] text-sm font-medium mt-1">
            {profile.bio || "Developer"} • {stats.total_logs || 0} Logs
          </p>
        </div>
      </section>

      {/* Streak Card */}
      <section className="px-4 mb-6">
        <div className="bg-[#161b22] rounded-2xl p-6 shadow-sm border border-[#30363d]">
          <div className="flex justify-between items-end mb-5">
            <div>
              <p className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1">
                Current Streak
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {stats.streak || 0}
                </span>
                <span className="text-lg font-bold text-[#2ea043]">Days</span>
              </div>
            </div>
            <div className="text-right">
              <span
                className="material-symbols-outlined text-[#2ea043]"
                style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
          </div>

          {/* Streak Grid */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-7 gap-2 w-full">
              {streakDays.map((day, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md ${
                    day.isFuture
                      ? "bg-transparent border border-[#30363d]/30"
                      : day.hasActivity
                      ? "bg-[#2ea043] shadow-[0_0_8px_rgba(46,160,67,0.4)]"
                      : day.isToday
                      ? "bg-[#0d1117] border border-dashed border-[#30363d]"
                      : "bg-[#2ea043]/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section - Feed Style */}
      <section className="flex flex-col px-4 gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-white">활동 기록</h3>
          <span className="text-sm text-[#8b949e]">{localPosts.length}개</span>
        </div>

        {localPosts.length === 0 ? (
          <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d] text-center text-[#8b949e]">
            아직 활동 기록이 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {localPosts.map((post) => (
              <motion.article
                key={post.id}
                className={`bg-[#161b22] border border-[#30363d] ${categoryBorderColors[post.category]} border-l-4 rounded-md p-4 flex flex-col gap-3`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
