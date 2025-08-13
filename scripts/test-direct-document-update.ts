import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testDirectDocumentUpdate() {
  console.log('🔍 Testing direct document update...')
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
    console.log('🔍 Test document before update:', {
      id: testDocument.id,
      status: testDocument.status,
      admin_comment: testDocument.admin_comment,
      reviewed_at: testDocument.reviewed_at
    })
    
    // 2. 직접 업데이트 테스트
    console.log('🔍 Updating document status to approved...')
    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .update({ 
        status: 'approved',
        admin_comment: '직접 업데이트 테스트',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', testDocument.id)
      .select()
    
    if (updateError) {
      console.error('❌ Update failed:', updateError)
      return
    }
    
    console.log('✅ Document updated successfully:', updatedDoc[0])
    
    // 3. 거부로 다시 업데이트
    console.log('🔍 Updating document status to rejected...')
    const { data: rejectedDoc, error: rejectError } = await supabase
      .from('documents')
      .update({ 
        status: 'rejected',
        admin_comment: '직접 거부 테스트',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', testDocument.id)
      .select()
    
    if (rejectError) {
      console.error('❌ Rejection failed:', rejectError)
      return
    }
    
    console.log('✅ Document rejected successfully:', rejectedDoc[0])
    
    // 4. 최종 상태 확인
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
      admin_comment: finalDoc.admin_comment,
      reviewed_at: finalDoc.reviewed_at
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDirectDocumentUpdate()
