import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'


export async function PATCH(request: NextRequest) {
  console.log('🔍 API: Bulk document status update request received')
  
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
    
    const { documentIds, status, rejection_reason } = body
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      console.log('❌ API: Missing or invalid documentIds')
      return NextResponse.json({ error: 'Missing or invalid documentIds' }, { status: 400 })
    }
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      console.log('❌ API: Invalid status')
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Supabase 클라이언트 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('🔍 API: Updating bulk document status:', { 
      documentIds: documentIds.length, 
      status, 
      rejection_reason 
    })

    // 문서 상태 업데이트 - 실제 테이블 구조에 맞게 수정
    const updateData: any = { 
      status: status,
      reviewed_at: new Date().toISOString()
    }
    
    // 거부인 경우에만 rejection_reason 설정
    if (status === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    } else if (status === 'approved') {
      // 승인인 경우 rejection_reason을 null로 설정
      updateData.rejection_reason = null
    }

    // 대량 업데이트 실행
    const { data, error } = await supabase
      .from('documents')
      .update(updateData)
      .in('id', documentIds)
      .select()

    if (error) {
      console.error('Bulk document update error:', error)
      return NextResponse.json({ error: 'Failed to update documents' }, { status: 500 })
    }

    console.log('✅ API: Bulk documents updated successfully:', data?.length || 0)

    return NextResponse.json({ 
      success: true, 
      message: `${data?.length || 0} documents ${status} successfully`,
      documents: data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
