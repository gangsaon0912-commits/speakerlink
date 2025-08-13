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

async function testApplicationFlow() {
  try {
    console.log('🧪 지원하기 기능 플로우 테스트 시작...')
    
    // 1. 강사 데이터 확인
    const { data: instructors, error: instructorsError } = await supabase
      .from('instructors')
      .select('id, full_name, profile_id')
      .limit(1)
    
    if (instructorsError) {
      console.error('❌ 강사 데이터 조회 오류:', instructorsError)
      return
    }
    
    if (!instructors || instructors.length === 0) {
      console.log('⚠️ 강사 데이터가 없습니다.')
      return
    }
    
    const instructor = instructors[0]
    console.log(`📋 테스트 강사: ${instructor.full_name} (ID: ${instructor.id}, Profile ID: ${instructor.profile_id})`)
    
    // 2. 프로젝트 데이터 확인
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
    
    const project = projects[0]
    console.log(`📋 테스트 프로젝트: ${project.title} (ID: ${project.id})`)
    
    // 3. 기존 지원서 확인
    const { data: existingApplications, error: existingError } = await supabase
      .from('applications')
      .select('*')
      .eq('project_id', project.id)
      .eq('instructor_id', instructor.id)
    
    if (existingError) {
      console.error('❌ 기존 지원서 조회 오류:', existingError)
      return
    }
    
    if (existingApplications && existingApplications.length > 0) {
      console.log(`⚠️ 이미 ${existingApplications.length}개의 지원서가 있습니다.`)
      console.log('📋 기존 지원서:', existingApplications)
      return
    }
    
    // 4. 새로운 지원서 생성
    const applicationData = {
      project_id: project.id,
      instructor_id: instructor.id,
      proposal: '테스트 지원서입니다. 저는 이 프로젝트에 대한 충분한 경험과 전문성을 가지고 있습니다.',
      proposed_rate: 350000
    }
    
    console.log('📋 생성할 지원서 데이터:', applicationData)
    
    const { data: newApplication, error: createError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ 지원서 생성 오류:', createError)
      return
    }
    
    console.log('✅ 새로운 지원서가 성공적으로 생성되었습니다!')
    console.log('📋 생성된 지원서:', newApplication)
    
    // 5. 활동 로그 생성
    await supabase
      .from('activity_logs')
      .insert({
        type: 'application_created',
        title: '테스트 지원서 생성',
        description: `${instructor.full_name}이(가) "${project.title}"에 테스트 지원서를 제출했습니다.`,
        user_name: instructor.full_name,
        related_id: newApplication.id,
        related_type: 'application'
      })
    
    console.log('✅ 활동 로그도 생성되었습니다.')
    
    // 6. 최종 확인
    const { data: finalApplications, error: finalError } = await supabase
      .from('applications')
      .select(`
        *,
        projects (
          title
        ),
        instructors (
          full_name
        )
      `)
      .eq('project_id', project.id)
    
    if (finalError) {
      console.error('❌ 최종 확인 오류:', finalError)
      return
    }
    
    console.log(`\n🎉 테스트 완료! 프로젝트 "${project.title}"에 ${finalApplications?.length || 0}개의 지원서가 있습니다.`)
    
    if (finalApplications && finalApplications.length > 0) {
      console.log('\n📋 최종 지원서 목록:')
      finalApplications.forEach((app, index) => {
        console.log(`${index + 1}. ${app.instructors?.full_name} - ${app.proposed_rate.toLocaleString()}원 (${app.status})`)
      })
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error)
  }
}

testApplicationFlow()
