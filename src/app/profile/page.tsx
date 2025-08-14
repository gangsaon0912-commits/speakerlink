'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { 
  User, 
  Building2, 
  ArrowRight, 
  Edit, 
  CheckCircle, 
  Clock, 
  Mail, 
  Calendar,
  Award,
  MapPin,
  DollarSign,
  BookOpen,
  Languages,
  Clock3,
  Camera,
  Upload
} from 'lucide-react'
import Link from 'next/link'

// 진행률 계산 함수
const calculateProfileProgress = (profile: any, userType: string, instructorProfile?: any, companyProfile?: any, user?: any) => {
  if (!profile) return { basic: 0, detailed: 0, verification: 0 }

  let basicScore = 0
  let detailedScore = 0
  let verificationScore = 0

  // 기본 정보 점수 - 실제 데이터 기반
  if (profile.email) basicScore += 25
  if (profile.full_name) basicScore += 25
  if (profile.user_type) basicScore += 20
  if (profile.avatar_url) basicScore += 15
  if (user?.email_confirmed_at) basicScore += 15 // 이메일 인증 추가

  // 상세 정보 점수
  if (userType === 'instructor' && instructorProfile) {
    // 강사 상세 정보
    if (instructorProfile.bio) detailedScore += 20
    if (instructorProfile.location) detailedScore += 15
    if (instructorProfile.hourly_rate && instructorProfile.hourly_rate > 0) detailedScore += 15
    if (instructorProfile.expertise && instructorProfile.expertise.length > 0) detailedScore += 20
    if (instructorProfile.experience) detailedScore += 15
    if (instructorProfile.education) detailedScore += 15
  } else if (userType === 'company' && companyProfile) {
    // 기업 상세 정보
    if (companyProfile.company_name) detailedScore += 25
    if (companyProfile.description) detailedScore += 25
    if (companyProfile.industry) detailedScore += 25
    if (companyProfile.website) detailedScore += 25
  }

  // 검증 상태 점수
  if (profile.is_verified) {
    verificationScore = 100
  } else if (profile.verification_status === 'pending') {
    verificationScore = 50
  } else {
    verificationScore = 0
  }

  return {
    basic: Math.min(basicScore, 100),
    detailed: Math.min(detailedScore, 100),
    verification: verificationScore
  }
}

export default function ProfileDashboardPage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading, updateProfile } = useAuth()
  const [userType, setUserType] = useState<'instructor' | 'company' | null>(null)
  const [instructorProfile, setInstructorProfile] = useState<any>(null)
  const [companyProfile, setCompanyProfile] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    // 프로필 정보가 있으면 사용자 타입 설정
    if (profile?.user_type) {
      setUserType(profile.user_type as 'instructor' | 'company')
    }
  }, [profile, router, isAuthenticated, loading])

  // 강사/기업 프로필 데이터 직접 가져오기
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id || !userType) return

      try {
        if (userType === 'instructor') {
          const { data, error } = await supabase
            .from('instructors')
            .select('*')
            .eq('profile_id', user.id)
            .single()
          
          if (!error && data) {
            setInstructorProfile(data)
            console.log('✅ Instructor profile loaded:', data)
          }
        } else if (userType === 'company') {
          const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('profile_id', user.id)
            .single()
          
          if (!error && data) {
            setCompanyProfile(data)
            console.log('✅ Company profile loaded:', data)
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch profile data:', error)
      }
    }

    fetchProfileData()
  }, [user?.id, userType])

  // 디버깅: 프로필 데이터 확인
  useEffect(() => {
    console.log('🔍 Profile Debug:', {
      profile,
      userType,
      instructorProfile,
      companyProfile
    })
  }, [profile, userType, instructorProfile, companyProfile])

  // 아바타 업로드 함수
  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return

    try {
      setIsUploading(true)
      
      // 파일 확장자 확인
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      // Supabase Storage에 업로드 (documents 버킷 사용)
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)
      
      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        return
      }
      
      // 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)
      
      // 프로필에 아바타 URL 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('❌ Update error:', updateError)
        return
      }
      
      console.log('✅ Avatar uploaded successfully:', publicUrl)
      
      // 프로필 상태 직접 업데이트
      const result = await updateProfile({ avatar_url: publicUrl })
      if (!result.success) {
        console.error('❌ Profile update failed:', result.error)
      }
      
    } catch (error) {
      console.error('❌ Avatar upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // 아바타 삭제 함수
  const handleAvatarDelete = async () => {
    if (!user?.id || !profile?.avatar_url) return

    try {
      setIsUploading(true)
      
      // 현재 아바타 URL에서 파일 경로 추출
      const urlParts = profile.avatar_url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `avatars/${fileName}`
      
      // Storage에서 파일 삭제
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([filePath])
      
      if (deleteError) {
        console.error('❌ Delete error:', deleteError)
        return
      }
      
      // 프로필에서 아바타 URL 제거
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('❌ Update error:', updateError)
        return
      }
      
      console.log('✅ Avatar deleted successfully')
      
      // 프로필 상태 직접 업데이트
      const result = await updateProfile({ avatar_url: null })
      if (!result.success) {
        console.error('❌ Profile update failed:', result.error)
      }
      
    } catch (error) {
      console.error('❌ Avatar delete failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 파일 크기 확인 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.')
        return
      }
      
      // 파일 타입 확인
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      
      handleAvatarUpload(file)
    }
  }

  const handleProfileTypeSelect = (type: 'instructor' | 'company') => {
    setUserType(type)
    // 선택한 타입에 따라 해당 프로필 페이지로 이동
    if (type === 'instructor') {
      router.push('/profile/instructor')
    } else {
      router.push('/profile/company')
    }
  }

  // 진행률 계산
  const progress = calculateProfileProgress(profile, userType || '', instructorProfile, companyProfile, user)

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
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

  // 프로필이 설정되지 않은 경우 프로필 유형 선택 페이지 표시
  if (!userType) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 text-gray-900 mb-4">
                프로필 유형을 선택하세요
              </h1>
              <p className="text-xl text-gray-600 text-gray-600">
                강사온스쿨에서 어떤 역할로 활동하실 건가요?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 강사 카드 */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={() => handleProfileTypeSelect('instructor')}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">강사</CardTitle>
                  <CardDescription>
                    교육 및 강의를 제공하는 전문가
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-gray-900">강사가 할 수 있는 것:</h3>
                    <ul className="text-sm text-gray-600 text-gray-600 space-y-1">
                      <li>• 전문 분야에 대한 강의 및 교육 제공</li>
                      <li>• 기업 맞춤형 교육 프로그램 개발</li>
                      <li>• 온라인/오프라인 강의 진행</li>
                      <li>• 교육 자료 및 콘텐츠 제작</li>
                      <li>• 기업 교육 컨설팅</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => handleProfileTypeSelect('instructor')}
                  >
                    강사로 시작하기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* 기업 카드 */}
              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={() => handleProfileTypeSelect('company')}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">기업</CardTitle>
                  <CardDescription>
                    교육 서비스를 찾는 기업 또는 조직
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-gray-900">기업이 할 수 있는 것:</h3>
                    <ul className="text-sm text-gray-600 text-gray-600 space-y-1">
                      <li>• 직원 교육 프로그램 구매</li>
                      <li>• 맞춤형 교육 서비스 요청</li>
                      <li>• 강사 매칭 및 예약</li>
                      <li>• 교육 효과 평가 및 피드백</li>
                      <li>• 장기 교육 파트너십 구축</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                    onClick={() => handleProfileTypeSelect('company')}
                  >
                    기업으로 시작하기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 text-gray-500">
                나중에 언제든지 프로필 유형을 변경할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 프로필 대시보드
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-gray-900">
                프로필 대시보드
              </h1>
              <p className="text-gray-600 text-gray-600 mt-1">
                {profile?.full_name || user?.email}님의 프로필 정보입니다
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={userType === 'instructor' ? 'default' : 'secondary'}>
                {userType === 'instructor' ? '강사' : '기업'}
              </Badge>
              <Link href={userType === 'instructor' ? '/profile/instructor' : '/profile/company'}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  프로필 편집
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 프로필 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 아바타 섹션 */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || '프로필 이미지'} />
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full bg-white shadow-md hover:bg-gray-50"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">프로필 사진</h3>
                    <p className="text-sm text-gray-600 text-gray-500 mb-3">
                      프로필 사진을 업로드하여 더 나은 인상을 남겨보세요.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? '업로드 중...' : '사진 업로드'}
                      </Button>
                      {profile?.avatar_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('프로필 사진을 삭제하시겠습니까?')) {
                              handleAvatarDelete()
                            }
                          }}
                          disabled={isUploading}
                        >
                          {isUploading ? '삭제 중...' : '삭제'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 숨겨진 파일 입력 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">이메일</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">이름</p>
                      <p className="font-medium">{profile?.full_name || '미설정'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">가입일</p>
                      <p className="font-medium">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR') : '미설정'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 이메일 인증 상태 섹션 */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${user?.email_confirmed_at ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium text-gray-900">이메일 인증</p>
                        <p className="text-sm text-gray-500">
                          {user?.email_confirmed_at ? '이메일이 성공적으로 인증되었습니다.' : '이메일 인증이 필요합니다.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user?.email_confirmed_at ? (
                        <span className="text-green-600 flex items-center gap-1 font-medium">
                          <CheckCircle className="w-4 h-4" />
                          완료
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1 font-medium">
                          <Clock className="w-4 h-4" />
                          대기중
                        </span>
                      )}
                    </div>
                  </div>
                  {!user?.email_confirmed_at && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        이메일 인증이 완료되지 않았습니다. 이메일을 확인하여 인증을 완료해주세요.
                      </p>
                      <Link href="/auth/verify-email">
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-100">
                          이메일 재전송
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 계정 상태 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  계정 상태
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                    <div className="text-sm text-gray-600 text-gray-500">완료된 프로젝트</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                    <div className="text-sm text-gray-600 text-gray-500">진행중인 프로젝트</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
                    <div className="text-sm text-gray-600 text-gray-500">총 수익</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 빠른 액션 카드 */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 액션</CardTitle>
                <CardDescription>
                  자주 사용하는 기능에 빠르게 접근하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/projects">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      프로젝트 보기
                    </Button>
                  </Link>
                  <Link href="/profile/verification">
                    <Button variant="outline" className="w-full justify-start">
                      <Award className="w-4 h-4 mr-2" />
                      검증 상태 확인
                    </Button>
                  </Link>
                  <Link href="/announcements">
                    <Button variant="outline" className="w-full justify-start">
                      <Clock3 className="w-4 h-4 mr-2" />
                      공지사항 확인
                    </Button>
                  </Link>
                  <Link href="/documents">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      문서 관리
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 프로필 완성도 */}
            <Card>
              <CardHeader>
                <CardTitle>프로필 완성도</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">기본 정보</span>
                    <span className={`text-sm font-medium ${progress.basic >= 100 ? 'text-green-600' : progress.basic >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {progress.basic}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${progress.basic >= 100 ? 'bg-green-600' : progress.basic >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`} 
                      style={{ width: `${progress.basic}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">상세 정보</span>
                    <span className={`text-sm font-medium ${progress.detailed >= 100 ? 'text-green-600' : progress.detailed >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {progress.detailed}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${progress.detailed >= 100 ? 'bg-green-600' : progress.detailed >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`} 
                      style={{ width: `${progress.detailed}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">검증 상태</span>
                    <span className={`text-sm font-medium ${progress.verification >= 100 ? 'text-green-600' : progress.verification >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {progress.verification}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${progress.verification >= 100 ? 'bg-green-600' : progress.verification >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`} 
                      style={{ width: `${progress.verification}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href={userType === 'instructor' ? '/profile/instructor' : '/profile/company'}>
                    <Button className="w-full" size="sm">
                      프로필 완성하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 최근 활동 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 text-gray-500">계정 생성</span>
                    <span className="text-gray-400 text-xs">방금 전</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 text-gray-500">프로필 설정</span>
                    <span className="text-gray-400 text-xs">방금 전</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 도움말 */}
            <Card>
              <CardHeader>
                <CardTitle>도움말</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600 text-gray-500">
                    프로필을 완성하면 더 많은 기회를 얻을 수 있습니다.
                  </p>
                  <p className="text-gray-600 text-gray-500">
                    검증을 받으면 신뢰도가 높아집니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

