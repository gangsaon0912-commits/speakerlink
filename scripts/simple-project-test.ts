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

async function simpleProjectTest() {
  console.log('🔍 Simple project creation test...')
  
  try {
    // 1. 기업 ID 가져오기
    console.log('1️⃣ Getting company ID...')
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
    
    // 2. 새 프로젝트 생성 (서비스 롤 사용)
    console.log('2️⃣ Creating new project with service role...')
    const newProject = {
      title: '서비스 롤 테스트 프로젝트',
      description: '서비스 롤을 사용하여 생성한 테스트 프로젝트입니다.',
      company_id: companyId,
      budget_range: '4000000-6000000',
      duration: '10주',
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
    
    // 3. 전체 프로젝트 목록 확인
    console.log('3️⃣ Checking all projects...')
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
    console.error('Error in simple project test:', error)
  }
}

simpleProjectTest()
