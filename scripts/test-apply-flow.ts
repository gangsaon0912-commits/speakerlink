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

async function testApplyFlow() {
  try {
    console.log('🧪 지원하기 기능 테스트 시작...')
    
    // 1. 테스트 사용자 로그인
    console.log('\n1️⃣ 테스트 사용자 로그인...')
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'instructor@test.com',
      password: 'test123456'
    })
    
    if (loginError) {
      console.error('❌ 로그인 실패:', loginError)
      return
    }
    
    console.log('✅ 로그인 성공:', user?.email)
    console.log('🆔 User ID:', user?.id)
    
    // 2. 강사 프로필 확인
    console.log('\n2️⃣ 강사 프로필 확인...')
    const { data: instructorProfile, error: profileError } = await supabase
      .from('instructors')
      .select('*')
      .eq('profile_id', user?.id)
      .single()
    
    if (profileError) {
      console.error('❌ 강사 프로필 조회 실패:', profileError)
      return
    }
    
    console.log('✅ 강사 프로필 확인:', instructorProfile?.full_name)
    console.log('🆔 Instructor ID:', instructorProfile?.id)
    
    // 3. 프로젝트 목록 확인
    console.log('\n3️⃣ 프로젝트 목록 확인...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    if (projectsError) {
      console.error('❌ 프로젝트 목록 조회 실패:', projectsError)
      return
    }
    
    if (!projects || projects.length === 0) {
      console.error('❌ 프로젝트가 없습니다.')
      return
    }
    
    const testProject = projects[0]
    console.log('✅ 테스트 프로젝트:', testProject.title)
    console.log('🆔 Project ID:', testProject.id)
    
    // 4. 기존 지원서 확인
    console.log('\n4️⃣ 기존 지원서 확인...')
    const { data: existingApplications, error: existingError } = await supabase
      .from('applications')
      .select('*')
      .eq('project_id', testProject.id)
      .eq('instructor_id', instructorProfile.id)
    
    if (existingError) {
      console.error('❌ 기존 지원서 조회 실패:', existingError)
      return
    }
    
    console.log('📋 기존 지원서 수:', existingApplications?.length || 0)
    
    // 5. 새 지원서 생성
    console.log('\n5️⃣ 새 지원서 생성...')
    const testApplication = {
      project_id: testProject.id,
      instructor_id: instructorProfile.id,
      proposal: '테스트 지원서입니다. 이 프로젝트에 관심이 많습니다.',
      proposed_rate: 50000,
      status: 'pending'
    }
    
    console.log('📋 지원서 데이터:', testApplication)
    
    const { data: newApplication, error: insertError } = await supabase
      .from('applications')
      .insert(testApplication)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ 지원서 생성 실패:', insertError)
      return
    }
    
    console.log('✅ 지원서 생성 성공!')
    console.log('🆔 Application ID:', newApplication?.id)
    
    // 6. 생성된 지원서 확인
    console.log('\n6️⃣ 생성된 지원서 확인...')
    const { data: createdApplication, error: fetchError } = await supabase
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
      .eq('id', newApplication.id)
      .single()
    
    if (fetchError) {
      console.error('❌ 생성된 지원서 조회 실패:', fetchError)
      return
    }
    
    console.log('✅ 생성된 지원서:')
    console.log('  - ID:', createdApplication?.id)
    console.log('  - 프로젝트:', createdApplication?.projects?.title)
    console.log('  - 강사:', createdApplication?.instructors?.full_name)
    console.log('  - 제안서:', createdApplication?.proposal)
    console.log('  - 제안 금액:', createdApplication?.proposed_rate)
    console.log('  - 상태:', createdApplication?.status)
    
    // 7. 활동 로그 확인
    console.log('\n7️⃣ 활동 로그 확인...')
    const { data: activityLogs, error: logsError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('related_id', newApplication.id)
      .eq('related_type', 'application')
    
    if (logsError) {
      console.error('❌ 활동 로그 조회 실패:', logsError)
    } else {
      console.log('✅ 활동 로그:', activityLogs?.length || 0, '개')
      activityLogs?.forEach(log => {
        console.log('  -', log.title, ':', log.description)
      })
    }
    
    console.log('\n🎉 지원하기 기능 테스트 완료!')
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error)
  }
}

testApplyFlow()
