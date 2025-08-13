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

async function debugApplyWeb() {
  try {
    console.log('🔍 웹 지원하기 기능 디버깅...')
    
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
    
    // 2. 프로젝트 목록 확인
    console.log('\n2️⃣ 프로젝트 목록 확인...')
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
    
    // 3. 강사 프로필 API 테스트
    console.log('\n3️⃣ 강사 프로필 API 테스트...')
    const instructorResponse = await fetch(`http://localhost:3000/api/instructors/profile/${user?.id}`)
    console.log('📋 강사 프로필 API 응답 상태:', instructorResponse.status)
    
    if (instructorResponse.ok) {
      const instructorResult = await instructorResponse.json()
      console.log('✅ 강사 프로필 API 성공:', instructorResult)
    } else {
      const errorText = await instructorResponse.text()
      console.error('❌ 강사 프로필 API 실패:', errorText)
    }
    
    // 4. 지원서 API 테스트
    console.log('\n4️⃣ 지원서 API 테스트...')
    
    // 먼저 강사 ID 가져오기
    const { data: instructorProfile } = await supabase
      .from('instructors')
      .select('id')
      .eq('profile_id', user?.id)
      .single()
    
    if (!instructorProfile) {
      console.error('❌ 강사 프로필을 찾을 수 없습니다.')
      return
    }
    
    const testApplicationData = {
      project_id: testProject.id,
      instructor_id: instructorProfile.id,
      proposal: '웹 테스트 지원서입니다.',
      proposed_rate: '60000'
    }
    
    console.log('📋 지원서 데이터:', testApplicationData)
    
    const applicationResponse = await fetch('http://localhost:3000/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testApplicationData)
    })
    
    console.log('📋 지원서 API 응답 상태:', applicationResponse.status)
    
    if (applicationResponse.ok) {
      const applicationResult = await applicationResponse.json()
      console.log('✅ 지원서 API 성공:', applicationResult)
    } else {
      const errorText = await applicationResponse.text()
      console.error('❌ 지원서 API 실패:', errorText)
    }
    
    // 5. 지원서 목록 API 테스트
    console.log('\n5️⃣ 지원서 목록 API 테스트...')
    const applicationsResponse = await fetch(`http://localhost:3000/api/applications?project_id=${testProject.id}`)
    console.log('📋 지원서 목록 API 응답 상태:', applicationsResponse.status)
    
    if (applicationsResponse.ok) {
      const applicationsResult = await applicationsResponse.json()
      console.log('✅ 지원서 목록 API 성공:', applicationsResult)
      console.log('📋 지원서 수:', applicationsResult.data?.length || 0)
    } else {
      const errorText = await applicationsResponse.text()
      console.error('❌ 지원서 목록 API 실패:', errorText)
    }
    
    console.log('\n🎉 웹 디버깅 완료!')
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류:', error)
  }
}

debugApplyWeb()
