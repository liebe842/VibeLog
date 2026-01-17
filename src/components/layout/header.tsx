"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-background-dark/95 backdrop-blur supports-[backdrop-filter]:bg-background-dark/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">
            <span className="text-primary">Vibe</span>
            <span className="text-text-primary">Log</span>
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-text-secondary"
            )}
          >
            피드
          </Link>
          <Link
            href="/profile"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/profile" ? "text-primary" : "text-text-secondary"
            )}
          >
            프로필
          </Link>
        </nav>

        {/* Notification Bell */}
        <button className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-surface-dark transition-colors">
          <span className="material-symbols-outlined text-text-secondary text-xl">
            notifications
          </span>
        </button>
      </div>
    </header>
  );
}
