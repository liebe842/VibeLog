import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="container max-w-md mx-auto px-4 py-20 flex flex-col items-center text-center">
      <div className="mb-6 text-yellow-500">
        <span className="material-symbols-outlined text-6xl">lock</span>
      </div>
      
      <h1 className="text-2xl font-bold text-text-primary mb-2">접근 권한이 없습니다</h1>
      <p className="text-text-secondary mb-8">
        이 서비스는 승인된 사용자만 이용할 수 있습니다.<br />
        관리자에게 이메일 등록을 요청하세요.
      </p>

      <div className="flex space-x-4">
        <Link href="/login">
          <Button variant="secondary">로그인 화면으로</Button>
        </Link>
        <Link href="/">
          <Button>홈으로 가기</Button>
        </Link>
      </div>
    </div>
  );
}
