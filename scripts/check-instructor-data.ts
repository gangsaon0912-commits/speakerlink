import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkInstructorData() {
  console.log('🔍 Checking instructor data...')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. 모든 강사 사용자 확인
    const { data: instructorUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'instructor')
    
    if (usersError) {
      console.error('❌ Failed to fetch instructor users:', usersError)
      return
    }
    
    console.log(`📋 Found ${instructorUsers?.length || 0} instructor users:`)
    instructorUsers?.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`)
    })
    
    // 2. instructors 테이블의 모든 데이터 확인
    const { data: allInstructors, error: instructorsError } = await supabase
      .from('instructors')
      .select('*')
    
    if (instructorsError) {
      console.error('❌ Failed to fetch instructors:', instructorsError)
      return
    }
    
    console.log(`📝 Found ${allInstructors?.length || 0} instructor profiles:`)
    allInstructors?.forEach(instructor => {
      console.log(`  - Profile ID: ${instructor.profile_id}`)
      console.log(`    Bio: ${instructor.bio ? '✅' : '❌'}`)
      console.log(`    Location: ${instructor.location ? '✅' : '❌'}`)
      console.log(`    Hourly Rate: ${instructor.hourly_rate || '❌'}`)
      console.log(`    Expertise: ${instructor.expertise?.length || 0} items`)
      console.log(`    Experience: ${instructor.experience ? '✅' : '❌'}`)
      console.log(`    Education: ${instructor.education ? '✅' : '❌'}`)
      console.log('')
    })
    
    // 3. 특정 사용자 (instructor@test.com) 확인
    const { data: specificUser, error: specificError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'instructor@test.com')
      .single()
    
    if (specificError) {
      console.error('❌ Failed to fetch specific user:', specificError)
      return
    }
    
    if (specificUser) {
      console.log('🎯 Specific user (instructor@test.com):')
      console.log(`  - ID: ${specificUser.id}`)
      console.log(`  - User Type: ${specificUser.user_type}`)
      
      // 해당 사용자의 강사 프로필 확인
      const { data: specificInstructor, error: specificInstructorError } = await supabase
        .from('instructors')
        .select('*')
        .eq('profile_id', specificUser.id)
        .single()
      
      if (specificInstructorError) {
        console.error('❌ Failed to fetch specific instructor profile:', specificInstructorError)
      } else if (specificInstructor) {
        console.log('✅ Found instructor profile:')
        console.log(JSON.stringify(specificInstructor, null, 2))
      } else {
        console.log('❌ No instructor profile found for this user')
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkInstructorData()
