import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// .env.local 파일 로드
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestVerificationRequests() {
  try {
    console.log('🚀 테스트 검증 요청 데이터 생성 시작...')

    // 먼저 admin 사용자 생성 (없는 경우)
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'test123456',
      email_confirm: true
    })

    if (adminError && adminError.message !== 'User already registered') {
      console.error('Admin 사용자 생성 오류:', adminError)
    } else {
      console.log('✅ Admin 사용자 준비 완료')
    }

    // admin 사용자 정보 가져오기
    const { data: { users: adminUsers } } = await supabase.auth.admin.listUsers()
    const adminUserData = adminUsers.find(u => u.email === 'admin@test.com')

    if (!adminUserData) {
      console.error('❌ Admin 사용자를 찾을 수 없습니다.')
      return
    }

    // admin 프로필 생성
    const { error: adminProfileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminUserData.id,
        email: 'admin@test.com',
        full_name: '관리자',
        user_type: 'instructor',
        is_verified: true
      })

    if (adminProfileError) {
      console.error('Admin 프로필 생성 오류:', adminProfileError)
    }

    // 테스트 사용자들 생성
    const testUsers = [
      {
        email: 'kim.instructor@email.com',
        password: 'test123456',
        full_name: '김강사',
        user_type: 'instructor' as const
      },
      {
        email: 'contact@abc.com',
        password: 'test123456',
        full_name: 'ABC기업',
        user_type: 'company' as const
      },
      {
        email: 'lee.instructor@email.com',
        password: 'test123456',
        full_name: '이강사',
        user_type: 'instructor' as const
      }
    ]

    // 테스트 사용자들 생성
    for (const testUser of testUsers) {
      const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true
      })

      if (userError && userError.message !== 'User already registered') {
        console.error(`${testUser.email} 사용자 생성 오류:`, userError)
      } else {
        console.log(`✅ ${testUser.email} 사용자 준비 완료`)
      }
    }

    // 모든 사용자 정보 가져오기
    const { data: { users } } = await supabase.auth.admin.listUsers()
    
    // 프로필 생성
    for (const testUser of testUsers) {
      const userData = users.find(u => u.email === testUser.email)
      if (userData) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userData.id,
            email: testUser.email,
            full_name: testUser.full_name,
            user_type: testUser.user_type,
            is_verified: false
          })

        if (profileError) {
          console.error(`${testUser.email} 프로필 생성 오류:`, profileError)
        }
      }
    }

    // 기존 검증 요청 데이터 삭제
    const { error: deleteError } = await supabase
      .from('verification_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 레코드 삭제

    if (deleteError) {
      console.error('기존 검증 요청 데이터 삭제 오류:', deleteError)
    } else {
      console.log('✅ 기존 검증 요청 데이터 삭제 완료')
    }

    // 테스트 검증 요청 데이터
    const testVerificationRequests = [
      {
        user_id: users.find(u => u.email === 'kim.instructor@email.com')?.id,
        user_type: 'instructor' as const,
        status: 'pending' as const,
        submitted_at: '2024-01-15T10:30:00Z',
        profile_data: {
          full_name: '김강사',
          email: 'kim.instructor@email.com',
          bio: '10년간의 교육 경험을 바탕으로 효과적인 학습 방법을 제공합니다.',
          expertise: ['프로그래밍', '데이터 분석', '프로젝트 관리'],
          documents: ['자격증.pdf', '포트폴리오.pdf']
        }
      },
      {
        user_id: users.find(u => u.email === 'contact@abc.com')?.id,
        user_type: 'company' as const,
        status: 'approved' as const,
        submitted_at: '2024-01-14T14:20:00Z',
        reviewed_at: '2024-01-15T09:15:00Z',
        reviewed_by: users.find(u => u.email === 'admin@test.com')?.id,
        profile_data: {
          company_name: 'ABC기업',
          industry: 'IT/소프트웨어',
          bio: '혁신적인 IT 솔루션을 제공하는 기업입니다.',
          documents: ['사업자등록증.pdf', '회사소개서.pdf']
        }
      },
      {
        user_id: users.find(u => u.email === 'lee.instructor@email.com')?.id,
        user_type: 'instructor' as const,
        status: 'rejected' as const,
        submitted_at: '2024-01-13T16:45:00Z',
        reviewed_at: '2024-01-14T11:30:00Z',
        reviewed_by: users.find(u => u.email === 'admin@test.com')?.id,
        rejection_reason: '제출된 문서가 불완전합니다. 추가 서류를 제출해주세요.',
        profile_data: {
          full_name: '이강사',
          email: 'lee.instructor@email.com',
          bio: '웹 개발 전문가입니다.',
          expertise: ['React', 'Node.js'],
          documents: ['자격증.pdf']
        }
      }
    ]

    // 새 검증 요청 데이터 삽입
    for (const request of testVerificationRequests) {
      if (request.user_id) {
        const { data, error } = await supabase
          .from('verification_requests')
          .insert(request)
          .select()

        if (error) {
          console.error(`❌ 검증 요청 생성 실패:`, error)
        } else {
          console.log(`✅ 검증 요청 생성 완료: ${request.profile_data.full_name || request.profile_data.company_name}`)
        }
      }
    }

    console.log('🎉 테스트 검증 요청 데이터 생성 완료!')
    
    // 생성된 데이터 확인
    const { data: requests, error: selectError } = await supabase
      .from('verification_requests')
      .select('*')

    if (selectError) {
      console.error('데이터 확인 오류:', selectError)
    } else {
      console.log(`📊 총 ${requests?.length}개의 검증 요청이 생성되었습니다.`)
      requests?.forEach(request => {
        console.log(`- ${request.user_type}: ${request.status}`)
      })
    }

  } catch (error) {
    console.error('❌ 테스트 데이터 생성 중 오류 발생:', error)
  }
}

createTestVerificationRequests()
