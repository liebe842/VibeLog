import { getUserProfileById, getUserActivityHeatmap, getUserPostsWithProfiles } from "@/lib/actions/profile";
import { getActiveChallengeSettings } from "@/lib/actions/challenge";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { redirect, notFound } from "next/navigation";
import { UserProfileContent } from "@/components/profile/user-profile-content";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params;

  // Check if current user is viewing their own profile
  const currentUserResult = await getCurrentUserProfile();
  if (currentUserResult.profile?.id === userId) {
    redirect("/profile");
  }

  const profileResult = await getUserProfileById(userId);

  if (profileResult.error || !profileResult.profile) {
    notFound();
  }

  const profile = profileResult.profile;
  const stats = profile.stats || { streak: 0, total_logs: 0 };

  // Get user's posts with profile info for feed display
  const postsResult = await getUserPostsWithProfiles(userId);
  const posts = postsResult.posts || [];
  const currentUserId = postsResult.currentUserId;

  // Get actual activity heatmap data
  const heatmapResult = await getUserActivityHeatmap(userId);
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
    <UserProfileContent
      profile={profile}
      stats={stats}
      posts={posts}
      streakDays={streakDays}
      currentUserId={currentUserId}
    />
  );
}
