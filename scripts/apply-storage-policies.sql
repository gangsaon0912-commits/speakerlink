-- Supabase Storage RLS Policies for documents bucket
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 관리자(admin@test.com)는 모든 파일 읽기 가능
CREATE POLICY "Admin can read all files" ON storage.objects
FOR SELECT 
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'admin@test.com'
  AND bucket_id = 'documents'
);

-- 2. 사용자는 자신의 파일만 읽기 가능
CREATE POLICY "Users can read own files" ON storage.objects
FOR SELECT 
TO authenticated
USING (
  auth.uid()::text = (storage.foldername(name))[1]
  AND bucket_id = 'documents'
);

-- 3. 인증된 사용자는 자신의 폴더에 파일 업로드 가능
CREATE POLICY "Users can upload to own folder" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
  AND bucket_id = 'documents'
);

-- 4. 사용자는 자신의 파일만 삭제 가능
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  auth.uid()::text = (storage.foldername(name))[1]
  AND bucket_id = 'documents'
);

-- 5. 관리자는 모든 파일 삭제 가능
CREATE POLICY "Admin can delete all files" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'admin@test.com'
  AND bucket_id = 'documents'
);

-- 6. 사용자는 자신의 파일만 업데이트 가능
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  auth.uid()::text = (storage.foldername(name))[1]
  AND bucket_id = 'documents'
)
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
  AND bucket_id = 'documents'
);

-- 7. 관리자는 모든 파일 업데이트 가능
CREATE POLICY "Admin can update all files" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'admin@test.com'
  AND bucket_id = 'documents'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'admin@test.com'
  AND bucket_id = 'documents'
);
