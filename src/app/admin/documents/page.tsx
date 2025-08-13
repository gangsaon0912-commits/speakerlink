'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  ExternalLink,
  Award,
  FolderOpen,
  AlertCircle,
  CheckSquare,
  Square,
  Trash2,
  Settings
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAdminDocuments, useUpdateDocumentStatus, useBulkUpdateDocumentStatus, useDeleteDocuments, useDocumentStats, Document } from '@/lib/hooks/useDocuments'
import { useToast } from '@/hooks/use-toast'

const documentTypeConfig = {
  certificate: {
    label: '자격증/수료증',
    icon: <Award className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  },
  portfolio: {
    label: '포트폴리오',
    icon: <FolderOpen className="w-4 h-4" />,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  },
  other: {
    label: '기타',
    icon: <FileText className="w-4 h-4" />,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 text-gray-600'
  }
}

const getStatusConfig = (status: Document['status']) => {
  switch (status) {
    case 'approved':
      return {
        label: '승인됨',
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      }
    case 'rejected':
      return {
        label: '거부됨',
        icon: <XCircle className="w-4 h-4" />,
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      }
    case 'pending':
    default:
      return {
        label: '검토중',
        icon: <Clock className="w-4 h-4" />,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function AdminDocumentsPage() {
  const { user, profile, isAuthenticated } = useAuth()
  const isAdmin = profile?.user_type === 'admin' || user?.email === 'admin@test.com'
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Document['status'] | 'all'>('all')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)

  const { data: documents, isLoading } = useAdminDocuments(statusFilter === 'all' ? undefined : statusFilter)
  const { data: stats } = useDocumentStats()
  const updateStatus = useUpdateDocumentStatus()
  const bulkUpdateStatus = useBulkUpdateDocumentStatus()
  const deleteDocuments = useDeleteDocuments()

  // 디버깅을 위한 로그 추가
  console.log('🔍 AdminDocumentsPage Debug:', {
    isAdmin,
    isAuthenticated,
    user: user?.email,
    profile: profile?.user_type,
    documents,
    isLoading,
    statusFilter,
    stats
  })

  const handleApprove = async (document: Document) => {
    try {
      await updateStatus.mutateAsync({
        documentId: document.id,
        status: 'approved'
      })
      toast({
        title: "성공",
        description: "문서가 승인되었습니다",
      })
      setShowReviewDialog(false)
      setSelectedDocument(null)
    } catch (error) {
      toast({
        title: "오류",
        description: "문서 승인에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (document: Document) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "오류",
        description: "거부 사유를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    try {
      await updateStatus.mutateAsync({
        documentId: document.id,
        status: 'rejected',
        rejection_reason: rejectionReason.trim()
      })
      toast({
        title: "성공",
        description: "문서가 거부되었습니다",
      })
      setShowReviewDialog(false)
      setSelectedDocument(null)
      setRejectionReason('')
    } catch (error) {
      toast({
        title: "오류",
        description: "문서 거부에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleReview = (document: Document) => {
    setSelectedDocument(document)
    setShowReviewDialog(true)
  }

  const handlePreview = (document: Document) => {
    setPreviewDocument(document)
    setShowPreviewDialog(true)
  }

  const handleBulkApprove = async () => {
    if (selectedDocuments.size === 0) {
      toast({
        title: "오류",
        description: "선택된 문서가 없습니다",
        variant: "destructive",
      })
      return
    }

    try {
      await bulkUpdateStatus.mutateAsync({
        documentIds: Array.from(selectedDocuments),
        status: 'approved'
      })
      
      toast({
        title: "성공",
        description: `${selectedDocuments.size}개의 문서가 승인되었습니다`,
      })
      
      setSelectedDocuments(new Set())
      setShowBulkActionDialog(false)
      setBulkAction(null)
    } catch (error) {
      toast({
        title: "오류",
        description: "대량 승인에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleBulkReject = async () => {
    if (selectedDocuments.size === 0) {
      toast({
        title: "오류",
        description: "선택된 문서가 없습니다",
        variant: "destructive",
      })
      return
    }

    if (!rejectionReason.trim()) {
      toast({
        title: "오류",
        description: "거부 사유를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    try {
      await bulkUpdateStatus.mutateAsync({
        documentIds: Array.from(selectedDocuments),
        status: 'rejected',
        rejection_reason: rejectionReason.trim()
      })
      
      toast({
        title: "성공",
        description: `${selectedDocuments.size}개의 문서가 거부되었습니다`,
      })
      
      setSelectedDocuments(new Set())
      setShowBulkActionDialog(false)
      setBulkAction(null)
      setRejectionReason('')
    } catch (error) {
      toast({
        title: "오류",
        description: "대량 거부에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) {
      toast({
        title: "오류",
        description: "선택된 문서가 없습니다",
        variant: "destructive",
      })
      return
    }

    // 삭제 확인
    if (!confirm(`선택된 ${selectedDocuments.size}개의 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      await deleteDocuments.mutateAsync({
        documentIds: Array.from(selectedDocuments)
      })
      
      toast({
        title: "성공",
        description: `${selectedDocuments.size}개의 문서가 삭제되었습니다`,
      })
      
      setSelectedDocuments(new Set())
      setShowBulkActionDialog(false)
      setBulkAction(null)
    } catch (error) {
      toast({
        title: "오류",
        description: "문서 삭제에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const toggleDocumentSelection = (docId: string) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(docId)) {
      newSelected.delete(docId)
    } else {
      newSelected.add(docId)
    }
    setSelectedDocuments(newSelected)
  }

  const selectAllDocuments = () => {
    const pendingDocs = filteredDocuments.filter(doc => doc.status === 'pending')
    setSelectedDocuments(new Set(pendingDocs.map(doc => doc.id)))
  }

  const clearSelection = () => {
    setSelectedDocuments(new Set())
  }

  const handleDownload = (doc: Document) => {
    // 간단한 방법으로 다운로드 처리
    const url = doc.file_url
    const fileName = doc.file_name
    
    // 새 창에서 열기
    window.open(url, '_blank')
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle>접근 권한이 없습니다</CardTitle>
              <CardDescription>
                관리자만 이 페이지에 접근할 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  const filteredDocuments = documents?.filter(doc => 
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-gray-900 mb-2">
            문서 검토 관리
          </h1>
          <p className="text-gray-600 text-gray-600">
            사용자가 업로드한 문서들을 검토하고 승인/거부를 관리하세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 text-gray-500">전체</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 text-gray-500">검토중</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 text-gray-500">승인됨</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 text-gray-500">거부됨</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          

        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="문서명, 사용자명, 이메일로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value: Document['status'] | 'all') => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="상태별 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="pending">검토중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 문서 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>문서 목록 ({filteredDocuments.length}개)</CardTitle>
                <CardDescription>
                  업로드된 문서들을 검토하고 승인/거부를 결정하세요
                </CardDescription>
              </div>
              {selectedDocuments.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedDocuments.size}개 선택됨
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActionDialog(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    대량 작업
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">문서 목록을 불러오는 중...</span>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">검색 조건에 맞는 문서가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 전체 선택 헤더 */}
                {filteredDocuments.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <button
                      onClick={selectAllDocuments}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      {selectedDocuments.size === filteredDocuments.filter(doc => doc.status === 'pending').length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      검토중인 문서 전체 선택
                    </button>
                    {selectedDocuments.size > 0 && (
                      <button
                        onClick={clearSelection}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        선택 해제
                      </button>
                    )}
                  </div>
                )}
                
                {filteredDocuments.map((doc) => {
                  const typeConfig = documentTypeConfig[doc.document_type]
                  const statusConfig = getStatusConfig(doc.status)
                  const isSelected = selectedDocuments.has(doc.id)

                  return (
                    <div
                      key={doc.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* 체크박스 */}
                          {doc.status === 'pending' && (
                            <button
                              onClick={() => toggleDocumentSelection(doc.id)}
                              className="mt-1"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          )}
                          
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={doc.profiles.avatar_url || undefined} />
                            <AvatarFallback>
                              {doc.profiles.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium truncate">{doc.file_name}</h4>
                              <Badge className={`${typeConfig.color} flex items-center gap-1`}>
                                {typeConfig.icon}
                                {typeConfig.label}
                              </Badge>
                              <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                                {statusConfig.icon}
                                {statusConfig.label}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 text-gray-500 space-y-1">
                              <p>
                                <span className="font-medium">{doc.profiles.full_name}</span>
                                <span className="mx-2">•</span>
                                <span>{doc.profiles.email}</span>
                                <span className="mx-2">•</span>
                                <span className="capitalize">{doc.profiles.user_type}</span>
                              </p>
                              <p>업로드: {formatDate(doc.uploaded_at)}</p>
                              {doc.description && (
                                <p className="text-gray-700 text-gray-600">
                                  설명: {doc.description}
                                </p>
                              )}
                              {doc.status === 'rejected' && doc.rejection_reason && (
                                <p className="text-red-600">
                                  거부 사유: {doc.rejection_reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(doc)}
                            title="미리보기"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReview(doc)}
                            title="검토"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            title="다운로드"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {doc.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(doc)}
                                className="text-green-600 hover:text-green-700"
                                disabled={updateStatus.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReview(doc)}
                                className="text-red-600 hover:text-red-700"
                                disabled={updateStatus.isPending}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 문서 검토 다이얼로그 */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>문서 검토</DialogTitle>
              <DialogDescription>
                문서를 검토하고 승인 또는 거부를 결정하세요
              </DialogDescription>
            </DialogHeader>
            
            {selectedDocument && (
              <div className="space-y-6">
                {/* 문서 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={documentTypeConfig[selectedDocument.document_type].color}>
                      {documentTypeConfig[selectedDocument.document_type].label}
                    </Badge>
                    <Badge className={getStatusConfig(selectedDocument.status).color}>
                      {getStatusConfig(selectedDocument.status).label}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">파일 정보</h4>
                    <p className="text-sm text-gray-600 text-gray-500">
                      파일명: {selectedDocument.file_name}
                    </p>
                    <p className="text-sm text-gray-600 text-gray-500">
                      크기: {(selectedDocument.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-sm text-gray-600 text-gray-500">
                      업로드: {formatDate(selectedDocument.uploaded_at)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">사용자 정보</h4>
                    <p className="text-sm text-gray-600 text-gray-500">
                      이름: {selectedDocument.profiles?.full_name}
                    </p>
                    <p className="text-sm text-gray-600 text-gray-500">
                      이메일: {selectedDocument.profiles?.email}
                    </p>
                    <p className="text-sm text-gray-600 text-gray-500">
                      유형: {selectedDocument.profiles?.user_type}
                    </p>
                  </div>
                  
                  {selectedDocument.description && (
                    <div>
                      <h4 className="font-medium mb-2">설명</h4>
                      <p className="text-sm text-gray-600 text-gray-500">
                        {selectedDocument.description}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* 문서 미리보기 */}
                <div>
                  <h4 className="font-medium mb-2">문서 미리보기</h4>
                  <div className="border rounded-lg p-4">
                    {selectedDocument.mime_type.startsWith('image/') ? (
                      <img
                        src={selectedDocument.file_url}
                        alt={selectedDocument.file_name}
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">이 파일 형식은 미리보기를 지원하지 않습니다</p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => window.open(selectedDocument.file_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            새 탭에서 열기
                          </Button>
                          <Button onClick={() => handleDownload(selectedDocument)}>
                            <Download className="w-4 h-4 mr-2" />
                            다운로드
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 검토 액션 */}
                {selectedDocument.status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rejection-reason">거부 사유 (거부 시 필수)</Label>
                      <Textarea
                        id="rejection-reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="문서를 거부하는 이유를 입력하세요..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowReviewDialog(false)}
                      >
                        취소
                      </Button>
                      <Button
                        onClick={() => handleReject(selectedDocument)}
                        variant="destructive"
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        거부
                      </Button>
                      <Button
                        onClick={() => handleApprove(selectedDocument)}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        승인
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 대량 작업 다이얼로그 */}
        <Dialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>대량 작업</DialogTitle>
              <DialogDescription>
                선택된 {selectedDocuments.size}개의 문서에 대해 작업을 수행하세요
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>작업 유형</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={bulkAction === 'approve' ? 'default' : 'outline'}
                    onClick={() => setBulkAction('approve')}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    승인
                  </Button>
                  <Button
                    variant={bulkAction === 'reject' ? 'destructive' : 'outline'}
                    onClick={() => setBulkAction('reject')}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    거부
                  </Button>
                  <Button
                    variant={bulkAction === 'delete' ? 'destructive' : 'outline'}
                    onClick={() => setBulkAction('delete')}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                </div>
              </div>
              
              {bulkAction === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="bulk-rejection-reason">거부 사유 *</Label>
                  <Textarea
                    id="bulk-rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="문서를 거부하는 이유를 입력하세요..."
                    rows={3}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkActionDialog(false)
                    setBulkAction(null)
                    setRejectionReason('')
                  }}
                >
                  취소
                </Button>
                <Button
                  onClick={
                    bulkAction === 'approve' ? handleBulkApprove : 
                    bulkAction === 'reject' ? handleBulkReject : 
                    bulkAction === 'delete' ? handleBulkDelete : 
                    () => {}
                  }
                  variant={bulkAction === 'reject' || bulkAction === 'delete' ? 'destructive' : 'default'}
                  disabled={
                    !bulkAction || 
                    (bulkAction === 'reject' && !rejectionReason.trim())
                  }
                >
                  {bulkAction === 'approve' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      승인
                    </>
                  ) : bulkAction === 'reject' ? (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      거부
                    </>
                  ) : bulkAction === 'delete' ? (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </>
                  ) : (
                    '실행'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 문서 미리보기 다이얼로그 */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>문서 미리보기</DialogTitle>
              <DialogDescription>
                {previewDocument?.file_name}
              </DialogDescription>
            </DialogHeader>
            
            {previewDocument && (
              <div className="space-y-4">
                {/* 문서 정보 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">파일명:</span> {previewDocument.file_name}
                  </div>
                  <div>
                    <span className="font-medium">크기:</span> {(previewDocument.file_size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div>
                    <span className="font-medium">업로드:</span> {formatDate(previewDocument.uploaded_at)}
                  </div>
                  <div>
                    <span className="font-medium">상태:</span> 
                    <Badge className={`ml-2 ${getStatusConfig(previewDocument.status).color}`}>
                      {getStatusConfig(previewDocument.status).label}
                    </Badge>
                  </div>
                </div>

                {/* 미리보기 영역 */}
                <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                  {previewDocument.mime_type.startsWith('image/') ? (
                    <div className="max-h-[60vh] overflow-auto">
                      <img
                        src={previewDocument.file_url}
                        alt={previewDocument.file_name}
                        className="w-full h-auto"
                      />
                    </div>
                  ) : previewDocument.mime_type === 'application/pdf' ? (
                    <div className="h-[60vh]">
                      <iframe
                        src={`${previewDocument.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-0"
                        title={previewDocument.file_name}
                        onLoad={() => {
                          console.log('PDF loaded successfully')
                        }}
                        onError={(e) => {
                          console.error('PDF load failed:', e)
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <div className="hidden text-center py-16 border rounded bg-gray-50">
                        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">PDF 미리보기를 불러올 수 없습니다</p>
                        <p className="text-sm text-gray-500 mb-4">Storage 버킷이 Private으로 설정되어 있습니다. Public으로 변경하거나 새 탭에서 열어주세요.</p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => {
                              try {
                                window.open(previewDocument.file_url, '_blank')
                              } catch (error) {
                                console.error('Failed to open file:', error)
                                toast({
                                  title: "파일 열기 실패",
                                  description: "파일에 접근할 수 없습니다. Storage 설정을 확인해주세요.",
                                  variant: "destructive"
                                })
                              }
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            새 탭에서 열기
                          </Button>
                          <Button onClick={() => handleDownload(previewDocument)}>
                            <Download className="w-4 h-4 mr-2" />
                            다운로드
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">이 파일 형식은 미리보기를 지원하지 않습니다</p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => window.open(previewDocument.file_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          새 탭에서 열기
                        </Button>
                        <Button onClick={() => handleDownload(previewDocument)}>
                          <Download className="w-4 h-4 mr-2" />
                          다운로드
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {previewDocument.profiles?.full_name} • {previewDocument.profiles?.email}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreviewDialog(false)}
                    >
                      닫기
                    </Button>
                    {previewDocument.status === 'pending' && (
                      <Button onClick={() => {
                        setShowPreviewDialog(false)
                        setSelectedDocument(previewDocument)
                        setShowReviewDialog(true)
                      }}>
                        <FileText className="w-4 h-4 mr-2" />
                        검토하기
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
