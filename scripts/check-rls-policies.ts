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

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies...')
  
  try {
    // 1. profiles 테이블의 RLS 정책 확인
    console.log('1️⃣ Checking profiles table RLS policies...')
    const { data: profilesPolicies, error: profilesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public')
    
    console.log('Profiles policies:', profilesPolicies)
    console.log('Profiles policies error:', profilesError)
    
    // 2. profiles 테이블의 RLS 상태 확인
    console.log('2️⃣ Checking profiles table RLS status...')
    const { data: profilesRLS, error: profilesRLSError } = await supabase
      .from('information_schema.tables')
      .select('row_security')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public')
      .single()
    
    console.log('Profiles RLS status:', profilesRLS)
    console.log('Profiles RLS error:', profilesRLSError)
    
    // 3. 현재 RLS 정책들 확인
    console.log('3️⃣ Current RLS policies for profiles:')
    if (profilesPolicies) {
      profilesPolicies.forEach((policy, index) => {
        console.log(`Policy ${index + 1}:`, {
          name: policy.policy_name,
          definition: policy.definition,
          roles: policy.roles
        })
      })
    }
    
  } catch (error) {
    console.error('Error checking RLS policies:', error)
  }
}

checkRLSPolicies()
