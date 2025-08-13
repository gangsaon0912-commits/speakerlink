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

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      console.error('❌ API: Supabase client not initialized')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일이 필요합니다.' },
        { status: 400 }
      )
    }

    // 이메일 인증 링크 재전송
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (error) {
      console.error('이메일 재전송 오류:', error)
      return NextResponse.json(
        { error: '이메일 전송에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '인증 이메일이 전송되었습니다.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('이메일 인증 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
