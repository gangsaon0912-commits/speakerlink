-- RLS를 일시적으로 비활성화
ALTER TABLE public.instructors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 잠시 대기 (정책 완전 제거를 위해)
SELECT pg_sleep(1);

-- RLS 다시 활성화
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view all instructors" ON public.instructors;
DROP POLICY IF EXISTS "Admin can manage all instructors" ON public.instructors;
DROP POLICY IF EXISTS "Users can update own instructor profile" ON public.instructors;
DROP POLICY IF EXISTS "Users can insert own instructor profile" ON public.instructors;
DROP POLICY IF EXISTS "Admin can view all instructors" ON public.instructors;
DROP POLICY IF EXISTS "Admin can update all instructors" ON public.instructors;
DROP POLICY IF EXISTS "Admin can delete all instructors" ON public.instructors;
DROP POLICY IF EXISTS "Admin can insert instructors" ON public.instructors;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;

-- 새로운 간단한 정책 생성
-- 모든 사용자가 모든 강사를 볼 수 있음
CREATE POLICY "Allow all users to view instructors" ON public.instructors
    FOR SELECT USING (true);

-- 관리자는 모든 강사 정보를 관리할 수 있음
CREATE POLICY "Allow admin to manage all instructors" ON public.instructors
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'admin@test.com'
    );

-- 모든 사용자가 모든 프로필을 볼 수 있음
CREATE POLICY "Allow all users to view profiles" ON public.profiles
    FOR SELECT USING (true);

-- 관리자는 모든 프로필을 관리할 수 있음
CREATE POLICY "Allow admin to manage all profiles" ON public.profiles
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'admin@test.com'
    );

-- 일반 사용자는 자신의 프로필만 관리할 수 있음
CREATE POLICY "Allow users to manage own profile" ON public.profiles
    FOR ALL USING (
        auth.uid() = id 
        AND auth.jwt() ->> 'email' != 'admin@test.com'
    );

-- 일반 사용자는 자신의 강사 프로필만 관리할 수 있음
CREATE POLICY "Allow users to manage own instructor profile" ON public.instructors
    FOR ALL USING (
        auth.uid() = profile_id 
        AND auth.jwt() ->> 'email' != 'admin@test.com'
    );
