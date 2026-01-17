import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  // Dummy registered users
  const users = [
    { id: "1", username: "VibeCoder", pin: "1234", role: "user", level: 12 },
    { id: "2", username: "DevJourney", pin: "5678", role: "user", level: 8 },
    { id: "3", username: "AdminUser", pin: "0000", role: "admin", level: 20 },
  ];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">관리자 대시보드</h1>
        <p className="text-sm text-text-secondary mt-1">
          사용자 등록 및 관리
        </p>
      </div>

      {/* User Registration Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>신규 사용자 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="new-username"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  사용자 이름
                </label>
                <input
                  type="text"
                  id="new-username"
                  placeholder="NewUser"
                  className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="new-pin"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  PIN (4자리)
                </label>
                <input
                  type="text"
                  id="new-pin"
                  maxLength={4}
                  placeholder="1234"
                  className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="admin-role"
                className="h-4 w-4 rounded border-border-dark text-primary focus:ring-primary"
              />
              <label htmlFor="admin-role" className="text-sm text-text-primary">
                관리자 권한 부여
              </label>
            </div>

            <Button type="submit" fullWidth>
              사용자 등록
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Registered Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>등록된 사용자 ({users.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    사용자 이름
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    PIN
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    권한
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    레벨
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border-dark last:border-0 hover:bg-surface-dark/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {user.username}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary font-mono">
                      {user.pin}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={user.role === "admin" ? "warning" : "secondary"}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {user.level}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        수정
                      </Button>
                      <Button variant="danger" size="sm" className="ml-2">
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
