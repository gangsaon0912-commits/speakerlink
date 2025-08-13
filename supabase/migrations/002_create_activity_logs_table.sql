-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    related_id UUID,
    related_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow all users to read activity logs
CREATE POLICY "Allow all users to read activity_logs" ON public.activity_logs
    FOR SELECT USING (true);

-- Allow authenticated users to insert activity logs
CREATE POLICY "Allow authenticated users to insert activity_logs" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow service role to do everything
CREATE POLICY "Allow service role full access to activity_logs" ON public.activity_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_activity_logs_updated_at
    BEFORE UPDATE ON public.activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data
INSERT INTO public.activity_logs (type, title, description, user_name, created_at) VALUES
('instructor_registration', '새 강사 등록', '김강사님이 강사로 등록했습니다.', '김강사', NOW() - INTERVAL '2 minutes'),
('project_matching', '프로젝트 매칭 완료', 'ABC기업과 이강사님의 매칭이 완료되었습니다.', '이강사', NOW() - INTERVAL '15 minutes'),
('project_application', '신청서 접수', '새로운 프로젝트 신청이 접수되었습니다.', '박기업', NOW() - INTERVAL '1 hour'),
('company_registration', '새 기업 등록', 'XYZ기업이 플랫폼에 가입했습니다.', 'XYZ기업', NOW() - INTERVAL '2 hours'),
('project_completion', '프로젝트 완료', '웹 개발 프로젝트가 성공적으로 완료되었습니다.', '최강사', NOW() - INTERVAL '3 hours'),
('verification_approved', '프로필 검증 승인', '김강사님의 프로필 검증이 승인되었습니다.', '김강사', NOW() - INTERVAL '4 hours'),
('announcement_published', '공지사항 발행', '새로운 공지사항이 발행되었습니다.', '관리자', NOW() - INTERVAL '5 hours'),
('instructor_profile_updated', '강사 프로필 업데이트', '이강사님이 프로필을 업데이트했습니다.', '이강사', NOW() - INTERVAL '6 hours'),
('company_profile_updated', '기업 프로필 업데이트', 'ABC기업이 프로필을 업데이트했습니다.', 'ABC기업', NOW() - INTERVAL '7 hours'),
('project_status_changed', '프로젝트 상태 변경', '웹 개발 프로젝트가 진행 중으로 변경되었습니다.', '관리자', NOW() - INTERVAL '8 hours');
