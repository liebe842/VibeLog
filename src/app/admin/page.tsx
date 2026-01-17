"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addUserToWhitelist, getAllUsers, deleteUser, updateUserRole } from "@/lib/actions/admin";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUsers();
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
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">관리자 대시보드</h1>
        <Badge variant="success">Admin</Badge>
      </div>

      {/* Registration Form */}
      <Card className="border-border-dark bg-surface-dark">
        <CardHeader>
          <CardTitle>신규 사용자 등록 (화이트리스트 추가)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">사용자 이름</label>
                <input
                  type="text"
                  name="username"
                  placeholder="예: VibeCoder"
                  required
                  className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">이메일</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  required
                  className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">역할</label>
              <select
                name="role"
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="user">일반 사용자</option>
                <option value="admin">관리자</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-primary/10 border border-primary/50 rounded-md text-primary text-sm">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full">
              사용자 등록
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User List */}
      <Card className="border-border-dark bg-surface-dark">
        <CardHeader>
          <CardTitle>등록된 사용자 ({users.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-text-secondary">로딩 중...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">등록된 사용자가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-dark">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">이름</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">이메일</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">역할</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">레벨</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border-dark/50 hover:bg-background-dark/50">
                      <td className="py-3 px-4 text-text-primary">{user.username}</td>
                      <td className="py-3 px-4 text-text-secondary text-sm">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === "admin" ? "success" : "default"}>
                          {user.role === "admin" ? "관리자" : "사용자"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">Lv.{user.level}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleRole(user.id, user.role)}
                          >
                            권한 변경
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
