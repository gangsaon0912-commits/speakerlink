import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function simpleDocumentsCheck() {
  console.log('🔍 Simple documents table check...')
  
  try {
    // 1. 기본 documents 쿼리
    console.log('1️⃣ Basic documents query...')
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .limit(5)

    if (docsError) {
      console.error('❌ Error fetching documents:', docsError)
      console.log('💡 Documents table might not exist or have RLS issues')
      return
    }

    console.log('✅ Documents table accessible')
    console.log('📄 Documents count:', documents.length)
    if (documents.length > 0) {
      console.log('Sample document:', documents[0])
    }

    // 2. profiles 테이블 확인
    console.log('2️⃣ Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_type')
      .limit(3)

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }

    console.log('✅ Profiles table accessible')
    console.log('👥 Profiles count:', profiles.length)
    if (profiles.length > 0) {
      console.log('Sample profile:', profiles[0])
    }

    // 3. Join 쿼리 테스트 (관리자용)
    console.log('3️⃣ Testing admin join query...')
    const { data: joinedData, error: joinError } = await supabase
      .from('documents')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          user_type
        )
      `)
      .limit(1)

    if (joinError) {
      console.error('❌ Error with join query:', joinError)
      console.log('💡 This is the 400 error source')
      
      // 4. 더 간단한 join 시도
      console.log('4️⃣ Trying simpler join...')
      const { data: simpleJoin, error: simpleError } = await supabase
        .from('documents')
        .select('*, profiles!user_id(*)')
        .limit(1)

      if (simpleError) {
        console.error('❌ Simple join also failed:', simpleError)
      } else {
        console.log('✅ Simple join worked:', simpleJoin[0])
      }
      
      return
    }

    console.log('✅ Join query successful')
    console.log('Joined data sample:', joinedData[0])

    // 5. 샘플 데이터 생성 (필요한 경우)
    if (documents.length === 0) {
      console.log('5️⃣ No documents found, creating sample data...')
      
      // admin 사용자 ID 가져오기
      const { data: adminUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'admin@test.com')
        .single()

      if (adminUser) {
        const sampleDoc = {
          user_id: adminUser.id,
          document_type: 'business_license',
          file_name: 'sample_license.pdf',
          file_url: 'https://example.com/sample.pdf',
          file_size: 1024000,
          mime_type: 'application/pdf',
          status: 'pending',
          description: '샘플 사업자등록증'
        }

        const { data: newDoc, error: insertError } = await supabase
          .from('documents')
          .insert(sampleDoc)
          .select()

        if (insertError) {
          console.error('❌ Error creating sample document:', insertError)
        } else {
          console.log('✅ Sample document created:', newDoc[0])
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

simpleDocumentsCheck()
