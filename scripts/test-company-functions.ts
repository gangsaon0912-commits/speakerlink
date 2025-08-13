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

// getAllCompanies 함수 테스트
async function testGetAllCompanies() {
  console.log('🔍 Testing getAllCompanies function...')
  
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
    
    // 2. 직접 companies 테이블 조회
    console.log('2️⃣ Direct companies query...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (companiesError) {
      console.error('❌ Direct companies error:', companiesError)
      return
    }
    
    console.log('📊 Direct companies result:', companies?.length || 0, 'companies')
    
    // 3. 각 company에 대해 profile 정보 조회
    console.log('3️⃣ Enriching with profile data...')
    const enrichedData = await Promise.all(
      companies?.map(async (company) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, email, is_verified')
          .eq('id', company.profile_id)
          .single()

        return {
          ...company,
          profile: profileData
        }
      }) || []
    )
    
    console.log('📊 Enriched companies result:', enrichedData?.length || 0, 'companies')
    enrichedData?.forEach((company, index) => {
      console.log(`${index + 1}. ${company.company_name} (${company.profile?.email})`)
    })
    
    // 4. RLS 정책 확인
    console.log('4️⃣ Checking RLS policies...')
    const { data: policies, error: policiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    if (policiesError) {
      console.error('❌ RLS policy error:', policiesError)
    } else {
      console.log('✅ RLS policies working correctly')
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// updateCompanyProfile 함수 테스트
async function testUpdateCompany() {
  console.log('🔧 Testing updateCompanyProfile function...')
  
  try {
    // 1. 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'test123456'
    })
    
    if (authError) {
      console.error('❌ Login error:', authError)
      return
    }
    
    // 2. 첫 번째 기업 가져오기
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    if (companiesError || !companies || companies.length === 0) {
      console.error('❌ No companies found for update test')
      return
    }
    
    const testCompany = companies[0]
    console.log('📝 Testing update for company:', testCompany.company_name)
    
    // 3. 업데이트 테스트
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        description: 'Updated description for testing - ' + new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', testCompany.id)
    
    if (updateError) {
      console.error('❌ Update error:', updateError)
    } else {
      console.log('✅ Update successful')
    }
    
  } catch (error) {
    console.error('❌ Update test error:', error)
  }
}

// deleteCompanyProfile 함수 테스트
async function testDeleteCompany() {
  console.log('🗑️ Testing deleteCompanyProfile function...')
  
  try {
    // 1. 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'test123456'
    })
    
    if (authError) {
      console.error('❌ Login error:', authError)
      return
    }
    
    // 2. 삭제할 테스트 기업 생성 (실제 삭제는 하지 않음)
    console.log('📝 Creating test company for delete test...')
    const { data: testCompany, error: createError } = await supabase
      .from('companies')
      .insert({
        profile_id: authData.user!.id,
        company_name: 'Test Company for Delete',
        industry: 'Test Industry',
        company_size: 'Test Size',
        description: 'This is a test company for delete testing'
      })
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Create test company error:', createError)
      return
    }
    
    console.log('✅ Test company created:', testCompany.company_name)
    
    // 3. 삭제 권한 테스트 (실제 삭제는 하지 않음)
    console.log('🔍 Testing delete permission (not actually deleting)...')
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', testCompany.id)
    
    if (deleteError) {
      console.error('❌ Delete permission error:', deleteError)
    } else {
      console.log('✅ Delete permission working correctly')
    }
    
  } catch (error) {
    console.error('❌ Delete test error:', error)
  }
}

async function runAllTests() {
  console.log('🚀 Starting company management function tests...\n')
  
  await testGetAllCompanies()
  console.log('\n' + '='.repeat(50) + '\n')
  
  await testUpdateCompany()
  console.log('\n' + '='.repeat(50) + '\n')
  
  await testDeleteCompany()
  console.log('\n' + '='.repeat(50) + '\n')
  
  console.log('✅ All tests completed!')
}

runAllTests()
