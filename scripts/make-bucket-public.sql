-- Supabase Storage 버킷을 Public으로 변경
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요

-- documents 버킷을 Public으로 변경
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documents';

-- 변경 결과 확인
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'documents';
