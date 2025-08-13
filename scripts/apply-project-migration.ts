import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyProjectMigration() {
  try {
    console.log('🚀 Applying project migration...')
    
    // 프로젝트 테이블에 필요한 컬럼들 추가
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE projects 
        ADD COLUMN IF NOT EXISTS category VARCHAR(100),
        ADD COLUMN IF NOT EXISTS budget_range VARCHAR(255),
        ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
        ADD COLUMN IF NOT EXISTS requirements TEXT[],
        ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0;
      `
    })
    
    if (alterError) {
      console.error('❌ Alter table error:', alterError)
      return
    }
    
    console.log('✅ Columns added successfully')
    
    // 기존 데이터 업데이트
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })
    
    if (updateError) {
      console.error('❌ Update data error:', updateError)
      return
    }
    
    console.log('✅ Data updated successfully')
    
    // 최종 확인
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .limit(5)
    
    if (fetchError) {
      console.error('❌ Fetch projects error:', fetchError)
      return
    }
    
    console.log('📋 Updated projects:')
    projects?.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title}`)
      console.log(`   Category: ${project.category}`)
      console.log(`   Budget: ${project.budget_range}`)
      console.log(`   Duration: ${project.duration}`)
      console.log(`   Requirements: ${project.requirements?.join(', ') || '없음'}`)
      console.log('')
    })
    
    console.log('🎉 Project migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

// 스크립트 실행
applyProjectMigration()
