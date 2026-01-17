"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { loginWithGoogle } from "@/lib/actions/auth";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-20 relative min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2">VibeLog</h1>
          <p className="text-text-secondary">개발자의 코딩 바이브를 기록하세요</p>
        </div>

        <Card className="border-border-dark bg-surface-dark/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">로그인</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-text-secondary mb-4">
              구글 계정으로 간편하게 시작하세요.<br/>
              (승인된 사용자만 접속 가능합니다)
            </div>
            
            <Button 
              className="w-full h-12 text-base font-medium flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 border border-gray-300 transition-colors"
              onClick={handleGoogleLogin}
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
                className="w-5 h-5"
              />
              Google로 계속하기
            </Button>
          </CardContent>
          <CardFooter className="justify-center border-t border-border-dark pt-6 mt-2">
            <p className="text-xs text-text-secondary">
              문의: 관리자에게 이메일 등록을 요청하세요
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
