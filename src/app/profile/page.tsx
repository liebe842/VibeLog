import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HeatmapGrid } from "@/components/profile/heatmap-grid";

export default function ProfilePage() {
  // Dummy user data
  const user = {
    username: "VibeCoder",
    level: 12,
    stats: {
      streak: 12,
      total_logs: 82,
    },
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar size="xl" fallback={user.username[0]} />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-text-primary">
                  {user.username}
                </h1>
                <Badge variant="default">Level {user.level}</Badge>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-text-secondary">연속 달성</span>
                  <span className="ml-2 font-semibold text-primary">
                    {user.stats.streak}일 🔥
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">총 기록</span>
                  <span className="ml-2 font-semibold text-text-primary">
                    {user.stats.total_logs}개
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Heatmap Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>활동 기록 (잔디 심기)</CardTitle>
        </CardHeader>
        <CardContent>
          <HeatmapGrid />
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { category: "Coding", duration: 120, date: "오늘" },
              { category: "Study", duration: 90, date: "어제" },
              { category: "Debug", duration: 60, date: "2일 전" },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b border-border-dark last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={
                      activity.category === "Coding"
                        ? "success"
                        : activity.category === "Study"
                        ? "default"
                        : "warning"
                    }
                  >
                    {activity.category}
                  </Badge>
                  <span className="text-sm text-text-secondary">
                    {activity.date}
                  </span>
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {activity.duration}분
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
