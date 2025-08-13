import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testLogin() {
  console.log('🔍 Testing admin login...')
  
  const passwords = [
    'password123',
    'admin123',
    '123456',
    'password',
    'admin',
    'test123',
    '12345678'
  ]

  for (const password of passwords) {
    try {
      console.log(`\n🔐 Trying password: ${password}`)
      
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: password
      })

      if (error) {
        console.log(`❌ Failed: ${error.message}`)
      } else {
        console.log(`✅ Success! Password is: ${password}`)
        console.log('Session token:', session?.access_token?.substring(0, 20) + '...')
        
        // 로그아웃
        await supabase.auth.signOut()
        return
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`)
    }
  }

  console.log('\n❌ No working password found')
}

testLogin()
