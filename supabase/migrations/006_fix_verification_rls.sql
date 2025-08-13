-- verification_requests 테이블의 RLS 정책 수정
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can update own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can insert own verification requests" ON public.verification_requests;

-- 새로운 정책 생성
-- 관리자는 모든 검증 요청을 볼 수 있음
CREATE POLICY "Admin can view all verification requests" ON public.verification_requests
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'admin@test.com'
    );

-- 관리자는 모든 검증 요청을 업데이트할 수 있음
CREATE POLICY "Admin can update all verification requests" ON public.verification_requests
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'admin@test.com'
    );

-- 사용자는 자신의 검증 요청을 볼 수 있음
CREATE POLICY "Users can view own verification requests" ON public.verification_requests
    FOR SELECT USING (
        auth.uid() = user_id AND auth.jwt() ->> 'email' != 'admin@test.com'
    );

-- 사용자는 자신의 검증 요청을 업데이트할 수 있음
CREATE POLICY "Users can update own verification requests" ON public.verification_requests
    FOR UPDATE USING (
        auth.uid() = user_id AND auth.jwt() ->> 'email' != 'admin@test.com'
    );

-- 사용자는 자신의 검증 요청을 생성할 수 있음
CREATE POLICY "Users can insert own verification requests" ON public.verification_requests
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- 서비스 롤은 모든 작업을 할 수 있음 (백엔드 스크립트용)
CREATE POLICY "Service role can do everything" ON public.verification_requests
    FOR ALL USING (
        auth.role() = 'service_role'
    );
