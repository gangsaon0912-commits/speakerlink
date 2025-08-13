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

async function createTestApplication() {
  try {
    console.log('🚀 테스트 지원서 생성 시작...')
    
    // 강사 데이터 확인
    const { data: instructors, error: instructorsError } = await supabase
      .from('instructors')
      .select('id, full_name')
      .limit(1)
    
    if (instructorsError) {
      console.error('❌ 강사 데이터 조회 오류:', instructorsError)
      return
    }
    
    if (!instructors || instructors.length === 0) {
      console.log('⚠️ 강사 데이터가 없습니다.')
      return
    }
    
    // 프로젝트 데이터 확인
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title')
      .limit(1)
    
    if (projectsError) {
      console.error('❌ 프로젝트 데이터 조회 오류:', projectsError)
      return
    }
    
    if (!projects || projects.length === 0) {
      console.log('⚠️ 프로젝트 데이터가 없습니다.')
      return
    }
    
    const instructor = instructors[0]
    const project = projects[0]
    
    console.log(`📋 선택된 강사: ${instructor.full_name} (${instructor.id})`)
    console.log(`📋 선택된 프로젝트: ${project.title} (${project.id})`)
    
    // 테스트 지원서 생성
    const applicationData = {
      project_id: project.id,
      instructor_id: instructor.id,
      proposal: '이 프로젝트에 대한 제안서입니다. 저는 5년간의 관련 경험을 가지고 있으며, 체계적이고 효율적인 방법으로 프로젝트를 진행할 수 있습니다.',
      proposed_rate: 400000
    }
    
    console.log('📋 생성할 지원서 데이터:', applicationData)
    
    const { data, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ 지원서 생성 오류:', error)
      return
    }
    
    console.log('✅ 테스트 지원서가 성공적으로 생성되었습니다!')
    console.log('📋 생성된 지원서:', data)
    
    // 활동 로그 생성
    await supabase
      .from('activity_logs')
      .insert({
        type: 'application_created',
        title: '테스트 지원서 생성',
        description: `${instructor.full_name}이(가) "${project.title}"에 테스트 지원서를 제출했습니다.`,
        user_name: instructor.full_name,
        related_id: data.id,
        related_type: 'application'
      })
    
    console.log('✅ 활동 로그도 생성되었습니다.')
    
  } catch (error) {
    console.error('❌ 테스트 지원서 생성 중 오류:', error)
  }
}

createTestApplication()
