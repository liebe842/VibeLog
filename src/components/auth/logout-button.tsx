"use client";

import { logout } from "@/lib/actions/auth";

interface LogoutButtonProps {
  variant?: "default" | "dropdown";
}

export function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  const handleLogout = async () => {
    await logout();
  };

  if (variant === "dropdown") {
    return (
      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-[#21262d] rounded-lg transition-colors flex items-center gap-3"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        <span>로그아웃</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
    >
      <span className="material-symbols-outlined text-[20px]">logout</span>
      로그아웃
    </button>
  );
}
