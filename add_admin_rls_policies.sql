-- ========================================
-- RLS 정책 추가: 관리자 권한
-- ========================================
-- 이 스크립트는 관리자가 profiles 테이블에 사용자를 추가할 수 있도록 합니다.
-- Supabase Dashboard > SQL Editor에서 실행하세요.

-- 1. 관리자가 profiles 테이블에 INSERT 할 수 있도록 허용
CREATE POLICY "Admin can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. 관리자가 모든 profiles를 UPDATE 할 수 있도록 허용 (권한 변경 등)
CREATE POLICY "Admin can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. 관리자가 profiles를 DELETE 할 수 있도록 허용
CREATE POLICY "Admin can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. 사용자가 자신의 알림을 UPDATE 할 수 있도록 허용 (읽음 처리)
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 완료! 이제 관리자는 사용자를 등록/수정/삭제할 수 있습니다.
