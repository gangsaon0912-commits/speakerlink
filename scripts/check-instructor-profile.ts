import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkInstructorProfile() {
  console.log('🔍 Checking instructor profile data...')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. 강사 사용자 찾기
    const { data: instructorUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'instructor')
      .limit(1)
    
    if (userError) {
      console.error('❌ Failed to fetch instructor user:', userError)
      return
    }
    
    if (!instructorUser || instructorUser.length === 0) {
      console.log('❌ No instructor user found')
      return
    }
    
    const user = instructorUser[0]
    console.log('📋 Instructor user:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type,
      is_verified: user.is_verified
    })
    
    // 2. 강사 프로필 데이터 가져오기
    const { data: instructorProfile, error: profileError } = await supabase
      .from('instructors')
      .select('*')
      .eq('profile_id', user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Failed to fetch instructor profile:', profileError)
      return
    }
    
    console.log('📝 Instructor profile data:')
    console.log(JSON.stringify(instructorProfile, null, 2))
    
    // 3. 진행률 계산 테스트
    let detailedScore = 0
    console.log('\n🔍 Progress calculation:')
    
    if (instructorProfile.bio) {
      detailedScore += 20
      console.log('✅ Bio: +20 points')
    } else {
      console.log('❌ Bio: missing')
    }
    
    if (instructorProfile.location) {
      detailedScore += 15
      console.log('✅ Location: +15 points')
    } else {
      console.log('❌ Location: missing')
    }
    
    if (instructorProfile.hourly_rate && instructorProfile.hourly_rate > 0) {
      detailedScore += 15
      console.log('✅ Hourly Rate: +15 points')
    } else {
      console.log('❌ Hourly Rate: missing or 0')
    }
    
    if (instructorProfile.expertise && instructorProfile.expertise.length > 0) {
      detailedScore += 20
      console.log('✅ Expertise: +20 points')
    } else {
      console.log('❌ Expertise: missing or empty')
    }
    
    if (instructorProfile.experience) {
      detailedScore += 15
      console.log('✅ Experience: +15 points')
    } else {
      console.log('❌ Experience: missing')
    }
    
    if (instructorProfile.education) {
      detailedScore += 15
      console.log('✅ Education: +15 points')
    } else {
      console.log('❌ Education: missing')
    }
    
    console.log(`\n📊 Total detailed score: ${detailedScore}%`)
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkInstructorProfile()
