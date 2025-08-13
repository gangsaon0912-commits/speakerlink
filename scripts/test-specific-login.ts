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

async function testSpecificLogin() {
  try {
    console.log('🧪 특정 계정 로그인 테스트 시작...')
    
    // 1. 특정 계정으로 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'instructor@test.com',
      password: 'test123456'
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
    
    // 2. 사용자 프로필 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ 프로필 조회 오류:', profileError)
      return
    }
    
    console.log('✅ 프로필 로드:', profile)
    
    // 3. 강사 프로필 확인
    const { data: instructorProfile, error: instructorError } = await supabase
      .from('instructors')
      .select('*')
      .eq('profile_id', authData.user.id)
      .single()
    
    if (instructorError) {
      console.error('❌ 강사 프로필 조회 오류:', instructorError)
      console.log('⚠️ 이 계정은 강사 프로필이 없을 수 있습니다.')
      return
    }
    
    console.log('✅ 강사 프로필 로드:', instructorProfile.full_name)
    console.log('📋 강사 ID:', instructorProfile.id)
    
    // 4. 프로젝트 확인
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, status')
      .eq('status', 'open')
      .limit(3)
    
    if (projectsError) {
      console.error('❌ 프로젝트 조회 오류:', projectsError)
      return
    }
    
    console.log('📋 지원 가능한 프로젝트:')
    projects?.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title} (ID: ${project.id})`)
    })
    
    // 5. 기존 지원서 확인
    if (instructorProfile) {
      const { data: existingApplications, error: existingError } = await supabase
        .from('applications')
        .select(`
          *,
          projects (
            title
          )
        `)
        .eq('instructor_id', instructorProfile.id)
      
      if (existingError) {
        console.error('❌ 기존 지원서 조회 오류:', existingError)
        return
      }
      
      console.log(`📋 기존 지원서: ${existingApplications?.length || 0}개`)
      if (existingApplications && existingApplications.length > 0) {
        existingApplications.forEach((app, index) => {
          console.log(`${index + 1}. ${app.projects?.title} - ${app.proposed_rate.toLocaleString()}원 (${app.status})`)
        })
      }
    }
    
    // 6. 로그아웃
    await supabase.auth.signOut()
    console.log('✅ 로그아웃 완료')
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error)
  }
}

testSpecificLogin()
