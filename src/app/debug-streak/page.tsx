import { createClient } from "@/lib/supabase/server";
import { recalculateCurrentUserStreak } from "@/lib/actions/profile";
import { revalidatePath } from "next/cache";

async function RecalculateButton() {
  "use server";
  async function recalculate() {
    "use server";
    await recalculateCurrentUserStreak();
    revalidatePath("/debug-streak");
  }

  return (
    <form action={recalculate}>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Streak 재계산하기
      </button>
    </form>
  );
}

export default async function DebugStreakPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">로그인이 필요합니다.</div>;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get user posts
  const { data: posts } = await supabase
    .from("posts")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Group posts by date
  const postsByDate: Record<string, number> = {};
  posts?.forEach((post) => {
    const date = new Date(post.created_at).toISOString().split("T")[0];
    postsByDate[date] = (postsByDate[date] || 0) + 1;
  });

  const dates = Object.keys(postsByDate).sort().reverse();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Streak 디버그 페이지</h1>

      <div className="bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-xl mb-2">현재 프로필 정보</h2>
        <p>User ID: {user.id}</p>
        <p>Username: {profile?.username}</p>
        <p>Current Streak: {profile?.stats?.streak || 0}</p>
        <p>Total Logs: {profile?.stats?.total_logs || 0}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-xl mb-2">게시물 현황</h2>
        <p>총 게시물 수: {posts?.length || 0}</p>
        <p>활동한 날짜 수: {dates.length}</p>
        {dates.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">날짜별 게시물:</p>
            <ul className="list-disc list-inside">
              {dates.map((date) => (
                <li key={date}>
                  {date}: {postsByDate[date]}개
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <RecalculateButton />

      <div className="mt-4 text-sm text-gray-400">
        <p>이 페이지를 사용하여 현재 streak 상태를 확인하고 재계산할 수 있습니다.</p>
      </div>
    </div>
  );
}
