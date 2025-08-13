import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const sampleProjects = [
  {
    title: '웹 개발 강의 프로그램',
    description: '기업 직원들을 대상으로 한 React.js 웹 개발 강의 프로그램을 진행할 강사를 찾습니다. 초급부터 중급 수준의 커리큘럼이 필요합니다.',
    budget_range: '3000000-5000000',
    duration: '12주',
    location: '서울시 강남구',
    status: 'open',
    requirements: ['React.js', 'JavaScript', '웹 개발 경험', '강의 경험']
  },
  {
    title: '디지털 마케팅 전략 수립',
    description: '신제품 출시를 위한 종합적인 디지털 마케팅 전략을 수립하고 실행할 전문가를 찾습니다.',
    budget_range: '5000000-8000000',
    duration: '24주',
    location: '서울시 서초구',
    status: 'open',
    requirements: ['디지털 마케팅', '브랜드 전략', '소셜미디어', '데이터 분석']
  },
  {
    title: 'UI/UX 디자인 워크샵',
    description: '개발팀을 위한 UI/UX 디자인 워크샵을 진행할 전문가를 찾습니다. 실무 중심의 교육이 필요합니다.',
    budget_range: '2000000-3000000',
    duration: '8주',
    location: '부산시 해운대구',
    status: 'open',
    requirements: ['UI/UX 디자인', 'Figma', '사용자 리서치', '워크샵 진행']
  },
  {
    title: '데이터 분석 교육',
    description: '비즈니스 인사이트 도출을 위한 데이터 분석 교육을 진행할 강사를 찾습니다.',
    budget_range: '4000000-6000000',
    duration: '16주',
    location: '대구시 수성구',
    status: 'in_progress',
    requirements: ['Python', 'SQL', '데이터 시각화', '통계 분석']
  },
  {
    title: '브랜드 아이덴티티 개발',
    description: '신규 브랜드의 아이덴티티를 개발하고 브랜드 가이드라인을 제작할 디자이너를 찾습니다.',
    budget_range: '3000000-5000000',
    duration: '12주',
    location: '인천시 연수구',
    status: 'open',
    requirements: ['브랜드 디자인', '로고 디자인', '타이포그래피', '컬러 시스템']
  },
  {
    title: '프로젝트 관리 교육',
    description: '애자일 방법론과 프로젝트 관리 기법을 교육할 전문가를 찾습니다.',
    budget_range: '2500000-4000000',
    duration: '8주',
    location: '광주시 서구',
    status: 'completed',
    requirements: ['애자일', '스크럼', '프로젝트 관리', '팀 리딩']
  },
  {
    title: '모바일 앱 개발',
    description: 'iOS/Android 크로스 플랫폼 모바일 앱을 개발할 개발자를 찾습니다.',
    budget_range: '8000000-12000000',
    duration: '24주',
    location: '서울시 마포구',
    status: 'open',
    requirements: ['React Native', 'TypeScript', '모바일 개발 경험', 'API 연동']
  },
  {
    title: '비즈니스 모델 분석',
    description: '신규 서비스의 비즈니스 모델을 분석하고 개선 방안을 제시할 컨설턴트를 찾습니다.',
    budget_range: '6000000-9000000',
    duration: '16주',
    location: '서울시 종로구',
    status: 'open',
    requirements: ['비즈니스 분석', '시장 조사', '재무 분석', '전략 수립']
  },
  {
    title: 'AI/ML 모델 개발',
    description: '머신러닝 모델을 개발하고 배포할 AI 전문가를 찾습니다.',
    budget_range: '10000000-15000000',
    duration: '32주',
    location: '서울시 강남구',
    status: 'in_progress',
    requirements: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', '클라우드 배포']
  },
  {
    title: '콘텐츠 마케팅 전략',
    description: '브랜드 인지도 향상을 위한 콘텐츠 마케팅 전략을 수립하고 실행할 전문가를 찾습니다.',
    budget_range: '4000000-6000000',
    duration: '20주',
    location: '서울시 송파구',
    status: 'open',
    requirements: ['콘텐츠 기획', '소셜미디어', 'SEO', '데이터 분석']
  },
  {
    title: '사용자 리서치 및 분석',
    description: '제품 개선을 위한 사용자 리서치를 진행하고 인사이트를 도출할 UX 리서처를 찾습니다.',
    budget_range: '3500000-5000000',
    duration: '12주',
    location: '서울시 성동구',
    status: 'open',
    requirements: ['사용자 인터뷰', '설문 조사', '데이터 분석', '인사이트 도출']
  },
  {
    title: '블록체인 개발',
    description: 'DeFi 프로젝트를 위한 스마트 컨트랙트를 개발할 블록체인 개발자를 찾습니다.',
    budget_range: '12000000-18000000',
    duration: '40주',
    location: '서울시 강남구',
    status: 'open',
    requirements: ['Solidity', 'Ethereum', 'Web3.js', '스마트 컨트랙트 보안']
  },
  {
    title: '기업 문화 개선 컨설팅',
    description: '조직 문화 개선을 위한 전략을 수립하고 실행할 HR 컨설턴트를 찾습니다.',
    budget_range: '7000000-10000000',
    duration: '24주',
    location: '서울시 영등포구',
    status: 'open',
    requirements: ['조직 개발', '인사 관리', '변경 관리', '팀 빌딩']
  },
  {
    title: '클라우드 인프라 구축',
    description: 'AWS/Azure 기반 클라우드 인프라를 구축하고 관리할 DevOps 엔지니어를 찾습니다.',
    budget_range: '9000000-13000000',
    duration: '28주',
    location: '서울시 강남구',
    status: 'in_progress',
    requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', '모니터링']
  },
  {
    title: '그래픽 디자인 교육',
    description: '신입 디자이너들을 위한 그래픽 디자인 기초 교육을 진행할 강사를 찾습니다.',
    budget_range: '2000000-3500000',
    duration: '8주',
    location: '부산시 부산진구',
    status: 'open',
    requirements: ['Adobe Creative Suite', '그래픽 디자인', '타이포그래피', '컬러 이론']
  }
]

async function createSampleProjects() {
  try {
    console.log('🚀 샘플 프로젝트 생성 시작...')
    
    // 먼저 기업 데이터 확인
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, company_name')
      .limit(5)
    
    if (companiesError) {
      console.error('❌ 기업 데이터 조회 오류:', companiesError)
      return
    }
    
    if (!companies || companies.length === 0) {
      console.log('⚠️ 기업 데이터가 없습니다. 먼저 기업 데이터를 생성해주세요.')
      return
    }
    
    console.log(`📋 ${companies.length}개 기업 데이터 확인됨`)
    
    // 샘플 프로젝트 생성
    const createdProjects = []
    
    for (let i = 0; i < sampleProjects.length; i++) {
      const project = sampleProjects[i]
      const companyIndex = i % companies.length
      const company = companies[companyIndex]
      
      const projectData = {
        ...project,
        company_id: company.id
      }
      
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single()
      
      if (error) {
        console.error(`❌ 프로젝트 "${project.title}" 생성 오류:`, error)
        continue
      }
      
      createdProjects.push(data)
      console.log(`✅ 프로젝트 생성됨: ${project.title} (${company.company_name})`)
      
      // 활동 로그 생성
      await supabase
        .from('activity_logs')
        .insert({
          type: 'project_created',
          title: '샘플 프로젝트 생성',
          description: `${company.company_name}이(가) "${project.title}" 프로젝트를 생성했습니다.`,
          user_name: company.company_name,
          related_id: data.id,
          related_type: 'project'
        })
    }
    
    console.log(`🎉 총 ${createdProjects.length}개의 샘플 프로젝트가 성공적으로 생성되었습니다!`)
    
    // 생성된 프로젝트 목록 출력
    console.log('\n📋 생성된 프로젝트 목록:')
    createdProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title} (${project.status})`)
    })
    
  } catch (error) {
    console.error('❌ 샘플 프로젝트 생성 중 오류:', error)
  }
}

// 스크립트 실행
createSampleProjects()
