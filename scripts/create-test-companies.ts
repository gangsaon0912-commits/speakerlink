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

async function createTestCompanies() {
  console.log('🏢 Creating test companies...')
  
  try {
    // 1. 관리자 계정 생성 (이미 존재할 수 있음)
    console.log('1️⃣ Creating admin account...')
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.signUp({
      email: 'admin@test.com',
      password: 'test123456'
    })

    if (adminAuthError && adminAuthError.message !== 'A user with this email address has already been registered') {
      console.error('❌ Admin auth error:', adminAuthError)
      return
    }

    // 2. 관리자 프로필 생성
    console.log('2️⃣ Creating admin profile...')
    const adminUserId = adminAuth?.user?.id || 'bce5cc73-7946-4477-b464-64e36f8363f1' // 기존 ID 사용
    
    const { error: adminProfileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminUserId,
        email: 'admin@test.com',
        full_name: '관리자',
        user_type: 'instructor',
        is_verified: true,
        verified_at: new Date().toISOString()
      })

    if (adminProfileError && adminProfileError.message !== 'duplicate key value violates unique constraint "profiles_pkey"') {
      console.error('❌ Admin profile error:', adminProfileError)
      return
    }

    // 3. 테스트 기업 계정들 생성
    const testCompanies = [
      {
        email: 'contact@techcorp.com',
        password: 'test123456',
        full_name: '김기업',
        company_name: '테크코프',
        industry: 'IT/소프트웨어',
        company_size: '50-100명',
        description: '혁신적인 소프트웨어 솔루션을 제공하는 IT 기업입니다.'
      },
      {
        email: 'hr@financebank.com',
        password: 'test123456',
        full_name: '이금융',
        company_name: '파이낸스뱅크',
        industry: '금융',
        company_size: '500명 이상',
        description: '고객 중심의 금융 서비스를 제공하는 은행입니다.'
      },
      {
        email: 'info@manufacturing.co.kr',
        password: 'test123456',
        full_name: '박제조',
        company_name: '매뉴팩처링',
        industry: '제조업',
        company_size: '100-500명',
        description: '고품질 제조 솔루션을 제공하는 제조업체입니다.'
      },
      {
        email: 'contact@biohealth.com',
        password: 'test123456',
        full_name: '최바이오',
        company_name: '바이오헬스',
        industry: '의료/바이오',
        company_size: '50-100명',
        description: '혁신적인 의료 기술을 개발하는 바이오 기업입니다.'
      },
      {
        email: 'info@eduplus.com',
        password: 'test123456',
        full_name: '정교육',
        company_name: '에듀플러스',
        industry: '교육',
        company_size: '10-50명',
        description: '차세대 교육 플랫폼을 제공하는 교육 기업입니다.'
      }
    ]

    console.log('3️⃣ Creating test company accounts...')
    
    for (const company of testCompanies) {
      try {
        // 기업 계정 생성
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: company.email,
          password: company.password
        })

        if (authError && authError.message !== 'A user with this email address has already been registered') {
          console.error(`❌ Auth error for ${company.email}:`, authError)
          continue
        }

        const userId = authData?.user?.id
        if (!userId) {
          console.log(`⚠️ User already exists for ${company.email}`)
          // 기존 사용자 ID 찾기
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', company.email)
            .single()
          
          if (existingUser) {
            console.log(`✅ Found existing user for ${company.email}: ${existingUser.id}`)
          } else {
            console.error(`❌ Could not find user for ${company.email}`)
            continue
          }
        }

        // 프로필 생성
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId || 'existing-user-id',
            email: company.email,
            full_name: company.full_name,
            user_type: 'company',
            is_verified: true,
            verified_at: new Date().toISOString()
          })

        if (profileError && profileError.message !== 'duplicate key value violates unique constraint "profiles_pkey"') {
          console.error(`❌ Profile error for ${company.email}:`, profileError)
          continue
        }

        // 기업 프로필 생성
        const { error: companyError } = await supabase
          .from('companies')
          .upsert({
            profile_id: userId || 'existing-user-id',
            company_name: company.company_name,
            industry: company.industry,
            company_size: company.company_size,
            description: company.description
          })

        if (companyError && companyError.message !== 'duplicate key value violates unique constraint "companies_profile_id_key"') {
          console.error(`❌ Company error for ${company.email}:`, companyError)
          continue
        }

        console.log(`✅ Created company: ${company.company_name} (${company.email})`)
      } catch (error) {
        console.error(`❌ Error creating company ${company.email}:`, error)
      }
    }

    console.log('✅ Test companies creation completed!')
    
    // 4. 생성된 기업 목록 확인
    console.log('4️⃣ Checking created companies...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select(`
        *,
        profile:profiles(id, email, full_name, is_verified)
      `)
      .order('created_at', { ascending: false })

    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError)
    } else {
      console.log('📊 Created companies:')
      companies?.forEach((company, index) => {
        console.log(`${index + 1}. ${company.company_name} (${company.profile?.email})`)
      })
    }

  } catch (error) {
    console.error('❌ Test companies creation error:', error)
  }
}

createTestCompanies()
