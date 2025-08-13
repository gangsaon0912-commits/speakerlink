'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getVerificationRequests, approveVerificationRequest, rejectVerificationRequest } from '@/lib/auth'
import { CheckCircle, XCircle, Clock, User, Building2, Eye, AlertCircle, ArrowLeft } from 'lucide-react'
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
  profile_data: {
    full_name?: string
    email?: string
    company_name?: string
    industry?: string
    bio?: string
    expertise?: string[]
    documents?: string[]
  }
  user_profile?: {
    full_name: string
    email: string
    user_type: string
  }
}

export default function AdminVerificationPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [isProcessing, setIsProcessing] = useState(false)

  // 관리자 권한 확인
  const isAdmin = user?.email === 'admin@test.com'

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Redirecting to login page')
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // 실제 데이터 로드 (관리자인 경우에만)
  useEffect(() => {
    console.log('🔍 Verification page useEffect triggered:', { isAuthenticated, isAdmin, loading })
    
    if (!loading && isAuthenticated && isAdmin) {
      console.log('✅ Loading verification requests...')
      const loadVerificationRequests = async () => {
        try {
          console.log('📋 Loading verification requests from database...')
          const result = await getVerificationRequests()
          
          if (result.data) {
            console.log('✅ Verification requests loaded successfully:', result.data.length)
            // 데이터베이스에서 가져온 데이터를 UI 형식에 맞게 변환
            const formattedRequests: VerificationRequest[] = result.data.map((request: any) => ({
              id: request.id,
              user_id: request.user_id,
              user_type: request.user_type,
              status: request.status,
              submitted_at: request.submitted_at,
              reviewed_at: request.reviewed_at,
              reviewed_by: request.reviewed_by,
              rejection_reason: request.rejection_reason,
              profile_data: request.profile_data || {},
              user_profile: request.user_profile || {
                full_name: '이름 없음',
                email: '이메일 없음',
                user_type: request.user_type
              }
            }))
            setVerificationRequests(formattedRequests)
          } else {
            console.log('❌ No verification requests found in database')
            setVerificationRequests([])
          }
        } catch (error) {
          console.error('❌ Error loading verification requests:', error)
          setVerificationRequests([])
        } finally {
          setIsLoading(false)
        }
      }

      loadVerificationRequests()
    } else if (!loading && !isAuthenticated) {
      console.log('❌ User not authenticated, setting loading to false')
      setIsLoading(false)
    } else if (loading) {
      console.log('⏳ Still loading, waiting...')
    }
  }, [isAuthenticated, isAdmin, loading])

  // 로딩 중이면 로딩 화면 표시
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {loading ? '인증 확인 중...' : '데이터 로딩 중...'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              잠시만 기다려주세요
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우 리다이렉트 중 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">리다이렉트 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 관리자가 아닌 경우 접근 제한
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle>접근 권한이 없습니다</CardTitle>
              <CardDescription>
                관리자 권한이 필요합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/">
                <Button>홈으로 돌아가기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleViewDetails = (request: VerificationRequest) => {
    setSelectedRequest(request)
    setIsDetailModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsDetailModalOpen(false)
    setSelectedRequest(null)
  }

  const handleApprove = async (requestId: string) => {
    try {
      console.log('Approving request:', requestId)
      setIsProcessing(true)
      
      const result = await approveVerificationRequest(requestId, user?.email || '')
      
      if (result.success) {
        console.log('Verification request approved successfully')
        
        // 데이터베이스에서 최신 데이터를 다시 가져와서 UI 업데이트
        const refreshResult = await getVerificationRequests()
        if (refreshResult.data) {
          const formattedRequests: VerificationRequest[] = refreshResult.data.map((request: any) => ({
            id: request.id,
            user_id: request.user_id,
            user_type: request.user_type,
            status: request.status,
            submitted_at: request.submitted_at,
            reviewed_at: request.reviewed_at,
            reviewed_by: request.reviewed_by,
            rejection_reason: request.rejection_reason,
            profile_data: request.profile_data || {},
            user_profile: request.user_profile || {
              full_name: '이름 없음',
              email: '이메일 없음',
              user_type: request.user_type
            }
          }))
          setVerificationRequests(formattedRequests)
        }
        
        alert('검증 요청이 승인되었습니다!')
      } else {
        console.error('Failed to approve verification request:', result.error?.message)
        alert(`승인 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('Error approving verification request:', error)
      alert('승인 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
      handleCloseModal()
    }
  }

  const handleReject = async (requestId: string, reason: string) => {
    try {
      console.log('Rejecting request:', requestId, 'Reason:', reason)
      setIsProcessing(true)
      
      const result = await rejectVerificationRequest(requestId, user?.email || '', reason)
      
      if (result.success) {
        console.log('Verification request rejected successfully')
        
        // 데이터베이스에서 최신 데이터를 다시 가져와서 UI 업데이트
        const refreshResult = await getVerificationRequests()
        if (refreshResult.data) {
          const formattedRequests: VerificationRequest[] = refreshResult.data.map((request: any) => ({
            id: request.id,
            user_id: request.user_id,
            user_type: request.user_type,
            status: request.status,
            submitted_at: request.submitted_at,
            reviewed_at: request.reviewed_at,
            reviewed_by: request.reviewed_by,
            rejection_reason: request.rejection_reason,
            profile_data: request.profile_data || {},
            user_profile: request.user_profile || {
              full_name: '이름 없음',
              email: '이메일 없음',
              user_type: request.user_type
            }
          }))
          setVerificationRequests(formattedRequests)
        }
        
        alert('검증 요청이 거부되었습니다!')
      } else {
        console.error('Failed to reject verification request:', result.error?.message)
        alert(`거부 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('Error rejecting verification request:', error)
      alert('거부 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
      handleCloseModal()
    }
  }

  const filteredRequests = verificationRequests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">승인됨</Badge>
      case 'rejected':
        return <Badge variant="destructive">거부됨</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  const getStatusCount = (status: string) => {
    return verificationRequests.filter(req => req.status === status).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                프로필 검증 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                강사 및 기업 프로필 검증 요청을 관리합니다.
              </p>
            </div>
            <Button onClick={() => router.push('/admin')} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 요청</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verificationRequests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getStatusCount('pending')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인됨</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getStatusCount('approved')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">거부됨</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getStatusCount('rejected')}</div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 버튼 */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              대기중
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
            >
              승인됨
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
            >
              거부됨
            </Button>
          </div>
        </div>

        {/* 검증 요청 목록 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">검증 요청이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {request.user_type === 'instructor' ? (
                          <User className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Building2 className="w-5 h-5 text-green-500" />
                        )}
                        <span className="font-medium">
                          {request.user_profile?.full_name || '이름 없음'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {request.user_profile?.email}
                      </span>
                      <Badge variant="outline">
                        {request.user_type === 'instructor' ? '강사' : '기업'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {new Date(request.submitted_at).toLocaleDateString('ko-KR')}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        상세보기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">검증 요청 상세</h2>
                <Button variant="ghost" onClick={handleCloseModal}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h3 className="font-semibold mb-3">기본 정보</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">이름:</span>
                      <span className="ml-2">{selectedRequest.user_profile?.full_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">이메일:</span>
                      <span className="ml-2">{selectedRequest.user_profile?.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">유형:</span>
                      <span className="ml-2">
                        {selectedRequest.user_type === 'instructor' ? '강사' : '기업'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">상태:</span>
                      <span className="ml-2">{getStatusBadge(selectedRequest.status)}</span>
                    </div>
                  </div>
                </div>

                {/* 프로필 데이터 */}
                <div>
                  <h3 className="font-semibold mb-3">프로필 정보</h3>
                  <div className="space-y-3 text-sm">
                    {selectedRequest.profile_data.bio && (
                      <div>
                        <span className="text-gray-500">자기소개:</span>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{selectedRequest.profile_data.bio}</p>
                      </div>
                    )}
                    
                    {selectedRequest.profile_data.expertise && selectedRequest.profile_data.expertise.length > 0 && (
                      <div>
                        <span className="text-gray-500">전문분야:</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedRequest.profile_data.expertise.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedRequest.profile_data.documents && selectedRequest.profile_data.documents.length > 0 && (
                      <div>
                        <span className="text-gray-500">첨부 문서:</span>
                        <div className="mt-1 space-y-1">
                          {selectedRequest.profile_data.documents.map((doc, index) => (
                            <div key={index} className="text-blue-600 hover:underline cursor-pointer">
                              📎 {doc}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 거부 사유 (거부된 경우) */}
                {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                  <div>
                    <h3 className="font-semibold mb-3 text-red-600">거부 사유</h3>
                    <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                      {selectedRequest.rejection_reason}
                    </p>
                  </div>
                )}

                {/* 액션 버튼 */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          처리 중...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          승인
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isProcessing}
                      onClick={() => {
                        const reason = prompt('거부 사유를 입력하세요:')
                        if (reason) {
                          handleReject(selectedRequest.id, reason)
                        }
                      }}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                          처리 중...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          거부
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
