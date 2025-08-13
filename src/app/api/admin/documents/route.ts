import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔍 API: Admin documents request received')
  
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    console.log('🔍 API: Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ API: No valid auth header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('🔍 API: Token length:', token.length)
    
    // Supabase 클라이언트 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('🔍 API: Using service role key for admin documents')
    
    // 간단한 관리자 권한 확인 (Service Role Key 사용 시)
    console.log('✅ API: Using service role key - bypassing auth check')

    // URL 파라미터에서 상태 필터 가져오기
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // 1. 문서 목록 조회
    console.log('🔍 API: Starting documents query...')
    
    let query = supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (status && status !== 'all') {
      console.log('🔍 API: Adding status filter:', status)
      query = query.eq('status', status)
    }

    console.log('🔍 API: Executing documents query...')
    const { data: documents, error: docsError } = await query

    console.log('🔍 API: Documents fetch result:', {
      count: documents?.length || 0,
      error: docsError?.message,
      documents: documents?.slice(0, 2) // 처음 2개만 로그로 출력
    })

    if (docsError) {
      console.error('Documents fetch error:', docsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // 2. 사용자 ID 목록 추출
    const userIds = [...new Set(documents.map(doc => doc.user_id))]

    if (userIds.length === 0) {
      return NextResponse.json({ documents: [], stats: { total: 0, pending: 0, approved: 0, rejected: 0 } })
    }

    // 3. 프로필 정보 조회
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_type')
      .in('id', userIds)

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    // 4. 프로필 정보를 Map으로 변환
    const profilesMap = new Map(profiles.map(profile => [profile.id, profile]))

    // 5. 문서와 프로필 정보 결합
    const combinedDocuments = documents.map(doc => ({
      ...doc,
      profiles: profilesMap.get(doc.user_id) || {
        id: doc.user_id,
        full_name: 'Unknown User',
        email: 'unknown@example.com',
        user_type: 'unknown'
      }
    }))

    // 6. 통계 계산
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

    console.log('🔍 API: Final response for admin documents:', {
      documentsCount: combinedDocuments.length,
      stats: stats
    })

    return NextResponse.json({
      documents: combinedDocuments,
      stats
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  console.log('🔍 API: Document approval/rejection request received')
  
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    console.log('🔍 API: Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ API: No valid auth header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 요청 본문 파싱
    const body = await request.json()
    console.log('🔍 API: Request body:', body)
    
    const { documentId, status, adminComment } = body
    
    if (!documentId || !status) {
      console.log('❌ API: Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      console.log('❌ API: Invalid status')
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Supabase 클라이언트 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('🔍 API: Updating document status:', { documentId, status, adminComment })

    // 문서 상태 업데이트 - 실제 테이블 구조에 맞게 수정
    const updateData: any = { 
      status: status,
      reviewed_at: new Date().toISOString()
    }
    
    // 거부인 경우에만 rejection_reason 설정
    if (status === 'rejected' && adminComment) {
      updateData.rejection_reason = adminComment
    } else if (status === 'approved') {
      // 승인인 경우 rejection_reason을 null로 설정
      updateData.rejection_reason = null
    }

    const { data, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .select()

    if (error) {
      console.error('Document update error:', error)
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
    }

    console.log('✅ API: Document updated successfully:', data)

    return NextResponse.json({ 
      success: true, 
      message: `Document ${status} successfully`,
      document: data[0]
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
