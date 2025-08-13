import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 웹 애플리케이션과 동일한 설정으로 Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'speakerlink-auth',
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

async function testWebLogin() {
  console.log('🌐 Testing web login simulation...')
  
  try {
    // 1. 초기 세션 확인
    console.log('1️⃣ Checking initial session...')
    const { data: { session: initialSession }, error: initialError } = await supabase.auth.getSession()
    
    if (initialError) {
      console.error('❌ Initial session error:', initialError)
      return
    }
    
    if (initialSession) {
      console.log('✅ Initial session found:', initialSession.user.email)
      return
    }
    
    console.log('❌ No initial session found')
    
    // 2. 로그인 시도
    console.log('2️⃣ Attempting login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'test123456'
    })
    
    if (authError) {
      console.error('❌ Login error:', authError)
      return
    }
    
    if (!authData.user || !authData.session) {
      console.error('❌ Login failed: no user or session data')
      return
    }
    
    console.log('✅ Login successful:', authData.user.email)
    console.log('📄 Session data:', {
      access_token: !!authData.session.access_token,
      refresh_token: !!authData.session.refresh_token,
      expires_at: authData.session.expires_at
    })
    
    // 3. 로그인 후 세션 확인
    console.log('3️⃣ Checking session after login...')
    const { data: { session: postLoginSession }, error: postLoginError } = await supabase.auth.getSession()
    
    if (postLoginError) {
      console.error('❌ Post-login session error:', postLoginError)
      return
    }
    
    if (postLoginSession) {
      console.log('✅ Post-login session confirmed:', postLoginSession.user.email)
    } else {
      console.error('❌ Post-login session not found')
    }
    
    // 4. 프로필 데이터 확인
    console.log('4️⃣ Checking profile data...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Profile error:', profileError)
    } else {
      console.log('✅ Profile found:', profile.full_name)
    }
    
    // 5. 인증 상태 변경 리스너 테스트
    console.log('5️⃣ Testing auth state change listener...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email)
      }
    )
    
    // 6. 잠시 대기 후 세션 재확인
    console.log('6️⃣ Waiting and rechecking session...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const { data: { session: finalSession } } = await supabase.auth.getSession()
    if (finalSession) {
      console.log('✅ Final session check successful:', finalSession.user.email)
    } else {
      console.error('❌ Final session check failed')
    }
    
    // 리스너 정리
    subscription.unsubscribe()
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testWebLogin()
