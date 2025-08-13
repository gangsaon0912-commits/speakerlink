import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

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

// 검증 요청 조회 함수
async function getVerificationRequests(): Promise<{ data: any[] | null; error?: any }> {
  try {
    console.log('getVerificationRequests called')
    
    // 먼저 verification_requests를 가져옴
    const { data: verificationRequests, error: vrError } = await supabase
      .from('verification_requests')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (vrError) {
      console.error('getVerificationRequests error:', vrError)
      return { data: null, error: { message: vrError.message } }
    }

    // 각 verification request에 대해 profile 정보를 가져옴
    const enrichedData = await Promise.all(
      verificationRequests?.map(async (request) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, email, user_type')
          .eq('id', request.user_id)
          .single()

        return {
          ...request,
          user_profile: profileData
        }
      }) || []
    )

    console.log('getVerificationRequests success, count:', enrichedData?.length)
    return { data: enrichedData }
  } catch (error) {
    console.error('getVerificationRequests exception:', error)
    return { data: null, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 검증 요청 승인 함수
async function approveVerificationRequest(requestId: string, reviewerEmail: string): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('approveVerificationRequest called with:', { requestId, reviewerEmail })
    
    // reviewerEmail로 사용자 ID 찾기
    const { data: userData } = await supabase.auth.admin.listUsers()
    const reviewer = userData?.users?.find(user => user.email === reviewerEmail)
    
    if (!reviewer) {
      console.error('Reviewer not found:', reviewerEmail)
      return { success: false, error: { message: '리뷰어를 찾을 수 없습니다.' } }
    }
    
    const { error } = await supabase
      .from('verification_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewer.id
      })
      .eq('id', requestId)

    if (error) {
      console.error('approveVerificationRequest error:', error)
      return { success: false, error: { message: error.message } }
    }

    console.log('approveVerificationRequest success')
    return { success: true }
  } catch (error) {
    console.error('approveVerificationRequest exception:', error)
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

// 검증 요청 거부 함수
async function rejectVerificationRequest(requestId: string, reviewerEmail: string, rejectionReason: string): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('rejectVerificationRequest called with:', { requestId, reviewerEmail, rejectionReason })
    
    // reviewerEmail로 사용자 ID 찾기
    const { data: userData } = await supabase.auth.admin.listUsers()
    const reviewer = userData?.users?.find(user => user.email === reviewerEmail)
    
    if (!reviewer) {
      console.error('Reviewer not found:', reviewerEmail)
      return { success: false, error: { message: '리뷰어를 찾을 수 없습니다.' } }
    }
    
    const { error } = await supabase
      .from('verification_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewer.id,
        rejection_reason: rejectionReason
      })
      .eq('id', requestId)

    if (error) {
      console.error('rejectVerificationRequest error:', error)
      return { success: false, error: { message: error.message } }
    }

    console.log('rejectVerificationRequest success')
    return { success: true }
  } catch (error) {
    console.error('rejectVerificationRequest exception:', error)
    return { success: false, error: { message: '알 수 없는 오류가 발생했습니다.' } }
  }
}

async function testVerificationFunctions() {
  console.log('🧪 검증 요청 함수 테스트 시작...')
  
  try {
    // 1. getVerificationRequests 테스트
    console.log('\n📋 getVerificationRequests 테스트:')
    const { data: requests, error } = await getVerificationRequests()
    
    if (error) {
      console.error('❌ getVerificationRequests 오류:', error)
      return
    }
    
    console.log(`✅ 검증 요청 개수: ${requests?.length || 0}`)
    requests?.forEach((request, index) => {
      console.log(`  ${index + 1}. ID: ${request.id}`)
      console.log(`     User ID: ${request.user_id}`)
      console.log(`     Status: ${request.status}`)
      console.log(`     Profile: ${request.user_profile ? `${request.user_profile.full_name} (${request.user_profile.email})` : 'No profile found'}`)
      console.log('')
    })
    
    if (requests && requests.length > 0) {
      const firstRequest = requests[0]
      
      // 2. approveVerificationRequest 테스트 (pending 상태인 경우만)
      if (firstRequest.status === 'pending') {
        console.log('\n✅ approveVerificationRequest 테스트:')
        const approveResult = await approveVerificationRequest(firstRequest.id, 'admin@test.com')
        console.log('승인 결과:', approveResult)
      }
      
      // 3. rejectVerificationRequest 테스트 (pending 상태인 경우만)
      if (firstRequest.status === 'pending') {
        console.log('\n❌ rejectVerificationRequest 테스트:')
        const rejectResult = await rejectVerificationRequest(firstRequest.id, 'admin@test.com', '테스트 거부 사유')
        console.log('거부 결과:', rejectResult)
      }
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error)
  }
}

testVerificationFunctions()
