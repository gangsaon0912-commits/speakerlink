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

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Profile request received')
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    console.log('🔍 API: Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ API: Invalid authorization header')
      return NextResponse.json(
        { success: false, error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔍 API: Token length:', token.length)
    
    // JWT 토큰에서 사용자 ID 추출 (서비스 롤 키 사용)
    try {
      // JWT 토큰을 디코드하여 사용자 ID 추출
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        console.error('❌ API: Invalid JWT token format')
        return NextResponse.json(
          { success: false, error: '유효하지 않은 토큰 형식입니다.' },
          { status: 401 }
        )
      }
      
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
      const userId = payload.sub
      
      console.log('📋 API: Extracted user ID from token:', userId)
      console.log('📋 API: Token payload:', payload)
      
      if (!userId) {
        console.error('❌ API: No user ID in token payload')
        return NextResponse.json(
          { success: false, error: '토큰에서 사용자 ID를 찾을 수 없습니다.' },
          { status: 401 }
        )
      }
      
      // 서비스 롤 키로 직접 프로필 조회
      console.log('📋 API: Fetching profile for user:', userId)
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('❌ API: Profile fetch error:', profileError)
        console.error('❌ API: Profile error code:', profileError.code)
        console.error('❌ API: Profile error message:', profileError.message)
        return NextResponse.json(
          { success: false, error: profileError.message },
          { status: 500 }
        )
      }

      if (!profile) {
        console.log('⚠️ API: No profile found for user:', userId)
        return NextResponse.json(
          { success: false, error: '프로필을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      console.log('✅ API: Profile fetched successfully:', profile.full_name)
      console.log('✅ API: Profile data:', profile)
      return NextResponse.json({
        success: true,
        data: profile
      })
      
    } catch (jwtError) {
      console.error('❌ API: JWT decode error:', jwtError)
      return NextResponse.json(
        { success: false, error: '토큰 디코딩에 실패했습니다.' },
        { status: 401 }
      )
    }
    
  } catch (error) {
    console.error('❌ API: Exception fetching profile:', error)
    return NextResponse.json(
      { success: false, error: '프로필을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
