import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'


export async function DELETE(request: NextRequest) {
  console.log('🔍 API: Document deletion request received')
  
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentIds } = body
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid documentIds' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('🔍 API: Deleting documents:', documentIds)

    // 문서 삭제
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .in('id', documentIds)
      .select()

    if (error) {
      console.error('Document deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete documents' }, { status: 500 })
    }
    
    console.log('✅ Documents deleted successfully:', data?.length || 0)
    return NextResponse.json({ 
      success: true, 
      message: `${data?.length || 0} documents deleted successfully`, 
      deletedCount: data?.length || 0 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
