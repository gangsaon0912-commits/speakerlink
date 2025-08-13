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

async function fixProjectRLS() {
  console.log('🔧 Fixing project RLS policies...')
  
  try {
    // 1. 기존 정책 삭제
    console.log('1️⃣ Dropping existing policies...')
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Admin can view all projects" ON projects;',
      'DROP POLICY IF EXISTS "Companies can view own projects" ON projects;',
      'DROP POLICY IF EXISTS "Instructors can view all projects" ON projects;',
      'DROP POLICY IF EXISTS "Service role can do everything" ON projects;'
    ]
    
    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error) {
        console.log('Policy drop error (expected):', error.message)
      }
    }
    
    // 2. 새로운 정책 생성
    console.log('2️⃣ Creating new policies...')
    const newPolicies = [
      `CREATE POLICY "Enable all access for admin" ON projects
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.email = 'admin@test.com'
          )
        );`,
      
      `CREATE POLICY "Enable read access for authenticated users" ON projects
        FOR SELECT USING (auth.role() = 'authenticated');`,
      
      `CREATE POLICY "Enable insert for authenticated users" ON projects
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');`,
      
      `CREATE POLICY "Enable update for admin" ON projects
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.email = 'admin@test.com'
          )
        );`,
      
      `CREATE POLICY "Enable delete for admin" ON projects
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.email = 'admin@test.com'
          )
        );`
    ]
    
    for (const policy of newPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error) {
        console.error('Policy creation error:', error)
      } else {
        console.log('✅ Policy created successfully')
      }
    }
    
    console.log('🎉 RLS policies updated successfully!')
    
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error)
  }
}

fixProjectRLS()
