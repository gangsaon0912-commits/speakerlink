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

async function fixProfilesRLS() {
  console.log('🔧 Fixing profiles table RLS policies...')
  
  try {
    // 1. 기존 RLS 정책 삭제
    console.log('1️⃣ Dropping existing RLS policies...')
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can view own profile" ON profiles;',
      'DROP POLICY IF EXISTS "Users can update own profile" ON profiles;',
      'DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;',
      'DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;',
      'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;',
      'DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;',
      'DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;'
    ]
    
    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error) {
        console.log('Policy drop result:', error.message)
      } else {
        console.log('✅ Policy dropped successfully')
      }
    }
    
    // 2. 새로운 RLS 정책 생성
    console.log('2️⃣ Creating new RLS policies...')
    
    const createPolicies = [
      // 모든 사용자가 프로필을 볼 수 있음
      `CREATE POLICY "Enable read access for all users" ON profiles
       FOR SELECT USING (true);`,
      
      // 인증된 사용자가 자신의 프로필을 생성할 수 있음
      `CREATE POLICY "Enable insert for authenticated users" ON profiles
       FOR INSERT WITH CHECK (auth.uid() = id);`,
      
      // 사용자가 자신의 프로필을 업데이트할 수 있음
      `CREATE POLICY "Enable update for users based on user_id" ON profiles
       FOR UPDATE USING (auth.uid() = id);`,
      
      // 사용자가 자신의 프로필을 삭제할 수 있음
      `CREATE POLICY "Enable delete for users based on user_id" ON profiles
       FOR DELETE USING (auth.uid() = id);`
    ]
    
    for (const policy of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error) {
        console.error('❌ Policy creation error:', error.message)
      } else {
        console.log('✅ Policy created successfully')
      }
    }
    
    // 3. RLS 활성화 확인
    console.log('3️⃣ Enabling RLS on profiles table...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
    })
    
    if (rlsError) {
      console.error('❌ RLS enable error:', rlsError.message)
    } else {
      console.log('✅ RLS enabled successfully')
    }
    
    console.log('🎉 Profiles RLS policies fixed successfully!')
    
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error)
  }
}

fixProfilesRLS()
