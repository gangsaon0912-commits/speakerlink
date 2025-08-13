'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/navigation'
import { Pagination } from '@/components/ui/pagination'
import { useAuthStore } from '@/lib/store'
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Building2,
  Plus,
  BookOpen,
  Megaphone,
  Code,
  Palette,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  requirements: string[]
  created_at: string
  applications_count: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // 프로젝트 데이터 가져오기
  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        category: categoryFilter === 'all' ? '' : categoryFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/projects?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '프로젝트를 불러오는데 실패했습니다.')
      }

      setProjects(result.data)
      setPagination(result.pagination)
    } catch (err) {
      console.error('프로젝트 로딩 오류:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 필터나 검색어가 변경될 때 페이지를 1로 리셋하고 데이터 다시 가져오기
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortOrder])

  // 페이지나 필터가 변경될 때 데이터 가져오기
  useEffect(() => {
    fetchProjects()
  }, [currentPage, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              프로젝트
            </h1>
            <p className="text-gray-600">
              다양한 분야의 프로젝트를 찾아보세요
              {pagination.total > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  (총 {pagination.total}개)
                </span>
              )}
            </p>
          </div>
            {user && (
              <Link href="/projects/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  프로젝트 등록
                </Button>
              </Link>
            )}
          </div>

        {/* 필터 및 검색 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-start">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="프로젝트 제목, 설명, 요구사항으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                <SelectItem value="강의">강의</SelectItem>
                <SelectItem value="마케팅">마케팅</SelectItem>
                <SelectItem value="디자인">디자인</SelectItem>
                <SelectItem value="개발">개발</SelectItem>
                <SelectItem value="비즈니스">비즈니스</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="open">모집중</SelectItem>
                <SelectItem value="in_progress">진행중</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-')
              setSortBy(newSortBy)
              setSortOrder(newSortOrder)
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">최신순</SelectItem>
                <SelectItem value="created_at-asc">오래된순</SelectItem>
                <SelectItem value="title-asc">제목순</SelectItem>
                <SelectItem value="applications_count-desc">지원자 많은순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">프로젝트를 불러오는 중...</span>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchProjects} variant="outline">
                다시 시도
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 프로젝트 목록 */}
        {!loading && !error && (
          <>
            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`${getCategoryColor(project.category)} flex items-center gap-1`}>
                        {getCategoryIcon(project.category)}
                        {project.category}
                      </Badge>
                      {getStatusBadge(project.status)}
                    </div>
                    <CardTitle className="text-lg">
                      <Link href={`/projects/${project.id}`} className="hover:text-blue-600">
                        {project.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{project.company_name}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{project.budget_range}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{project.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>{project.applications_count}명 지원</span>
                      </div>
                    </div>

                    {project.requirements && project.requirements.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">요구사항</h4>
                        <div className="flex flex-wrap gap-1">
                          {project.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {project.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.requirements.length - 3}개 더
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        {new Date(project.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm" variant="outline">
                          상세보기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
                <div className="text-center mt-4 text-sm text-gray-500">
                  {pagination.total}개 중 {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
                </div>
              </div>
            )}
          </>
        )}

        {/* 빈 상태 */}
        {!loading && !error && projects.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                검색 조건에 맞는 프로젝트가 없습니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
