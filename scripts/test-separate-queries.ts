import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSeparateQueries() {
  console.log('🔍 Testing separate queries approach...')
  
  try {
    // 1. 문서 목록 조회
    console.log('1️⃣ Fetching documents...')
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (docsError) {
      console.error('❌ Error fetching documents:', docsError)
      return
    }

    console.log('✅ Documents fetched successfully')
    console.log('📄 Documents count:', documents.length)

    if (documents.length === 0) {
      console.log('No documents found')
      return
    }

    // 2. 사용자 ID 목록 추출
    console.log('2️⃣ Extracting user IDs...')
    const userIds = [...new Set(documents.map(doc => doc.user_id))]
    console.log('👥 Unique user IDs:', userIds)

    // 3. 프로필 정보 조회
    console.log('3️⃣ Fetching profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_type')
      .in('id', userIds)

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }

    console.log('✅ Profiles fetched successfully')
    console.log('👥 Profiles count:', profiles.length)

    // 4. 프로필 정보를 Map으로 변환
    console.log('4️⃣ Creating profiles map...')
    const profilesMap = new Map(profiles.map(profile => [profile.id, profile]))
    console.log('🗺️ Profiles map created with', profilesMap.size, 'entries')

    // 5. 문서와 프로필 정보 결합
    console.log('5️⃣ Combining documents and profiles...')
    const combinedData = documents.map(doc => ({
      ...doc,
      profiles: profilesMap.get(doc.user_id) || {
        id: doc.user_id,
        full_name: 'Unknown User',
        email: 'unknown@example.com',
        user_type: 'unknown'
      }
    }))

    console.log('✅ Data combination successful')
    console.log('📄 Combined data count:', combinedData.length)

    // 6. 결과 샘플 출력
    if (combinedData.length > 0) {
      console.log('📋 Sample combined document:')
      const sample = combinedData[0]
      console.log({
        id: sample.id,
        file_name: sample.file_name,
        status: sample.status,
        user_id: sample.user_id,
        profiles: {
          id: sample.profiles.id,
          full_name: sample.profiles.full_name,
          email: sample.profiles.email,
          user_type: sample.profiles.user_type
        }
      })
    }

    // 7. 상태별 필터링 테스트
    console.log('7️⃣ Testing status filtering...')
    const pendingDocs = documents.filter(doc => doc.status === 'pending')
    console.log('⏳ Pending documents count:', pendingDocs.length)

    if (pendingDocs.length > 0) {
      const pendingUserIds = [...new Set(pendingDocs.map(doc => doc.user_id))]
      const { data: pendingProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, user_type')
        .in('id', pendingUserIds)

      const pendingProfilesMap = new Map(pendingProfiles.map(profile => [profile.id, profile]))
      const pendingCombined = pendingDocs.map(doc => ({
        ...doc,
        profiles: pendingProfilesMap.get(doc.user_id) || {
          id: doc.user_id,
          full_name: 'Unknown User',
          email: 'unknown@example.com',
          user_type: 'unknown'
        }
      }))

      console.log('✅ Status filtering successful')
      console.log('⏳ Pending combined count:', pendingCombined.length)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testSeparateQueries()
