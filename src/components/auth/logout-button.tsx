"use client";

import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  const handleLogout = async () => {
    await logout();
  };

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
