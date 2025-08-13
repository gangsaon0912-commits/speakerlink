-- 기업 테이블에 대한 RLS 정책 추가

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Admin can view all companies" ON companies;
DROP POLICY IF EXISTS "Admin can update all companies" ON companies;
DROP POLICY IF EXISTS "Admin can delete all companies" ON companies;
DROP POLICY IF EXISTS "Users can view own company profile" ON companies;
DROP POLICY IF EXISTS "Users can update own company profile" ON companies;
DROP POLICY IF EXISTS "Users can insert own company profile" ON companies;
DROP POLICY IF EXISTS "Service role can do everything" ON companies;

-- 새로운 RLS 정책 생성

-- 관리자가 모든 기업을 볼 수 있음
CREATE POLICY "Admin can view all companies" ON companies
FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@test.com');

-- 관리자가 모든 기업을 수정할 수 있음
CREATE POLICY "Admin can update all companies" ON companies
FOR UPDATE USING (auth.jwt() ->> 'email' = 'admin@test.com');

-- 관리자가 모든 기업을 삭제할 수 있음
CREATE POLICY "Admin can delete all companies" ON companies
FOR DELETE USING (auth.jwt() ->> 'email' = 'admin@test.com');

-- 사용자가 자신의 기업 프로필을 볼 수 있음
CREATE POLICY "Users can view own company profile" ON companies
FOR SELECT USING (
  auth.uid() = profile_id AND 
  auth.jwt() ->> 'email' != 'admin@test.com'
);

-- 사용자가 자신의 기업 프로필을 수정할 수 있음
CREATE POLICY "Users can update own company profile" ON companies
FOR UPDATE USING (
  auth.uid() = profile_id AND 
  auth.jwt() ->> 'email' != 'admin@test.com'
);

-- 사용자가 자신의 기업 프로필을 생성할 수 있음
CREATE POLICY "Users can insert own company profile" ON companies
FOR INSERT WITH CHECK (
  auth.uid() = profile_id AND 
  auth.jwt() ->> 'email' != 'admin@test.com'
);

-- 서비스 역할이 모든 작업을 할 수 있음
CREATE POLICY "Service role can do everything" ON companies
FOR ALL USING (auth.role() = 'service_role');
