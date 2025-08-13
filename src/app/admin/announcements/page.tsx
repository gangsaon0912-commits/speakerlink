'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, Announcement } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Eye, Edit, Trash2, ArrowLeft, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

export default function AdminAnnouncementsPage() {
  const { user, profile, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<{
    id: string
    title: string
    content: string
    is_published: boolean
    scheduledPublishDate: string
    scheduledPublishTime: string
  } | null>(null)
  const [creatingAnnouncement, setCreatingAnnouncement] = useState({
    title: '',
    content: '',
    category: 'general' as 'general' | 'important' | 'update' | 'maintenance',
    status: 'draft' as 'draft' | 'published',
    scheduledPublishDate: '',
    scheduledPublishTime: ''
  })
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    console.log('🔍 Announcements page - Auth state:', { user, profile, isAuthenticated, loading })
    
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
      console.log('📋 Loading announcements data...')
      
      const result = await getAllAnnouncements()
      console.log('📋 Announcements result:', result)
      
      if (result.success && result.data) {
        setAnnouncements(result.data)
      }
      
    } catch (error) {
      console.error('❌ Error loading data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && announcement.is_published) ||
                         (statusFilter === 'draft' && !announcement.is_published)
    return matchesSearch && matchesStatus
  })

  // 페이징 계산
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAnnouncements = filteredAnnouncements.slice(startIndex, endIndex)

  // 페이지 변경 시 검색/필터 초기화
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const getStatusBadge = (announcement: Announcement) => {
    if (announcement.is_published) {
      if (announcement.published_at) {
        const publishedAt = new Date(announcement.published_at)
        const now = new Date()
        
        // 예약 발행인지 확인 (발행 시간이 미래인 경우)
        if (publishedAt > now) {
          return <Badge variant="secondary">예약 발행</Badge>
        } else {
          return <Badge variant="default">발행됨</Badge>
        }
      } else {
        return <Badge variant="default">발행됨</Badge>
      }
    } else {
      return <Badge variant="outline">임시저장</Badge>
    }
  }

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setIsViewModalOpen(true)
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    // published_at에서 날짜와 시간 추출
    let scheduledPublishDate = ''
    let scheduledPublishTime = ''
    
    if (announcement.published_at) {
      const publishedAt = new Date(announcement.published_at)
      scheduledPublishDate = publishedAt.toISOString().split('T')[0]
      scheduledPublishTime = publishedAt.toTimeString().split(' ')[0].substring(0, 5)
    }
    
    setEditingAnnouncement({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      is_published: announcement.is_published,
      scheduledPublishDate,
      scheduledPublishTime
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteAnnouncement = (announcement: Announcement) => {
    setDeletingAnnouncement(announcement)
    setIsDeleteModalOpen(true)
  }

  const handleCreateAnnouncement = () => {
    setCreatingAnnouncement({
      title: '',
      content: '',
      category: 'general',
      status: 'draft',
      scheduledPublishDate: '',
      scheduledPublishTime: ''
    })
    setIsCreateModalOpen(true)
  }

  const handleSaveCreate = async () => {
    try {
      setCreating(true)
      console.log('📋 Creating announcement:', creatingAnnouncement)
      
      const result = await createAnnouncement(creatingAnnouncement)
      console.log('📋 Create result:', result)
      
      if (result.success) {
        await loadData()
        setIsCreateModalOpen(false)
        setCreatingAnnouncement({ title: '', content: '', category: 'general', status: 'draft', scheduledPublishDate: '', scheduledPublishTime: '' })
      } else {
        alert(`생성 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('❌ Error creating announcement:', error)
      alert('공지사항 생성 중 오류가 발생했습니다.')
    } finally {
      setCreating(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingAnnouncement) return
    
    try {
      setSaving(true)
      console.log('📋 Saving announcement edit:', editingAnnouncement)
      
      const result = await updateAnnouncement({
        id: editingAnnouncement.id,
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        status: editingAnnouncement.is_published ? 'published' : 'draft',
        scheduledPublishDate: editingAnnouncement.scheduledPublishDate,
        scheduledPublishTime: editingAnnouncement.scheduledPublishTime
      })
      
      console.log('📋 Update result:', result)
      
      if (result.success) {
        await loadData()
        setIsEditModalOpen(false)
        setEditingAnnouncement(null)
      } else {
        alert(`수정 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('❌ Error saving announcement:', error)
      alert('공지사항 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingAnnouncement) return
    
    try {
      setDeleting(true)
      console.log('📋 Deleting announcement:', deletingAnnouncement.id)
      
      const result = await deleteAnnouncement(deletingAnnouncement.id)
      
      console.log('📋 Delete result:', result)
      
      if (result.success) {
        await loadData()
        setIsDeleteModalOpen(false)
        setDeletingAnnouncement(null)
      } else {
        alert(`삭제 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('❌ Error deleting announcement:', error)
      alert('공지사항 삭제 중 오류가 발생했습니다.')
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
        <h1 className="text-3xl font-bold">공지사항 관리</h1>
        <Button onClick={handleCreateAnnouncement} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          새 공지사항
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="공지사항 검색..."
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
            <SelectItem value="draft">임시저장</SelectItem>
            <SelectItem value="published">발행됨</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 공지사항 목록 */}
      <div className="grid gap-4">
        {currentAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">공지사항이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          currentAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{announcement.title}</h3>
                        {getStatusBadge(announcement)}
                      </div>
                    <div 
                      className="text-gray-600 mb-3 line-clamp-2"
                      dangerouslySetInnerHTML={{ 
                        __html: announcement.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' 
                      }}
                    />
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>생성: {new Date(announcement.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                      {announcement.published_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {announcement.is_published && new Date(announcement.published_at) > new Date() 
                              ? `예약 발행: ${new Date(announcement.published_at).toLocaleString('ko-KR')}`
                              : `발행: ${new Date(announcement.published_at).toLocaleDateString('ko-KR')}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAnnouncement(announcement)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAnnouncement(announcement)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement)}
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

      {/* 페이징 네비게이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </Button>
          
          <div className="flex gap-1">
            {(() => {
              const pages = []
              const maxVisiblePages = 5
              
              if (totalPages <= maxVisiblePages) {
                // 페이지가 적으면 모두 표시
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i)
                }
              } else {
                // 페이지가 많으면 현재 페이지 주변만 표시
                const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                const end = Math.min(totalPages, start + maxVisiblePages - 1)
                
                if (start > 1) {
                  pages.push(1)
                  if (start > 2) pages.push('...')
                }
                
                for (let i = start; i <= end; i++) {
                  pages.push(i)
                }
                
                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push('...')
                  pages.push(totalPages)
                }
              }
              
              return pages.map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page as number)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                )
              ))
            })()}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            다음
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 페이지 정보 */}
      {filteredAnnouncements.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          총 {filteredAnnouncements.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredAnnouncements.length)}개 표시
        </div>
      )}

      {/* 상세보기 모달 */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>공지사항 상세보기</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">제목</Label>
                <p className="mt-1">{selectedAnnouncement.title}</p>
              </div>
              <div>
                <Label className="font-semibold">내용</Label>
                <div 
                  className="mt-1 p-4 border rounded-lg bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">상태</Label>
                  <div className="mt-1">{getStatusBadge(selectedAnnouncement)}</div>
                </div>
                <div>
                  <Label className="font-semibold">생성일</Label>
                  <p className="mt-1">{new Date(selectedAnnouncement.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
                {selectedAnnouncement.published_at && (
                  <div>
                    <Label className="font-semibold">발행일</Label>
                    <p className="mt-1">{new Date(selectedAnnouncement.published_at).toLocaleDateString('ko-KR')}</p>
                  </div>
                )}
                <div>
                  <Label className="font-semibold">수정일</Label>
                  <p className="mt-1">{new Date(selectedAnnouncement.updated_at).toLocaleDateString('ko-KR')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 생성 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>새 공지사항 작성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-title">제목</Label>
              <Input
                id="create-title"
                value={creatingAnnouncement.title}
                onChange={(e) => setCreatingAnnouncement({ ...creatingAnnouncement, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="create-category">카테고리</Label>
              <Select
                value={creatingAnnouncement.category}
                onValueChange={(value: 'general' | 'important' | 'update' | 'maintenance') => 
                  setCreatingAnnouncement({ ...creatingAnnouncement, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">일반</SelectItem>
                  <SelectItem value="important">중요</SelectItem>
                  <SelectItem value="update">업데이트</SelectItem>
                  <SelectItem value="maintenance">점검</SelectItem>
                </SelectContent>
              </Select>
            </div>
                          <div>
                <Label htmlFor="create-content">내용</Label>
                <RichTextEditor
                  value={creatingAnnouncement.content}
                  onChange={(content) => setCreatingAnnouncement({ ...creatingAnnouncement, content })}
                  placeholder="공지사항 내용을 입력하세요..."
                />
              </div>
                        <div>
              <Label htmlFor="create-status">상태</Label>
              <Select
                value={creatingAnnouncement.status}
                onValueChange={(value: 'draft' | 'published') => 
                  setCreatingAnnouncement({ ...creatingAnnouncement, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">임시저장</SelectItem>
                  <SelectItem value="published">발행</SelectItem>
                </SelectContent>
              </Select>
              {creatingAnnouncement.status === 'published' && (
                <p className="text-sm text-gray-500 mt-1">
                  발행 상태로 설정하면 예약 발행 날짜/시간을 설정할 수 있습니다.
                </p>
              )}
            </div>
            {creatingAnnouncement.status === 'published' && (
              <>
                <div>
                  <Label htmlFor="create-scheduled-date">예약 발행 날짜 (선택사항)</Label>
                  <Input
                    id="create-scheduled-date"
                    type="date"
                    value={creatingAnnouncement.scheduledPublishDate}
                    onChange={(e) => setCreatingAnnouncement({ ...creatingAnnouncement, scheduledPublishDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="mb-4"
                  />
                </div>
                <div>
                  <Label htmlFor="create-scheduled-time">예약 발행 시간 (선택사항)</Label>
                  <Input
                    id="create-scheduled-time"
                    type="time"
                    value={creatingAnnouncement.scheduledPublishTime}
                    onChange={(e) => setCreatingAnnouncement({ ...creatingAnnouncement, scheduledPublishTime: e.target.value })}
                    className="mb-4"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    날짜와 시간을 설정하지 않으면 즉시 발행됩니다.
                  </p>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setCreatingAnnouncement({ title: '', content: '', category: 'general', status: 'draft', scheduledPublishDate: '', scheduledPublishTime: '' })
                }}
              >
                취소
              </Button>
              <Button onClick={handleSaveCreate} disabled={creating}>
                {creating ? '생성 중...' : '생성'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
          </DialogHeader>
          {editingAnnouncement && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">제목</Label>
                <Input
                  id="edit-title"
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-content">내용</Label>
                <RichTextEditor
                  value={editingAnnouncement.content}
                  onChange={(content) => setEditingAnnouncement({ ...editingAnnouncement, content })}
                  placeholder="공지사항 내용을 입력하세요..."
                />
              </div>
              <div>
                <Label htmlFor="edit-status">상태</Label>
                <Select
                  value={editingAnnouncement.is_published ? 'published' : 'draft'}
                  onValueChange={(value: 'draft' | 'published') => 
                    setEditingAnnouncement({ ...editingAnnouncement, is_published: value === 'published' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">임시저장</SelectItem>
                    <SelectItem value="published">발행</SelectItem>
                  </SelectContent>
                </Select>
                {editingAnnouncement.is_published && (
                  <p className="text-sm text-gray-500 mt-1">
                    발행 상태로 설정하면 예약 발행 날짜/시간을 설정할 수 있습니다.
                  </p>
                )}
              </div>
              {editingAnnouncement.is_published && (
                <>
                  <div>
                    <Label htmlFor="edit-scheduled-date">예약 발행 날짜 (선택사항)</Label>
                    <Input
                      id="edit-scheduled-date"
                      type="date"
                      value={editingAnnouncement.scheduledPublishDate}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, scheduledPublishDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="mb-4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-scheduled-time">예약 발행 시간 (선택사항)</Label>
                    <Input
                      id="edit-scheduled-time"
                      type="time"
                      value={editingAnnouncement.scheduledPublishTime}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, scheduledPublishTime: e.target.value })}
                      className="mb-4"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      날짜와 시간을 설정하지 않으면 즉시 발행됩니다.
                    </p>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingAnnouncement(null)
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
            <DialogTitle>공지사항 삭제</DialogTitle>
          </DialogHeader>
          {deletingAnnouncement && (
            <div className="space-y-4">
              <p>정말로 "{deletingAnnouncement.title}" 공지사항을 삭제하시겠습니까?</p>
              <p className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다.</p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setDeletingAnnouncement(null)
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
