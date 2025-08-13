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

async function checkApplicationsTable() {
  try {
    console.log('🔍 Applications 테이블 구조 확인 중...')
    
    // applications 테이블 존재 여부 확인
    const { data: tableInfo, error: tableError } = await supabase
      .from('applications')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Applications 테이블 조회 오류:', tableError)
      return
    }
    
    console.log('✅ Applications 테이블이 존재합니다.')
    
    // 기존 지원서 데이터 확인
    const { data: applications, error: fetchError } = await supabase
      .from('applications')
      .select(`
        *,
        projects (
          title
        ),
        instructors (
          full_name
        )
      `)
    
    if (fetchError) {
      console.error('❌ 지원서 데이터 조회 오류:', fetchError)
      return
    }
    
    console.log(`📋 총 ${applications?.length || 0}개의 지원서가 있습니다.`)
    
    if (applications && applications.length > 0) {
      console.log('\n📋 지원서 목록:')
      applications.forEach((app, index) => {
        console.log(`${index + 1}. ${app.projects?.title || '알 수 없음'} - ${app.instructors?.full_name || '알 수 없음'} (${app.status})`)
      })
    }
    
    // 강사 데이터 확인
    const { data: instructors, error: instructorsError } = await supabase
      .from('instructors')
      .select('id, full_name, profile_id')
      .limit(5)
    
    if (instructorsError) {
      console.error('❌ 강사 데이터 조회 오류:', instructorsError)
      return
    }
    
    console.log(`\n📋 사용 가능한 강사: ${instructors?.length || 0}명`)
    if (instructors && instructors.length > 0) {
      instructors.forEach((instructor, index) => {
        console.log(`${index + 1}. ${instructor.full_name} (ID: ${instructor.id})`)
      })
    }
    
    // 프로젝트 데이터 확인
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title')
      .limit(5)
    
    if (projectsError) {
      console.error('❌ 프로젝트 데이터 조회 오류:', projectsError)
      return
    }
    
    console.log(`\n📋 사용 가능한 프로젝트: ${projects?.length || 0}개`)
    if (projects && projects.length > 0) {
      projects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.title} (ID: ${project.id})`)
      })
    }
    
  } catch (error) {
    console.error('❌ 테이블 확인 중 오류:', error)
  }
}

checkApplicationsTable()
