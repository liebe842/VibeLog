import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HeatmapGrid } from "@/components/profile/heatmap-grid";
import { getCurrentUserProfile, getUserActivityHeatmap, getUserRecentActivities } from "@/lib/actions/profile";
import { redirect } from "next/navigation";

const categoryColors: Record<string, "default" | "success" | "warning"> = {
  Coding: "success",
  Study: "default",
  Debug: "warning",
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  return date.toLocaleDateString("ko-KR");
}

export default async function ProfilePage() {
  const profileResult = await getCurrentUserProfile();

  if (profileResult.error || !profileResult.profile) {
    redirect("/login");
  }

  const profile = profileResult.profile;
  const stats = profile.stats || { streak: 0, total_logs: 0 };

  const heatmapResult = await getUserActivityHeatmap(profile.id);
  const activityByDate = heatmapResult.activityByDate || {};

  const activitiesResult = await getUserRecentActivities(profile.id, 5);
  const recentActivities = activitiesResult.posts || [];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar size="xl" fallback={profile.username[0]} />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-text-primary">
                  {profile.username}
                </h1>
                <Badge variant="default">Level {profile.level}</Badge>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-text-secondary">연속 달성</span>
                  <span className="ml-2 font-semibold text-primary">
                    {stats.streak}일 🔥
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">총 기록</span>
                  <span className="ml-2 font-semibold text-text-primary">
                    {stats.total_logs}개
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
          <HeatmapGrid activityByDate={activityByDate} />
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-center text-text-secondary py-4">
              아직 활동 기록이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-border-dark last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant={categoryColors[activity.category] || "default"}>
                      {activity.category}
                    </Badge>
                    <span className="text-sm text-text-secondary">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                  {activity.duration_min > 0 && (
                    <span className="text-sm font-medium text-text-primary">
                      {activity.duration_min}분
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
