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

async function addInstructorFields() {
  try {
    console.log('🔧 instructors 테이블에 필드 추가 시작...')
    
    // 1. 현재 instructors 테이블 구조 확인
    const { data: testInstructor, error: testError } = await supabase
      .from('instructors')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ instructors 테이블 접근 오류:', testError)
      return
    }
    
    console.log('✅ instructors 테이블 접근 가능')
    console.log('📋 현재 필드들:', Object.keys(testInstructor?.[0] || {}))
    
    // 2. 필드 추가 시도
    const fieldsToAdd = [
      'location',
      'experience', 
      'education',
      'certifications',
      'languages',
      'full_name',
      'email',
      'is_verified'
    ]
    
    for (const field of fieldsToAdd) {
      try {
        // 필드 존재 여부 확인
        const { data: checkData, error: checkError } = await supabase
          .from('instructors')
          .select(field)
          .limit(1)
        
        if (checkError && checkError.message.includes('column') && checkError.message.includes('does not exist')) {
          console.log(`📋 ${field} 필드가 없습니다. 수동으로 추가해야 합니다.`)
          console.log(`📋 Supabase 대시보드에서 다음 SQL을 실행하세요:`)
          
          if (field === 'certifications' || field === 'languages') {
            console.log(`ALTER TABLE instructors ADD COLUMN ${field} TEXT[] DEFAULT '{}';`)
          } else if (field === 'is_verified') {
            console.log(`ALTER TABLE instructors ADD COLUMN ${field} BOOLEAN DEFAULT FALSE;`)
          } else {
            console.log(`ALTER TABLE instructors ADD COLUMN ${field} TEXT;`)
          }
        } else {
          console.log(`✅ ${field} 필드가 이미 존재합니다.`)
        }
      } catch (fieldError) {
        console.error(`❌ ${field} 필드 확인 오류:`, fieldError)
      }
    }
    
    // 3. 최종 확인
    const { data: finalCheck, error: finalError } = await supabase
      .from('instructors')
      .select('*')
      .limit(1)
    
    if (finalError) {
      console.error('❌ 최종 확인 오류:', finalError)
    } else {
      console.log('✅ 최종 확인 완료')
      console.log('📋 최종 필드들:', Object.keys(finalCheck?.[0] || {}))
    }
    
  } catch (error) {
    console.error('❌ 스크립트 실행 오류:', error)
  }
}

addInstructorFields()
