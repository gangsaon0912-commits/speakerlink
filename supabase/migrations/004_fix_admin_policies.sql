-- 기존 관리자 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Admin can view all instructors" ON public.instructors;
DROP POLICY IF EXISTS "Admin can update all instructors" ON public.instructors;
DROP POLICY IF EXISTS "Admin can delete all instructors" ON public.instructors;
DROP POLICY IF EXISTS "Admin can insert instructors" ON public.instructors;

-- 모든 사용자가 강사를 볼 수 있도록 정책 수정
DROP POLICY IF EXISTS "Users can view all instructors" ON public.instructors;
CREATE POLICY "Users can view all instructors" ON public.instructors
    FOR SELECT USING (true);

-- 관리자가 모든 강사 정보를 관리할 수 있도록 정책 추가
CREATE POLICY "Admin can manage all instructors" ON public.instructors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@test.com'
        )
    );

-- 일반 사용자는 자신의 프로필만 관리할 수 있도록 정책 수정
DROP POLICY IF EXISTS "Users can update own instructor profile" ON public.instructors;
CREATE POLICY "Users can update own instructor profile" ON public.instructors
    FOR UPDATE USING (
        auth.uid() = profile_id 
        AND NOT EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@test.com'
        )
    );

-- 일반 사용자는 자신의 프로필만 삽입할 수 있도록 정책 수정
DROP POLICY IF EXISTS "Users can insert own instructor profile" ON public.instructors;
CREATE POLICY "Users can insert own instructor profile" ON public.instructors
    FOR INSERT WITH CHECK (
        auth.uid() = profile_id 
        AND NOT EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@test.com'
        )
    );

-- profiles 테이블에 대해서도 동일한 정책 적용
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;

-- 관리자가 모든 프로필을 관리할 수 있도록 정책 추가
CREATE POLICY "Admin can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@test.com'
        )
    );

-- 일반 사용자는 자신의 프로필만 볼 수 있도록 정책 수정
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id 
        OR EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@test.com'
        )
    );

-- 일반 사용자는 자신의 프로필만 업데이트할 수 있도록 정책 수정
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id 
        AND NOT EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@test.com'
        )
    );

-- 일반 사용자는 자신의 프로필만 삽입할 수 있도록 정책 수정
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id 
        AND NOT EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@test.com'
        )
    );
