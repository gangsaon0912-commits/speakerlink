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

async function addLocationToProfiles() {
  try {
    console.log('🔧 profiles 테이블에 location 컬럼 추가 시작...')
    
    // 1. 현재 profiles 테이블 구조 확인
    const { data: currentColumns, error: describeError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' })
    
    if (describeError) {
      console.log('📋 현재 컬럼 확인 (RPC 사용 불가, 직접 확인)')
    } else {
      console.log('📋 현재 profiles 컬럼:', currentColumns)
    }
    
    // 2. location 컬럼 추가
    const { error: alterError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;' 
      })
    
    if (alterError) {
      console.error('❌ location 컬럼 추가 오류:', alterError)
      
      // 대안: 직접 SQL 실행
      console.log('🔄 직접 SQL 실행 시도...')
      const { error: directError } = await supabase
        .from('profiles')
        .select('location')
        .limit(1)
      
      if (directError && directError.message.includes('column') && directError.message.includes('location')) {
        console.log('✅ location 컬럼이 아직 없습니다. 수동으로 추가해야 합니다.')
        console.log('📋 Supabase 대시보드에서 다음 SQL을 실행하세요:')
        console.log('ALTER TABLE profiles ADD COLUMN location TEXT;')
        return
      } else {
        console.log('✅ location 컬럼이 이미 존재하거나 접근 가능합니다.')
      }
    } else {
      console.log('✅ location 컬럼이 성공적으로 추가되었습니다.')
    }
    
    // 3. email_verified 컬럼도 확인
    const { error: emailVerifiedError } = await supabase
      .from('profiles')
      .select('email_verified')
      .limit(1)
    
    if (emailVerifiedError && emailVerifiedError.message.includes('column') && emailVerifiedError.message.includes('email_verified')) {
      console.log('📋 email_verified 컬럼도 추가해야 합니다.')
      console.log('📋 Supabase 대시보드에서 다음 SQL을 실행하세요:')
      console.log('ALTER TABLE profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;')
    } else {
      console.log('✅ email_verified 컬럼이 이미 존재합니다.')
    }
    
    // 4. 최종 확인
    const { data: testProfile, error: testError } = await supabase
      .from('profiles')
      .select('id, email, full_name, location, email_verified')
      .limit(1)
    
    if (testError) {
      console.error('❌ 최종 확인 오류:', testError)
    } else {
      console.log('✅ 최종 확인 성공:', testProfile)
    }
    
  } catch (error) {
    console.error('❌ 스크립트 실행 오류:', error)
  }
}

addLocationToProfiles()
