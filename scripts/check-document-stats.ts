import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkDocumentStats() {
  console.log('🔍 Checking document statistics...')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 모든 문서 조회
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
    
    if (error) {
      console.error('❌ Failed to fetch documents:', error)
      return
    }
    
    console.log(`📋 Total documents: ${documents?.length || 0}`)
    
    if (documents && documents.length > 0) {
      // 상태별 통계
      const stats = {
        total: documents.length,
        pending: documents.filter(d => d.status === 'pending').length,
        approved: documents.filter(d => d.status === 'approved').length,
        rejected: documents.filter(d => d.status === 'rejected').length,
        byType: {
          certificate: documents.filter(d => d.document_type === 'certificate').length,
          portfolio: documents.filter(d => d.document_type === 'portfolio').length,
          other: documents.filter(d => d.document_type === 'other').length
        }
      }
      
      console.log('📊 Document Statistics:')
      console.log(`  - Total: ${stats.total}`)
      console.log(`  - Pending: ${stats.pending}`)
      console.log(`  - Approved: ${stats.approved}`)
      console.log(`  - Rejected: ${stats.rejected}`)
      console.log('  - By Type:')
      console.log(`    - Certificate: ${stats.byType.certificate}`)
      console.log(`    - Portfolio: ${stats.byType.portfolio}`)
      console.log(`    - Other: ${stats.byType.other}`)
      
      // 샘플 문서 정보
      console.log('\n📄 Sample documents:')
      documents.slice(0, 3).forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.document_type} - ${doc.status} (${doc.uploaded_at})`)
      })
    } else {
      console.log('📭 No documents found')
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkDocumentStats()
