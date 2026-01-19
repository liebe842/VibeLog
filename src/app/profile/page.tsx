import { getCurrentUserProfile, getUserActivityHeatmap, getUserRecentActivities } from "@/lib/actions/profile";
import { getActiveChallengeSettings } from "@/lib/actions/challenge";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/profile/profile-content";

export default async function ProfilePage() {
  const profileResult = await getCurrentUserProfile();

  if (profileResult.error || !profileResult.profile) {
    redirect("/login");
  }

  const profile = profileResult.profile;
  const stats = profile.stats || { streak: 0, total_logs: 0 };

  const activitiesResult = await getUserRecentActivities(profile.id, 5);
  const recentActivities = activitiesResult.posts || [];

  // Get actual activity heatmap data
  const heatmapResult = await getUserActivityHeatmap(profile.id);
  const activityByDate = heatmapResult.activityByDate || {};

  // Get active challenge settings
  const challengeResult = await getActiveChallengeSettings();
  const challenge = challengeResult.challenge;

  // Generate streak grid data based on challenge period
  let streakDays;
  if (challenge) {
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Calculate total days from start to end (full challenge period)
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    streakDays = Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const isFuture = date > today;

      return {
        date,
        hasActivity: (activityByDate[dateStr] || 0) > 0,
        isToday: dateStr === todayStr,
        isFuture
      };
    });
  } else {
    // Fallback: last 14 days if no challenge
    streakDays = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      const dateStr = date.toISOString().split("T")[0];
      return {
        date,
        hasActivity: (activityByDate[dateStr] || 0) > 0,
        isToday: i === 13,
        isFuture: false
      };
    });
  }

  return (
    <ProfileContent
      profile={profile}
      stats={stats}
      recentActivities={recentActivities}
      streakDays={streakDays}
    />
  );
}
