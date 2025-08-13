import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testDocumentApproval() {
  console.log('🔍 Testing document approval API...')
  console.log('🔍 Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
  console.log('🔍 Service Key:', supabaseServiceKey ? 'Set' : 'Not set')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    // 1. 먼저 문서 목록을 가져와서 테스트할 문서 찾기
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (docsError) {
      console.error('❌ Failed to fetch documents:', docsError)
      return
    }
    
    if (!documents || documents.length === 0) {
      console.log('❌ No documents found for testing')
      return
    }
    
    const testDocument = documents[0]
    console.log('🔍 Test document:', {
      id: testDocument.id,
      status: testDocument.status,
      document_type: testDocument.document_type
    })
    
    // 2. API 엔드포인트 테스트
    const apiUrl = 'http://localhost:3000/api/admin/documents'
    
    // 승인 테스트
    console.log('🔍 Testing approval...')
    const approvalResponse = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        documentId: testDocument.id,
        status: 'approved',
        adminComment: '테스트 승인 - 자동화된 테스트'
      })
    })
    
    console.log('🔍 Approval response status:', approvalResponse.status)
    const approvalResult = await approvalResponse.json()
    console.log('🔍 Approval result:', approvalResult)
    
    // 거부 테스트
    console.log('🔍 Testing rejection...')
    const rejectionResponse = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        documentId: testDocument.id,
        status: 'rejected',
        adminComment: '테스트 거부 - 자동화된 테스트'
      })
    })
    
    console.log('🔍 Rejection response status:', rejectionResponse.status)
    const rejectionResult = await rejectionResponse.json()
    console.log('🔍 Rejection result:', rejectionResult)
    
    // 3. 최종 상태 확인
    const { data: finalDoc, error: finalError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', testDocument.id)
      .single()
    
    if (finalError) {
      console.error('❌ Failed to fetch final document state:', finalError)
      return
    }
    
    console.log('✅ Final document state:', {
      id: finalDoc.id,
      status: finalDoc.status,
      rejection_reason: finalDoc.rejection_reason,
      reviewed_at: finalDoc.reviewed_at
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDocumentApproval()
