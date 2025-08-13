import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createActivityLogsDirect() {
  try {
    console.log('📋 Creating activity_logs table directly...')
    
    // 먼저 테이블이 존재하는지 확인
    const { data: existingData, error: checkError } = await supabase
      .from('activity_logs')
      .select('id')
      .limit(1)
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('📋 Table does not exist, creating...')
      
      // 테이블이 없으므로 샘플 데이터 삽입으로 테이블 생성 시도
      const sampleData = {
        type: 'instructor_registration',
        title: '새 강사 등록',
        description: '김강사님이 강사로 등록했습니다.',
        user_name: '김강사',
        created_at: new Date().toISOString()
      }
      
      const { error: createError } = await supabase
        .from('activity_logs')
        .insert(sampleData)
      
      if (createError) {
        console.error('❌ Error creating table via insert:', createError)
        console.log('📋 This might be because the table schema is not properly set up.')
        return
      }
      
      console.log('✅ Table created successfully')
    } else if (checkError) {
      console.error('❌ Error checking table:', checkError)
      return
    } else {
      console.log('✅ Table already exists')
    }
    
    // 기존 데이터 확인
    const { data: existingRecords, error: dataError } = await supabase
      .from('activity_logs')
      .select('*')
    
    if (dataError) {
      console.error('❌ Error checking existing data:', dataError)
      return
    }
    
    console.log(`📊 Existing records: ${existingRecords?.length || 0}`)
    
    // 이미 충분한 데이터가 있으면 종료
    if (existingRecords && existingRecords.length >= 7) {
      console.log('✅ Sufficient data already exists')
      return
    }
    
    // 샘플 데이터 삽입
    console.log('📝 Inserting sample data...')
    
    const sampleActivities = [
      {
        type: 'instructor_registration',
        title: '새 강사 등록',
        description: '김강사님이 강사로 등록했습니다.',
        user_name: '김강사',
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2분 전
      },
      {
        type: 'project_matching',
        title: '프로젝트 매칭 완료',
        description: 'ABC기업과 이강사님의 매칭이 완료되었습니다.',
        user_name: '이강사',
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15분 전
      },
      {
        type: 'project_application',
        title: '신청서 접수',
        description: '새로운 프로젝트 신청이 접수되었습니다.',
        user_name: '박기업',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1시간 전
      },
      {
        type: 'company_registration',
        title: '새 기업 등록',
        description: 'XYZ기업이 플랫폼에 가입했습니다.',
        user_name: 'XYZ기업',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2시간 전
      },
      {
        type: 'project_completion',
        title: '프로젝트 완료',
        description: '웹 개발 프로젝트가 성공적으로 완료되었습니다.',
        user_name: '최강사',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3시간 전
      },
      {
        type: 'verification_approved',
        title: '프로필 검증 승인',
        description: '김강사님의 프로필 검증이 승인되었습니다.',
        user_name: '김강사',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4시간 전
      },
      {
        type: 'announcement_published',
        title: '공지사항 발행',
        description: '새로운 공지사항이 발행되었습니다.',
        user_name: '관리자',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5시간 전
      }
    ]

    const { error: insertError } = await supabase
      .from('activity_logs')
      .insert(sampleActivities)

    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError)
    } else {
      console.log('✅ Sample data inserted successfully')
    }

    // 최종 확인
    const { data: finalData, error: finalError } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (finalError) {
      console.error('❌ Final check error:', finalError)
    } else {
      console.log(`🎉 Total activity logs: ${finalData?.length || 0}`)
      if (finalData && finalData.length > 0) {
        console.log('📋 Latest activity:', finalData[0])
      }
    }

  } catch (error) {
    console.error('❌ Error in createActivityLogsDirect:', error)
  }
}

createActivityLogsDirect()
