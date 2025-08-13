import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// .env.local 파일 로드
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestAccounts() {
  console.log('테스트 계정 생성 중...')

  const testAccounts = [
    {
      email: 'instructor@test.com',
      password: 'test123456',
      fullName: '김강사',
      userType: 'instructor' as const,
      bio: '10년간의 교육 경험을 바탕으로 효과적인 학습 방법을 제공합니다.',
      expertise: ['프로그래밍', '데이터 분석', '프로젝트 관리'],
      hourlyRate: 150000,
      availability: ['월요일', '화요일', '수요일', '목요일', '금요일'],
      location: '서울시 강남구'
    },
    {
      email: 'company@test.com',
      password: 'test123456',
      fullName: '이기업',
      userType: 'company' as const,
      companyName: '테스트 기업',
      industry: 'IT/소프트웨어',
      companySize: '50-100명',
      description: '혁신적인 IT 솔루션을 제공하는 기업입니다.',
      website: 'https://test-company.com'
    },
    {
      email: 'admin@test.com',
      password: 'test123456',
      fullName: '관리자',
      userType: 'instructor' as const,
      bio: '시스템 관리자입니다.',
      expertise: ['시스템 관리', '보안'],
      hourlyRate: 200000,
      availability: ['월요일', '화요일', '수요일', '목요일', '금요일'],
      location: '서울시'
    }
  ]

  for (const account of testAccounts) {
    try {
      console.log(`\n${account.email} 계정 생성 중...`)

      // 1. 사용자 계정 생성
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true
      })

      if (authError) {
        console.error(`❌ ${account.email} 인증 계정 생성 실패:`, authError.message)
        continue
      }

      if (!authData.user) {
        console.error(`❌ ${account.email} 사용자 데이터 없음`)
        continue
      }

      // 2. 프로필 생성
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: account.email,
          full_name: account.fullName,
          user_type: account.userType,
          is_verified: true,
          verified_at: new Date().toISOString()
        })

      if (profileError) {
        console.error(`❌ ${account.email} 프로필 생성 실패:`, profileError.message)
        continue
      }

      // 3. 사용자 타입별 추가 프로필 생성
      if (account.userType === 'instructor') {
        const { error: instructorError } = await supabase
          .from('instructors')
          .insert({
            profile_id: authData.user.id,
            bio: account.bio,
            expertise: account.expertise,
            hourly_rate: account.hourlyRate,
            availability: account.availability,
            rating: 4.5,
            total_reviews: 10
          })

        if (instructorError) {
          console.error(`❌ ${account.email} 강사 프로필 생성 실패:`, instructorError.message)
        } else {
          console.log(`✅ ${account.email} 강사 계정 생성 완료`)
        }
      } else if (account.userType === 'company') {
        const { error: companyError } = await supabase
          .from('companies')
          .insert({
            profile_id: authData.user.id,
            company_name: account.companyName,
            industry: account.industry,
            company_size: account.companySize,
            description: account.description,
            website: account.website
          })

        if (companyError) {
          console.error(`❌ ${account.email} 기업 프로필 생성 실패:`, companyError.message)
        } else {
          console.log(`✅ ${account.email} 기업 계정 생성 완료`)
        }
      }

    } catch (error) {
      console.error(`❌ ${account.email} 계정 생성 중 오류:`, error)
    }
  }

  console.log('\n=== 테스트 계정 정보 ===')
  console.log('강사 계정:')
  console.log('  이메일: instructor@test.com')
  console.log('  비밀번호: test123456')
  console.log('\n기업 계정:')
  console.log('  이메일: company@test.com')
  console.log('  비밀번호: test123456')
  console.log('\n관리자 계정:')
  console.log('  이메일: admin@test.com')
  console.log('  비밀번호: test123456')
  console.log('\n모든 계정이 생성되었습니다!')
}

// 스크립트 실행
createTestAccounts().catch(console.error)
