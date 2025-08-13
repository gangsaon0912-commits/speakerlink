import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function manualAdminFix() {
  console.log('🔧 Manual admin fix...')
  
  try {
    // 1. 현재 admin@test.com 사용자 확인
    console.log('1️⃣ Checking current admin user...')
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@test.com')
      .single()

    if (userError) {
      console.error('❌ Error fetching admin user:', userError)
      return
    }

    console.log('Current admin user:', currentUser)

    // 2. 임시로 user_type을 company로 변경 (제약조건 우회)
    console.log('2️⃣ Temporarily changing user_type to company...')
    const { data: tempUpdate, error: tempError } = await supabase
      .from('profiles')
      .update({ user_type: 'company' })
      .eq('email', 'admin@test.com')
      .select()

    if (tempError) {
      console.error('❌ Error with temporary update:', tempError)
      return
    }

    console.log('✅ Temporary update successful:', tempUpdate[0])

    // 3. 제약조건을 우회하여 admin으로 직접 업데이트
    console.log('3️⃣ Attempting direct admin update...')
    
    // PostgreSQL의 제약조건을 우회하는 방법 시도
    const { data: directUpdate, error: directError } = await supabase
      .from('profiles')
      .update({ 
        user_type: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'admin@test.com')
      .select()

    if (directError) {
      console.error('❌ Direct update failed:', directError)
      console.log('💡 Manual SQL needed. Please run in Supabase SQL editor:')
      console.log(`
        -- 1. Drop the constraint
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
        
        -- 2. Add new constraint with admin
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check CHECK (user_type IN ('instructor', 'company', 'admin'));
        
        -- 3. Update admin user
        UPDATE public.profiles SET user_type = 'admin' WHERE email = 'admin@test.com';
      `)
      return
    }

    console.log('✅ Direct update successful:', directUpdate[0])

    // 4. 최종 확인
    console.log('4️⃣ Final verification...')
    const { data: finalUser, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@test.com')
      .single()

    if (finalError) {
      console.error('❌ Error in final verification:', finalError)
      return
    }

    console.log('🔍 Final admin user details:')
    console.log('Email:', finalUser.email)
    console.log('Full name:', finalUser.full_name)
    console.log('User type:', finalUser.user_type)
    console.log('Is verified:', finalUser.is_verified)
    
    if (finalUser.user_type === 'admin') {
      console.log('🎉 Admin user type fix completed successfully!')
    } else {
      console.log('⚠️ User type is still:', finalUser.user_type)
      console.log('💡 Manual SQL intervention required')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

manualAdminFix()
