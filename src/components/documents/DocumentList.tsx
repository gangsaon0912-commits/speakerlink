'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  File, 
  FileText, 
  Image, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Award,
  FolderOpen,
  ExternalLink
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useDocuments, useDeleteDocument, Document } from '@/lib/hooks/useDocuments'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

interface DocumentListProps {
  userId?: string
  showUploadButton?: boolean
  onDocumentDeleted?: (document: Document) => void
  className?: string
}

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

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return <Image className="w-4 h-4" />
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="w-4 h-4" />
  }
  return <File className="w-4 h-4" />
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

export default function DocumentList({ 
  userId, 
  showUploadButton = false, 
  onDocumentDeleted,
  className 
}: DocumentListProps) {
  const { user } = useAuth()
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const { data: documents, isLoading, error } = useDocuments(userId || user?.id)
  const deleteDocument = useDeleteDocument()
  const { toast } = useToast()

  const handleDelete = async (document: Document) => {
    if (!confirm('정말로 이 문서를 삭제하시겠습니까?')) {
      return
    }

    try {
      await deleteDocument.mutateAsync(document.id)
      toast({
        title: "성공",
        description: "문서가 삭제되었습니다",
      })
      if (onDocumentDeleted) {
        onDocumentDeleted(document)
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "문서 삭제에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (document: Document) => {
    const link = document.createElement('a')
    link.href = document.file_url
    link.download = document.file_name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = (document: Document) => {
    setSelectedDocument(document)
    setShowPreview(true)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">문서 목록을 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="w-8 h-8 mx-auto mb-2" />
            <p>문서 목록을 불러오는데 실패했습니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>업로드된 문서</CardTitle>
          <CardDescription>
            아직 업로드된 문서가 없습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showUploadButton && (
            <div className="text-center py-8">
              <File className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">첫 번째 문서를 업로드해보세요</p>
              <Button variant="outline">
                문서 업로드
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle>업로드된 문서 ({documents.length}개)</CardTitle>
          <CardDescription>
            업로드한 문서들의 상태를 확인할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((document) => {
              const typeConfig = documentTypeConfig[document.document_type]
              const statusConfig = getStatusConfig(document.status)

              return (
                <div
                  key={document.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0">
                        {getFileIcon(document.mime_type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium truncate">{document.file_name}</h4>
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
                          <p>크기: {formatFileSize(document.file_size)}</p>
                          <p>업로드: {formatDate(document.uploaded_at)}</p>
                          {document.description && (
                            <p className="text-gray-700 text-gray-600">
                              설명: {document.description}
                            </p>
                          )}
                          {document.status === 'rejected' && document.rejection_reason && (
                            <p className="text-red-600">
                              거부 사유: {document.rejection_reason}
                            </p>
                          )}
                          {document.status === 'approved' && document.reviewed_at && (
                            <p className="text-green-600">
                              승인: {formatDate(document.reviewed_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(document)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document)}
                        className="text-red-500 hover:text-red-700"
                        disabled={deleteDocument.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 문서 미리보기 다이얼로그 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getFileIcon(selectedDocument.mime_type)}
              {selectedDocument?.file_name}
            </DialogTitle>
            <DialogDescription>
              문서 미리보기
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={documentTypeConfig[selectedDocument.document_type].color}>
                  {documentTypeConfig[selectedDocument.document_type].label}
                </Badge>
                <Badge className={getStatusConfig(selectedDocument.status).color}>
                  {getStatusConfig(selectedDocument.status).label}
                </Badge>
              </div>
              
              {selectedDocument.description && (
                <div>
                  <h4 className="font-medium mb-2">설명</h4>
                  <p className="text-gray-600 text-gray-500">
                    {selectedDocument.description}
                  </p>
                </div>
              )}
              
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
                    <Button onClick={() => handleDownload(selectedDocument)}>
                      <Download className="w-4 h-4 mr-2" />
                      다운로드
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  업로드: {formatDate(selectedDocument.uploaded_at)}
                </div>
                <div className="flex gap-2">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
