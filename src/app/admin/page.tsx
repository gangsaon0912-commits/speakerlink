'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardStats } from '@/lib/auth'
import { useDocumentStats } from '@/lib/hooks/useDocuments'
import { Users, Building2, FileText, AlertCircle, CheckCircle, Upload, Bell, Shield } from 'lucide-react'
import Link from 'next/link'
import { RecentActivity } from '@/components/RecentActivity'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading } = useAuth()
  const [stats, setStats] = useState({
    totalInstructors: 0,
    totalCompanies: 0,
    totalProfiles: 0,
    pendingVerifications: 0,
    totalVerifications: 0,
    approvedVerifications: 0,
    recentInstructors: 0,
    recentCompanies: 0,
    totalProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    totalAnnouncements: 0,
    publishedAnnouncements: 0,
    draftAnnouncements: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  
  // 문서 통계를 별도로 가져오기
  const { data: documentStats } = useDocumentStats()

  // 관리자 권한 확인
  const isAdmin = profile?.user_type === 'admin' || user?.email === 'admin@test.com'

  // 대시보드 통계 데이터 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      if (isAdmin) {
        try {
          console.log('📊 Fetching dashboard stats...')
          const dashboardStats = await getDashboardStats()
          
          // 문서 통계를 API에서 가져온 데이터로 교체
          const updatedStats = {
            ...dashboardStats,
            totalDocuments: documentStats?.total || 0,
            pendingDocuments: documentStats?.pending || 0,
            approvedDocuments: documentStats?.approved || 0,
            rejectedDocuments: documentStats?.rejected || 0
          }
          
          setStats(updatedStats)
          console.log('✅ Dashboard stats loaded:', updatedStats)
        } catch (error) {
          console.error('❌ Error loading dashboard stats:', error)
        } finally {
          setStatsLoading(false)
        }
      }
    }

    fetchStats()
  }, [isAdmin, documentStats])

  // 디버깅 정보
  console.log('Admin Dashboard State:', {
    loading,
    user: user?.email,
    isAuthenticated,
    isAdmin,
    profile,
    stats,
    statsLoading
  })

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트 (useEffect를 최상위에서 처리)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Redirecting to login page')
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우 리다이렉트 중 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            관리자 대시보드
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            강사온스쿨 플랫폼의 전체 현황을 한눈에 확인하고 관리하세요
          </p>
        </div>

        {/* 통계 카드 섹션 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            플랫폼 현황
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-sm font-medium text-gray-700">총 강사 수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    stats.totalInstructors
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {statsLoading ? '로딩 중...' : `최근 ${stats.recentInstructors}명 추가`}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-sm font-medium text-gray-700">총 기업 수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    stats.totalCompanies
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {statsLoading ? '로딩 중...' : `최근 ${stats.recentCompanies}개사 추가`}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-sm font-medium text-gray-700">총 프로필</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    stats.totalProfiles
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {statsLoading ? '로딩 중...' : '전체 사용자 프로필'}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <CardTitle className="text-sm font-medium text-gray-700">대기 중인 검증</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    stats.pendingVerifications
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {statsLoading ? '로딩 중...' : '검토 필요'}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <CardTitle className="text-sm font-medium text-gray-700">승인된 검증</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {statsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    stats.approvedVerifications
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {statsLoading ? '로딩 중...' : `총 ${stats.totalVerifications}개 중`}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 관리 기능 섹션 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            관리 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold">강사 관리</CardTitle>
                <CardDescription className="text-center">
                  등록된 강사들을 관리하고 검토합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">승인 대기</span>
                    <Badge variant="secondary" className="font-semibold">
                      {statsLoading ? '...' : stats.pendingVerifications}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">활성 강사</span>
                    <Badge variant="default" className="font-semibold">
                      {statsLoading ? '...' : stats.totalInstructors}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/admin/instructors">
                    <Button className="w-full" variant="outline">
                      강사 관리하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold">프로필 검증</CardTitle>
                <CardDescription className="text-center">
                  강사 및 기업 프로필 검증 요청을 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">대기중</span>
                    <Badge variant="secondary" className="font-semibold">
                      {statsLoading ? '...' : stats.pendingVerifications}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">승인됨</span>
                    <Badge variant="default" className="font-semibold">
                      {statsLoading ? '...' : stats.approvedVerifications}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/admin/verification">
                    <Button className="w-full" variant="outline">
                      검증 관리하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold">기업 관리</CardTitle>
                <CardDescription className="text-center">
                  등록된 기업들을 관리하고 검토합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">승인 대기</span>
                    <Badge variant="secondary" className="font-semibold">
                      {statsLoading ? '...' : '0'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">활성 기업</span>
                    <Badge variant="default" className="font-semibold">
                      {statsLoading ? '...' : stats.totalCompanies}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/admin/companies">
                    <Button className="w-full" variant="outline">
                      기업 관리하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold">강사공고 관리</CardTitle>
                <CardDescription className="text-center">
                  진행 중인 강사공고들을 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">진행 중</span>
                    <Badge variant="default" className="font-semibold">
                      {statsLoading ? '...' : stats.inProgressProjects}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">완료됨</span>
                    <Badge variant="secondary" className="font-semibold">
                      {statsLoading ? '...' : stats.completedProjects}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/admin/projects">
                    <Button className="w-full" variant="outline">
                      강사공고 관리하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold">문서 검토</CardTitle>
                <CardDescription className="text-center">
                  업로드된 문서들을 검토하고 승인/거부를 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">검토 대기</span>
                    <Badge variant="secondary" className="font-semibold">
                      {statsLoading ? '...' : stats.pendingDocuments}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">승인됨</span>
                    <Badge variant="default" className="font-semibold">
                      {statsLoading ? '...' : stats.approvedDocuments}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">거부됨</span>
                    <Badge variant="destructive" className="font-semibold">
                      {statsLoading ? '...' : stats.rejectedDocuments}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/admin/documents">
                    <Button className="w-full" variant="outline">
                      문서 검토하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Bell className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold">공지사항 관리</CardTitle>
                <CardDescription className="text-center">
                  공지사항을 작성하고 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">전체 공지사항</span>
                    <Badge variant="secondary" className="font-semibold">
                      {statsLoading ? '...' : stats.totalAnnouncements}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">발행됨</span>
                    <Badge variant="default" className="font-semibold">
                      {statsLoading ? '...' : stats.publishedAnnouncements}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">임시저장</span>
                    <Badge variant="outline" className="font-semibold">
                      {statsLoading ? '...' : stats.draftAnnouncements}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/admin/announcements">
                    <Button className="w-full" variant="outline">
                      공지사항 관리하기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 최근 활동 섹션 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            최근 활동
          </h2>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
