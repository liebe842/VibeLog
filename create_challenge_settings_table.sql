-- ========================================
-- 챌린지 설정 테이블 (Challenge Settings)
-- ========================================
-- 관리자가 챌린지 기간을 설정하고 관리

-- 1. challenge_settings 테이블 생성
CREATE TABLE IF NOT EXISTS public.challenge_settings (
  id uuid default gen_random_uuid() primary key,
  start_date date not null,
  end_date date not null,
  total_days int not null,
  is_active boolean default true,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS challenge_settings_active_idx ON public.challenge_settings(is_active);

-- 3. RLS 활성화
ALTER TABLE public.challenge_settings ENABLE ROW LEVEL SECURITY;

-- 4. 정책: 모든 사용자가 활성 챌린지 조회 가능
CREATE POLICY "Anyone can view active challenge settings"
ON public.challenge_settings FOR SELECT
TO authenticated
USING (is_active = true);

-- 5. 정책: 관리자만 챌린지 설정 추가 가능
CREATE POLICY "Admin can insert challenge settings"
ON public.challenge_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. 정책: 관리자만 챌린지 설정 수정 가능
CREATE POLICY "Admin can update challenge settings"
ON public.challenge_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 7. updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_challenge_settings_updated_at ON public.challenge_settings;
CREATE TRIGGER update_challenge_settings_updated_at
  BEFORE UPDATE ON public.challenge_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. 기본 챌린지 설정 추가 (예시)
-- 관리자가 직접 설정하므로 주석 처리
-- INSERT INTO public.challenge_settings (start_date, end_date, total_days, created_by)
-- VALUES (CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 30, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1));

-- 완료! 이제 관리자가 챌린지 기간을 설정할 수 있습니다.
