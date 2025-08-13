import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkDocumentsTable() {
  console.log('🔍 Checking documents table structure...')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. 샘플 데이터 조회해서 컬럼 구조 파악
    const { data: sampleDocs, error: sampleError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.error('❌ Failed to fetch sample data:', sampleError)
      return
    }
    
    if (sampleDocs && sampleDocs.length > 0) {
      console.log('📋 Documents table columns (from sample data):')
      const columns = Object.keys(sampleDocs[0])
      columns.forEach(col => {
        console.log(`  - ${col}: ${typeof sampleDocs[0][col as keyof typeof sampleDocs[0]]}`)
      })
      
      console.log('📄 Sample document data:')
      console.log(JSON.stringify(sampleDocs[0], null, 2))
    } else {
      console.log('❌ No documents found in table')
    }
    
    // 2. 빈 레코드로 컬럼 테스트
    console.log('🔍 Testing column access...')
    const { data: testData, error: testError } = await supabase
      .from('documents')
      .select('id, user_id, document_type, file_path, status, uploaded_at')
      .limit(1)
    
    if (testError) {
      console.error('❌ Basic column test failed:', testError)
    } else {
      console.log('✅ Basic columns accessible')
    }
    
    // 3. admin_comment 컬럼 테스트
    console.log('🔍 Testing admin_comment column...')
    const { data: adminTest, error: adminError } = await supabase
      .from('documents')
      .select('id, admin_comment')
      .limit(1)
    
    if (adminError) {
      console.error('❌ admin_comment column test failed:', adminError)
      console.log('💡 admin_comment column does not exist')
    } else {
      console.log('✅ admin_comment column exists')
    }
    
    // 4. reviewed_at 컬럼 테스트
    console.log('🔍 Testing reviewed_at column...')
    const { data: reviewTest, error: reviewError } = await supabase
      .from('documents')
      .select('id, reviewed_at')
      .limit(1)
    
    if (reviewError) {
      console.error('❌ reviewed_at column test failed:', reviewError)
      console.log('💡 reviewed_at column does not exist')
    } else {
      console.log('✅ reviewed_at column exists')
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkDocumentsTable()
