'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { signUp, createInstructorProfileData } from '@/lib/auth'
import { 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  Award, 
  DollarSign, 
  GraduationCap,
  Globe,
  Calendar,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface InstructorSignupForm {
  email: string
  password: string
  confirmPassword: string
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

export default function InstructorSignupPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState<InstructorSignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
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

  // 이미 로그인한 경우 프로필 페이지로 리다이렉트
  if (isAuthenticated) {
    router.push('/profile/instructor')
    return null
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.email) newErrors.email = '이메일을 입력해주세요'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = '올바른 이메일 형식을 입력해주세요'
      
      if (!formData.password) newErrors.password = '비밀번호를 입력해주세요'
      else if (formData.password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다'
      
      if (!formData.confirmPassword) newErrors.confirmPassword = '비밀번호 확인을 입력해주세요'
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
      
      if (!formData.fullName) newErrors.fullName = '이름을 입력해주세요'
    }

    if (step === 2) {
      if (!formData.location) newErrors.location = '위치를 입력해주세요'
      if (!formData.bio) newErrors.bio = '자기소개를 입력해주세요'
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
    if (!validateStep(currentStep)) return

    try {
      setIsLoading(true)
      console.log('📋 Starting instructor signup process...')

      // 1. 회원가입
      const signupResult = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        user_type: 'instructor',
        location: formData.location
      })

      if (!signupResult.success) {
        alert(`회원가입 실패: ${signupResult.error?.message}`)
        return
      }

      console.log('✅ Signup successful, creating instructor profile...')

      // 2. 강사 프로필 생성
      const profileResult = await createInstructorProfileData(signupResult.data.user.id, {
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

      if (!profileResult.success) {
        alert(`프로필 생성 실패: ${profileResult.error?.message}`)
        return
      }

      console.log('✅ Instructor profile created successfully')
      
      // 이메일 인증 안내
      if (signupResult.error?.message?.includes('이메일을 확인')) {
        alert('강사 등록이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요.')
        router.push('/auth/verify-email')
      } else {
        alert('강사 등록이 완료되었습니다! 프로필 페이지로 이동합니다.')
        router.push('/profile/instructor')
      }

    } catch (error) {
      console.error('❌ Error during instructor signup:', error)
      alert('강사 등록 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, title: '기본 정보', description: '계정 정보를 입력하세요' },
    { number: 2, title: '프로필 정보', description: '강사 프로필을 작성하세요' },
    { number: 3, title: '추가 정보', description: '경력과 자격을 입력하세요' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/signup">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                강사로 시작하기
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                강사 계정을 생성하고 프로필을 설정하세요
              </p>
            </div>
          </div>

          {/* 진행 단계 표시 */}
          <div className="flex items-center justify-center mb-8">
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
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="example@email.com"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">비밀번호</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="6자 이상"
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder="비밀번호를 다시 입력하세요"
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>

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
                  </div>
                )}

                {/* Step 2: 프로필 정보 */}
                {currentStep === 2 && (
                  <div className="space-y-4">
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

                    <div className="space-y-2">
                      <Label>전문 분야</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.expertise.map((item, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                            {item}
                            <button
                              onClick={() => removeExpertise(index)}
                              className="hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
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
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                            {cert}
                            <button
                              onClick={() => removeCertification(index)}
                              className="hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
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
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                            {lang}
                            <button
                              onClick={() => removeLanguage(index)}
                              className="hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
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
                          <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                            {time}
                            <button
                              onClick={() => removeAvailability(index)}
                              className="hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
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
                        {isLoading ? '등록 중...' : '강사 등록 완료'}
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
                  강사 등록 가이드
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
                        이메일, 비밀번호, 이름을 입력하세요.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">프로필 작성</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        위치, 자기소개, 전문 분야, 시급을 설정하세요.
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
                <CardTitle>강사 혜택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">프로젝트 매칭 서비스</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">수익 창출 기회</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">전문성 인증</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">커뮤니티 참여</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
