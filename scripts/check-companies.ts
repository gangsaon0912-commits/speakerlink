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
    debug: true
  }
})

async function checkCompanies() {
  console.log('🔍 Checking existing companies...')
  
  try {
    // 1. 로그인
    console.log('1️⃣ Logging in as admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'test123456'
    })
    
    if (authError) {
      console.error('❌ Login error:', authError)
      return
    }
    
    console.log('✅ Login successful:', authData.user?.email)
    
    // 2. 기업 데이터 확인
    console.log('2️⃣ Checking companies table...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select(`
        *,
        profile:profiles(id, email, full_name, is_verified)
      `)
      .order('created_at', { ascending: false })
    
    if (companiesError) {
      console.error('❌ Companies error:', companiesError)
      return
    }
    
    console.log('📊 Existing companies:')
    if (companies && companies.length > 0) {
      companies.forEach((company, index) => {
        console.log(`${index + 1}. ${company.company_name} (${company.profile?.email})`)
        console.log(`   - Industry: ${company.industry}`)
        console.log(`   - Size: ${company.company_size}`)
        console.log(`   - Verified: ${company.profile?.is_verified}`)
      })
    } else {
      console.log('❌ No companies found')
    }
    
    // 3. 기업 타입 프로필 확인
    console.log('3️⃣ Checking company profiles...')
    const { data: companyProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'company')
      .order('created_at', { ascending: false })
    
    if (profilesError) {
      console.error('❌ Profiles error:', profilesError)
      return
    }
    
    console.log('📊 Company profiles:')
    if (companyProfiles && companyProfiles.length > 0) {
      companyProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name} (${profile.email})`)
        console.log(`   - Verified: ${profile.is_verified}`)
        console.log(`   - Created: ${profile.created_at}`)
      })
    } else {
      console.log('❌ No company profiles found')
    }
    
  } catch (error) {
    console.error('❌ Check error:', error)
  }
}

checkCompanies()
