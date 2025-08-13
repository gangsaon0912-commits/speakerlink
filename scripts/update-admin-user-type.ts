import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateAdminUserType() {
  console.log('🔧 Updating admin user type...')
  
  try {
    // admin@test.com 사용자의 user_type을 'admin'으로 변경
    const { data, error } = await supabase
      .from('profiles')
      .update({ user_type: 'admin' })
      .eq('email', 'admin@test.com')
      .select()

    if (error) {
      console.error('❌ Error updating admin user type:', error)
      return
    }

    console.log('✅ Admin user type updated successfully')
    console.log('Updated profile:', data[0])
    
    // 변경된 프로필 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@test.com')
      .single()

    if (profileError) {
      console.error('❌ Error fetching updated profile:', profileError)
      return
    }

    console.log('🔍 Updated profile details:')
    console.log('Email:', profile.email)
    console.log('Full name:', profile.full_name)
    console.log('User type:', profile.user_type)
    console.log('Is verified:', profile.is_verified)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

updateAdminUserType()
