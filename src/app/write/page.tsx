"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPost } from "@/lib/actions/posts";

export default function WritePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createPost(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card className="border-border-dark bg-surface-dark">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>새 활동 기록</span>
            <Button variant="secondary" size="sm" onClick={() => router.back()}>
              취소
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                required
                rows={4}
                placeholder="오늘 무엇을 했나요? 배운 점이나 해결한 문제를 기록해보세요."
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {["Coding", "Study", "Debug"].map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 px-4 py-2 bg-background-dark border border-border-dark rounded-md cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      required
                      className="accent-primary"
                    />
                    <span className="text-text-primary">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                소요 시간 (분) <span className="text-text-secondary text-xs">- 선택</span>
              </label>
              <input
                type="number"
                name="duration_min"
                min="0"
                placeholder="예: 45"
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Link URL (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                링크 URL <span className="text-text-secondary text-xs">- 선택</span>
              </label>
              <input
                type="url"
                name="link_url"
                placeholder="https://github.com/username/repo"
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Image URL (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                이미지 URL <span className="text-text-secondary text-xs">- 선택</span>
              </label>
              <input
                type="url"
                name="image_url"
                placeholder="https://example.com/screenshot.png"
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "등록 중..." : "기록 등록"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
