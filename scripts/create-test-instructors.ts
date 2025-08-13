import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createTestInstructors() {
  console.log('🔍 Creating test instructors...')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 먼저 기존 강사 프로필 확인
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('user_type', 'instructor')
      .limit(10)
    
    if (profilesError) {
      console.error('❌ Failed to fetch profiles:', profilesError)
      return
    }
    
    if (!existingProfiles || existingProfiles.length === 0) {
      console.log('❌ No instructor profiles found')
      return
    }
    
    console.log(`📋 Found ${existingProfiles.length} instructor profiles`)
    
    // 테스트 강사 데이터
    const testInstructors = [
      {
        profile_id: existingProfiles[0].id,
        bio: '10년간의 교육 경험을 바탕으로 효과적인 학습 방법을 제공합니다. 특히 프로그래밍과 웹 개발 분야에서 전문성을 가지고 있습니다.',
        location: '서울시 강남구',
        hourly_rate: 50000,
        expertise: ['JavaScript', 'React', 'Node.js', '웹 개발'],
        experience: '10년',
        education: '컴퓨터공학 학사',
        certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
        languages: ['한국어', '영어']
      },
      {
        profile_id: existingProfiles[Math.min(1, existingProfiles.length - 1)].id,
        bio: '디자인과 UX/UI 분야에서 8년간 활동하며, 사용자 중심의 디자인 솔루션을 제공합니다.',
        location: '서울시 서초구',
        hourly_rate: 60000,
        expertise: ['UI/UX 디자인', 'Figma', 'Adobe Creative Suite', '디자인 시스템'],
        experience: '8년',
        education: '디자인학 학사',
        certifications: ['Adobe Certified Expert', 'Figma Design System Specialist'],
        languages: ['한국어', '영어', '일본어']
      },
      {
        profile_id: existingProfiles[Math.min(2, existingProfiles.length - 1)].id,
        bio: '마케팅과 비즈니스 전략 분야의 전문가로, 데이터 기반의 마케팅 전략 수립과 실행을 도와드립니다.',
        location: '부산시 해운대구',
        hourly_rate: 45000,
        expertise: ['디지털 마케팅', 'SEO', 'Google Ads', '데이터 분석'],
        experience: '12년',
        education: '경영학 석사',
        certifications: ['Google Ads Certification', 'Google Analytics Individual Qualification'],
        languages: ['한국어', '영어']
      },
      {
        profile_id: existingProfiles[Math.min(3, existingProfiles.length - 1)].id,
        bio: '언어 교육 전문가로, 체계적이고 효과적인 언어 학습 방법을 제공합니다. 특히 비즈니스 영어와 일본어 교육에 특화되어 있습니다.',
        location: '대구시 수성구',
        hourly_rate: 40000,
        expertise: ['영어 교육', '일본어 교육', '비즈니스 영어', 'TOEIC/TOEFL'],
        experience: '15년',
        education: '영어영문학 학사',
        certifications: ['TESOL Certificate', 'JLPT N1'],
        languages: ['한국어', '영어', '일본어']
      },
      {
        profile_id: existingProfiles[Math.min(4, existingProfiles.length - 1)].id,
        bio: '창업과 비즈니스 개발 전문가로, 스타트업부터 대기업까지 다양한 규모의 기업에서 경험을 쌓았습니다.',
        location: '인천시 연수구',
        hourly_rate: 70000,
        expertise: ['창업 컨설팅', '비즈니스 전략', '투자 유치', '기업 가치 평가'],
        experience: '18년',
        education: '경영학 박사',
        certifications: ['Certified Business Consultant', 'Venture Capital Professional'],
        languages: ['한국어', '영어', '중국어']
      }
    ]
    
    console.log(`📝 Creating ${testInstructors.length} test instructors...`)
    
    // 기존 강사 데이터 삭제 (테스트용)
    const { error: deleteError } = await supabase
      .from('instructors')
      .delete()
      .in('profile_id', existingProfiles.map(p => p.id))
    
    if (deleteError) {
      console.error('❌ Failed to delete existing instructors:', deleteError)
      return
    }
    
    // 강사 데이터 삽입
    const { data: insertedInstructors, error: insertError } = await supabase
      .from('instructors')
      .insert(testInstructors)
      .select()
    
    if (insertError) {
      console.error('❌ Failed to insert instructors:', insertError)
      return
    }
    
    console.log(`✅ Successfully created ${insertedInstructors?.length || 0} test instructors`)
    
    // 결과 확인
    const { data: allInstructors, error: statsError } = await supabase
      .from('instructors')
      .select('*')
    
    if (!statsError && allInstructors) {
      console.log('📊 Final Statistics:')
      console.log(`  - Total instructors: ${allInstructors.length}`)
      
      const expertiseCount = new Set(allInstructors.flatMap(i => i.expertise || [])).size
      const locationCount = new Set(allInstructors.map(i => i.location).filter(Boolean)).size
      
      console.log(`  - Unique expertise areas: ${expertiseCount}`)
      console.log(`  - Unique locations: ${locationCount}`)
      
      console.log('\n📋 Sample instructors:')
      allInstructors.slice(0, 3).forEach((instructor, index) => {
        console.log(`  ${index + 1}. ${instructor.location} - ${instructor.expertise?.join(', ')}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Create failed:', error)
  }
}

createTestInstructors()
