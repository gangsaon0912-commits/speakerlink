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

async function testCreateProject() {
  console.log('🔍 Testing project creation...')
  
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
    
    // 2. 기업 ID 가져오기
    console.log('2️⃣ Getting company ID...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, company_name')
      .limit(1)
    
    if (companiesError || !companies || companies.length === 0) {
      console.error('❌ Error getting companies:', companiesError)
      return
    }
    
    const companyId = companies[0].id
    console.log('✅ Using company:', companies[0].company_name, 'ID:', companyId)
    
    // 3. 새 프로젝트 생성
    console.log('3️⃣ Creating new project...')
    const newProject = {
      title: '테스트 프로젝트',
      description: '새 프로젝트 생성 기능을 테스트하기 위한 프로젝트입니다.',
      company_id: companyId,
      budget_range: '3000000-5000000',
      duration: '6주',
      location: '서울',
      status: 'open'
    }
    
    const { data: createdProject, error: createError } = await supabase
      .from('projects')
      .insert(newProject)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Error creating project:', createError)
      return
    }
    
    console.log('✅ Project created successfully:', createdProject)
    console.log('Project ID:', createdProject.id)
    console.log('Project title:', createdProject.title)
    
    // 4. 생성된 프로젝트 확인
    console.log('4️⃣ Verifying created project...')
    const { data: verifyProject, error: verifyError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', createdProject.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Error verifying project:', verifyError)
    } else {
      console.log('✅ Project verified:', verifyProject)
    }
    
    // 5. 전체 프로젝트 목록 확인
    console.log('5️⃣ Checking all projects...')
    const { data: allProjects, error: allProjectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (allProjectsError) {
      console.error('❌ Error fetching all projects:', allProjectsError)
    } else {
      console.log('📊 Total projects:', allProjects?.length || 0)
      allProjects?.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.title} (${project.status})`)
      })
    }
    
  } catch (error) {
    console.error('Error testing project creation:', error)
  }
}

testCreateProject()
