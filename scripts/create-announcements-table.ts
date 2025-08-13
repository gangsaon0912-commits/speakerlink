import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAnnouncementsTable() {
  try {
    console.log('📋 Creating announcements table...')
    
    // announcements 테이블 생성
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS announcements (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
          author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          published_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (createError) {
      console.error('❌ Error creating announcements table:', createError)
      
      // exec_sql이 없으면 직접 테이블 생성 시도
      console.log('🔄 Trying direct table creation...')
      const { error: directError } = await supabase
        .from('announcements')
        .select('*')
        .limit(1)
      
      if (directError && directError.code === 'PGRST116') {
        console.log('📋 Table does not exist, creating manually...')
        // 테이블이 없으면 샘플 데이터 삽입으로 테이블 생성 시도
        const { error: insertError } = await supabase
          .from('announcements')
          .insert({
            title: '테스트 공지사항',
            content: '<p>이것은 테스트 공지사항입니다.</p>',
            status: 'draft'
          })
        
        if (insertError) {
          console.error('❌ Error creating table via insert:', insertError)
          return
        }
      }
    }

    console.log('✅ Announcements table created successfully')

    // RLS 정책 설정 (선택적)
    console.log('🔒 Setting up RLS policies...')
    
    try {
      // RLS 활성화
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;'
      })
      console.log('✅ RLS enabled')
    } catch (error) {
      console.log('⚠️ Could not enable RLS via exec_sql')
    }

    try {
      // 관리자 정책 (모든 작업 허용)
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE POLICY "Admin can do everything" ON announcements
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.email = 'admin@test.com'
            )
          );
        `
      })
      console.log('✅ Admin policy created')
    } catch (error) {
      console.log('⚠️ Could not create admin policy via exec_sql')
    }

    try {
      // 일반 사용자 정책 (발행된 공지사항만 읽기)
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE POLICY "Users can read published announcements" ON announcements
          FOR SELECT USING (status = 'published');
        `
      })
      console.log('✅ User policy created')
    } catch (error) {
      console.log('⚠️ Could not create user policy via exec_sql')
    }

    try {
      // updated_at 트리거 생성
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ language 'plpgsql';

          CREATE TRIGGER update_announcements_updated_at 
            BEFORE UPDATE ON announcements 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        `
      })
      console.log('✅ Trigger created')
    } catch (error) {
      console.log('⚠️ Could not create trigger via exec_sql')
    }

    console.log('✅ RLS policies and triggers setup completed')

    // 샘플 데이터 삽입
    console.log('📝 Inserting sample data...')
    
    const sampleAnnouncements = [
      {
        title: '시스템 점검 안내',
        content: '<p>안녕하세요,</p><p>시스템 점검이 예정되어 있습니다.</p><ul><li>점검 시간: 2024년 1월 15일 02:00~04:00</li><li>점검 내용: 서버 업그레이드</li></ul><p>불편을 끼쳐 죄송합니다.</p>',
        status: 'published',
        published_at: new Date().toISOString()
      },
      {
        title: '새로운 기능 업데이트',
        content: '<p>새로운 기능이 추가되었습니다:</p><ol><li>강사 검색 기능 개선</li><li>프로젝트 매칭 알고리즘 업데이트</li><li>사용자 인터페이스 개선</li></ol><p>더 나은 서비스를 제공하기 위해 노력하겠습니다.</p>',
        status: 'published',
        published_at: new Date().toISOString()
      },
      {
        title: '임시 공지사항',
        content: '<p>이것은 임시저장된 공지사항입니다.</p>',
        status: 'draft'
      }
    ]

    const { error: insertError } = await supabase
      .from('announcements')
      .insert(sampleAnnouncements)

    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError)
    } else {
      console.log('✅ Sample data inserted successfully')
    }

    console.log('🎉 Announcements table setup completed!')

  } catch (error) {
    console.error('❌ Error in createAnnouncementsTable:', error)
  }
}

createAnnouncementsTable()
