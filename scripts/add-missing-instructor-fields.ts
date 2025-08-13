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

async function addMissingInstructorFields() {
  try {
    console.log('🔧 누락된 instructor 필드 추가 시작...')
    
    // 1. 현재 instructors 테이블 구조 확인
    const { data: currentFields, error: checkError } = await supabase
      .from('instructors')
      .select('*')
      .limit(1)
    
    if (checkError) {
      console.error('❌ instructors 테이블 접근 오류:', checkError)
      return
    }
    
    console.log('✅ instructors 테이블 접근 가능')
    console.log('📋 현재 필드들:', Object.keys(currentFields?.[0] || {}))
    
    // 2. 누락된 필드들
    const missingFields = [
      { name: 'experience', type: 'TEXT' },
      { name: 'education', type: 'TEXT' },
      { name: 'certifications', type: 'TEXT[] DEFAULT \'{}\'' },
      { name: 'languages', type: 'TEXT[] DEFAULT \'{}\'' }
    ]
    
    // 3. 각 필드 추가 시도
    for (const field of missingFields) {
      try {
        console.log(`📋 ${field.name} 필드 추가 시도...`)
        
        // RPC를 통해 SQL 실행 시도
        const { error: rpcError } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE instructors ADD COLUMN IF NOT EXISTS ${field.name} ${field.type};`
        })
        
        if (rpcError) {
          console.log(`⚠️ RPC로 ${field.name} 필드 추가 실패, 수동 추가 필요`)
          console.log(`📋 Supabase 대시보드에서 다음 SQL을 실행하세요:`)
          console.log(`ALTER TABLE instructors ADD COLUMN ${field.name} ${field.type};`)
        } else {
          console.log(`✅ ${field.name} 필드 추가 성공`)
        }
        
      } catch (fieldError) {
        console.error(`❌ ${field.name} 필드 추가 오류:`, fieldError)
        console.log(`📋 Supabase 대시보드에서 다음 SQL을 실행하세요:`)
        console.log(`ALTER TABLE instructors ADD COLUMN ${field.name} ${field.type};`)
      }
    }
    
    // 4. 최종 확인
    console.log('\n🔍 최종 확인...')
    const { data: finalCheck, error: finalError } = await supabase
      .from('instructors')
      .select('*')
      .limit(1)
    
    if (finalError) {
      console.error('❌ 최종 확인 오류:', finalError)
    } else {
      console.log('✅ 최종 확인 완료')
      console.log('📋 최종 필드들:', Object.keys(finalCheck?.[0] || {}))
      
      // 누락된 필드 확인
      const finalFields = Object.keys(finalCheck?.[0] || {})
      const requiredFields = ['experience', 'education', 'certifications', 'languages']
      
      const stillMissing = requiredFields.filter(field => !finalFields.includes(field))
      
      if (stillMissing.length > 0) {
        console.log('\n⚠️ 여전히 누락된 필드들:')
        stillMissing.forEach(field => {
          console.log(`❌ ${field}`)
        })
        console.log('\n📋 Supabase 대시보드에서 다음 SQL들을 실행하세요:')
        stillMissing.forEach(field => {
          if (field === 'certifications' || field === 'languages') {
            console.log(`ALTER TABLE instructors ADD COLUMN ${field} TEXT[] DEFAULT '{}';`)
          } else {
            console.log(`ALTER TABLE instructors ADD COLUMN ${field} TEXT;`)
          }
        })
      } else {
        console.log('\n✅ 모든 필드가 성공적으로 추가되었습니다!')
      }
    }
    
  } catch (error) {
    console.error('❌ 스크립트 실행 오류:', error)
  }
}

addMissingInstructorFields()
