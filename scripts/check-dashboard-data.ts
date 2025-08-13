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

async function checkDashboardData() {
  console.log('📊 Checking dashboard data...')
  
  try {
    // 1. 총 강사 수 (instructors 테이블)
    console.log('1️⃣ Counting instructors...')
    const { count: instructorCount, error: instructorError } = await supabase
      .from('instructors')
      .select('*', { count: 'exact', head: true })
    
    console.log('Instructor count:', instructorCount)
    console.log('Instructor error:', instructorError)
    
    // 2. 총 기업 수 (companies 테이블)
    console.log('2️⃣ Counting companies...')
    const { count: companyCount, error: companyError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
    
    console.log('Company count:', companyCount)
    console.log('Company error:', companyError)
    
    // 3. 총 프로필 수 (profiles 테이블)
    console.log('3️⃣ Counting profiles...')
    const { count: profileCount, error: profileError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    console.log('Profile count:', profileCount)
    console.log('Profile error:', profileError)
    
    // 4. 대기 중인 검증 요청 수 (verification_requests 테이블)
    console.log('4️⃣ Counting pending verification requests...')
    const { count: pendingVerificationCount, error: verificationError } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    
    console.log('Pending verification count:', pendingVerificationCount)
    console.log('Verification error:', verificationError)
    
    // 5. 전체 검증 요청 수
    console.log('5️⃣ Counting all verification requests...')
    const { count: totalVerificationCount, error: totalVerificationError } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
    
    console.log('Total verification count:', totalVerificationCount)
    console.log('Total verification error:', totalVerificationError)
    
    // 6. 승인된 검증 요청 수
    console.log('6️⃣ Counting approved verification requests...')
    const { count: approvedVerificationCount, error: approvedVerificationError } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
    
    console.log('Approved verification count:', approvedVerificationCount)
    console.log('Approved verification error:', approvedVerificationError)
    
    // 7. 프로필 타입별 분포
    console.log('7️⃣ Counting profiles by user type...')
    const { data: profileTypes, error: profileTypesError } = await supabase
      .from('profiles')
      .select('user_type')
    
    console.log('Profile types:', profileTypes)
    console.log('Profile types error:', profileTypesError)
    
    if (profileTypes) {
      const typeCounts = profileTypes.reduce((acc, profile) => {
        acc[profile.user_type] = (acc[profile.user_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('Profile type distribution:', typeCounts)
    }
    
    // 8. 최근 30일 데이터 (임시로 전체 데이터 사용)
    console.log('8️⃣ Recent data (last 30 days)...')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: recentInstructorCount, error: recentInstructorError } = await supabase
      .from('instructors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    const { count: recentCompanyCount, error: recentCompanyError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    console.log('Recent instructor count:', recentInstructorCount)
    console.log('Recent company count:', recentCompanyCount)
    
    // 대시보드 통계 요약
    console.log('\n📊 DASHBOARD STATISTICS SUMMARY:')
    console.log('================================')
    console.log(`총 강사 수: ${instructorCount || 0}`)
    console.log(`총 기업 수: ${companyCount || 0}`)
    console.log(`총 프로필 수: ${profileCount || 0}`)
    console.log(`대기 중인 검증 요청: ${pendingVerificationCount || 0}`)
    console.log(`전체 검증 요청: ${totalVerificationCount || 0}`)
    console.log(`승인된 검증 요청: ${approvedVerificationCount || 0}`)
    console.log(`최근 30일 강사: ${recentInstructorCount || 0}`)
    console.log(`최근 30일 기업: ${recentCompanyCount || 0}`)
    
  } catch (error) {
    console.error('Error checking dashboard data:', error)
  }
}

checkDashboardData()
