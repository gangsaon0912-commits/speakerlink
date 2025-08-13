import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetAdminPassword() {
  console.log('🔧 Resetting admin password...')
  
  try {
    // 1. admin 사용자 ID 찾기
    console.log('1️⃣ Finding admin user...')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Error listing users:', usersError)
      return
    }

    const adminUser = users.users.find(user => user.email === 'admin@test.com')
    
    if (!adminUser) {
      console.error('❌ Admin user not found')
      return
    }

    console.log('✅ Admin user found:', adminUser.id)

    // 2. 새 비밀번호로 업데이트
    console.log('2️⃣ Updating password...')
    const newPassword = 'admin123'
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return
    }

    console.log('✅ Password updated successfully')
    console.log('New password:', newPassword)

    // 3. 새 비밀번호로 로그인 테스트
    console.log('3️⃣ Testing new password...')
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: newPassword
    })

    if (loginError) {
      console.error('❌ Login test failed:', loginError)
    } else {
      console.log('✅ Login test successful')
      console.log('Session token:', session?.access_token?.substring(0, 20) + '...')
      
      // 로그아웃
      await supabase.auth.signOut()
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

resetAdminPassword()
