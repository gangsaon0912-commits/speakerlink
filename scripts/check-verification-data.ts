import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkVerificationData() {
  console.log('🔍 검증 요청 데이터 확인 중...')
  
  try {
    // 1. verification_requests 테이블 확인
    console.log('\n📋 verification_requests 테이블:')
    const { data: verificationRequests, error: vrError } = await supabase
      .from('verification_requests')
      .select('*')
    
    if (vrError) {
      console.error('❌ verification_requests 조회 오류:', vrError)
    } else {
      console.log(`✅ 검증 요청 개수: ${verificationRequests?.length || 0}`)
      verificationRequests?.forEach((req, index) => {
        console.log(`  ${index + 1}. ID: ${req.id}`)
        console.log(`     User ID: ${req.user_id}`)
        console.log(`     User Type: ${req.user_type}`)
        console.log(`     Status: ${req.status}`)
        console.log(`     Submitted: ${req.submitted_at}`)
        console.log(`     Reviewed: ${req.reviewed_at}`)
        console.log(`     Reviewed By: ${req.reviewed_by}`)
        console.log(`     Rejection Reason: ${req.rejection_reason || 'N/A'}`)
        console.log('')
      })
    }

    // 2. profiles 테이블 확인
    console.log('\n👥 profiles 테이블:')
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('*')
    
    if (pError) {
      console.error('❌ profiles 조회 오류:', pError)
    } else {
      console.log(`✅ 프로필 개수: ${profiles?.length || 0}`)
      profiles?.forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile.id}`)
        console.log(`     User ID: ${profile.user_id}`)
        console.log(`     Full Name: ${profile.full_name}`)
        console.log(`     Email: ${profile.email}`)
        console.log(`     User Type: ${profile.user_type}`)
        console.log('')
      })
    }

    // 3. auth.users 테이블 확인
    console.log('\n🔐 auth.users 테이블:')
    const { data: users, error: uError } = await supabase.auth.admin.listUsers()
    
    if (uError) {
      console.error('❌ auth.users 조회 오류:', uError)
    } else {
      console.log(`✅ 사용자 개수: ${users?.users?.length || 0}`)
      users?.users?.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}`)
        console.log(`     Email: ${user.email}`)
        console.log(`     Created: ${user.created_at}`)
        console.log('')
      })
    }

    // 4. JOIN 쿼리로 전체 데이터 확인
    console.log('\n🔗 JOIN 쿼리 결과:')
    const { data: joinedData, error: jError } = await supabase
      .from('verification_requests')
      .select(`
        *,
        user_profile:profiles!verification_requests_user_id_fkey(
          id,
          full_name,
          email,
          user_type
        )
      `)
      .order('submitted_at', { ascending: false })
    
    if (jError) {
      console.error('❌ JOIN 쿼리 오류:', jError)
    } else {
      console.log(`✅ JOIN 결과 개수: ${joinedData?.length || 0}`)
      joinedData?.forEach((item, index) => {
        console.log(`  ${index + 1}. Verification ID: ${item.id}`)
        console.log(`     User ID: ${item.user_id}`)
        console.log(`     Status: ${item.status}`)
        console.log(`     Profile: ${item.user_profile ? `${item.user_profile.full_name} (${item.user_profile.email})` : 'No profile found'}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ 전체 오류:', error)
  }
}

checkVerificationData()
