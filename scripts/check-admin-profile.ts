import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkAdminProfile() {
  console.log('🔍 Checking admin profile...')
  
  try {
    // 1. admin@test.com 사용자 ID 찾기
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    console.log('Users error:', usersError)
    
    const adminUser = users?.find(u => u.email === 'admin@test.com')
    console.log('Admin user found:', !!adminUser, 'ID:', adminUser?.id)
    
    if (adminUser) {
      // 2. 프로필 데이터 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminUser.id)
        .single()
      
      console.log('Profile data:', profile)
      console.log('Profile error:', profileError)
      
      if (profile) {
        console.log('✅ Admin profile exists')
        console.log('Full name:', profile.full_name)
        console.log('User type:', profile.user_type)
        console.log('Email:', profile.email)
      } else {
        console.log('❌ Admin profile not found')
        
        // 프로필이 없다면 생성
        console.log('Creating admin profile...')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: adminUser.id,
            email: 'admin@test.com',
            full_name: '관리자',
            user_type: 'admin'
          })
          .select()
          .single()
        
        console.log('Create profile result:', newProfile)
        console.log('Create profile error:', createError)
      }
    }
    
  } catch (error) {
    console.error('Error checking admin profile:', error)
  }
}

checkAdminProfile()
