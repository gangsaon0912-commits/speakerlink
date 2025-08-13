import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 진행률 계산 함수 (페이지와 동일한 로직)
const calculateProfileProgress = (profile: any, userType: string, instructorProfile?: any, companyProfile?: any) => {
  if (!profile) return { basic: 0, detailed: 0, verification: 0 }

  let basicScore = 0
  let detailedScore = 0
  let verificationScore = 0

  // 기본 정보 점수 (이메일, 이름은 항상 있음)
  basicScore += 50 // 기본 50점

  // 상세 정보 점수
  if (userType === 'instructor' && instructorProfile) {
    // 강사 상세 정보
    if (instructorProfile.bio) detailedScore += 20
    if (instructorProfile.location) detailedScore += 15
    if (instructorProfile.hourly_rate && instructorProfile.hourly_rate > 0) detailedScore += 15
    if (instructorProfile.expertise && instructorProfile.expertise.length > 0) detailedScore += 20
    if (instructorProfile.experience) detailedScore += 15
    if (instructorProfile.education) detailedScore += 15
  } else if (userType === 'company' && companyProfile) {
    // 기업 상세 정보
    if (companyProfile.company_name) detailedScore += 25
    if (companyProfile.description) detailedScore += 25
    if (companyProfile.industry) detailedScore += 25
    if (companyProfile.website) detailedScore += 25
  }

  // 검증 상태 점수
  if (profile.is_verified) {
    verificationScore = 100
  } else if (profile.verification_status === 'pending') {
    verificationScore = 50
  } else {
    verificationScore = 0
  }

  return {
    basic: Math.min(basicScore, 100),
    detailed: Math.min(detailedScore, 100),
    verification: verificationScore
  }
}

async function testCurrentUserProgress() {
  console.log('🔍 Testing current user progress calculation...')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // instructor@test.com 사용자 찾기
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
      console.log('❌ User not found')
      return
    }
    
    console.log(`📋 Testing progress for user: ${user.email} (${user.user_type})`)
    
    let instructorProfile = null
    let companyProfile = null
    
    // 사용자 타입에 따라 프로필 데이터 가져오기
    if (user.user_type === 'instructor') {
      const { data: instructor } = await supabase
        .from('instructors')
        .select('*')
        .eq('profile_id', user.id)
        .single()
      instructorProfile = instructor
      console.log('🔍 Instructor profile:', instructorProfile ? 'Found' : 'Not found')
    } else if (user.user_type === 'company') {
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('profile_id', user.id)
        .single()
      companyProfile = company
      console.log('🔍 Company profile:', companyProfile ? 'Found' : 'Not found')
    }
    
    // 진행률 계산
    const progress = calculateProfileProgress(user, user.user_type || '', instructorProfile, companyProfile)
    
    console.log('📊 Progress calculation:')
    console.log(`  - Basic Info: ${progress.basic}%`)
    console.log(`  - Detailed Info: ${progress.detailed}%`)
    console.log(`  - Verification: ${progress.verification}%`)
    
    // 상세 정보 표시
    if (user.user_type === 'instructor' && instructorProfile) {
      console.log('📝 Instructor details:')
      console.log(`  - Bio: ${instructorProfile.bio ? '✅' : '❌'}`)
      console.log(`  - Location: ${instructorProfile.location ? '✅' : '❌'}`)
      console.log(`  - Hourly Rate: ${instructorProfile.hourly_rate ? '✅' : '❌'}`)
      console.log(`  - Expertise: ${instructorProfile.expertise?.length || 0} items`)
      console.log(`  - Experience: ${instructorProfile.experience ? '✅' : '❌'}`)
      console.log(`  - Education: ${instructorProfile.education ? '✅' : '❌'}`)
      
      // 점수 계산 상세
      let detailedScore = 0
      console.log('\n🔍 Detailed score calculation:')
      if (instructorProfile.bio) {
        detailedScore += 20
        console.log(`  ✅ Bio: +20 points (${detailedScore} total)`)
      }
      if (instructorProfile.location) {
        detailedScore += 15
        console.log(`  ✅ Location: +15 points (${detailedScore} total)`)
      }
      if (instructorProfile.hourly_rate && instructorProfile.hourly_rate > 0) {
        detailedScore += 15
        console.log(`  ✅ Hourly Rate: +15 points (${detailedScore} total)`)
      }
      if (instructorProfile.expertise && instructorProfile.expertise.length > 0) {
        detailedScore += 20
        console.log(`  ✅ Expertise: +20 points (${detailedScore} total)`)
      }
      if (instructorProfile.experience) {
        detailedScore += 15
        console.log(`  ✅ Experience: +15 points (${detailedScore} total)`)
      }
      if (instructorProfile.education) {
        detailedScore += 15
        console.log(`  ✅ Education: +15 points (${detailedScore} total)`)
      }
      console.log(`\n📊 Final detailed score: ${Math.min(detailedScore, 100)}%`)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testCurrentUserProgress()
