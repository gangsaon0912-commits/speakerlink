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

async function testLoginAndApply() {
  try {
    console.log('🧪 로그인 및 지원하기 기능 테스트 시작...')
    
    // 1. 강사 계정으로 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'kim.instructor@email.com',
      password: 'password123'
    })
    
    if (authError) {
      console.error('❌ 로그인 오류:', authError)
      return
    }
    
    if (!authData.user) {
      console.error('❌ 로그인 실패: 사용자 데이터 없음')
      return
    }
    
    console.log('✅ 로그인 성공:', authData.user.email)
    console.log('📋 사용자 ID:', authData.user.id)
    
    // 2. 강사 프로필 가져오기
    const { data: instructorProfile, error: profileError } = await supabase
      .from('instructors')
      .select('*')
      .eq('profile_id', authData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ 강사 프로필 조회 오류:', profileError)
      return
    }
    
    console.log('✅ 강사 프로필 로드:', instructorProfile.full_name)
    console.log('📋 강사 ID:', instructorProfile.id)
    
    // 3. 프로젝트 선택
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title')
      .eq('status', 'open')
      .limit(1)
    
    if (projectsError) {
      console.error('❌ 프로젝트 조회 오류:', projectsError)
      return
    }
    
    if (!projects || projects.length === 0) {
      console.log('⚠️ 지원 가능한 프로젝트가 없습니다.')
      return
    }
    
    const project = projects[0]
    console.log('📋 선택된 프로젝트:', project.title)
    console.log('📋 프로젝트 ID:', project.id)
    
    // 4. 기존 지원서 확인
    const { data: existingApplications, error: existingError } = await supabase
      .from('applications')
      .select('*')
      .eq('project_id', project.id)
      .eq('instructor_id', instructorProfile.id)
    
    if (existingError) {
      console.error('❌ 기존 지원서 조회 오류:', existingError)
      return
    }
    
    if (existingApplications && existingApplications.length > 0) {
      console.log(`⚠️ 이미 ${existingApplications.length}개의 지원서가 있습니다.`)
      console.log('📋 기존 지원서:', existingApplications)
      return
    }
    
    // 5. 새로운 지원서 생성
    const applicationData = {
      project_id: project.id,
      instructor_id: instructorProfile.id,
      proposal: '이 프로젝트에 대한 제안서입니다. 저는 5년간의 관련 경험을 가지고 있으며, 체계적이고 효율적인 방법으로 프로젝트를 진행할 수 있습니다.',
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
    
    // 6. 활동 로그 생성
    await supabase
      .from('activity_logs')
      .insert({
        type: 'application_created',
        title: '로그인 테스트 지원서 생성',
        description: `${instructorProfile.full_name}이(가) "${project.title}"에 로그인 테스트 지원서를 제출했습니다.`,
        user_name: instructorProfile.full_name,
        related_id: newApplication.id,
        related_type: 'application'
      })
    
    console.log('✅ 활동 로그도 생성되었습니다.')
    
    // 7. 최종 확인
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
    
    // 8. 로그아웃
    await supabase.auth.signOut()
    console.log('✅ 로그아웃 완료')
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error)
  }
}

testLoginAndApply()
