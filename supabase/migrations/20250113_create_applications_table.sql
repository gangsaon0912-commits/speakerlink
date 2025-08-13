-- 지원서 테이블 생성
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  proposal TEXT NOT NULL,
  proposed_rate INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, instructor_id)
);

-- 지원서 테이블에 RLS 활성화
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 관리자는 모든 지원서를 볼 수 있음
CREATE POLICY "Admin can view all applications" ON applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'admin@test.com'
    )
  );

-- 강사는 자신의 지원서를 볼 수 있음
CREATE POLICY "Instructors can view own applications" ON applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM instructors 
      WHERE instructors.id = applications.instructor_id 
      AND instructors.profile_id = auth.uid()
    )
  );

-- 기업은 자신의 프로젝트에 대한 지원서를 볼 수 있음
CREATE POLICY "Companies can view applications for own projects" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      JOIN companies ON companies.id = projects.company_id
      WHERE projects.id = applications.project_id 
      AND companies.profile_id = auth.uid()
    )
  );

-- 서비스 롤은 모든 작업을 할 수 있음
CREATE POLICY "Service role can do everything" ON applications
  FOR ALL USING (auth.role() = 'service_role');

-- 업데이트 트리거 생성
CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON applications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
