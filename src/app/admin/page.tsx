"use client";

import { useState, useEffect } from "react";
import { addUserToWhitelist, getAllUsers, deleteUser, updateUserRole } from "@/lib/actions/admin";
import { createChallengeSettings, getActiveChallengeSettings } from "@/lib/actions/challenge";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [challengeSuccess, setChallengeSuccess] = useState("");
  const [challengeError, setChallengeError] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);

  useEffect(() => {
    loadUsers();
    loadChallenge();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const result = await getAllUsers();
    if (result.error) {
      setError(result.error);
    } else {
      setUsers(result.profiles || []);
    }
    setLoading(false);
  }

  async function loadChallenge() {
    const result = await getActiveChallengeSettings();
    if (result.challenge) {
      setCurrentChallenge(result.challenge);
    }
  }

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const result = await addUserToWhitelist(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("사용자가 화이트리스트에 추가되었습니다!");
      e.currentTarget.reset();
      loadUsers();
    }
  }

  async function handleCreateChallenge(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChallengeError("");
    setChallengeSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createChallengeSettings(formData);

    if (result.error) {
      setChallengeError(result.error);
    } else {
      setChallengeSuccess("챌린지 일정이 설정되었습니다!");

      // Update current challenge immediately with returned data
      if (result.challenge) {
        setCurrentChallenge(result.challenge);
      } else {
        loadChallenge();
      }

      // Reset form after state update
      form.reset();
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const result = await deleteUser(userId);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("사용자가 삭제되었습니다.");
      loadUsers();
    }
  }

  async function handleToggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const result = await updateUserRole(userId, newRole);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("권한이 변경되었습니다.");
      loadUsers();
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0d1117]/95 backdrop-blur-sm border-b border-[#30363d] p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-[#e6edf3]">관리자 대시보드</h1>
          <span className="bg-[#2ea043] text-white text-xs font-bold px-3 py-1 rounded-full">
            Admin
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Challenge Settings */}
        <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6">
          <h2 className="text-xl font-bold text-[#e6edf3] mb-6">챌린지 일정 설정</h2>
          
          {currentChallenge && (
            <div className="mb-4 p-4 bg-[#0d1117] rounded-lg border border-[#30363d]">
              <p className="text-sm text-[#8b949e] mb-2">현재 활성 챌린지:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[#8b949e]">시작일:</span>
                  <span className="text-[#e6edf3] ml-2">{currentChallenge.start_date}</span>
                </div>
                <div>
                  <span className="text-[#8b949e]">종료일:</span>
                  <span className="text-[#e6edf3] ml-2">{currentChallenge.end_date}</span>
                </div>
                <div>
                  <span className="text-[#8b949e]">총 기간:</span>
                  <span className="text-[#e6edf3] ml-2">{currentChallenge.total_days}일</span>
                </div>
                <div>
                  <span className="text-[#8b949e]">성공 기준:</span>
                  <span className="text-[#3fb950] ml-2">{currentChallenge.required_days || 7}일 작성</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateChallenge} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#8b949e]">시작일</label>
                <input
                  type="date"
                  name="start_date"
                  required
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#8b949e]">총 기간 (일)</label>
                <input
                  type="number"
                  name="total_days"
                  placeholder="14"
                  min="1"
                  required
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#8b949e]">성공 기준 (일)</label>
                <input
                  type="number"
                  name="required_days"
                  placeholder="7"
                  min="1"
                  required
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
                />
                <p className="text-xs text-[#8b949e]">기간 내 이 일수만큼 작성하면 성공</p>
              </div>
            </div>

            {challengeError && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {challengeError}
              </div>
            )}

            {challengeSuccess && (
              <div className="p-4 bg-[#2ea043]/10 border border-[#2ea043]/50 rounded-lg text-[#2ea043] text-sm">
                {challengeSuccess}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#2ea043] hover:bg-[#2c974b] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-[#2ea043]/20 active:scale-[0.98] transition-all"
            >
              챌린지 일정 설정
            </button>
          </form>
        </div>

        {/* Registration Form */}
        <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6">
          <h2 className="text-xl font-bold text-[#e6edf3] mb-6">신규 사용자 등록 (화이트리스트 추가)</h2>
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#8b949e]">사용자 이름</label>
                <input
                  type="text"
                  name="username"
                  placeholder="예: VibeCoder"
                  required
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#8b949e]">이메일</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  required
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#8b949e]">역할</label>
              <select
                name="role"
                className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
              >
                <option value="user">일반 사용자</option>
                <option value="admin">관리자</option>
              </select>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-[#2ea043]/10 border border-[#2ea043]/50 rounded-lg text-[#2ea043] text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#2ea043] hover:bg-[#2c974b] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-[#2ea043]/20 active:scale-[0.98] transition-all"
            >
              사용자 등록
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6">
          <h2 className="text-xl font-bold text-[#e6edf3] mb-6">등록된 사용자 ({users.length}명)</h2>
          
          {loading ? (
            <div className="text-center py-12 text-[#8b949e]">로딩 중...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-[#8b949e]">등록된 사용자가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#30363d]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">이름</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">이메일</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">역할</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#8b949e]">레벨</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[#8b949e]">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[#30363d]/50 hover:bg-[#0d1117]/50 transition-colors">
                      <td className="py-3 px-4 text-[#e6edf3] font-medium">{user.username}</td>
                      <td className="py-3 px-4 text-[#8b949e] text-sm">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin" 
                            ? "bg-[#2ea043]/20 text-[#2ea043] border border-[#2ea043]/30"
                            : "bg-[#8b949e]/20 text-[#8b949e] border border-[#8b949e]/30"
                        }`}>
                          {user.role === "admin" ? "관리자" : "사용자"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#8b949e]">Lv.{user.level}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] text-sm font-medium rounded-lg transition-colors"
                          >
                            권한 변경
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-medium rounded-lg transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
