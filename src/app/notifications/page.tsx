"use client";

import { useState, useEffect } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  return `${Math.floor(diffInSeconds / 86400)}일 전`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    const result = await getNotifications();
    if (result.notifications) {
      setNotifications(result.notifications as Notification[]);
    }
    setLoading(false);
  }

  async function handleMarkAsRead(id: string) {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function handleMarkAllAsRead() {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0d1117] pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0d1117]/95 backdrop-blur-sm border-b border-[#30363d] p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#e6edf3]">알림</h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-[#2ea043] hover:text-[#2c974b] font-semibold transition-colors"
            >
              모두 읽음
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        {loading ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center">
            <p className="text-[#8b949e] text-lg">로딩 중...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-[64px] text-[#8b949e] mb-4 block">
              notifications_none
            </span>
            <p className="text-[#8b949e] text-lg">알림이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-[#161b22] border border-[#30363d] rounded-xl p-4 transition-all hover:border-[#8b949e] ${
                  !notification.read ? "ring-1 ring-[#2ea043]/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {!notification.read && (
                    <span className="w-2 h-2 mt-2 rounded-full bg-[#2ea043] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-[#e6edf3] text-sm leading-relaxed">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors shrink-0"
                        >
                          읽음
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#8b949e] mt-2">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
