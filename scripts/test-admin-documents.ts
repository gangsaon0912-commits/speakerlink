import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAdminDocuments() {
  console.log('🔍 Testing admin documents query...')
  
  try {
    // 수정된 join 쿼리 테스트
    console.log('1️⃣ Testing modified join query...')
    const { data: joinedData, error: joinError } = await supabase
      .from('documents')
      .select(`
        *,
        user_profiles:user_id (
          id,
          full_name,
          email,
          user_type
        )
      `)
      .order('uploaded_at', { ascending: false })

    if (joinError) {
      console.error('❌ Error with modified join query:', joinError)
      return
    }

    console.log('✅ Modified join query successful')
    console.log('📄 Documents count:', joinedData.length)
    
    if (joinedData.length > 0) {
      console.log('Sample document with profile:')
      const sample = joinedData[0]
      console.log({
        id: sample.id,
        file_name: sample.file_name,
        status: sample.status,
        user_profiles: sample.user_profiles
      })
    }

    // 데이터 변환 테스트
    console.log('2️⃣ Testing data transformation...')
    const transformedData = joinedData.map(doc => ({
      ...doc,
      profiles: doc.user_profiles
    }))

    console.log('✅ Data transformation successful')
    if (transformedData.length > 0) {
      console.log('Transformed sample:')
      const sample = transformedData[0]
      console.log({
        id: sample.id,
        file_name: sample.file_name,
        status: sample.status,
        profiles: sample.profiles
      })
    }

    // 상태별 필터링 테스트
    console.log('3️⃣ Testing status filtering...')
    const { data: pendingDocs, error: pendingError } = await supabase
      .from('documents')
      .select(`
        *,
        user_profiles:user_id (
          id,
          full_name,
          email,
          user_type
        )
      `)
      .eq('status', 'pending')
      .order('uploaded_at', { ascending: false })

    if (pendingError) {
      console.error('❌ Error with status filtering:', pendingError)
    } else {
      console.log('✅ Status filtering successful')
      console.log('Pending documents count:', pendingDocs.length)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testAdminDocuments()
