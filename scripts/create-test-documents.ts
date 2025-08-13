import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createTestDocuments() {
  console.log('🔍 Creating test documents...')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 먼저 사용자 확인
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found')
      return
    }
    
    console.log(`📋 Found ${users.length} users`)
    
    // 테스트 문서 데이터
    const testDocuments = [
      {
        user_id: users[0].id,
        document_type: 'certificate',
        file_name: 'test-certificate-1.pdf',
        file_url: 'https://example.com/test-certificate-1.pdf',
        file_size: 1024000, // 1MB
        mime_type: 'application/pdf',
        status: 'pending',
        uploaded_at: new Date().toISOString()
      },
      {
        user_id: users[0].id,
        document_type: 'portfolio',
        file_name: 'test-portfolio-1.pdf',
        file_url: 'https://example.com/test-portfolio-1.pdf',
        file_size: 2048000, // 2MB
        mime_type: 'application/pdf',
        status: 'approved',
        uploaded_at: new Date(Date.now() - 86400000).toISOString() // 1일 전
      },
      {
        user_id: users[0].id,
        document_type: 'certificate',
        file_name: 'test-certificate-2.pdf',
        file_url: 'https://example.com/test-certificate-2.pdf',
        file_size: 1536000, // 1.5MB
        mime_type: 'application/pdf',
        status: 'rejected',
        rejection_reason: '문서가 불완전합니다.',
        uploaded_at: new Date(Date.now() - 172800000).toISOString() // 2일 전
      },
      {
        user_id: users[Math.min(1, users.length - 1)].id,
        document_type: 'portfolio',
        file_name: 'test-portfolio-2.pdf',
        file_url: 'https://example.com/test-portfolio-2.pdf',
        file_size: 3072000, // 3MB
        mime_type: 'application/pdf',
        status: 'pending',
        uploaded_at: new Date(Date.now() - 3600000).toISOString() // 1시간 전
      },
      {
        user_id: users[Math.min(1, users.length - 1)].id,
        document_type: 'other',
        file_name: 'test-other-1.pdf',
        file_url: 'https://example.com/test-other-1.pdf',
        file_size: 512000, // 0.5MB
        mime_type: 'application/pdf',
        status: 'approved',
        uploaded_at: new Date(Date.now() - 43200000).toISOString() // 12시간 전
      },
      {
        user_id: users[Math.min(2, users.length - 1)].id,
        document_type: 'certificate',
        file_name: 'test-certificate-3.pdf',
        file_url: 'https://example.com/test-certificate-3.pdf',
        file_size: 1792000, // 1.75MB
        mime_type: 'application/pdf',
        status: 'pending',
        uploaded_at: new Date(Date.now() - 7200000).toISOString() // 2시간 전
      },
      {
        user_id: users[Math.min(2, users.length - 1)].id,
        document_type: 'portfolio',
        file_name: 'test-portfolio-3.pdf',
        file_url: 'https://example.com/test-portfolio-3.pdf',
        file_size: 4096000, // 4MB
        mime_type: 'application/pdf',
        status: 'approved',
        uploaded_at: new Date(Date.now() - 259200000).toISOString() // 3일 전
      },
      {
        user_id: users[Math.min(3, users.length - 1)].id,
        document_type: 'other',
        file_name: 'test-other-2.pdf',
        file_url: 'https://example.com/test-other-2.pdf',
        file_size: 256000, // 0.25MB
        mime_type: 'application/pdf',
        status: 'rejected',
        rejection_reason: '지원하지 않는 파일 형식입니다.',
        uploaded_at: new Date(Date.now() - 518400000).toISOString() // 6일 전
      }
    ]
    
    console.log(`📝 Creating ${testDocuments.length} test documents...`)
    
    // 문서 삽입
    const { data: insertedDocs, error: insertError } = await supabase
      .from('documents')
      .insert(testDocuments)
      .select()
    
    if (insertError) {
      console.error('❌ Failed to insert documents:', insertError)
      return
    }
    
    console.log(`✅ Successfully created ${insertedDocs?.length || 0} test documents`)
    
    // 통계 확인
    const { data: allDocs, error: statsError } = await supabase
      .from('documents')
      .select('*')
    
    if (!statsError && allDocs) {
      const stats = {
        total: allDocs.length,
        pending: allDocs.filter(d => d.status === 'pending').length,
        approved: allDocs.filter(d => d.status === 'approved').length,
        rejected: allDocs.filter(d => d.status === 'rejected').length
      }
      
      console.log('📊 Final Statistics:')
      console.log(`  - Total: ${stats.total}`)
      console.log(`  - Pending: ${stats.pending}`)
      console.log(`  - Approved: ${stats.approved}`)
      console.log(`  - Rejected: ${stats.rejected}`)
    }
    
  } catch (error) {
    console.error('❌ Create failed:', error)
  }
}

createTestDocuments()
