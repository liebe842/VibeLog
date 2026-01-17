import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getPosts } from "@/lib/actions/posts";

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

export default async function HomePage() {
  const result = await getPosts(20);
  const posts = result.posts || [];

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
      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-text-secondary mb-4">
              아직 등록된 활동이 없습니다.
            </p>
            <Link href="/write">
              <span className="text-primary hover:underline cursor-pointer">
                첫 번째 활동을 기록해보세요! →
              </span>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <Card key={post.id} className="hover:border-gray-500 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      size="md"
                      fallback={post.profiles?.username?.[0] || "U"}
                    />
                    <div>
                      <p className="font-semibold text-text-primary">
                        {post.profiles?.username || "Unknown"}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={categoryColors[post.category] || "default"}>
                      {post.category}
                    </Badge>
                    {post.duration_min > 0 && (
                      <span className="text-xs text-text-secondary">
                        {post.duration_min}분
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-text-primary mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post image"
                    className="rounded-md mb-4 max-w-full h-auto"
                  />
                )}

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
      )}

      {/* Floating Action Button */}
      <Link href="/write">
        <button className="fixed bottom-20 md:bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </Link>
    </div>
  );
}
