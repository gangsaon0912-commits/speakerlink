import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'



// 환경 변수 안전 처리
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ API: Missing Supabase environment variables')
}

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      console.error('❌ API: Supabase client not initialized')
      return NextResponse.json(
        { success: false, error: '서버 설정 오류입니다.' },
        { status: 500 }
      )
    }

    const { id } = await params
    console.log('📋 API: Fetching project by ID:', id)
    
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        companies!inner (
          company_name,
          description
        )
      `)
      .eq('id', id)
      .single()
    
    console.log('📋 API: Fetch result - data:', data)
    console.log('📋 API: Fetch result - error:', error)
    
    if (error) {
      console.error('❌ API: Error fetching project:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 카테고리 추정
    let category = '기타'
    if (data.title.includes('강의') || data.title.includes('교육') || data.title.includes('워크샵')) {
      category = '강의'
    } else if (data.title.includes('마케팅') || data.title.includes('브랜드') || data.title.includes('콘텐츠')) {
      category = '마케팅'
    } else if (data.title.includes('디자인') || data.title.includes('UI') || data.title.includes('UX')) {
      category = '디자인'
    } else if (data.title.includes('개발') || data.title.includes('프로그래밍') || data.title.includes('웹') || data.title.includes('앱') || data.title.includes('AI')) {
      category = '개발'
    } else if (data.title.includes('비즈니스') || data.title.includes('컨설팅') || data.title.includes('전략')) {
      category = '비즈니스'
    }
    
    // 예산 범위 포맷팅
    let budgetRange = '협의'
    if (data.budget_range) {
      // "3000000-5000000" 형식을 "300만원 - 500만원" 형식으로 변환
      const parts = data.budget_range.split('-')
      if (parts.length === 2) {
        const min = parseInt(parts[0]) / 10000
        const max = parseInt(parts[1]) / 10000
        budgetRange = `${min}만원 - ${max}만원`
      } else {
        budgetRange = data.budget_range
      }
    }
    
    // 응답 데이터 포맷팅
    const formattedData = {
      id: data.id,
      title: data.title,
      description: data.description,
      category,
      budget_range: budgetRange,
      duration: data.duration || '협의',
      location: data.location || '협의',
      status: data.status,
      company_name: data.companies?.company_name || '알 수 없음',
      company_avatar: null, // 기업 테이블에 아바타 컬럼이 없으므로 null
      company_description: data.companies?.description || '기업 정보가 없습니다.',
      requirements: data.requirements || [],
      additional_info: data.additional_info || '',
      created_at: data.created_at,
      applications_count: 0, // 기본값
      deadline: data.deadline || null
    }
    
    console.log('✅ API: Project fetched successfully')
    return NextResponse.json({
      success: true,
      data: formattedData
    })
    
  } catch (error) {
    console.error('❌ API: Exception fetching project:', error)
    return NextResponse.json(
      { success: false, error: '프로젝트를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
