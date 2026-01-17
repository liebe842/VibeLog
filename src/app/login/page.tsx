import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="container max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-primary">Vibe</span>
          <span className="text-text-primary">Log</span>
        </h1>
        <p className="text-text-secondary">
          개발자를 위한 코딩 챌린지 플랫폼
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                사용자 이름
              </label>
              <input
                type="text"
                id="username"
                placeholder="VibeCoder"
                className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="pin"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                PIN (4자리)
              </label>
              <input
                type="password"
                id="pin"
                maxLength={4}
                placeholder="****"
                className="w-full px-4 py-2 bg-background-dark border border-border-dark rounded-md text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
              />
            </div>

            <Button type="submit" fullWidth size="lg" className="mt-6">
              로그인
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-text-secondary mt-6">
        계정이 없으신가요?{" "}
        <a href="/admin" className="text-primary hover:underline">
          관리자에게 문의하세요
        </a>
      </p>
    </div>
  );
}
