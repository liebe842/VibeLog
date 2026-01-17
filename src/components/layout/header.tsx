"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationPopup } from "@/components/notifications/notification-popup";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#0d1117]/95 backdrop-blur-sm border-b border-[#30363d] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer">
          <div className="bg-[#21262d] rounded-full w-8 h-8 ring-1 ring-[#30363d] flex items-center justify-center text-[#e6edf3] font-bold text-sm">
            V
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2ea043] rounded-full border-2 border-[#0d1117]" />
        </div>
        <Link href="/">
          <h1 className="text-[#e6edf3] text-lg font-bold tracking-tight">VibeLog</h1>
        </Link>
      </div>

      <NotificationPopup />
    </header>
  );
}
