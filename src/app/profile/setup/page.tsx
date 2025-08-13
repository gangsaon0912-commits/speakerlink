'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createInstructorProfileData, updateInstructorProfileData } from '@/lib/auth'
import {
  User,
  Building2,
  Award,
  DollarSign,
  GraduationCap,
  Globe,
  Calendar,
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react'

interface ProfileSetupForm {
  userType: 'instructor' | 'company'
  fullName: string
  location: string
  bio: string
  expertise: string[]
  hourlyRate: number
  experience: string
  education: string
  certifications: string[]
  languages: string[]
  availability: string[]
}

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading } = useAuth()
  
  const [formData, setFormData] = useState<ProfileSetupForm>({
    userType: 'instructor',
    fullName: '',
    location: '',
    bio: '',
    expertise: [],
    hourlyRate: 0,
    experience: '',
    education: '',
    certifications: [],
    languages: [],
    availability: []
  })

  const [newExpertise, setNewExpertise] = useState('')
  const [newCertification, setNewCertification] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [newAvailability, setNewAvailability] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    // 이미 프로필이 완성된 경우 해당 프로필 페이지로 리다이렉트
    if (profile && profile.user_type === 'instructor') {
      router.push('/profile/instructor')
      return
    }

    // 기본 정보 설정
    if (profile) {
      setFormData(prev => ({
        ...prev,
        userType: profile.user_type as 'instructor' | 'company',
        fullName: profile.full_name || ''
      }))
    }
  }, [isAuthenticated, loading, profile, router])

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = '이름을 입력해주세요'
      if (!formData.location) newErrors.location = '위치를 입력해주세요'
      if (!formData.bio) newErrors.bio = '자기소개를 입력해주세요'
    }

    if (step === 2 && formData.userType === 'instructor') {
      if (formData.expertise.length === 0) newErrors.expertise = '최소 하나의 전문 분야를 입력해주세요'
      if (formData.hourlyRate <= 0) newErrors.hourlyRate = '시급을 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, newExpertise.trim()]
      })
      setNewExpertise('')
    }
  }

  const removeExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((_, i) => i !== index)
    })
  }

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()]
      })
      setNewCertification('')
    }
  }

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index)
    })
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage.trim()]
      })
      setNewLanguage('')
    }
  }

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index)
    })
  }

  const addAvailability = () => {
    if (newAvailability.trim() && !formData.availability.includes(newAvailability.trim())) {
      setFormData({
        ...formData,
        availability: [...formData.availability, newAvailability.trim()]
      })
      setNewAvailability('')
    }
  }

  const removeAvailability = (index: number) => {
    setFormData({
      ...formData,
      availability: formData.availability.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    if (!user?.id || !validateStep(currentStep)) return

    try {
      setIsLoading(true)
      console.log('💾 Setting up profile...')

      if (formData.userType === 'instructor') {
        const result = await createInstructorProfileData(user.id, {
          full_name: formData.fullName,
          bio: formData.bio,
          expertise: formData.expertise,
          hourly_rate: formData.hourlyRate,
          location: formData.location,
          experience: formData.experience,
          education: formData.education,
          certifications: formData.certifications,
          languages: formData.languages,
          availability: formData.availability
        })

        if (result.success) {
          console.log('✅ Instructor profile created successfully')
          alert('프로필 설정이 완료되었습니다!')
          router.push('/profile/instructor')
        } else {
          console.error('❌ Failed to create instructor profile:', result.error)
          alert(`프로필 생성 실패: ${result.error?.message}`)
        }
      } else {
        // 기업 프로필 생성 (나중에 구현)
        alert('기업 프로필 기능은 준비 중입니다.')
      }

    } catch (error) {
      console.error('❌ Error setting up profile:', error)
      alert('프로필 설정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, title: '기본 정보', description: '이름, 위치, 자기소개를 입력하세요' },
    { number: 2, title: '전문 정보', description: '전문 분야와 시급을 설정하세요' },
    { number: 3, title: '추가 정보', description: '경력과 자격을 입력하세요' }
  ]

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              프로필 설정
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              프로필을 완성하여 더 나은 서비스를 이용하세요
            </p>
          </div>

          {/* 진행 단계 표시 */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step.number 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 폼 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription>
                  {steps[currentStep - 1].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: 기본 정보 */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">이름</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        placeholder="홍길동"
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">위치</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="예: 서울시 강남구"
                        className={errors.location ? 'border-red-500' : ''}
                      />
                      {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">자기소개</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="자신을 소개해주세요..."
                        rows={4}
                        className={errors.bio ? 'border-red-500' : ''}
                      />
                      {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
                    </div>
                  </div>
                )}

                {/* Step 2: 전문 정보 (강사만) */}
                {currentStep === 2 && formData.userType === 'instructor' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>전문 분야</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.expertise.map((item, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {item}
                            <button
                              onClick={() => removeExpertise(index)}
                              className="hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="새로운 전문 분야"
                          value={newExpertise}
                          onChange={(e) => setNewExpertise(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                        />
                        <Button onClick={addExpertise} size="sm">추가</Button>
                      </div>
                      {errors.expertise && <p className="text-sm text-red-500">{errors.expertise}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">시급 (원)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({...formData, hourlyRate: parseInt(e.target.value) || 0})}
                        placeholder="50000"
                        className={errors.hourlyRate ? 'border-red-500' : ''}
                      />
                      {errors.hourlyRate && <p className="text-sm text-red-500">{errors.hourlyRate}</p>}
                    </div>
                  </div>
                )}

                {/* Step 3: 추가 정보 */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">경력</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        placeholder="관련 경력을 작성해주세요..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education">학력</Label>
                      <Textarea
                        id="education"
                        value={formData.education}
                        onChange={(e) => setFormData({...formData, education: e.target.value})}
                        placeholder="학력 사항을 작성해주세요..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>자격증</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {cert}
                            <button
                              onClick={() => removeCertification(index)}
                              className="hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="새로운 자격증"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                        />
                        <Button onClick={addCertification} size="sm">추가</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>사용 가능 언어</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.languages.map((lang, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {lang}
                            <button
                              onClick={() => removeLanguage(index)}
                              className="hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="새로운 언어"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                        />
                        <Button onClick={addLanguage} size="sm">추가</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>가능 시간</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.availability.map((time, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {time}
                            <button
                              onClick={() => removeAvailability(index)}
                              className="hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="예: 평일 오후 2-6시"
                          value={newAvailability}
                          onChange={(e) => setNewAvailability(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addAvailability()}
                        />
                        <Button onClick={addAvailability} size="sm">추가</Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 네비게이션 버튼 */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={handlePrev}>
                      이전
                    </Button>
                  )}
                  
                  <div className="ml-auto">
                    {currentStep < 3 ? (
                      <Button onClick={handleNext}>
                        다음
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? '설정 중...' : '프로필 완성'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 - 가이드 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  프로필 설정 가이드
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">기본 정보 입력</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        이름, 위치, 자기소개를 입력하세요.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">전문 정보 설정</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        전문 분야와 시급을 설정하세요.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">추가 정보</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        경력, 학력, 자격증, 언어, 가능 시간을 입력하세요.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>프로필 완성 혜택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">더 정확한 매칭</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">프로젝트 추천</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">신뢰도 향상</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">수익 기회 증가</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
