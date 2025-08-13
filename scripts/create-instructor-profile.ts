import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createInstructorProfile() {
  console.log('🔍 Creating instructor profile...')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. instructor@test.com 사용자 찾기
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'instructor@test.com')
      .single()
    
    if (userError) {
      console.error('❌ Failed to fetch user:', userError)
      return
    }
    
    if (!user) {
      console.error('❌ User not found')
      return
    }
    
    console.log('📋 Found user:', user.email, user.id)
    
    // 2. 이미 강사 프로필이 있는지 확인
    const { data: existingProfile, error: checkError } = await supabase
      .from('instructors')
      .select('*')
      .eq('profile_id', user.id)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Failed to check existing profile:', checkError)
      return
    }
    
    if (existingProfile) {
      console.log('✅ Instructor profile already exists:')
      console.log(JSON.stringify(existingProfile, null, 2))
      return
    }
    
    // 3. 강사 프로필 생성
    const instructorData = {
      profile_id: user.id,
      bio: '안녕하세요! 저는 경험 많은 강사입니다. 다양한 분야에서 전문적인 교육을 제공합니다.',
      expertise: ['프로그래밍', '웹 개발', '데이터 분석'],
      hourly_rate: 50000,
      availability: ['월요일', '화요일', '수요일', '목요일', '금요일'],
      location: '서울시 강남구',
      experience: '5년 이상의 교육 경험을 가지고 있으며, 다양한 프로젝트를 성공적으로 완료했습니다.',
      education: '컴퓨터 공학 학사, 교육학 석사',
      certifications: ['AWS 공인 솔루션스 아키텍트', 'Google Cloud 인증'],
      languages: ['한국어', '영어']
    }
    
    const { data: newProfile, error: createError } = await supabase
      .from('instructors')
      .insert(instructorData)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Failed to create instructor profile:', createError)
      return
    }
    
    console.log('✅ Instructor profile created successfully:')
    console.log(JSON.stringify(newProfile, null, 2))
    
  } catch (error) {
    console.error('❌ Create failed:', error)
  }
}

createInstructorProfile()
