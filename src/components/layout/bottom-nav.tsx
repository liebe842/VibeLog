"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/write", icon: "add", label: "", isCenter: true },
  { href: "/profile", icon: "person", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#0d1117]/95 backdrop-blur-md border-t border-[#30363d] z-50">
      <div className="flex justify-around items-center h-[70px] pb-2 max-w-lg mx-auto">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full gap-1 group transition-colors ${
            pathname === "/" ? "text-[#2ea043]" : "text-[#8b949e] hover:text-[#e6edf3]"
          }`}
        >
          <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">
            home
          </span>
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Center FAB */}
        <div className="relative -top-4">
          <Link href="/write">
            <button className="bg-[#2ea043] hover:bg-[#25b060] text-[#0d1117] rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_15px_rgba(46,160,67,0.3)] transition-all active:scale-95">
              <span className="material-symbols-outlined text-[28px]">add</span>
            </button>
          </Link>
        </div>

        {/* Profile */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center w-full gap-1 group transition-colors ${
            pathname === "/profile" ? "text-[#2ea043]" : "text-[#8b949e] hover:text-[#e6edf3]"
          }`}
        >
          <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">
            person
          </span>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
