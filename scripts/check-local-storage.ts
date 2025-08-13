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
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

async function checkLocalStorage() {
  console.log('🔍 Checking local storage...')
  
  try {
    // 로컬 스토리지 확인 (Node.js 환경에서는 사용할 수 없음)
    if (typeof window !== 'undefined') {
      console.log('🌐 Browser environment detected')
      
      // speakerlink-auth 키 확인
      const authData = localStorage.getItem('speakerlink-auth')
      if (authData) {
        console.log('✅ speakerlink-auth found in localStorage')
        try {
          const parsed = JSON.parse(authData)
          console.log('📄 Auth data structure:', Object.keys(parsed))
          if (parsed.access_token) {
            console.log('🔑 Access token exists')
          }
        } catch (e) {
          console.log('❌ Failed to parse auth data')
        }
      } else {
        console.log('❌ speakerlink-auth not found in localStorage')
      }
    } else {
      console.log('🖥️ Node.js environment - localStorage not available')
    }
    
    // Supabase 세션 확인
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Session error:', error)
      return
    }
    
    if (session) {
      console.log('✅ Supabase session found:', session.user.email)
      console.log('📅 Expires at:', session.expires_at)
      console.log('🆔 User ID:', session.user.id)
      
      // 세션 유효성 확인
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at
      
      if (expiresAt && now < expiresAt) {
        console.log('✅ Session is valid')
      } else {
        console.log('❌ Session is expired')
      }
    } else {
      console.log('❌ No Supabase session found')
      
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
        
        // 로그인 후 세션 다시 확인
        const { data: { session: newSession } } = await supabase.auth.getSession()
        if (newSession) {
          console.log('✅ New session confirmed:', newSession.user.email)
        }
        
        // 로컬 스토리지 다시 확인
        if (typeof window !== 'undefined') {
          const newAuthData = localStorage.getItem('speakerlink-auth')
          if (newAuthData) {
            console.log('✅ speakerlink-auth updated in localStorage')
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Check error:', error)
  }
}

checkLocalStorage()
