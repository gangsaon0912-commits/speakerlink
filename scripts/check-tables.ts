import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkTables() {
  console.log('🔍 Checking existing tables...')
  
  try {
    // 1. 프로필 테이블 확인
    console.log('1️⃣ Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    console.log('Profiles table exists:', !profilesError)
    if (profilesError) {
      console.error('Profiles error:', profilesError)
    }
    
    // 2. 강사 테이블 확인
    console.log('2️⃣ Checking instructors table...')
    const { data: instructors, error: instructorsError } = await supabase
      .from('instructors')
      .select('*')
      .limit(1)
    
    console.log('Instructors table exists:', !instructorsError)
    if (instructorsError) {
      console.error('Instructors error:', instructorsError)
    }
    
    // 3. 기업 테이블 확인
    console.log('3️⃣ Checking companies table...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    console.log('Companies table exists:', !companiesError)
    if (companiesError) {
      console.error('Companies error:', companiesError)
    }
    
    // 4. 프로젝트 테이블 확인
    console.log('4️⃣ Checking projects table...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    console.log('Projects table exists:', !projectsError)
    if (projectsError) {
      console.error('Projects error:', projectsError)
    }
    
    // 5. 검증 요청 테이블 확인
    console.log('5️⃣ Checking verification_requests table...')
    const { data: verificationRequests, error: verificationError } = await supabase
      .from('verification_requests')
      .select('*')
      .limit(1)
    
    console.log('Verification requests table exists:', !verificationError)
    if (verificationError) {
      console.error('Verification requests error:', verificationError)
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error)
  }
}

checkTables()
