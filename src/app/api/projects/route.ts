import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  }) : null

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Fetching projects...')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    console.log('📋 API: Query params:', { page, limit, search, category, status, sortBy, sortOrder })
    
    // 기본 쿼리 시작
    let query = supabase
      .from('projects')
      .select(`
        *,
        companies!inner (
          company_name
        )
      `)
    
    // 검색 필터
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    // 카테고리 필터 (기존 컬럼이 없으므로 제목 기반으로 필터링)
    if (category && category !== 'all') {
      const categoryKeywords = {
        '강의': ['강의', '교육', '워크샵'],
        '마케팅': ['마케팅', '브랜드', '콘텐츠'],
        '디자인': ['디자인', 'UI', 'UX', '그래픽'],
        '개발': ['개발', '프로그래밍', '코딩', '웹', '앱', 'AI', '머신'],
        '비즈니스': ['비즈니스', '컨설팅', '전략', '분석']
      }
      
      const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || []
      if (keywords.length > 0) {
        const orConditions = keywords.map(keyword => `title.ilike.%${keyword}%`).join(',')
        query = query.or(orConditions)
      }
    }
    
    // 상태 필터
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    // 정렬
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    
    // 전체 개수 가져오기 (페이지네이션용)
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
    
    // 페이지네이션 적용
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data, error } = await query
    
    console.log('📋 API: Fetch result - data count:', data?.length)
    console.log('📋 API: Fetch result - error:', error)
    
    if (error) {
      console.error('❌ API: Error fetching projects:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    // 응답 데이터 포맷팅
    const formattedData = data?.map(project => {
      // 카테고리 추정
      let category = '기타'
      if (project.title.includes('강의') || project.title.includes('교육') || project.title.includes('워크샵')) {
        category = '강의'
      } else if (project.title.includes('마케팅') || project.title.includes('브랜드') || project.title.includes('콘텐츠')) {
        category = '마케팅'
      } else if (project.title.includes('디자인') || project.title.includes('UI') || project.title.includes('UX')) {
        category = '디자인'
      } else if (project.title.includes('개발') || project.title.includes('프로그래밍') || project.title.includes('웹') || project.title.includes('앱') || project.title.includes('AI')) {
        category = '개발'
      } else if (project.title.includes('비즈니스') || project.title.includes('컨설팅') || project.title.includes('전략')) {
        category = '비즈니스'
      }
      
      // 예산 범위 포맷팅
      let budgetRange = '협의'
      if (project.budget_range) {
        // "3000000-5000000" 형식을 "300만원 - 500만원" 형식으로 변환
        const parts = project.budget_range.split('-')
        if (parts.length === 2) {
          const min = parseInt(parts[0]) / 10000
          const max = parseInt(parts[1]) / 10000
          budgetRange = `${min}만원 - ${max}만원`
        } else {
          budgetRange = project.budget_range
        }
      }
      
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        category,
        budget_range: budgetRange,
        duration: project.duration || '협의',
        location: project.location || '협의',
        status: project.status,
        company_name: project.companies?.company_name || '알 수 없음',
        company_avatar: null, // 기업 테이블에 아바타 컬럼이 없으므로 null
        requirements: project.requirements || [],
        created_at: project.created_at,
        applications_count: 0 // 기본값
      }
    }) || []
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    console.log('✅ API: Projects fetched successfully')
    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('❌ API: Exception fetching projects:', error)
    return NextResponse.json(
      { success: false, error: '프로젝트 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📋 API: Creating project...')
    
    const body = await request.json()
    console.log('📋 API: Request body:', body)
    
    // 필수 필드 검증
    if (!body.title || !body.description || !body.company_id) {
      console.error('❌ API: Missing required fields')
      return NextResponse.json(
        { success: false, error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      )
    }
    
    const insertData = {
      title: body.title,
      description: body.description,
      company_id: body.company_id,
      budget_range: body.budget_range || null,
      duration: body.duration || null,
      location: body.location || null,
      status: body.status || 'open'
    }
    
    console.log('📋 API: Insert data:', insertData)
    
    const { data, error } = await supabase
      .from('projects')
      .insert(insertData)
      .select()
      .single()
    
    console.log('📋 API: Insert result - data:', data)
    console.log('📋 API: Insert result - error:', error)
    
    if (error) {
      console.error('❌ API: Error creating project:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // 기업 정보 가져오기 (활동 로그용)
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('id', body.company_id)
      .single()

    // 활동 로그 생성
    await supabase
      .from('activity_logs')
      .insert({
        type: 'project_created',
        title: '새 프로젝트 생성',
        description: `${company?.company_name || '기업'}이(가) "${body.title}" 프로젝트를 생성했습니다.`,
        user_name: company?.company_name || '기업',
        related_id: data?.id,
        related_type: 'project'
      })

    console.log('✅ API: Project created successfully:', data?.id)
    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error('❌ API: Exception creating project:', error)
    return NextResponse.json(
      { success: false, error: '프로젝트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('📋 API: Updating project...')
    
    const body = await request.json()
    console.log('📋 API: Update request body:', body)
    
    const { id, ...updateData } = body
    
    if (!id) {
      console.error('❌ API: Missing project ID')
      return NextResponse.json(
        { success: false, error: '프로젝트 ID가 필요합니다.' },
        { status: 400 }
      )
    }
    
    // 필수 필드 검증
    if (!updateData.title || !updateData.description || !updateData.company_id) {
      console.error('❌ API: Missing required fields for update')
      return NextResponse.json(
        { success: false, error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      )
    }
    
    const dataToUpdate = {
      title: updateData.title,
      description: updateData.description,
      company_id: updateData.company_id,
      budget_range: updateData.budget_range || null,
      duration: updateData.duration || null,
      location: updateData.location || null,
      status: updateData.status || 'open'
    }
    
    console.log('📋 API: Update data:', dataToUpdate)
    
    const { data, error } = await supabase
      .from('projects')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single()
    
    console.log('📋 API: Update result - data:', data)
    console.log('📋 API: Update result - error:', error)
    
    if (error) {
      console.error('❌ API: Error updating project:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // 기업 정보 가져오기 (활동 로그용)
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('id', updateData.company_id)
      .single()

    // 활동 로그 생성
    await supabase
      .from('activity_logs')
      .insert({
        type: 'project_updated',
        title: '프로젝트 수정',
        description: `${company?.company_name || '기업'}이(가) "${updateData.title}" 프로젝트를 수정했습니다.`,
        user_name: company?.company_name || '기업',
        related_id: data?.id,
        related_type: 'project'
      })

    console.log('✅ API: Project updated successfully:', data?.id)
    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error('❌ API: Exception updating project:', error)
    return NextResponse.json(
      { success: false, error: '프로젝트 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('📋 API: Deleting project...')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    console.log('📋 API: Delete project ID:', id)
    
    if (!id) {
      console.error('❌ API: Missing project ID')
      return NextResponse.json(
        { success: false, error: '프로젝트 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 프로젝트 정보 가져오기 (활동 로그용)
    const { data: project } = await supabase
      .from('projects')
      .select('title, company_id')
      .eq('id', id)
      .single()

    // 기업 정보 가져오기 (활동 로그용)
    let companyName = '기업'
    if (project?.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('company_name')
        .eq('id', project.company_id)
        .single()
      companyName = company?.company_name || '기업'
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    console.log('📋 API: Delete result - error:', error)
    
    if (error) {
      console.error('❌ API: Error deleting project:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // 활동 로그 생성
    if (project?.title) {
      await supabase
        .from('activity_logs')
        .insert({
          type: 'project_deleted',
          title: '프로젝트 삭제',
          description: `${companyName}이(가) "${project.title}" 프로젝트를 삭제했습니다.`,
          user_name: companyName,
          related_type: 'project'
        })
    }
    
    console.log('✅ API: Project deleted successfully:', id)
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('❌ API: Exception deleting project:', error)
    return NextResponse.json(
      { success: false, error: '프로젝트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
