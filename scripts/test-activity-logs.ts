import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testActivityLogs() {
  try {
    console.log('🧪 Testing activity logs...')
    
    // 새로운 활동 로그 생성
    const testActivities = [
      {
        type: 'instructor_registration',
        title: '테스트 강사 등록',
        description: '테스트 강사님이 강사로 등록했습니다.',
        user_name: '테스트 강사',
        created_at: new Date().toISOString()
      },
      {
        type: 'project_created',
        title: '테스트 프로젝트 생성',
        description: '테스트 기업이 "테스트 프로젝트"를 생성했습니다.',
        user_name: '테스트 기업',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        type: 'announcement_published',
        title: '테스트 공지사항 발행',
        description: '"테스트 공지사항"이 발행되었습니다.',
        user_name: '관리자',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      }
    ]

    console.log('📝 Inserting test activities...')
    
    for (const activity of testActivities) {
      const { error } = await supabase
        .from('activity_logs')
        .insert(activity)
      
      if (error) {
        console.error('❌ Error inserting activity:', error)
      } else {
        console.log('✅ Activity inserted:', activity.title)
      }
    }

    // 최신 활동 로그 확인
    console.log('\n📋 Latest activity logs:')
    const { data: latestActivities, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ Error fetching activities:', error)
    } else {
      latestActivities?.forEach((activity, index) => {
        console.log(`${index + 1}. ${activity.title} - ${activity.user_name} (${new Date(activity.created_at).toLocaleString()})`)
      })
    }

    console.log('\n🎉 Activity logs test completed!')

  } catch (error) {
    console.error('❌ Error in testActivityLogs:', error)
  }
}

testActivityLogs()
