import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAdminAPI() {
  console.log('🔍 Testing admin API route...')
  
  try {
    // 1. admin 사용자로 로그인하여 세션 토큰 얻기
    console.log('1️⃣ Logging in as admin...')
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'password123'
    })

    if (loginError) {
      console.error('❌ Login error:', loginError)
      return
    }

    console.log('✅ Login successful')
    console.log('Session token:', session?.access_token?.substring(0, 20) + '...')

    // 2. API 엔드포인트 테스트 (시뮬레이션)
    console.log('2️⃣ Simulating API call...')
    
    // 실제 API 호출 대신 동일한 로직을 직접 실행
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user:', user?.email)

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user?.id)
      .single()

    const isAdmin = profile?.user_type === 'admin' || user?.email === 'admin@test.com'
    console.log('Is admin:', isAdmin)

    if (!isAdmin) {
      console.error('❌ Not admin user')
      return
    }

    // 3. 문서 목록 조회
    console.log('3️⃣ Fetching documents...')
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (docsError) {
      console.error('❌ Documents fetch error:', docsError)
      return
    }

    console.log('✅ Documents fetched:', documents.length)

    // 4. 사용자 ID 목록 추출
    const userIds = [...new Set(documents.map(doc => doc.user_id))]
    console.log('👥 User IDs:', userIds)

    if (userIds.length === 0) {
      console.log('No documents found')
      return
    }

    // 5. 프로필 정보 조회
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_type')
      .in('id', userIds)

    if (profilesError) {
      console.error('❌ Profiles fetch error:', profilesError)
      return
    }

    console.log('✅ Profiles fetched:', profiles.length)

    // 6. 데이터 결합
    const profilesMap = new Map(profiles.map(profile => [profile.id, profile]))
    const combinedDocuments = documents.map(doc => ({
      ...doc,
      profiles: profilesMap.get(doc.user_id) || {
        id: doc.user_id,
        full_name: 'Unknown User',
        email: 'unknown@example.com',
        user_type: 'unknown'
      }
    }))

    console.log('✅ Data combination successful')

    // 7. 통계 계산
    const stats = {
      total: documents.length,
      pending: documents.filter(d => d.status === 'pending').length,
      approved: documents.filter(d => d.status === 'approved').length,
      rejected: documents.filter(d => d.status === 'rejected').length,
      byType: {
        business_license: documents.filter(d => d.document_type === 'business_license').length,
        identity_card: documents.filter(d => d.document_type === 'identity_card').length,
        certificate: documents.filter(d => d.document_type === 'certificate').length,
        portfolio: documents.filter(d => d.document_type === 'portfolio').length,
        other: documents.filter(d => d.document_type === 'other').length
      }
    }

    console.log('📊 Stats:', stats)

    // 8. 결과 샘플 출력
    if (combinedDocuments.length > 0) {
      console.log('📋 Sample combined document:')
      const sample = combinedDocuments[0]
      console.log({
        id: sample.id,
        file_name: sample.file_name,
        status: sample.status,
        profiles: {
          id: sample.profiles.id,
          full_name: sample.profiles.full_name,
          email: sample.profiles.email,
          user_type: sample.profiles.user_type
        }
      })
    }

    console.log('🎉 Admin API simulation successful!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testAdminAPI()
