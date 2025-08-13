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

async function fixProjectTable() {
  try {
    console.log('🚀 Fixing project table structure...')
    
    // 1. 필요한 컬럼들 추가
    console.log('📝 Adding new columns...')
    
    // category 컬럼 추가
    const { error: categoryError } = await supabase
      .from('projects')
      .select('category')
      .limit(1)
    
    if (categoryError && categoryError.message.includes('column')) {
      console.log('Adding category column...')
      // 실제로는 Supabase Dashboard에서 직접 추가해야 함
    }
    
    // 2. 기존 프로젝트 데이터 확인
    const { data: existingProjects, error: fetchError } = await supabase
      .from('projects')
      .select('*')
    
    if (fetchError) {
      console.error('❌ Error fetching projects:', fetchError)
      return
    }
    
    console.log(`📋 Found ${existingProjects?.length || 0} existing projects`)
    
    // 3. 기존 프로젝트 데이터 업데이트
    if (existingProjects && existingProjects.length > 0) {
      for (const project of existingProjects) {
        const updateData: any = {}
        
        // 카테고리 설정
        if (project.title.includes('웹') || project.title.includes('개발')) {
          updateData.category = '개발'
        } else if (project.title.includes('AI') || project.title.includes('머신')) {
          updateData.category = '개발'
        } else if (project.title.includes('모바일') || project.title.includes('앱')) {
          updateData.category = '개발'
        } else {
          updateData.category = '기타'
        }
        
        // 예산 범위 설정
        if (project.budget_min && project.budget_max) {
          updateData.budget_range = `${project.budget_min}만원 - ${project.budget_max}만원`
        } else {
          updateData.budget_range = '협의'
        }
        
        // 기간 설정
        if (project.duration_weeks) {
          updateData.duration = `${project.duration_weeks}주`
        } else {
          updateData.duration = '협의'
        }
        
        // 요구사항 설정
        if (project.skills_required) {
          updateData.requirements = project.skills_required
        } else {
          updateData.requirements = []
        }
        
        // applications_count 설정
        updateData.applications_count = 0
        
        // 업데이트 실행
        const { error: updateError } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', project.id)
        
        if (updateError) {
          console.error(`❌ Error updating project ${project.title}:`, updateError)
        } else {
          console.log(`✅ Updated project: ${project.title}`)
        }
      }
    }
    
    // 4. 최종 확인
    const { data: finalProjects, error: finalError } = await supabase
      .from('projects')
      .select('*')
      .limit(3)
    
    if (finalError) {
      console.error('❌ Error fetching final projects:', finalError)
      return
    }
    
    console.log('\n📋 Final project structure:')
    finalProjects?.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title}`)
      console.log(`   Category: ${project.category || 'N/A'}`)
      console.log(`   Budget: ${project.budget_range || 'N/A'}`)
      console.log(`   Duration: ${project.duration || 'N/A'}`)
      console.log(`   Requirements: ${project.requirements?.join(', ') || 'N/A'}`)
      console.log(`   Applications: ${project.applications_count || 0}`)
      console.log('')
    })
    
    console.log('🎉 Project table structure fixed!')
    console.log('\n💡 Note: If you see "N/A" values, you may need to add the columns manually in Supabase Dashboard:')
    console.log('   - category (VARCHAR(100))')
    console.log('   - budget_range (VARCHAR(255))')
    console.log('   - duration (VARCHAR(100))')
    console.log('   - requirements (TEXT[])')
    console.log('   - applications_count (INTEGER DEFAULT 0)')
    
  } catch (error) {
    console.error('❌ Error fixing project table:', error)
  }
}

// 스크립트 실행
fixProjectTable()
