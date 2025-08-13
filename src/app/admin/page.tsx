'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardStats } from '@/lib/auth'
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

  // 관리자 권한 확인
  const isAdmin = profile?.user_type === 'admin' || user?.email === 'admin@test.com'

  // 대시보드 통계 데이터 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      if (isAdmin) {
        try {
          console.log('📊 Fetching dashboard stats...')
          const dashboardStats = await getDashboardStats()
          setStats(dashboardStats)
          console.log('✅ Dashboard stats loaded:', dashboardStats)
        } catch (error) {
          console.error('❌ Error loading dashboard stats:', error)
        } finally {
          setStatsLoading(false)
        }
      }
    }

    fetchStats()
  }, [isAdmin])

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            관리자 대시보드
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            강사온스쿨 플랫폼 관리 및 모니터링
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 강사 수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.totalInstructors
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? '로딩 중...' : `+${stats.recentInstructors} from last month`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 기업 수</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.totalCompanies
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? '로딩 중...' : `+${stats.recentCompanies} from last month`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 프로필</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.totalProfiles
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? '로딩 중...' : '전체 사용자 프로필'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기 중인 검증</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.pendingVerifications
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? '로딩 중...' : '검토 필요'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인된 검증</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stats.approvedVerifications
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? '로딩 중...' : `총 ${stats.totalVerifications}개 중`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 관리 기능 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                강사 관리
              </CardTitle>
              <CardDescription>
                등록된 강사들을 관리하고 검토합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>승인 대기</span>
                <Badge variant="secondary">
                  {statsLoading ? '...' : stats.pendingVerifications}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>활성 강사</span>
                <Badge variant="default">
                  {statsLoading ? '...' : stats.totalInstructors}
                </Badge>
              </div>
              <Link href="/admin/instructors">
                <Button className="w-full" variant="outline">
                  강사 관리하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                프로필 검증
              </CardTitle>
              <CardDescription>
                강사 및 기업 프로필 검증 요청을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>대기중</span>
                <Badge variant="secondary">
                  {statsLoading ? '...' : stats.pendingVerifications}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>승인됨</span>
                <Badge variant="default">
                  {statsLoading ? '...' : stats.approvedVerifications}
                </Badge>
              </div>
              <Link href="/admin/verification">
                <Button className="w-full" variant="outline">
                  검증 관리하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                기업 관리
              </CardTitle>
              <CardDescription>
                등록된 기업들을 관리하고 검토합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>승인 대기</span>
                <Badge variant="secondary">
                  {statsLoading ? '...' : '0'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>활성 기업</span>
                <Badge variant="default">
                  {statsLoading ? '...' : stats.totalCompanies}
                </Badge>
              </div>
              <Link href="/admin/companies">
                <Button className="w-full" variant="outline">
                  기업 관리하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                프로젝트 관리
              </CardTitle>
              <CardDescription>
                진행 중인 프로젝트들을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>진행 중</span>
                <Badge variant="default">
                  {statsLoading ? '...' : stats.inProgressProjects}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>완료됨</span>
                <Badge variant="secondary">
                  {statsLoading ? '...' : stats.completedProjects}
                </Badge>
              </div>
              <Link href="/admin/projects">
                <Button className="w-full" variant="outline">
                  프로젝트 관리하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                문서 검토
              </CardTitle>
              <CardDescription>
                업로드된 문서들을 검토하고 승인/거부를 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>검토 대기</span>
                <Badge variant="secondary">
                  {statsLoading ? '...' : stats.pendingDocuments}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>승인됨</span>
                <Badge variant="default">
                  {statsLoading ? '...' : stats.approvedDocuments}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>거부됨</span>
                <Badge variant="destructive">
                  {statsLoading ? '...' : stats.rejectedDocuments}
                </Badge>
              </div>
              <Link href="/admin/documents">
                <Button className="w-full" variant="outline">
                  문서 검토하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                공지사항 관리
              </CardTitle>
              <CardDescription>
                공지사항을 작성하고 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>전체 공지사항</span>
                <Badge variant="secondary">
                  {statsLoading ? '...' : stats.totalAnnouncements}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>발행됨</span>
                <Badge variant="default">
                  {statsLoading ? '...' : stats.publishedAnnouncements}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>임시저장</span>
                <Badge variant="outline">
                  {statsLoading ? '...' : stats.draftAnnouncements}
                </Badge>
              </div>
              <Link href="/admin/announcements">
                <Button className="w-full" variant="outline">
                  공지사항 관리하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 최근 활동 */}
        <div className="mt-8">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
