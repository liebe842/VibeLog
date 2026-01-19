import { getPosts } from "@/lib/actions/posts";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { FeedList } from "@/components/feed/feed-list";

export default async function HomePage() {
  const result = await getPosts(20);
  const posts = result.posts || [];

  // Try to get user stats if logged in
  let stats;
  let currentUserId;
  try {
    const profileResult = await getCurrentUserProfile();
    if (profileResult.profile) {
      const profile = profileResult.profile;
      currentUserId = profile.id;
      stats = {
        streak: profile.stats?.streak || 0,
        total_logs: profile.stats?.total_logs || 0,
        level: profile.level || 1,
      };
    }
  } catch {
    // Not logged in, that's ok
  }

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto w-full pb-24 md:pb-8">
      <FeedList posts={posts} stats={stats} currentUserId={currentUserId} />
    </main>
  );
}
