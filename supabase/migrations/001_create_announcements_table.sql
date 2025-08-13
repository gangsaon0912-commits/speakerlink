-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('general', 'important', 'update', 'maintenance')),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON public.announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON public.announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON public.announcements(author_id);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(announcement_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE public.announcements 
    SET view_count = COALESCE(view_count, 0) + 1 
    WHERE id = announcement_id
    RETURNING view_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to published announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow authenticated users to read all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow authenticated users to create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow users to update own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow users to delete own announcements" ON public.announcements;

-- Create RLS policies
-- Allow all users to read published announcements
CREATE POLICY "Allow public read access to published announcements" ON public.announcements
    FOR SELECT USING (is_published = true);

-- Allow authenticated users to read all announcements (for admin purposes)
CREATE POLICY "Allow authenticated users to read all announcements" ON public.announcements
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create announcements
CREATE POLICY "Allow authenticated users to create announcements" ON public.announcements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own announcements or system announcements (where author_id is NULL)
CREATE POLICY "Allow users to update own announcements" ON public.announcements
    FOR UPDATE USING (auth.uid() = author_id OR author_id IS NULL);

-- Allow users to delete their own announcements or system announcements (where author_id is NULL)
CREATE POLICY "Allow users to delete own announcements" ON public.announcements
    FOR DELETE USING (auth.uid() = author_id OR author_id IS NULL);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON public.announcements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (with NULL author_id for system announcements)
INSERT INTO public.announcements (title, content, category, is_pinned, is_published, author_id, author_name, view_count) VALUES
(
    'SpeakerLink 플랫폼 오픈 안내',
    '<h2>안녕하세요!</h2><p>SpeakerLink 플랫폼이 정식 오픈되었습니다.</p><p>강사와 기업을 연결하는 AI 기반 매칭 플랫폼으로, 효율적이고 안전한 거래 환경을 제공합니다.</p><br><p><strong>주요 기능:</strong></p><ul><li>AI 기반 개인화 매칭</li><li>프로필 검증 시스템</li><li>안전한 거래 환경</li><li>실시간 커뮤니케이션</li></ul>',
    'important',
    true,
    true,
    NULL,
    '관리자',
    156
),
(
    '시스템 점검 안내 (2024년 1월 15일)',
    '<p>안정적인 서비스 제공을 위해 시스템 점검을 실시합니다.</p><br><p><strong>점검 일시:</strong> 2024년 1월 15일 02:00 ~ 06:00</p><p><strong>점검 내용:</strong></p><ul><li>서버 성능 최적화</li><li>데이터베이스 백업</li><li>보안 업데이트</li></ul><p>점검 시간 동안 서비스 이용이 일시 중단될 수 있습니다.</p>',
    'maintenance',
    false,
    true,
    NULL,
    '관리자',
    89
),
(
    '프로필 검증 시스템 업데이트',
    '<p>프로필 검증 시스템이 업데이트되었습니다.</p><br><p><strong>새로운 기능:</strong></p><ul><li>자동 검증 알고리즘 개선</li><li>문서 업로드 기능 강화</li><li>검증 상태 실시간 알림</li></ul><p>더욱 정확하고 빠른 검증 서비스를 제공합니다.</p>',
    'update',
    false,
    true,
    NULL,
    '관리자',
    234
),
(
    '이용약관 개정 안내',
    '<p>SpeakerLink 이용약관이 개정되었습니다.</p><br><p><strong>주요 변경사항:</strong></p><ul><li>개인정보 보호 정책 강화</li><li>거래 안전성 규정 추가</li><li>분쟁 해결 절차 개선</li></ul><p>자세한 내용은 이용약관을 참고해 주시기 바랍니다.</p>',
    'general',
    false,
    true,
    NULL,
    '관리자',
    67
);