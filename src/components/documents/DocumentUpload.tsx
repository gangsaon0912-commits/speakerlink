'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Image,
  Award,
  FolderOpen
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUploadDocument, Document, UploadDocumentData } from '@/lib/hooks/useDocuments'
import { useToast } from '@/hooks/use-toast'

interface DocumentUploadProps {
  onUploadSuccess?: (document: Document) => void
  className?: string
}

const documentTypes = [
  {
    value: 'certificate',
    label: '자격증/수료증',
    icon: <Award className="w-4 h-4" />,
    description: '관련 자격증이나 수료증을 업로드해주세요'
  },
  {
    value: 'portfolio',
    label: '포트폴리오',
    icon: <FolderOpen className="w-4 h-4" />,
    description: '작업물이나 포트폴리오 파일'
  },
  {
    value: 'other',
    label: '기타',
    icon: <FileText className="w-4 h-4" />,
    description: '기타 관련 문서'
  }
]

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

export default function DocumentUpload({ onUploadSuccess, className }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<Document['document_type']>('certificate')
  const [description, setDescription] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadDocument = useUploadDocument()
  const { toast } = useToast()

  const handleFileSelect = (file: File) => {
    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "오류",
        description: "파일 크기는 10MB를 초과할 수 없습니다",
        variant: "destructive",
      })
      return
    }

    // 파일 타입 검증
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "오류",
        description: "지원하지 않는 파일 형식입니다. PDF, 이미지, Word 문서만 업로드 가능합니다",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "오류",
        description: "파일을 선택해주세요",
        variant: "destructive",
      })
      return
    }

    const uploadData: UploadDocumentData = {
      file: selectedFile,
      document_type: documentType,
      description: description.trim() || undefined
    }

    try {
      const result = await uploadDocument.mutateAsync(uploadData)
      toast({
        title: "성공",
        description: "문서가 성공적으로 업로드되었습니다",
      })
      
      // 폼 초기화
      setSelectedFile(null)
      setDescription('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 콜백 실행
      if (onUploadSuccess) {
        onUploadSuccess(result)
      }
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : '문서 업로드에 실패했습니다',
        variant: "destructive",
      })
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const selectedType = documentTypes.find(type => type.value === documentType)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          문서 업로드
        </CardTitle>
        <CardDescription>
          필요한 문서를 업로드하여 프로필을 완성하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 문서 타입 선택 */}
        <div className="space-y-2">
          <Label htmlFor="document-type">문서 타입 *</Label>
          <Select value={documentType} onValueChange={(value: Document['document_type']) => setDocumentType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="문서 타입을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    {type.icon}
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedType && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedType.description}
            </p>
          )}
        </div>

        {/* 파일 업로드 영역 */}
        <div className="space-y-2">
          <Label>파일 선택 *</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">파일이 선택되었습니다</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium">파일을 드래그하거나 클릭하여 업로드</p>
                  <p className="text-sm text-gray-500">
                    PDF, 이미지, Word 문서 (최대 10MB)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  파일 선택
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              onChange={handleFileInputChange}
            />
          </div>
        </div>

        {/* 설명 입력 */}
        <div className="space-y-2">
          <Label htmlFor="description">설명 (선택사항)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="문서에 대한 추가 설명을 입력하세요"
            rows={3}
          />
        </div>

        {/* 업로드 진행률 */}
        {uploadDocument.isPending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>업로드 중...</span>
              <span>{uploadDocument.variables ? '처리 중' : '0%'}</span>
            </div>
            <Progress value={uploadDocument.variables ? 50 : 0} className="w-full" />
          </div>
        )}

        {/* 업로드 버튼 */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadDocument.isPending}
          className="w-full"
        >
          {uploadDocument.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              업로드 중...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              문서 업로드
            </>
          )}
        </Button>

        {/* 안내사항 */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">업로드 가이드</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 지원 파일 형식: PDF, JPG, PNG, GIF, DOC, DOCX</li>
            <li>• 최대 파일 크기: 10MB</li>
            <li>• 업로드된 문서는 관리자 검토 후 승인됩니다</li>
            <li>• 개인정보가 포함된 문서는 안전하게 처리됩니다</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
