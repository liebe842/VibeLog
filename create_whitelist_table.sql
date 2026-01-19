-- ========================================
-- 화이트리스트 테이블 생성
-- ========================================
-- 관리자가 승인한 이메일을 저장하는 별도 테이블
-- auth.users와 독립적으로 관리

-- 1. 화이트리스트 테이블 생성
CREATE TABLE IF NOT EXISTS public.whitelist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  username text not null,
  role text default 'user' check (role in ('user', 'admin')),
  approved_by uuid references public.profiles(id), -- 승인한 관리자
  used boolean default false, -- 사용자가 로그인했는지 여부
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS 활성화
ALTER TABLE public.whitelist ENABLE ROW LEVEL SECURITY;

-- 3. 정책: 관리자만 조회 가능
CREATE POLICY "Admin can view whitelist"
ON public.whitelist FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. 정책: 관리자만 추가 가능
CREATE POLICY "Admin can insert whitelist"
ON public.whitelist FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. 정책: 관리자만 삭제 가능
CREATE POLICY "Admin can delete whitelist"
ON public.whitelist FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. 정책: 관리자만 업데이트 가능
CREATE POLICY "Admin can update whitelist"
ON public.whitelist FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 7. 로그인 시 화이트리스트 확인 및 role 설정을 위한 함수 수정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  whitelist_entry RECORD;
BEGIN
  -- 화이트리스트에서 이메일 확인
  SELECT * INTO whitelist_entry
  FROM public.whitelist
  WHERE email = new.email AND used = false
  LIMIT 1;

  IF whitelist_entry IS NULL THEN
    -- 화이트리스트에 없으면 일반 사용자로 등록
    INSERT INTO public.profiles (id, username, email, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email,
      'user'
    );
  ELSE
    -- 화이트리스트에 있으면 지정된 role로 등록
    INSERT INTO public.profiles (id, username, email, role)
    VALUES (
      new.id,
      whitelist_entry.username,
      new.email,
      whitelist_entry.role
    );
    
    -- 화이트리스트 항목을 사용됨으로 표시
    UPDATE public.whitelist
    SET used = true
    WHERE id = whitelist_entry.id;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 기존 트리거 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 완료! 이제 관리자는 whitelist 테이블에 이메일을 추가할 수 있습니다.
