'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Building2,
  Calendar,
  Send,
  Share2,
  Bookmark,
  BookOpen,
  Megaphone,
  Code,
  Palette,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogIn,
  User,
  X,
  Shield
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  description: string
  category: string
  budget_range: string
  duration: string
  location: string
  status: 'open' | 'in_progress' | 'completed'
  company_name: string
  company_avatar: string | null
  company_description: string
  requirements: string[]
  additional_info: string
  created_at: string
  applications_count: number
  deadline?: string
}

interface Application {
  id: string
  instructor_name: string
  instructor_avatar: string | null
  proposal: string
  proposed_rate: number
  submitted_at: string
  status: 'pending' | 'accepted' | 'rejected'
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  // 디버깅용 상태 출력
  console.log('🔍 ProjectDetailPage - Auth State:', {
    user,
    profile: profile ? 'exists' : 'null',
    isAuthenticated,
    profileUserType: profile?.user_type,
    profileIsVerified: profile?.is_verified
  })
  
  // 관리자 권한 확인
  const isAdmin = profile?.user_type === 'admin'
  const [project, setProject] = useState<Project | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationForm, setApplicationForm] = useState({
    proposal: '',
    proposed_rate: ''
  })
  
  // 현재 사용자가 이미 지원했는지 확인
  const [hasApplied, setHasApplied] = useState(false)
  
  // 지원 여부 확인 함수
  const checkIfApplied = useCallback(async () => {
    if (!profile || profile.user_type !== 'instructor') return
    
    try {
      const instructorResponse = await fetch(`/api/instructors/profile/${profile.id}`)
      const instructorResult = await instructorResponse.json()
      
      if (instructorResult.success && instructorResult.data) {
        const instructorId = instructorResult.data.id
        const hasUserApplied = applications.some(app => 
          app.instructor_id === instructorId
        )
        setHasApplied(hasUserApplied)
      }
    } catch (error) {
      console.error('지원 여부 확인 오류:', error)
    }
  }, [profile, applications])
  
  // 지원 여부 확인
  useEffect(() => {
    checkIfApplied()
  }, [checkIfApplied])

  // 프로젝트 데이터 가져오기
  const fetchProject = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/projects/${params.id}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '프로젝트를 불러오는데 실패했습니다.')
      }
      
      setProject(result.data)
    } catch (error) {
      console.error('프로젝트 로딩 오류:', error)
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : '프로젝트를 불러오는데 실패했습니다.',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 지원서 목록 가져오기
  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/applications?project_id=${params.id}`)
      const result = await response.json()
      
      if (result.success) {
        setApplications(result.data)
      }
    } catch (error) {
      console.error('지원서 목록 로딩 오류:', error)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchProject()
      fetchApplications()
    }
  }, [params.id])

  const handleApply = async () => {
    console.log('🔍 handleApply 호출됨')
    console.log('🔍 User:', user)
    console.log('🔍 Profile:', profile)
    console.log('🔍 isAuthenticated:', isAuthenticated)
    
    if (!user) {
      console.log('❌ 로그인되지 않음, 로그인 페이지로 이동')
      router.push('/login')
      return
    }

    if (!profile) {
      console.log('❌ Profile이 없음')
      toast({
        title: "지원 불가",
        description: "프로필을 완성한 후 지원할 수 있습니다.",
        variant: "destructive"
      })
      return
    }

    if (profile.user_type !== 'instructor') {
      console.log('❌ 강사가 아님:', profile.user_type)
      toast({
        title: "지원 불가",
        description: "강사 계정으로만 프로젝트에 지원할 수 있습니다.",
        variant: "destructive"
      })
      return
    }

    if (!profile.is_verified) {
      console.log('❌ 인증되지 않음')
      toast({
        title: "지원 불가",
        description: "계정 인증이 완료된 후 지원할 수 있습니다.",
        variant: "destructive"
      })
      return
    }

    if (hasApplied) {
      console.log('❌ 이미 지원함')
      toast({
        title: "지원 불가",
        description: "이미 이 프로젝트에 지원하셨습니다.",
        variant: "destructive"
      })
      return
    }

    // 강사 ID 가져오기
    let instructorId = null
    try {
      console.log('🔍 강사 프로필 API 호출:', `/api/instructors/profile/${profile.id}`)
      const instructorResponse = await fetch(`/api/instructors/profile/${profile.id}`)
      console.log('🔍 강사 프로필 API 응답 상태:', instructorResponse.status)
      
      const instructorResult = await instructorResponse.json()
      console.log('🔍 강사 프로필 API 결과:', instructorResult)
      
      if (instructorResult.success && instructorResult.data) {
        instructorId = instructorResult.data.id
        console.log('✅ 강사 ID 획득:', instructorId)
      } else {
        console.error('❌ 강사 프로필을 찾을 수 없음:', instructorResult)
        toast({
          title: "지원 불가",
          description: "강사 프로필을 찾을 수 없습니다.",
          variant: "destructive"
        })
        return
      }
    } catch (error) {
      console.error('❌ 강사 프로필 조회 오류:', error)
      toast({
        title: "지원 불가",
        description: "강사 프로필을 가져오는데 실패했습니다.",
        variant: "destructive"
      })
      return
    }

    if (!applicationForm.proposal.trim() || !applicationForm.proposed_rate.trim()) {
      toast({
        title: "입력 오류",
        description: "제안서와 제안 금액을 모두 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: params.id,
          instructor_id: instructorId,
          proposal: applicationForm.proposal,
          proposed_rate: applicationForm.proposed_rate
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '지원서 제출에 실패했습니다.')
      }

      // 성공 알럿 표시
      alert('지원서가 성공적으로 저장되었습니다!')
      
      toast({
        title: "지원 완료",
        description: "지원서가 성공적으로 제출되었습니다.",
      })

      setShowApplyDialog(false)
      setApplicationForm({ proposal: '', proposed_rate: '' })
      
      // 지원서 목록 새로고침 및 지원 여부 업데이트
      fetchApplications()
      setHasApplied(true)
      
    } catch (error) {
      console.error('지원서 제출 실패:', error)
      toast({
        title: "제출 실패",
        description: error instanceof Error ? error.message : '지원서 제출에 실패했습니다.',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '강의':
        return <BookOpen className="w-4 h-4" />
      case '마케팅':
        return <Megaphone className="w-4 h-4" />
      case '디자인':
        return <Palette className="w-4 h-4" />
      case '개발':
        return <Code className="w-4 h-4" />
      case '비즈니스':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default" className="bg-green-500">모집중</Badge>
      case 'in_progress':
        return <Badge variant="secondary">진행중</Badge>
      case 'completed':
        return <Badge variant="outline">완료</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '강의':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case '마케팅':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case '디자인':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
      case '개발':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case '비즈니스':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle>프로젝트를 찾을 수 없습니다</CardTitle>
              <CardDescription>
                요청하신 프로젝트가 존재하지 않거나 삭제되었습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/projects">
                <Button>프로젝트 목록으로</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 프로젝트 헤더 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getCategoryColor(project.category)} flex items-center gap-1`}>
                      {getCategoryIcon(project.category)}
                      {project.category}
                    </Badge>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      공유
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="w-4 h-4 mr-2" />
                      저장
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                <CardDescription className="text-base">
                  {project.company_name} • {new Date(project.created_at).toLocaleDateString('ko-KR')}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* 프로젝트 설명 */}
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line">{project.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* 요구사항 */}
            <Card>
              <CardHeader>
                <CardTitle>요구사항</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.requirements.map((req, index) => (
                    <Badge key={index} variant="outline">
                      {req}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 추가 정보 */}
            {project.additional_info && (
              <Card>
                <CardHeader>
                  <CardTitle>추가 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-gray-500">
                    {project.additional_info}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 지원자 목록 - 관리자만 볼 수 있음 */}
            {isAdmin && applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    지원자 ({applications.length}명)
                    <Badge variant="secondary" className="text-xs">관리자 전용</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={application.instructor_avatar || undefined} />
                              <AvatarFallback>
                                {application.instructor_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{application.instructor_name}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(application.submitted_at).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {application.proposed_rate.toLocaleString()}원
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {application.status === 'pending' ? '검토중' : 
                               application.status === 'accepted' ? '선택됨' : '거부됨'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 text-gray-500 line-clamp-2">
                          {application.proposal}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 일반 사용자를 위한 지원자 수 표시 */}
            {!isAdmin && applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>지원 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-lg font-medium text-gray-600 text-gray-500">
                      현재 {applications.length}명이 지원했습니다
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      지원자 상세 정보는 관리자만 확인할 수 있습니다.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 기업 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기업 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={project.company_avatar || undefined} />
                    <AvatarFallback>
                      {project.company_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{project.company_name}</h3>
                    <p className="text-sm text-gray-600 text-gray-500">
                      프로젝트 등록 기업
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-gray-500">
                  {project.company_description}
                </p>
              </CardContent>
            </Card>

            {/* 프로젝트 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">예산</p>
                      <p className="font-medium">{project.budget_range}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">진행 기간</p>
                      <p className="font-medium">{project.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">진행 지역</p>
                      <p className="font-medium">{project.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">지원자</p>
                      <p className="font-medium">
                        {isAdmin ? (
                          <span className="text-blue-600 font-semibold">
                            {applications.length}명 (상세보기 가능)
                          </span>
                        ) : (
                          <span className="text-gray-600">
                            {applications.length}명
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {project.deadline && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-500">지원 마감</p>
                        <p className="font-medium">
                          {new Date(project.deadline).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 지원하기 */}
            {project.status === 'open' && (
              <Card>
                <CardHeader>
                  <CardTitle>지원하기</CardTitle>
                  <CardDescription>
                    {!user ? (
                      '로그인 후 프로젝트에 지원할 수 있습니다.'
                    ) : !profile ? (
                      '프로필을 완성한 후 지원할 수 있습니다.'
                    ) : profile.user_type !== 'instructor' ? (
                      '강사 계정으로만 프로젝트에 지원할 수 있습니다.'
                    ) : !profile.is_verified ? (
                      '계정 인증이 완료된 후 지원할 수 있습니다.'
                    ) : hasApplied ? (
                      '이미 이 프로젝트에 지원하셨습니다.'
                    ) : (
                      '이 프로젝트에 지원하고 싶으시다면 버튼을 클릭하세요.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!user ? (
                    <Button 
                      className="w-full bg-gray-400 cursor-not-allowed" 
                      disabled
                      onClick={() => router.push('/login')}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      로그인 후 지원하기
                    </Button>
                  ) : !profile ? (
                    <Button 
                      className="w-full bg-gray-400 cursor-not-allowed" 
                      disabled
                      onClick={() => router.push('/profile/setup')}
                    >
                      <User className="w-4 h-4 mr-2" />
                      프로필 완성 후 지원하기
                    </Button>
                  ) : profile.user_type !== 'instructor' ? (
                    <Button 
                      className="w-full bg-gray-400 cursor-not-allowed" 
                      disabled
                    >
                      <X className="w-4 h-4 mr-2" />
                      강사 계정만 지원 가능
                    </Button>
                  ) : !profile.is_verified ? (
                    <Button 
                      className="w-full bg-gray-400 cursor-not-allowed" 
                      disabled
                      onClick={() => router.push('/profile/verification')}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      인증 완료 후 지원하기
                    </Button>
                  ) : hasApplied ? (
                    <Button 
                      className="w-full bg-gray-400 cursor-not-allowed" 
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      이미 지원했습니다
                    </Button>
                  ) : (
                    <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <Send className="w-4 h-4 mr-2" />
                          지원하기
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>프로젝트 지원</DialogTitle>
                          <DialogDescription>
                            프로젝트에 대한 제안서를 작성해주세요.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="proposal">제안서 *</Label>
                            <Textarea
                              id="proposal"
                              value={applicationForm.proposal}
                              onChange={(e) => setApplicationForm({...applicationForm, proposal: e.target.value})}
                              placeholder="프로젝트에 대한 제안과 본인의 경험을 설명해주세요..."
                              rows={6}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="proposed_rate">제안 금액 (원) *</Label>
                            <Input
                              id="proposed_rate"
                              type="number"
                              value={applicationForm.proposed_rate}
                              onChange={(e) => setApplicationForm({...applicationForm, proposed_rate: e.target.value})}
                              placeholder="예: 400000"
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                              취소
                            </Button>
                            <Button onClick={handleApply} disabled={isSubmitting}>
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  제출 중...
                                </>
                              ) : (
                                '지원서 제출'
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
