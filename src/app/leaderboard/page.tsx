"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLeaderboard, LeaderboardUser } from "@/lib/actions/leaderboard";

const rankIcons: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    const result = await getLeaderboard();
    if (result.users) {
      setUsers(result.users);
      setCurrentUserId(result.currentUserId);
    }
    setLoading(false);
  }

  function handleUserClick(userId: string) {
    router.push(`/profile/${userId}`);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0d1117]/95 backdrop-blur-sm border-b border-[#30363d] p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px] text-[#2ea043]">
            leaderboard
          </span>
          <h1 className="text-2xl font-bold text-[#e6edf3]">리더보드</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        {loading ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center">
            <p className="text-[#8b949e] text-lg">로딩 중...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-[64px] text-[#8b949e] mb-4 block">
              groups
            </span>
            <p className="text-[#8b949e] text-lg">아직 사용자가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const isTopThree = user.rank <= 3;

              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className={`bg-[#161b22] border border-[#30363d] rounded-xl p-4 transition-all cursor-pointer hover:border-[#8b949e] ${
                    isCurrentUser ? "ring-2 ring-[#2ea043]/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-10 text-center shrink-0">
                      {isTopThree ? (
                        <span className="text-2xl">{rankIcons[user.rank]}</span>
                      ) : (
                        <span className="text-lg font-bold text-[#8b949e]">
                          {user.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#21262d] border-2 border-[#30363d] flex items-center justify-center text-[#e6edf3] font-bold text-lg overflow-hidden">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.username[0].toUpperCase()
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#2ea043] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#0d1117]">
                        {user.level}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[#e6edf3] font-semibold truncate">
                          {user.username}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs text-[#2ea043] font-medium">
                            (나)
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#8b949e]">
                        Lvl {user.level}
                      </p>
                    </div>

                    {/* Logs Count */}
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-[#e6edf3]">
                        {user.total_logs}
                      </p>
                      <p className="text-xs text-[#8b949e]">로그</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
