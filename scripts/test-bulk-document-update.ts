import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testBulkDocumentUpdate() {
  console.log('🔍 Testing bulk document update API...')
  console.log('🔍 Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
  console.log('🔍 Service Key:', supabaseServiceKey ? 'Set' : 'Not set')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. 문서 목록 조회
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .limit(2)
    
    if (docsError) {
      console.error('❌ Failed to fetch documents:', docsError)
      return
    }
    
    if (!documents || documents.length === 0) {
      console.log('❌ No documents found for testing')
      return
    }
    
    const testDocumentIds = documents.map(doc => doc.id)
    console.log('🔍 Test document IDs:', testDocumentIds)
    
    // 2. API 엔드포인트 테스트
    const apiUrl = 'http://localhost:3000/api/admin/documents/bulk'
    
    // 대량 승인 테스트
    console.log('🔍 Testing bulk approval...')
    const approvalResponse = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        documentIds: testDocumentIds,
        status: 'approved'
      })
    })
    
    console.log('🔍 Bulk approval response status:', approvalResponse.status)
    const approvalResult = await approvalResponse.json()
    console.log('🔍 Bulk approval result:', approvalResult)
    
    // 대량 거부 테스트
    console.log('🔍 Testing bulk rejection...')
    const rejectionResponse = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        documentIds: testDocumentIds,
        status: 'rejected',
        rejection_reason: '대량 거부 테스트'
      })
    })
    
    console.log('🔍 Bulk rejection response status:', rejectionResponse.status)
    const rejectionResult = await rejectionResponse.json()
    console.log('🔍 Bulk rejection result:', rejectionResult)
    
    // 3. 최종 상태 확인
    const { data: finalDocs, error: finalError } = await supabase
      .from('documents')
      .select('*')
      .in('id', testDocumentIds)
    
    if (finalError) {
      console.error('❌ Failed to fetch final document states:', finalError)
      return
    }
    
    console.log('✅ Final document states:')
    finalDocs.forEach(doc => {
      console.log(`  - ${doc.id}: ${doc.status} (${doc.rejection_reason || 'no reason'})`)
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testBulkDocumentUpdate()
