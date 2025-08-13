import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProfilesConstraints() {
  console.log('🔍 Checking profiles table constraints...')
  
  try {
    // profiles 테이블의 제약조건 확인
    const { data, error } = await supabase
      .rpc('get_table_constraints', { table_name: 'profiles' })

    if (error) {
      console.error('❌ Error fetching constraints:', error)
      
      // 직접 SQL로 확인
      const { data: sqlData, error: sqlError } = await supabase
        .from('information_schema.check_constraints')
        .select('*')
        .eq('constraint_name', 'profiles_user_type_check')

      if (sqlError) {
        console.error('❌ Error with SQL query:', sqlError)
        return
      }

      console.log('📋 Check constraints for profiles table:')
      console.log(sqlData)
      
      // user_type 컬럼의 가능한 값들 확인
      const { data: enumData, error: enumError } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_name', 'profiles')
        .eq('column_name', 'user_type')

      if (enumError) {
        console.error('❌ Error fetching column info:', enumError)
        return
      }

      console.log('📋 user_type column info:')
      console.log(enumData)
      
    } else {
      console.log('✅ Constraints:', data)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkProfilesConstraints()
