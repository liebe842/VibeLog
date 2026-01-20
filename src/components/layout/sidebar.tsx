"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { getUnreadCount } from "@/lib/actions/notifications";
import { SettingsDropdown } from "@/components/profile/settings-dropdown";
import { ProfileEditModal } from "@/components/profile/profile-edit-modal";

const navItems = [
  { href: "/", icon: "home", label: "피드" },
  { href: "/projects", icon: "folder", label: "프로젝트" },
  { href: "/write", icon: "edit_square", label: "글쓰기" },
  { href: "/notifications", icon: "notifications", label: "알림", showBadge: true },
  { href: "/profile", icon: "person", label: "프로필" },
  { href: "/admin", icon: "admin_panel_settings", label: "관리자" },
];

interface Profile {
  username: string;
  level: number;
  role: string;
  bio?: string;
  avatar_url?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function loadProfile() {
    const result = await getCurrentUserProfile();
    if (result.profile) {
      setProfile({
        username: result.profile.username,
        level: result.profile.level,
        role: result.profile.role,
        bio: result.profile.bio,
        avatar_url: result.profile.avatar_url,
      });
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    async function loadUnreadCount() {
      const result = await getUnreadCount();
      setUnreadCount(result.count || 0);
    }
    loadUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 fixed left-0 top-0 h-screen bg-[#0d1117] border-r border-[#30363d] p-6">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="bg-[#21262d] rounded-full w-10 h-10 ring-1 ring-[#30363d] flex items-center justify-center text-[#e6edf3] font-bold text-lg group-hover:ring-[#2ea043] transition-all">
              V
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#2ea043] rounded-full border-2 border-[#0d1117]" />
          </div>
          <h1 className="text-[#e6edf3] text-xl font-bold tracking-tight">VibeLog</h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems
          .filter((item) => {
            // 관리자 메뉴는 admin만 표시
            if (item.href === "/admin") {
              return profile?.role === "admin";
            }
            return true;
          })
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                  isActive
                    ? "bg-[#2ea043]/10 text-[#2ea043] font-semibold"
                    : "text-[#8b949e] hover:bg-[#161b22] hover:text-[#e6edf3]"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
                {item.showBadge && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Profile Section */}
      {profile && (
        <div className="pt-4 border-t border-[#30363d]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#161b22]/50 border border-[#30363d]">
            {/* Avatar & Info */}
            <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#21262d] border-2 border-[#30363d] flex items-center justify-center text-[#e6edf3] font-bold text-sm group-hover:border-[#2ea043] transition-all overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    profile.username[0].toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-[#2ea043] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#0d1117]">
                  {profile.level}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#e6edf3] truncate">
                  {profile.username}
                </p>
                <p className="text-xs text-[#8b949e]">
                  {profile.role === "admin" ? "관리자" : "사용자"}
                </p>
              </div>
            </Link>

            {/* Settings Icon */}
            <div className="shrink-0">
              <SettingsDropdown onEditProfile={() => setIsEditModalOpen(true)} />
            </div>
          </div>
        </div>
      )}
    </aside>

    {/* Profile Edit Modal */}
    {profile && (
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          // Reload profile after edit
          loadProfile();
        }}
        currentProfile={{
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        }}
      />
    )}
    </>
  );
}
