import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Dummy data
const dummyPosts = [
  {
    id: "1",
    user: { username: "VibeCoder", avatar: "" },
    content: "오늘은 Next.js App Router를 공부했어요! 정말 강력한 기능들이 많네요 🚀",
    category: "Study",
    duration_min: 120,
    likes: 12,
    comments_count: 3,
    created_at: "2시간 전",
  },
  {
    id: "2",
    user: { username: "DevJourney", avatar: "" },
    content: "드디어 회원가입 기능을 완성했습니다! Supabase Auth 정말 편하네요.",
    category: "Coding",
    duration_min: 180,
    link_url: "https://github.com/example/repo",
    likes: 24,
    comments_count: 7,
    created_at: "5시간 전",
  },
  {
    id: "3",
    user: { username: "CodeMaster", avatar: "" },
    content: "버그 잡는데 3시간 걸렸지만 결국 해결! 콘솔 로그의 중요성을 다시 깨달았습니다 😅",
    category: "Debug",
    duration_min: 180,
    likes: 18,
    comments_count: 5,
    created_at: "1일 전",
  },
];

const categoryColors: Record<string, "default" | "success" | "warning"> = {
  Coding: "success",
  Study: "default",
  Debug: "warning",
};

export default function HomePage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">커뮤니티 피드</h1>
        <p className="text-sm text-text-secondary mt-1">
          개발자들의 오늘 바이브를 확인하세요
        </p>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {dummyPosts.map((post) => (
          <Card key={post.id} className="hover:border-gray-500 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar size="md" fallback={post.user.username[0]} />
                  <div>
                    <p className="font-semibold text-text-primary">
                      {post.user.username}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {post.created_at}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={categoryColors[post.category]}>
                    {post.category}
                  </Badge>
                  <span className="text-xs text-text-secondary">
                    {post.duration_min}분
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-text-primary mb-4">{post.content}</p>

              {post.link_url && (
                <a
                  href={post.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-link-blue hover:underline mb-4"
                >
                  <span className="material-symbols-outlined text-base mr-1">
                    link
                  </span>
                  결과물 보러가기
                </a>
              )}

              <div className="flex items-center space-x-4 text-text-secondary">
                <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">
                    favorite_border
                  </span>
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">
                    chat_bubble_outline
                  </span>
                  <span className="text-sm">{post.comments_count}</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-20 md:bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center">
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
}
