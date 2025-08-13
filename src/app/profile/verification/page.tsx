'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getVerificationRequest, submitVerificationRequest, getInstructorProfile } from '@/lib/auth'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Send,
  FileText,
  ArrowLeft
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'

interface VerificationRequest {
  id: string
  user_id: string
  user_type: 'instructor' | 'company'
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  profile_data: any
}

export default function VerificationStatusPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResubmitDialog, setShowResubmitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, loading, router])

  // 검증 요청 데이터 로드
  useEffect(() => {
    const loadVerificationRequest = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        console.log('📋 Loading verification request for user:', user.id)
        
        const result = await getVerificationRequest(user.id)
        
        if (result.success && result.data) {
          console.log('✅ Verification request loaded:', result.data)
          setVerificationRequest(result.data)
        } else {
          console.log('⚠️ No verification request found')
          setVerificationRequest(null)
        }
      } catch (error) {
        console.error('❌ Error loading verification request:', error)
        setVerificationRequest(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && user?.id) {
      loadVerificationRequest()
    }
  }, [isAuthenticated, user?.id])

  const getStatusInfo = () => {
    if (!verificationRequest) {
      return {
        status: 'not_submitted',
        title: '검증 요청을 제출하지 않았습니다',
        description: '프로필을 완성하고 검증을 요청해주세요.',
        icon: <FileText className="w-8 h-8 text-gray-400" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-800'
      }
    }

    switch (verificationRequest.status) {
      case 'pending':
        return {
          status: 'pending',
          title: '검증 대기중',
          description: '관리자가 프로필을 검토하고 있습니다. 보통 1-3일 내에 완료됩니다.',
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        }
      case 'approved':
        return {
          status: 'approved',
          title: '검증 완료',
          description: '프로필이 승인되었습니다. 이제 모든 기능을 사용할 수 있습니다.',
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        }
      case 'rejected':
        return {
          status: 'rejected',
          title: '검증 거부됨',
          description: verificationRequest.rejection_reason || '프로필이 거부되었습니다. 수정 후 재제출해주세요.',
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        }
      default:
        return {
          status: 'unknown',
          title: '알 수 없는 상태',
          description: '검증 상태를 확인할 수 없습니다.',
          icon: <AlertCircle className="w-8 h-8 text-gray-400" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-800'
        }
    }
  }

  const statusInfo = getStatusInfo()

  const handleSubmitVerification = async () => {
    if (!user?.id) return

    try {
      setIsSubmitting(true)
      console.log('📋 Submitting verification request...')
      
      // 강사 프로필 데이터 가져오기
      const profileResult = await getInstructorProfile(user.id)
      
      if (!profileResult.success || !profileResult.data) {
        alert('프로필 정보를 가져올 수 없습니다. 프로필을 먼저 완성해주세요.')
        return
      }

      const result = await submitVerificationRequest(user.id, 'instructor', profileResult.data)
      
      if (result.success) {
        console.log('✅ Verification request submitted successfully')
        alert('검증 요청이 성공적으로 제출되었습니다!')
        setShowResubmitDialog(false)
        
        // 페이지 새로고침
        window.location.reload()
      } else {
        console.error('❌ Failed to submit verification request:', result.error)
        alert(`검증 요청 제출 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('❌ Error submitting verification request:', error)
      alert('검증 요청 제출 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRefresh = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const result = await getVerificationRequest(user.id)
      
      if (result.success && result.data) {
        setVerificationRequest(result.data)
      } else {
        setVerificationRequest(null)
      }
    } catch (error) {
      console.error('❌ Error refreshing verification request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 로딩 중이면 로딩 화면 표시
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">검증 상태 확인 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우 null 반환 (리다이렉트는 useEffect에서 처리)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                검증 상태
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                프로필 검증 진행 상황을 확인하세요.
              </p>
            </div>
            <Link href="/profile/instructor">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                프로필로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 검증 상태 카드 */}
          <div className="lg:col-span-2">
            <Card className={`${statusInfo.bgColor} border-0`}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  {statusInfo.icon}
                  <div>
                    <CardTitle className={statusInfo.color}>
                      {statusInfo.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {statusInfo.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationRequest && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">제출일:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(verificationRequest.submitted_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {verificationRequest.reviewed_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">검토일:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(verificationRequest.reviewed_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    )}
                    {verificationRequest.rejection_reason && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">거부 사유</h4>
                        <p className="text-sm text-red-600 dark:text-red-300">
                          {verificationRequest.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    새로고침
                  </Button>
                  
                  {statusInfo.status === 'rejected' && (
                    <Dialog open={showResubmitDialog} onOpenChange={setShowResubmitDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Send className="w-4 h-4 mr-2" />
                          재제출
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>검증 재제출</DialogTitle>
                          <DialogDescription>
                            프로필을 수정하고 다시 검증을 요청하시겠습니까?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            거부 사유를 확인하고 프로필을 수정한 후 재제출해주세요.
                          </p>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowResubmitDialog(false)}
                            >
                              취소
                            </Button>
                            <Button 
                              onClick={handleSubmitVerification}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? '제출 중...' : '재제출'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {statusInfo.status === 'not_submitted' && (
                    <Dialog open={showResubmitDialog} onOpenChange={setShowResubmitDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Send className="w-4 h-4 mr-2" />
                          검증 신청
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>검증 신청</DialogTitle>
                          <DialogDescription>
                            현재 프로필로 검증을 요청하시겠습니까?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            프로필이 완성되었는지 확인하고 검증을 요청해주세요.
                          </p>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowResubmitDialog(false)}
                            >
                              취소
                            </Button>
                            <Button 
                              onClick={handleSubmitVerification}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? '제출 중...' : '검증 신청'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 검증 가이드 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>검증 가이드</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">프로필 완성</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        모든 필수 정보를 입력하고 프로필을 완성하세요.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">검증 요청</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        프로필 편집 페이지에서 검증을 요청하세요.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">검토 대기</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        관리자가 프로필을 검토합니다 (1-3일 소요).
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">승인 완료</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        승인되면 모든 기능을 사용할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>검증 기준</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">강사</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 경력 및 학력 정보 확인</li>
                    <li>• 전문 분야 명시</li>
                    <li>• 자기소개 작성</li>
                    <li>• 연락처 정보 확인</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">기업</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 회사 정보 완성</li>
                    <li>• 연락처 정보 확인</li>
                    <li>• 회사 소개 작성</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>문의하기</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  검증 과정에서 궁금한 점이 있으시면 문의해주세요.
                </p>
                <Button variant="outline" className="w-full">
                  고객센터 문의
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
