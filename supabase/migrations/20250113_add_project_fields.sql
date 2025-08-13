-- 프로젝트 테이블에 필요한 컬럼들 추가
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS budget_range VARCHAR(255),
ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS requirements TEXT[],
ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0;

-- 기존 데이터 업데이트
UPDATE projects 
SET 
  category = CASE 
    WHEN title LIKE '%웹%' OR title LIKE '%개발%' THEN '개발'
    WHEN title LIKE '%AI%' OR title LIKE '%머신%' THEN '개발'
    WHEN title LIKE '%모바일%' OR title LIKE '%앱%' THEN '개발'
    ELSE '기타'
  END,
  budget_range = CASE 
    WHEN budget_min IS NOT NULL AND budget_max IS NOT NULL 
    THEN budget_min::text || '만원 - ' || budget_max::text || '만원'
    ELSE '협의'
  END,
  duration = CASE 
    WHEN duration_weeks IS NOT NULL 
    THEN duration_weeks::text || '주'
    ELSE '협의'
  END,
  requirements = COALESCE(skills_required, ARRAY[]::text[]);

-- 기존 컬럼들 제거 (선택사항)
-- ALTER TABLE projects 
-- DROP COLUMN IF EXISTS budget_min,
-- DROP COLUMN IF EXISTS budget_max,
-- DROP COLUMN IF EXISTS duration_weeks,
-- DROP COLUMN IF EXISTS skills_required;
