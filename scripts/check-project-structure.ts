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

async function checkProjectStructure() {
  try {
    console.log('🔍 프로젝트 테이블 구조 확인 중...')
    
    // 기존 프로젝트 데이터 확인
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    if (fetchError) {
      console.error('❌ 프로젝트 테이블 조회 오류:', fetchError)
      return
    }
    
    if (projects && projects.length > 0) {
      const project = projects[0]
      console.log('📋 프로젝트 테이블 컬럼 구조:')
      console.log(Object.keys(project))
      
      console.log('\n📋 샘플 프로젝트 데이터:')
      console.log(JSON.stringify(project, null, 2))
    } else {
      console.log('⚠️ 프로젝트 테이블에 데이터가 없습니다.')
    }
    
    // 기업 데이터도 확인
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    if (companiesError) {
      console.error('❌ 기업 테이블 조회 오류:', companiesError)
      return
    }
    
    if (companies && companies.length > 0) {
      const company = companies[0]
      console.log('\n📋 기업 테이블 컬럼 구조:')
      console.log(Object.keys(company))
      
      console.log('\n📋 샘플 기업 데이터:')
      console.log(JSON.stringify(company, null, 2))
    }
    
  } catch (error) {
    console.error('❌ 테이블 구조 확인 중 오류:', error)
  }
}

// 스크립트 실행
checkProjectStructure()
