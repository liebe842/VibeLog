-- ========================================
-- 좋아요 시스템 (Likes Table)
-- ========================================
-- 사용자별 좋아요 추적 및 중복 방지

-- 1. likes 테이블 생성
CREATE TABLE IF NOT EXISTS public.likes (
  user_id uuid references public.profiles(id) ON DELETE CASCADE not null,
  post_id uuid references public.posts(id) ON DELETE CASCADE not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  PRIMARY KEY (user_id, post_id)
);

-- 2. RLS 활성화
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 3. 정책: 모든 사용자가 likes 조회 가능
CREATE POLICY "Anyone can view likes"
ON public.likes FOR SELECT
TO authenticated
USING (true);

-- 4. 정책: 로그인한 사용자는 자신의 좋아요 추가 가능
CREATE POLICY "Users can insert their own likes"
ON public.likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. 정책: 로그인한 사용자는 자신의 좋아요 삭제 가능
CREATE POLICY "Users can delete their own likes"
ON public.likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. posts 테이블에 likes_count 컬럼 추가 (성능 최적화)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS likes_count int default 0;

-- 7. likes를 카운트하여 posts.likes_count 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 트리거: likes 테이블 변경 시 자동으로 posts.likes_count 업데이트
DROP TRIGGER IF EXISTS update_likes_count_trigger ON public.likes;
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- 9. 기존 posts.likes 데이터를 likes_count로 마이그레이션 (선택사항)
-- 기존 likes 값이 있다면 likes_count에 복사
UPDATE public.posts SET likes_count = likes WHERE likes_count = 0 AND likes > 0;

-- 완료! 이제 좋아요는 사용자당 1번만 가능하며, 토글할 수 있습니다.
