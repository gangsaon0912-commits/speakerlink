import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 클라이언트 측 Supabase 클라이언트 (웹 앱과 동일한 설정)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'speakerlink-auth',
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

async function testProjectsAccess() {
  console.log('🔍 Testing projects access...')
  
  try {
    // 1. 로그인
    console.log('1️⃣ Logging in...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'test123456'
    })
    
    if (authError) {
      console.error('❌ Login error:', authError)
      return
    }
    
    console.log('✅ Login successful:', authData.user?.email)
    console.log('🆔 User ID:', authData.user?.id)
    
    // 2. 세션 확인
    console.log('2️⃣ Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session exists:', !!session, 'Error:', sessionError)
    
    if (session?.user) {
      // 3. 프로젝트 데이터 접근 테스트
      console.log('3️⃣ Testing projects access...')
      console.log('About to query projects table...')
      
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
      
      console.log('Projects query completed')
      console.log('Projects data:', projects)
      console.log('Projects error:', projectsError)
      
      if (projects) {
        console.log('✅ Projects access successful')
        console.log('Number of projects:', projects.length)
        projects.forEach((project, index) => {
          console.log(`  ${index + 1}. ${project.title} (${project.status})`)
        })
      } else {
        console.log('❌ Projects access failed')
      }
      
      // 4. 기업 데이터 접근 테스트
      console.log('4️⃣ Testing companies access...')
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
      
      console.log('Companies data:', companies)
      console.log('Companies error:', companiesError)
      
      // 5. 강사 데이터 접근 테스트
      console.log('5️⃣ Testing instructors access...')
      const { data: instructors, error: instructorsError } = await supabase
        .from('instructors')
        .select('*')
      
      console.log('Instructors data:', instructors)
      console.log('Instructors error:', instructorsError)
    }
    
  } catch (error) {
    console.error('Error testing projects access:', error)
  }
}

testProjectsAccess()
