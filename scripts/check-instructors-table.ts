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

async function checkInstructorsTable() {
  try {
    console.log('🔍 Instructors 테이블 구조 확인 중...')
    
    // instructors 테이블 존재 여부 확인
    const { data: tableInfo, error: tableError } = await supabase
      .from('instructors')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Instructors 테이블 조회 오류:', tableError)
      return
    }
    
    console.log('✅ Instructors 테이블이 존재합니다.')
    
    // 기존 강사 데이터 확인
    const { data: instructors, error: fetchError } = await supabase
      .from('instructors')
      .select('*')
      .limit(5)
    
    if (fetchError) {
      console.error('❌ 강사 데이터 조회 오류:', fetchError)
      return
    }
    
    console.log(`📋 총 ${instructors?.length || 0}명의 강사가 있습니다.`)
    
    if (instructors && instructors.length > 0) {
      const instructor = instructors[0]
      console.log('\n📋 Instructors 테이블 컬럼 구조:')
      console.log(Object.keys(instructor))
      
      console.log('\n📋 샘플 강사 데이터:')
      console.log(JSON.stringify(instructor, null, 2))
      
      console.log('\n📋 강사 목록:')
      instructors.forEach((instructor, index) => {
        console.log(`${index + 1}. ${instructor.name || instructor.full_name || '이름 없음'} (ID: ${instructor.id})`)
      })
    }
    
  } catch (error) {
    console.error('❌ 테이블 확인 중 오류:', error)
  }
}

checkInstructorsTable()
