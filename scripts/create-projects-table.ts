import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createProjectsTable() {
  console.log('🚀 Creating projects table...')
  
  try {
    // 1. 샘플 데이터 삽입
    console.log('1️⃣ Inserting sample data...')
    
    // 먼저 기업 ID 가져오기
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
    
    if (companies && companies.length > 0) {
      const companyId = companies[0].id
      
      const sampleData = [
        {
          title: '웹 개발 프로젝트',
          description: 'React와 Node.js를 사용한 웹 애플리케이션 개발',
          company_id: companyId,
          status: 'open',
          budget_min: 5000000,
          budget_max: 8000000,
          duration_weeks: 8,
          skills_required: ['React', 'Node.js', 'TypeScript'],
          location: '서울'
        },
        {
          title: '모바일 앱 개발',
          description: 'Flutter를 사용한 크로스 플랫폼 모바일 앱 개발',
          company_id: companyId,
          status: 'in_progress',
          budget_min: 3000000,
          budget_max: 5000000,
          duration_weeks: 6,
          skills_required: ['Flutter', 'Dart', 'Firebase'],
          location: '부산'
        },
        {
          title: 'AI 모델 개발',
          description: '머신러닝 모델 개발 및 최적화',
          company_id: companyId,
          status: 'completed',
          budget_min: 10000000,
          budget_max: 15000000,
          duration_weeks: 12,
          skills_required: ['Python', 'TensorFlow', 'PyTorch'],
          location: '대구'
        }
      ]
      
      for (const project of sampleData) {
        const { error: insertError } = await supabase
          .from('projects')
          .insert(project)
        
        if (insertError) {
          console.error('❌ Error inserting project:', insertError)
        } else {
          console.log(`✅ Inserted project: ${project.title}`)
        }
      }
    }
    
    // 2. 최종 확인
    console.log('2️⃣ Final verification...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
    
    if (projectsError) {
      console.error('❌ Error checking projects:', projectsError)
    } else {
      console.log('📊 Projects in database:', projects?.length || 0)
      if (projects && projects.length > 0) {
        projects.forEach(project => {
          console.log(`  - ${project.title} (${project.status})`)
        })
      }
    }
    
    console.log('🎉 Projects setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

createProjectsTable()
