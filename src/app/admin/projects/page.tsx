'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getAllProjects, getAllCompanies, getAllInstructors, updateProject, deleteProject } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Eye, Edit, Trash2, Building, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  description: string
  company_id: string
  company?: {
    company_name: string
  }
  instructor_id?: string
  instructor?: {
    name: string
  }
  status: string
  budget_range?: string
  duration?: string
  location?: string
  created_at: string
}

interface Company {
  id: string
  company_name: string
}

interface Instructor {
  id: string
  name: string
}

export default function AdminProjectsPage() {
  const { user, profile, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    console.log('🔍 Projects page - Auth state:', { user, profile, isAuthenticated, loading })
    
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (!loading && isAuthenticated && user?.email !== 'admin@test.com') {
      router.push('/')
      return
    }
    
    if (isAuthenticated && user?.email === 'admin@test.com') {
      loadData()
    }
  }, [user, profile, isAuthenticated, loading, router])

  const loadData = async () => {
    try {
      setDataLoading(true)
      console.log('📋 Loading projects data...')
      
      const [projectsResult, companiesResult, instructorsResult] = await Promise.all([
        getAllProjects(),
        getAllCompanies(),
        getAllInstructors()
      ])
      
      console.log('📋 Projects result:', projectsResult)
      console.log('📋 Companies result:', companiesResult)
      console.log('📋 Instructors result:', instructorsResult)
      
      if (projectsResult.success && projectsResult.data) {
        setProjects(projectsResult.data)
        console.log('📋 Projects loaded:', projectsResult.data.length)
      }
      
      if (companiesResult.success && companiesResult.data) {
        setCompanies(companiesResult.data)
        console.log('📋 Companies loaded:', companiesResult.data.length)
        console.log('📋 Companies data:', companiesResult.data)
      }
      
      if (instructorsResult.success && instructorsResult.data) {
        setInstructors(instructorsResult.data)
        console.log('📋 Instructors loaded:', instructorsResult.data.length)
      }
      
    } catch (error) {
      console.error('❌ Error loading data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'open': { label: '모집중', variant: 'default' as const },
      'in_progress': { label: '진행중', variant: 'secondary' as const },
      'completed': { label: '완료', variant: 'outline' as const },
      'cancelled': { label: '취소', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleViewProject = (project: Project) => {
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsEditModalOpen(true)
  }

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project)
    setIsDeleteModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingProject) return
    
    try {
      setSaving(true)
      console.log('📋 Saving project edit:', editingProject)
      
      const result = await updateProject({
        id: editingProject.id,
        title: editingProject.title,
        description: editingProject.description,
        company_id: editingProject.company_id,
        budget_range: editingProject.budget_range,
        duration: editingProject.duration,
        location: editingProject.location,
        status: editingProject.status
      })
      
      console.log('📋 Update result:', result)
      
      if (result.success) {
        // 프로젝트 목록 새로고침
        await loadData()
        setIsEditModalOpen(false)
        setEditingProject(null)
      } else {
        alert(`수정 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('❌ Error saving project:', error)
      alert('프로젝트 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingProject) return
    
    try {
      setDeleting(true)
      console.log('📋 Deleting project:', deletingProject.id)
      
      const result = await deleteProject(deletingProject.id)
      
      console.log('📋 Delete result:', result)
      
      if (result.success) {
        // 프로젝트 목록 새로고침
        await loadData()
        setIsDeleteModalOpen(false)
        setDeletingProject(null)
      } else {
        alert(`삭제 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('❌ Error deleting project:', error)
      alert('프로젝트 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.email !== 'admin@test.com') {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">프로젝트 관리</h1>
        <Link href="/admin/projects/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            새 프로젝트
          </Button>
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="프로젝트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="open">모집중</SelectItem>
            <SelectItem value="in_progress">진행중</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="cancelled">취소</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 프로젝트 목록 */}
      <div className="grid gap-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">프로젝트가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {project.company && (
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span>{project.company.company_name}</span>
                        </div>
                      )}
                      {project.instructor && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{project.instructor.name}</span>
                        </div>
                      )}
                      {project.budget_range && (
                        <span>예산: {project.budget_range}</span>
                      )}
                      {project.duration && (
                        <span>기간: {project.duration}</span>
                      )}
                      {project.location && (
                        <span>위치: {project.location}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProject(project)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProject(project)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 상세보기 모달 */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>프로젝트 상세보기</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">프로젝트 제목</Label>
                <p className="mt-1">{selectedProject.title}</p>
              </div>
              <div>
                <Label className="font-semibold">프로젝트 설명</Label>
                <p className="mt-1 whitespace-pre-wrap">{selectedProject.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">담당 기업</Label>
                  <p className="mt-1">{selectedProject.company?.company_name || '미지정'}</p>
                </div>
                <div>
                  <Label className="font-semibold">담당 강사</Label>
                  <p className="mt-1">{selectedProject.instructor?.name || '미지정'}</p>
                </div>
                <div>
                  <Label className="font-semibold">예산 범위</Label>
                  <p className="mt-1">{selectedProject.budget_range || '미지정'}</p>
                </div>
                <div>
                  <Label className="font-semibold">프로젝트 기간</Label>
                  <p className="mt-1">{selectedProject.duration || '미지정'}</p>
                </div>
                <div>
                  <Label className="font-semibold">프로젝트 위치</Label>
                  <p className="mt-1">{selectedProject.location || '미지정'}</p>
                </div>
                <div>
                  <Label className="font-semibold">프로젝트 상태</Label>
                  <div className="mt-1">{getStatusBadge(selectedProject.status)}</div>
                </div>
              </div>
              <div>
                <Label className="font-semibold">생성일</Label>
                <p className="mt-1">{new Date(selectedProject.created_at).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>프로젝트 수정</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">프로젝트 제목</Label>
                <Input
                  id="edit-title"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">프로젝트 설명</Label>
                <Textarea
                  id="edit-description"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-company">담당 기업</Label>
                <Select
                  value={editingProject.company_id}
                  onValueChange={(value) => setEditingProject({ ...editingProject, company_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="기업 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.length === 0 ? (
                      <SelectItem value="" disabled>
                        기업 데이터를 불러오는 중...
                      </SelectItem>
                    ) : (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.company_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-500 mt-1">
                  로드된 기업 수: {companies.length}개
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-budget">예산 범위</Label>
                  <Input
                    id="edit-budget"
                    value={editingProject.budget_range || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, budget_range: e.target.value })}
                    placeholder="예: 5000000-8000000"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-duration">프로젝트 기간</Label>
                  <Input
                    id="edit-duration"
                    value={editingProject.duration || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, duration: e.target.value })}
                    placeholder="예: 8주"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location">프로젝트 위치</Label>
                  <Input
                    id="edit-location"
                    value={editingProject.location || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                    placeholder="예: 서울"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">프로젝트 상태</Label>
                  <Select
                    value={editingProject.status}
                    onValueChange={(value) => setEditingProject({ ...editingProject, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">모집중</SelectItem>
                      <SelectItem value="in_progress">진행중</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                      <SelectItem value="cancelled">취소</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingProject(null)
                  }}
                >
                  취소
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로젝트 삭제</DialogTitle>
          </DialogHeader>
          {deletingProject && (
            <div className="space-y-4">
              <p>정말로 "{deletingProject.title}" 프로젝트를 삭제하시겠습니까?</p>
              <p className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다.</p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeletingProject(null)
                  }}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
