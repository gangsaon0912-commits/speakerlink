'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getInstructorProfile, updateInstructorProfileData, createInstructorProfileData } from '@/lib/auth'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Save, 
  X, 
  Edit3, 
  Award, 
  GraduationCap, 
  Globe, 
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface InstructorProfile {
  id: string
  profile_id: string
  full_name: string
  email: string
  bio: string
  expertise: string[]
  hourly_rate: number
  availability: string[]
  location: string
  rating: number
  total_reviews: number
  avatar_url: string | null
  experience: string
  education: string
  certifications: string[]
  languages: string[]
  is_verified: boolean
  created_at: string
  updated_at: string
}

export default function InstructorProfilePage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfile | null>(null)
  const [newExpertise, setNewExpertise] = useState('')
  const [newCertification, setNewCertification] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [newAvailability, setNewAvailability] = useState('')

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, loading, router])

  // 강사 프로필 데이터 로드
  useEffect(() => {
    const loadInstructorProfile = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        console.log('📋 Loading instructor profile for user:', user.id)
        
        const result = await getInstructorProfile(user.id)
        
        if (result.success && result.data) {
          console.log('✅ Instructor profile loaded:', result.data)
          // 배열 필드들이 undefined인 경우 빈 배열로 설정
          const profileData = {
            ...result.data,
            expertise: result.data.expertise || [],
            certifications: result.data.certifications || [],
            languages: result.data.languages || [],
            availability: result.data.availability || []
          }
          setInstructorProfile(profileData)
        } else {
          console.log('⚠️ No instructor profile found, user might be new')
          // 새로운 강사인 경우 기본 프로필 생성
          if (profile) {
            setInstructorProfile({
              id: '',
              profile_id: user.id,
              full_name: profile.full_name || '',
              email: profile.email || '',
              bio: '',
              expertise: [],
              hourly_rate: 0,
              availability: [],
                             location: '',
              rating: 0,
              total_reviews: 0,
              avatar_url: profile.avatar_url,
              experience: '',
              education: '',
              certifications: [],
              languages: [],
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        }
      } catch (error) {
        console.error('❌ Error loading instructor profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && user?.id) {
      loadInstructorProfile()
    }
  }, [isAuthenticated, user?.id, profile])

  const handleSave = async () => {
    if (!user?.id || !instructorProfile) return

    try {
      setIsSaving(true)
      console.log('💾 Saving instructor profile...')
      
      const result = await updateInstructorProfileData(user.id, {
        full_name: instructorProfile.full_name,
        bio: instructorProfile.bio,
        expertise: instructorProfile.expertise || [],
        hourly_rate: instructorProfile.hourly_rate,
        location: instructorProfile.location || '',
        experience: instructorProfile.experience || '',
        education: instructorProfile.education || '',
        certifications: instructorProfile.certifications || [],
        languages: instructorProfile.languages || [],
        availability: instructorProfile.availability || []
      })

      if (result.success) {
        console.log('✅ Profile saved successfully')
        setIsEditing(false)
        alert('프로필이 성공적으로 저장되었습니다!')
      } else {
        console.error('❌ Failed to save profile:', result.error)
        alert(`저장 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      alert('프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const addExpertise = () => {
    if (newExpertise.trim() && instructorProfile && !(instructorProfile.expertise || []).includes(newExpertise.trim())) {
      setInstructorProfile({
        ...instructorProfile,
        expertise: [...(instructorProfile.expertise || []), newExpertise.trim()]
      })
      setNewExpertise('')
    }
  }

  const removeExpertise = (index: number) => {
    if (instructorProfile) {
      setInstructorProfile({
        ...instructorProfile,
        expertise: (instructorProfile.expertise || []).filter((_, i) => i !== index)
      })
    }
  }

  const addCertification = () => {
    if (newCertification.trim() && instructorProfile && !(instructorProfile.certifications || []).includes(newCertification.trim())) {
      setInstructorProfile({
        ...instructorProfile,
        certifications: [...(instructorProfile.certifications || []), newCertification.trim()]
      })
      setNewCertification('')
    }
  }

  const removeCertification = (index: number) => {
    if (instructorProfile) {
      setInstructorProfile({
        ...instructorProfile,
        certifications: (instructorProfile.certifications || []).filter((_, i) => i !== index)
      })
    }
  }

  const addLanguage = () => {
    if (newLanguage.trim() && instructorProfile && !(instructorProfile.languages || []).includes(newLanguage.trim())) {
      setInstructorProfile({
        ...instructorProfile,
        languages: [...(instructorProfile.languages || []), newLanguage.trim()]
      })
      setNewLanguage('')
    }
  }

  const removeLanguage = (index: number) => {
    if (instructorProfile) {
      setInstructorProfile({
        ...instructorProfile,
        languages: (instructorProfile.languages || []).filter((_, i) => i !== index)
      })
    }
  }

  const addAvailability = () => {
    if (newAvailability.trim() && instructorProfile && !(instructorProfile.availability || []).includes(newAvailability.trim())) {
      setInstructorProfile({
        ...instructorProfile,
        availability: [...(instructorProfile.availability || []), newAvailability.trim()]
      })
      setNewAvailability('')
    }
  }

  const removeAvailability = (index: number) => {
    if (instructorProfile) {
      setInstructorProfile({
        ...instructorProfile,
        availability: (instructorProfile.availability || []).filter((_, i) => i !== index)
      })
    }
  }

  // 로딩 중이면 로딩 화면 표시
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">프로필 로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우 null 반환 (리다이렉트는 useEffect에서 처리)
  if (!isAuthenticated) {
    return null
  }

  // 프로필이 없으면 로딩 화면 표시
  if (!instructorProfile) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">프로필 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-gray-900">
                강사 프로필
              </h1>
              <p className="text-gray-600 text-gray-600 mt-1">
                프로필을 관리하고 업데이트하세요
              </p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    취소
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? '저장 중...' : '저장'}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    프로필 편집
                  </Button>
                  <Link href="/profile/verification">
                    <Button variant="outline" className="flex items-center gap-2">
                      {instructorProfile.is_verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      {instructorProfile.is_verified ? '인증됨' : '검증 신청'}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 사이드바 - 프로필 카드 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={instructorProfile.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {instructorProfile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{instructorProfile.full_name}</CardTitle>

              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{instructorProfile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{instructorProfile.location || '위치 미설정'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">시급 {instructorProfile.hourly_rate.toLocaleString()}원</span>
                </div>
                <div className="flex items-center gap-2">
                  {instructorProfile.is_verified ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-sm">
                    {instructorProfile.is_verified ? '인증된 강사' : '검증 대기중'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">이름</Label>
                    <Input
                      id="fullName"
                      value={instructorProfile.full_name}
                      onChange={(e) => setInstructorProfile({...instructorProfile, full_name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={instructorProfile.email}
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">위치</Label>
                  <Input
                    id="location"
                    value={instructorProfile.location}
                    onChange={(e) => setInstructorProfile({...instructorProfile, location: e.target.value})}
                    disabled={!isEditing}
                    placeholder="예: 서울시 강남구"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">자기소개</Label>
                  <Textarea
                    id="bio"
                    value={instructorProfile.bio}
                    onChange={(e) => setInstructorProfile({...instructorProfile, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="자신을 소개해주세요..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* 전문 분야 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  전문 분야
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                                      {(instructorProfile.expertise || []).map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {item}
                      {isEditing && (
                        <button
                          onClick={() => removeExpertise(index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="새로운 전문 분야"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                    />
                    <Button onClick={addExpertise} size="sm">추가</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 시급 및 경력 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  시급 및 경력
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">시급 (원)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={instructorProfile.hourly_rate}
                      onChange={(e) => setInstructorProfile({...instructorProfile, hourly_rate: parseInt(e.target.value) || 0})}
                      disabled={!isEditing}
                      placeholder="50000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">경력</Label>
                  <Textarea
                    id="experience"
                    value={instructorProfile.experience}
                    onChange={(e) => setInstructorProfile({...instructorProfile, experience: e.target.value})}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="관련 경력을 작성해주세요..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* 학력 및 자격증 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  학력 및 자격증
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="education">학력</Label>
                  <Textarea
                    id="education"
                    value={instructorProfile.education}
                    onChange={(e) => setInstructorProfile({...instructorProfile, education: e.target.value})}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="학력 사항을 작성해주세요..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>자격증</Label>
                  <div className="flex flex-wrap gap-2">
                    {(instructorProfile.certifications || []).map((cert, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {cert}
                        {isEditing && (
                          <button
                            onClick={() => removeCertification(index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="새로운 자격증"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                      />
                      <Button onClick={addCertification} size="sm">추가</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 언어 및 가능 시간 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  언어 및 가능 시간
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>사용 가능 언어</Label>
                  <div className="flex flex-wrap gap-2">
                    {(instructorProfile.languages || []).map((lang, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {lang}
                        {isEditing && (
                          <button
                            onClick={() => removeLanguage(index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="새로운 언어"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                      />
                      <Button onClick={addLanguage} size="sm">추가</Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>가능 시간</Label>
                  <div className="flex flex-wrap gap-2">
                    {(instructorProfile.availability || []).map((time, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {time}
                        {isEditing && (
                          <button
                            onClick={() => removeAvailability(index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="예: 평일 오후 2-6시"
                        value={newAvailability}
                        onChange={(e) => setNewAvailability(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addAvailability()}
                      />
                      <Button onClick={addAvailability} size="sm">추가</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
