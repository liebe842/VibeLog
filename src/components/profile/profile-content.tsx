"use client";

import { useState } from "react";
import { ProfileEditModal } from "./profile-edit-modal";
import { SettingsDropdown } from "./settings-dropdown";

interface ProfileContentProps {
  profile: any;
  stats: any;
  recentActivities: any[];
  streakDays: any[];
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
  return `${Math.floor(diffInSeconds / 86400)}일 전`;
}

export function ProfileContent({ profile, stats, recentActivities, streakDays }: ProfileContentProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="relative flex min-h-screen w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto flex-col bg-[#0d1117] pb-24 md:pb-8 overflow-x-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-[#0d1117] sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
          <button className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full hover:bg-[#161b22] transition-colors text-white">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight text-[#e6edf3]">My Status</h1>
          <SettingsDropdown onEditProfile={() => setIsEditModalOpen(true)} position="bottom" />
        </header>

        {/* Profile Card */}
        <section className="flex flex-col items-center px-6 pt-4 pb-8">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-[#21262d] border-4 border-[#161b22] shadow-xl flex items-center justify-center text-4xl font-bold text-[#e6edf3] transition-transform transform group-hover:scale-105 overflow-hidden">
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
              {profile.bio || "Developer"} • {stats.total_logs || 0}h Logged
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
            <p className="text-xs text-[#8b949e] mt-4 text-center">
              You're in the top 5% of learners this week!
            </p>
          </div>
        </section>

        {/* History Section */}
        <section className="flex flex-col px-4 gap-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-white">History</h3>
            <button className="text-sm font-semibold text-[#2ea043]">View All</button>
          </div>

          <div className="relative">
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-3 pl-1">
                Recent
              </h4>
              <div className="flex flex-col gap-3">
                {recentActivities.length === 0 ? (
                  <div className="bg-[#161b22] p-4 rounded-xl border border-[#30363d] text-center text-[#8b949e]">
                    아직 활동 기록이 없습니다.
                  </div>
                ) : (
                  recentActivities.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="bg-[#161b22] p-4 rounded-xl border border-[#30363d] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            categoryColors[activity.category] || "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {categoryIcons[activity.category] || "code"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white line-clamp-1">
                            {activity.content.substring(0, 30)}
                            {activity.content.length > 30 ? "..." : ""}
                          </span>
                          <span className="text-xs text-[#8b949e]">
                            {activity.category} • {formatTimeAgo(activity.created_at)}
                          </span>
                        </div>
                      </div>
                      {activity.duration_min > 0 && (
                        <div className="bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
                          <span className="text-xs font-bold text-[#e6edf3]">
                            {activity.duration_min}m
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={{
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        }}
      />
    </>
  );
}
