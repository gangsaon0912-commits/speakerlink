'use client'

import { useState } from 'react'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Award, 
  MapPin, 
  DollarSign, 
  Star, 
  Users, 
  BookOpen,
  Clock,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Heart,
  Eye,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

interface Instructor {
  id: string
  full_name: string
  email: string
  bio: string
  location: string
  hourly_rate: number
  expertise: string[]
  experience: string
  education: string
  certifications: string[]
  languages: string[]
  avatar_url?: string
}

export default function AboutPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expertiseFilter, setExpertiseFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')

  // 목데이터 강사 목록
  const mockInstructors: Instructor[] = [
    {
      id: '1',
      full_name: '김웹개발',
      email: 'kim.web@강사온스쿨.com',
      bio: '10년간의 웹 개발 경험을 바탕으로 React, Node.js, TypeScript 등 현대적인 웹 기술을 가르칩니다. 실제 프로젝트 기반의 실습 중심 교육을 제공합니다.',
      location: '서울시 강남구',
      hourly_rate: 50000,
      expertise: ['JavaScript', 'React', 'Node.js', 'TypeScript', '웹 개발'],
      experience: '10년',
      education: '컴퓨터공학 학사',
      certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
      languages: ['한국어', '영어']
    },
    {
      id: '2',
      full_name: '이디자인',
      email: 'lee.design@강사온스쿨.com',
      bio: 'UX/UI 디자인 전문가로 사용자 중심의 디자인 솔루션을 제공합니다. Figma, Adobe Creative Suite를 활용한 실무 중심 교육을 진행합니다.',
      location: '서울시 서초구',
      hourly_rate: 60000,
      expertise: ['UI/UX 디자인', 'Figma', 'Adobe Creative Suite', '디자인 시스템'],
      experience: '8년',
      education: '디자인학 학사',
      certifications: ['Adobe Certified Expert', 'Figma Design System Specialist'],
      languages: ['한국어', '영어', '일본어']
    },
    {
      id: '3',
      full_name: '박마케팅',
      email: 'park.marketing@강사온스쿨.com',
      bio: '디지털 마케팅과 비즈니스 전략 전문가로, 데이터 기반의 마케팅 전략 수립과 실행을 도와드립니다. SEO, Google Ads, 소셜미디어 마케팅에 특화되어 있습니다.',
      location: '부산시 해운대구',
      hourly_rate: 45000,
      expertise: ['디지털 마케팅', 'SEO', 'Google Ads', '데이터 분석', '소셜미디어'],
      experience: '12년',
      education: '경영학 석사',
      certifications: ['Google Ads Certification', 'Google Analytics Individual Qualification'],
      languages: ['한국어', '영어']
    },
    {
      id: '4',
      full_name: '최언어',
      email: 'choi.language@강사온스쿨.com',
      bio: '언어 교육 전문가로, 체계적이고 효과적인 언어 학습 방법을 제공합니다. 특히 비즈니스 영어와 일본어 교육에 특화되어 있으며, TOEIC/TOEFL 시험 대비도 도와드립니다.',
      location: '대구시 수성구',
      hourly_rate: 40000,
      expertise: ['영어 교육', '일본어 교육', '비즈니스 영어', 'TOEIC/TOEFL'],
      experience: '15년',
      education: '영어영문학 학사',
      certifications: ['TESOL Certificate', 'JLPT N1'],
      languages: ['한국어', '영어', '일본어']
    },
    {
      id: '5',
      full_name: '정창업',
      email: 'jung.startup@강사온스쿨.com',
      bio: '창업과 비즈니스 개발 전문가로, 스타트업부터 대기업까지 다양한 규모의 기업에서 경험을 쌓았습니다. 투자 유치, 기업 가치 평가, 비즈니스 모델 개발을 전문으로 합니다.',
      location: '인천시 연수구',
      hourly_rate: 70000,
      expertise: ['창업 컨설팅', '비즈니스 전략', '투자 유치', '기업 가치 평가'],
      experience: '18년',
      education: '경영학 박사',
      certifications: ['Certified Business Consultant', 'Venture Capital Professional'],
      languages: ['한국어', '영어', '중국어']
    },
    {
      id: '6',
      full_name: '한AI',
      email: 'han.ai@강사온스쿨.com',
      bio: 'AI/ML 전문가로 머신러닝과 딥러닝을 가르칩니다. Python, TensorFlow, PyTorch를 활용한 실무 중심 교육을 제공하며, 실제 AI 프로젝트 경험을 바탕으로 한 교육을 진행합니다.',
      location: '서울시 마포구',
      hourly_rate: 80000,
      expertise: ['머신러닝', '딥러닝', 'Python', 'TensorFlow', 'PyTorch'],
      experience: '14년',
      education: '컴퓨터공학 석사',
      certifications: ['TensorFlow Developer Certificate', 'AWS Machine Learning Specialty'],
      languages: ['한국어', '영어']
    }
  ]

  // 필터링된 강사 목록
  const filteredInstructors = mockInstructors.filter(instructor => {
    const matchesSearch = instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.expertise?.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesExpertise = !expertiseFilter || expertiseFilter === 'all' || 
                           instructor.expertise?.some(exp => exp.toLowerCase().includes(expertiseFilter.toLowerCase()))
    
    const matchesLocation = !locationFilter || locationFilter === 'all' || 
                          instructor.location?.toLowerCase().includes(locationFilter.toLowerCase())

    return matchesSearch && matchesExpertise && matchesLocation
  })

  // 정렬된 강사 목록
  const sortedInstructors = [...filteredInstructors].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.full_name.localeCompare(b.full_name, 'ko')
      case 'name-desc':
        return b.full_name.localeCompare(a.full_name, 'ko')
      case 'price':
        return a.hourly_rate - b.hourly_rate
      case 'price-desc':
        return b.hourly_rate - a.hourly_rate
      case 'experience':
        return parseInt(a.experience) - parseInt(b.experience)
      case 'experience-desc':
        return parseInt(b.experience) - parseInt(a.experience)
      default:
        return 0
    }
  })

  // 전문 분야 목록 (중복 제거 및 우선순위 정렬)
  const expertisePriority = [
    'JavaScript',
    'React', 
    'Node.js',
    'TypeScript',
    '웹 개발',
    'UI/UX 디자인',
    'Figma',
    'Adobe Creative Suite',
    '디자인 시스템',
    '디지털 마케팅',
    'SEO',
    'Google Ads',
    '데이터 분석',
    '소셜미디어',
    '영어 교육',
    '일본어 교육',
    '비즈니스 영어',
    'TOEIC/TOEFL',
    '창업 컨설팅',
    '비즈니스 전략',
    '투자 유치',
    '기업 가치 평가',
    '머신러닝',
    '딥러닝',
    'Python',
    'TensorFlow',
    'PyTorch'
  ]
  
  const allExpertise = Array.from(new Set(
    mockInstructors.flatMap(instructor => instructor.expertise || [])
  )).sort((a, b) => {
    const aIndex = expertisePriority.indexOf(a)
    const bIndex = expertisePriority.indexOf(b)
    
    // 우선순위에 있는 전문분야는 앞으로
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    // 나머지는 알파벳 순
    return a.localeCompare(b, 'ko')
  })

  // 지역 목록 (중복 제거 및 우선순위 정렬)
  const locationPriority = [
    '서울시 강남구',
    '서울시 서초구', 
    '서울시 마포구',
    '부산시 해운대구',
    '대구시 수성구',
    '인천시 연수구'
  ]
  
  const allLocations = Array.from(new Set(
    mockInstructors.map(instructor => instructor.location).filter(Boolean)
  )).sort((a, b) => {
    const aIndex = locationPriority.indexOf(a)
    const bIndex = locationPriority.indexOf(b)
    
    // 우선순위에 있는 지역은 앞으로
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    // 나머지는 알파벳 순
    return a.localeCompare(b, 'ko')
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const getExpertiseColor = (expertise: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    ]
    return colors[expertise.length % colors.length]
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            강사진 소개
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            강사온스쿨의 전문 강사진을 소개합니다. 각 분야의 전문가들이 최고의 교육을 제공합니다.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-blue-900 mb-2">{mockInstructors.length}</p>
              <p className="text-sm font-medium text-blue-700">전문 강사</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-green-900 mb-2">{allExpertise.length}</p>
              <p className="text-sm font-medium text-green-700">전문 분야</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-purple-900 mb-2">{allLocations.length}</p>
              <p className="text-sm font-medium text-purple-700">활동 지역</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-600 rounded-full mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-yellow-900 mb-2">4.8</p>
              <p className="text-sm font-medium text-yellow-700">평균 평점</p>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 mb-12 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="강사명, 전문분야로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
              />
            </div>
            
            <div className="flex gap-4 flex-wrap">
              <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                <SelectTrigger className="w-48 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                  <SelectValue placeholder="전문분야 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 전문분야</SelectItem>
                  {allExpertise.map(expertise => (
                    <SelectItem key={expertise} value={expertise}>
                      {expertise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-40 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 지역</SelectItem>
                  {allLocations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">이름순 (가나다)</SelectItem>
                  <SelectItem value="name-desc">이름순 (다나가)</SelectItem>
                  <SelectItem value="price">시급순 (낮은순)</SelectItem>
                  <SelectItem value="price-desc">시급순 (높은순)</SelectItem>
                  <SelectItem value="experience">경력순 (낮은순)</SelectItem>
                  <SelectItem value="experience-desc">경력순 (높은순)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 강사 목록 */}
        {sortedInstructors.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              다른 검색어나 필터를 시도해보세요. 다양한 전문분야의 강사들이 기다리고 있습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedInstructors.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all">
                        <AvatarImage src={instructor.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold">
                          {instructor.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                          {instructor.full_name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {instructor.location || '지역 미설정'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {instructor.hourly_rate ? `${formatPrice(instructor.hourly_rate)}원/시간` : '가격 미설정'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* 전문분야 */}
                  {instructor.expertise && instructor.expertise.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-blue-600" />
                        전문분야
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {instructor.expertise.slice(0, 3).map((exp, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className={`text-xs px-3 py-1 rounded-full font-medium ${getExpertiseColor(exp)}`}
                          >
                            {exp}
                          </Badge>
                        ))}
                        {instructor.expertise.length > 3 && (
                          <Badge variant="outline" className="text-xs px-3 py-1 rounded-full">
                            +{instructor.expertise.length - 3}개 더
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 소개 */}
                  {instructor.bio && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-green-600" />
                        소개
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {instructor.bio.substring(0, 100)}
                        {instructor.bio.length > 100 && '...'}
                      </p>
                    </div>
                  )}

                  {/* 경력 */}
                  {instructor.experience && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-purple-600" />
                        경력
                      </h4>
                      <p className="text-sm text-gray-600 font-medium">
                        {instructor.experience}
                      </p>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                      <Link href={`/projects?instructor=${instructor.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        프로젝트 보기
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-2 hover:bg-gray-50" asChild>
                      <Link href={`mailto:${instructor.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        문의하기
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 하단 CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <CardContent className="p-12 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">강사가 되어보세요</h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                전문 지식을 나누고 새로운 기회를 만들어보세요. 강사온스쿨에서 당신의 전문성을 발휘할 수 있습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
                  asChild
                >
                  <Link href="/signup/instructor">
                    강사 등록하기
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200 font-semibold px-8 py-3" 
                  asChild
                >
                  <Link href="/projects">
                    프로젝트 둘러보기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
