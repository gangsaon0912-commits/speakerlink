import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📋 API: Fetching instructor profile for user:', id)
    
    const { data, error } = await supabase
      .from('instructors')
      .select(`
        *,
        profiles!inner(*)
      `)
      .eq('profile_id', id)
      .single()
    
    console.log('📋 API: Fetch result - data:', data)
    console.log('📋 API: Fetch result - error:', error)
    
    if (error) {
      console.error('❌ API: Error fetching instructor profile:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: '강사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    console.log('✅ API: Instructor profile fetched successfully')
    return NextResponse.json({
      success: true,
      data
    })
    
  } catch (error) {
    console.error('❌ API: Exception fetching instructor profile:', error)
    return NextResponse.json(
      { success: false, error: '강사 프로필을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
