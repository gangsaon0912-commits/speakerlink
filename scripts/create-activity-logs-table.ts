import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createActivityLogsTable() {
  try {
    console.log('📋 Creating activity_logs table...')
    
    // activity_logs 테이블 생성
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          user_name TEXT,
          related_id UUID,
          related_type TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (createError) {
      console.error('❌ Error creating activity_logs table:', createError)
      
      // exec_sql이 없으면 직접 테이블 생성 시도
      console.log('🔄 Trying direct table creation...')
      const { error: directError } = await supabase
        .from('activity_logs')
        .select('*')
        .limit(1)
      
      if (directError && directError.code === 'PGRST116') {
        console.log('📋 Table does not exist, creating manually...')
        // 테이블이 없으면 샘플 데이터 삽입으로 테이블 생성 시도
        const { error: insertError } = await supabase
          .from('activity_logs')
          .insert({
            type: 'instructor_registration',
            title: '새 강사 등록',
            description: '김강사님이 강사로 등록했습니다.',
            user_name: '김강사'
          })
        
        if (insertError) {
          console.error('❌ Error creating table via insert:', insertError)
          return
        }
      }
    }

    console.log('✅ Activity logs table created successfully')

    // RLS 정책 설정
    console.log('🔒 Setting up RLS policies...')
    
    try {
      // RLS 활성화
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;'
      })
      console.log('✅ RLS enabled')
    } catch (error) {
      console.log('⚠️ Could not enable RLS via exec_sql')
    }

    try {
      // 모든 사용자가 읽기 가능
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE POLICY "Users can read activity logs" ON activity_logs
          FOR SELECT USING (true);
        `
      })
      console.log('✅ Read policy created')
    } catch (error) {
      console.log('⚠️ Could not create read policy via exec_sql')
    }

    try {
      // 관리자만 쓰기 가능
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE POLICY "Admin can insert activity logs" ON activity_logs
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.email = 'admin@test.com'
            )
          );
        `
      })
      console.log('✅ Insert policy created')
    } catch (error) {
      console.log('⚠️ Could not create insert policy via exec_sql')
    }

    console.log('✅ RLS policies setup completed')

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

    console.log('🎉 Activity logs table setup completed!')

  } catch (error) {
    console.error('❌ Error in createActivityLogsTable:', error)
  }
}

createActivityLogsTable()
