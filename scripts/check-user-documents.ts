import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserDocuments() {
  console.log('🔍 Checking user documents...')
  
  try {
    // 1. 모든 문서 조회
    console.log('1️⃣ Fetching all documents...')
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (docsError) {
      console.error('❌ Error fetching documents:', docsError)
      return
    }

    console.log('✅ Documents fetched successfully')
    console.log('📄 Total documents count:', documents.length)

    if (documents.length === 0) {
      console.log('📭 No documents found in database')
      return
    }

    // 2. 사용자 ID 목록 추출
    const userIds = [...new Set(documents.map(doc => doc.user_id))]
    console.log('👥 Unique user IDs:', userIds)

    // 3. 프로필 정보 조회
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_type')
      .in('id', userIds)

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }

    console.log('✅ Profiles fetched successfully')
    console.log('👥 Profiles count:', profiles.length)

    // 4. 프로필 정보를 Map으로 변환
    const profilesMap = new Map(profiles.map(profile => [profile.id, profile]))

    // 5. 문서와 프로필 정보 결합
    const documentsWithProfiles = documents.map(doc => ({
      ...doc,
      profiles: profilesMap.get(doc.user_id) || {
        id: doc.user_id,
        full_name: 'Unknown User',
        email: 'unknown@example.com',
        user_type: 'unknown'
      }
    }))

    console.log('✅ Documents with profiles combined')

    // 6. 문서 상세 정보 출력
    console.log('\n📋 Document Details:')
    documentsWithProfiles.forEach((doc, index) => {
      console.log(`\n${index + 1}. Document ID: ${doc.id}`)
      console.log(`   File Name: ${doc.file_name}`)
      console.log(`   Document Type: ${doc.document_type}`)
      console.log(`   Status: ${doc.status}`)
      console.log(`   File Size: ${(doc.file_size / 1024).toFixed(2)} KB`)
      console.log(`   Uploaded: ${new Date(doc.uploaded_at).toLocaleString('ko-KR')}`)
      console.log(`   User: ${doc.profiles.full_name} (${doc.profiles.email})`)
      console.log(`   User Type: ${doc.profiles.user_type}`)
      if (doc.description) {
        console.log(`   Description: ${doc.description}`)
      }
      if (doc.rejection_reason) {
        console.log(`   Rejection Reason: ${doc.rejection_reason}`)
      }
    })

    // 7. 통계 정보
    console.log('\n📊 Document Statistics:')
    const stats = {
      total: documents.length,
      byStatus: {
        pending: documents.filter(d => d.status === 'pending').length,
        approved: documents.filter(d => d.status === 'approved').length,
        rejected: documents.filter(d => d.status === 'rejected').length
      },
      byType: {
        business_license: documents.filter(d => d.document_type === 'business_license').length,
        identity_card: documents.filter(d => d.document_type === 'identity_card').length,
        certificate: documents.filter(d => d.document_type === 'certificate').length,
        portfolio: documents.filter(d => d.document_type === 'portfolio').length,
        other: documents.filter(d => d.document_type === 'other').length
      },
      byUserType: {
        instructor: documentsWithProfiles.filter(d => d.profiles.user_type === 'instructor').length,
        company: documentsWithProfiles.filter(d => d.profiles.user_type === 'company').length,
        admin: documentsWithProfiles.filter(d => d.profiles.user_type === 'admin').length
      }
    }

    console.log('📈 Status breakdown:')
    console.log(`   - Pending: ${stats.byStatus.pending}`)
    console.log(`   - Approved: ${stats.byStatus.approved}`)
    console.log(`   - Rejected: ${stats.byStatus.rejected}`)

    console.log('📁 Type breakdown:')
    console.log(`   - Business License: ${stats.byType.business_license}`)
    console.log(`   - Identity Card: ${stats.byType.identity_card}`)
    console.log(`   - Certificate: ${stats.byType.certificate}`)
    console.log(`   - Portfolio: ${stats.byType.portfolio}`)
    console.log(`   - Other: ${stats.byType.other}`)

    console.log('👥 User type breakdown:')
    console.log(`   - Instructor: ${stats.byUserType.instructor}`)
    console.log(`   - Company: ${stats.byUserType.company}`)
    console.log(`   - Admin: ${stats.byUserType.admin}`)

    // 8. 최근 문서 (최근 5개)
    console.log('\n🕒 Recent Documents (last 5):')
    documentsWithProfiles.slice(0, 5).forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.file_name} by ${doc.profiles.full_name} (${doc.status})`)
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkUserDocuments()
