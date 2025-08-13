import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'speakerlink-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

async function testSession() {
  console.log('🔍 Testing session...')
  
  try {
    // 현재 세션 확인
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Session error:', error)
      return
    }
    
    if (session) {
      console.log('✅ Session found:', session.user.email)
      console.log('📅 Expires at:', session.expires_at)
      console.log('🆔 User ID:', session.user.id)
      
      // 검증 요청 데이터 테스트
      const { data: verificationRequests, error: vrError } = await supabase
        .from('verification_requests')
        .select('*')
        .order('submitted_at', { ascending: false })
      
      if (vrError) {
        console.error('❌ Verification requests error:', vrError)
      } else {
        console.log('✅ Verification requests found:', verificationRequests?.length || 0)
        verificationRequests?.forEach((req, index) => {
          console.log(`  ${index + 1}. ${req.user_type} - ${req.status}`)
        })
      }
    } else {
      console.log('❌ No session found')
      
      // 로그인 시도
      console.log('🔐 Attempting login...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'test123456'
      })
      
      if (authError) {
        console.error('❌ Login error:', authError)
      } else {
        console.log('✅ Login successful:', authData.user?.email)
        
        // 로그인 후 검증 요청 데이터 다시 테스트
        const { data: verificationRequests, error: vrError } = await supabase
          .from('verification_requests')
          .select('*')
          .order('submitted_at', { ascending: false })
        
        if (vrError) {
          console.error('❌ Verification requests error after login:', vrError)
        } else {
          console.log('✅ Verification requests found after login:', verificationRequests?.length || 0)
        }
      }
    }
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testSession()
