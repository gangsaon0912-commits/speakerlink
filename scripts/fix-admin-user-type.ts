import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminUserType() {
  console.log('🔧 Fixing admin user type...')
  
  try {
    // 1. 기존 제약조건 삭제
    console.log('1️⃣ Dropping existing constraint...')
    const { error: dropError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;' 
      })

    if (dropError) {
      console.log('⚠️ Drop constraint error (might not exist):', dropError)
    } else {
      console.log('✅ Constraint dropped successfully')
    }

    // 2. 새로운 제약조건 추가
    console.log('2️⃣ Adding new constraint with admin...')
    const { error: addError } = await supabase
      .rpc('exec_sql', { 
        sql: `ALTER TABLE public.profiles 
              ADD CONSTRAINT profiles_user_type_check 
              CHECK (user_type IN ('instructor', 'company', 'admin'));` 
      })

    if (addError) {
      console.error('❌ Error adding constraint:', addError)
      return
    }
    console.log('✅ New constraint added successfully')

    // 3. admin@test.com 사용자 업데이트
    console.log('3️⃣ Updating admin@test.com user...')
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ user_type: 'admin' })
      .eq('email', 'admin@test.com')
      .select()

    if (updateError) {
      console.error('❌ Error updating admin user:', updateError)
      return
    }

    console.log('✅ Admin user updated successfully')
    console.log('Updated profile:', data[0])
    
    // 4. 변경사항 확인
    console.log('4️⃣ Verifying changes...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@test.com')
      .single()

    if (profileError) {
      console.error('❌ Error fetching updated profile:', profileError)
      return
    }

    console.log('🔍 Final profile details:')
    console.log('Email:', profile.email)
    console.log('Full name:', profile.full_name)
    console.log('User type:', profile.user_type)
    console.log('Is verified:', profile.is_verified)
    
    console.log('🎉 Admin user type fix completed successfully!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

fixAdminUserType()
