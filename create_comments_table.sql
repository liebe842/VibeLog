-- ========================================
-- 댓글 시스템 (Comments Table)
-- ========================================
-- 게시물에 대한 댓글 저장 및 관리

-- 1. comments 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) ON DELETE CASCADE not null,
  user_id uuid references public.profiles(id) ON DELETE CASCADE not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at DESC);

-- 3. RLS 활성화
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. 정책: 모든 사용자가 댓글 조회 가능
CREATE POLICY "Anyone can view comments"
ON public.comments FOR SELECT
TO authenticated
USING (true);

-- 5. 정책: 로그인한 사용자만 댓글 작성 가능
CREATE POLICY "Users can insert their own comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. 정책: 본인의 댓글만 삭제 가능
CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 7. 정책: 본인의 댓글만 수정 가능
CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. posts 테이블에 comments_count 컬럼이 없다면 추가
-- (이미 있을 수도 있으므로 IF NOT EXISTS 사용)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'comments_count'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN comments_count int default 0;
  END IF;
END $$;

-- 9. 댓글 수를 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 트리거: comments 테이블 변경 시 자동으로 posts.comments_count 업데이트
DROP TRIGGER IF EXISTS update_comments_count_trigger ON public.comments;
CREATE TRIGGER update_comments_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- 11. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. updated_at 트리거
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 완료! 이제 댓글 시스템이 준비되었습니다.
