"use client";

import { useState, useRef, useEffect } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

interface SettingsDropdownProps {
  onEditProfile?: () => void;
  position?: "top" | "bottom";
}

export function SettingsDropdown({ onEditProfile, position = "top" }: SettingsDropdownProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full hover:bg-[#161b22] transition-colors text-white"
      >
        <span className="material-symbols-outlined text-[24px]">settings</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 w-56 bg-[#161b22] border border-[#30363d] rounded-xl shadow-lg overflow-hidden z-50 ${
          position === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
        }`}>
          {/* Menu Items */}
          <div className="py-2">
            {/* Profile Edit */}
            <button
              className="w-full px-4 py-3 text-left text-sm text-[#e6edf3] hover:bg-[#21262d] transition-colors flex items-center gap-3"
              onClick={() => {
                setIsOpen(false);
                if (onEditProfile) {
                  onEditProfile();
                } else {
                  alert("프로필 편집 기능은 준비 중입니다.");
                }
              }}
            >
              <span className="material-symbols-outlined text-[20px] text-[#8b949e]">
                edit
              </span>
              <span>프로필 편집</span>
            </button>

            {/* Notification Settings */}
            <button
              className="w-full px-4 py-3 text-left text-sm text-[#e6edf3] hover:bg-[#21262d] transition-colors flex items-center gap-3"
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to notification settings
                alert("알림 설정 기능은 준비 중입니다.");
              }}
            >
              <span className="material-symbols-outlined text-[20px] text-[#8b949e]">
                notifications
              </span>
              <span>알림 설정</span>
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-[#30363d]" />

            {/* Logout */}
            <div className="px-2">
              <LogoutButton variant="dropdown" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
