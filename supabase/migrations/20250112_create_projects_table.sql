-- 프로젝트 테이블 생성
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  budget_min INTEGER,
  budget_max INTEGER,
  duration_weeks INTEGER,
  skills_required TEXT[],
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로젝트 테이블에 RLS 활성화
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 관리자는 모든 프로젝트를 볼 수 있음
CREATE POLICY "Admin can view all projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'admin@test.com'
    )
  );

-- 기업은 자신의 프로젝트를 볼 수 있음
CREATE POLICY "Companies can view own projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = projects.company_id 
      AND companies.profile_id = auth.uid()
    )
  );

-- 강사는 모든 프로젝트를 볼 수 있음 (매칭을 위해)
CREATE POLICY "Instructors can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'instructor'
    )
  );

-- 서비스 롤은 모든 작업을 할 수 있음
CREATE POLICY "Service role can do everything" ON projects
  FOR ALL USING (auth.role() = 'service_role');

-- 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 샘플 프로젝트 데이터 삽입
INSERT INTO projects (title, description, company_id, status, budget_min, budget_max, duration_weeks, skills_required, location) VALUES
('웹 개발 프로젝트', 'React와 Node.js를 사용한 웹 애플리케이션 개발', (SELECT id FROM companies LIMIT 1), 'open', 5000000, 8000000, 8, ARRAY['React', 'Node.js', 'TypeScript'], '서울'),
('모바일 앱 개발', 'Flutter를 사용한 크로스 플랫폼 모바일 앱 개발', (SELECT id FROM companies LIMIT 1), 'in_progress', 3000000, 5000000, 6, ARRAY['Flutter', 'Dart', 'Firebase'], '부산'),
('AI 모델 개발', '머신러닝 모델 개발 및 최적화', (SELECT id FROM companies LIMIT 1), 'completed', 10000000, 15000000, 12, ARRAY['Python', 'TensorFlow', 'PyTorch'], '대구');
