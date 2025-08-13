import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('📋 API: Creating application...')
    
    const body = await request.json()
    console.log('📋 API: Request body:', body)
    
    // 필수 필드 검증
    if (!body.project_id || !body.instructor_id || !body.proposal || !body.proposed_rate) {
      console.error('❌ API: Missing required fields')
      return NextResponse.json(
        { success: false, error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      )
    }
    
    const insertData = {
      project_id: body.project_id,
      instructor_id: body.instructor_id,
      proposal: body.proposal,
      proposed_rate: parseInt(body.proposed_rate),
      status: 'pending'
    }
    
    console.log('📋 API: Insert data:', insertData)
    
    const { data, error } = await supabase
      .from('applications')
      .insert(insertData)
      .select()
      .single()
    
    console.log('📋 API: Insert result - data:', data)
    console.log('📋 API: Insert result - error:', error)
    
    if (error) {
      console.error('❌ API: Error creating application:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // 프로젝트 정보 가져오기 (활동 로그용)
    const { data: project } = await supabase
      .from('projects')
      .select('title')
      .eq('id', body.project_id)
      .single()

    // 강사 정보 가져오기 (활동 로그용)
    const { data: instructor } = await supabase
      .from('instructors')
      .select('full_name')
      .eq('id', body.instructor_id)
      .single()

    // 활동 로그 생성
    await supabase
      .from('activity_logs')
      .insert({
        type: 'application_created',
        title: '새 지원서 제출',
        description: `${instructor?.full_name || '강사'}이(가) "${project?.title || '프로젝트'}"에 지원서를 제출했습니다.`,
        user_name: instructor?.full_name || '강사',
        related_id: data?.id,
        related_type: 'application'
      })

    console.log('✅ API: Application created successfully:', data?.id)
    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error('❌ API: Exception creating application:', error)
    return NextResponse.json(
      { success: false, error: '지원서 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Fetching applications...')
    
    const { searchParams } = new URL(request.url)
    const project_id = searchParams.get('project_id')
    const instructor_id = searchParams.get('instructor_id')
    
    console.log('📋 API: Query params:', { project_id, instructor_id })
    
    // 기본 쿼리 시작
    let query = supabase
      .from('applications')
      .select(`
        *,
        projects!inner (
          title
        ),
        instructors!inner (
          full_name,
          profile_id
        )
      `)
    
    // 프로젝트 ID 필터
    if (project_id) {
      query = query.eq('project_id', project_id)
    }
    
    // 강사 ID 필터
    if (instructor_id) {
      query = query.eq('instructor_id', instructor_id)
    }
    
    // 최신순 정렬
    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    console.log('📋 API: Fetch result - data count:', data?.length)
    console.log('📋 API: Fetch result - error:', error)
    
    if (error) {
      console.error('❌ API: Error fetching applications:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    // 응답 데이터 포맷팅
    const formattedData = data?.map(application => ({
      id: application.id,
      project_id: application.project_id,
      instructor_id: application.instructor_id,
      proposal: application.proposal,
      proposed_rate: application.proposed_rate,
      status: application.status,
      created_at: application.created_at,
      updated_at: application.updated_at,
      project_title: application.projects?.title,
      instructor_name: application.instructors?.full_name
    })) || []
    
    console.log('✅ API: Applications fetched successfully')
    return NextResponse.json({
      success: true,
      data: formattedData
    })
    
  } catch (error) {
    console.error('❌ API: Exception fetching applications:', error)
    return NextResponse.json(
      { success: false, error: '지원서 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
