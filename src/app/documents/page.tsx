'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Filter,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DocumentUpload from '@/components/documents/DocumentUpload'
import DocumentList from '@/components/documents/DocumentList'
import DocumentStats from '@/components/documents/DocumentStats'
import { Document } from '@/lib/hooks/useDocuments'
import { useToast } from '@/hooks/use-toast'

export default function DocumentsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('upload')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const handleUploadSuccess = (document: Document) => {
    toast({
      title: "성공",
      description: `${document.file_name}이(가) 성공적으로 업로드되었습니다`,
    })
    setActiveTab('list')
  }

  const handleDocumentDeleted = (document: Document) => {
    toast({
      title: "성공",
      description: `${document.file_name}이(가) 삭제되었습니다`,
    })
  }

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>로그인이 필요합니다</CardTitle>
              <CardDescription>
                문서를 관리하려면 로그인해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/login">
                <Button>로그인하기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              문서 관리
            </h1>
            <p className="text-gray-600">
              프로필 검증에 필요한 문서를 업로드하고 관리하세요
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <DocumentStats />

        {/* 메인 콘텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              문서 업로드
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              문서 목록
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
            
            {/* 업로드 가이드 */}
            <Card>
              <CardHeader>
                <CardTitle>문서 업로드 가이드</CardTitle>
                <CardDescription>
                  프로필 검증을 위해 필요한 문서들을 업로드해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      자격증/수료증
                    </h4>
                    <p className="text-sm text-gray-600 text-gray-500">
                      관련 자격증이나 수료증을 업로드하여 전문성을 증명하세요.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      포트폴리오
                    </h4>
                    <p className="text-sm text-gray-600 text-gray-500">
                      작업물이나 포트폴리오를 업로드하여 실력을 보여주세요.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {/* 필터 및 검색 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="문서명으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="상태별 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="pending">검토중</SelectItem>
                      <SelectItem value="approved">승인됨</SelectItem>
                      <SelectItem value="rejected">거부됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 문서 목록 */}
            <DocumentList 
              onDocumentDeleted={handleDocumentDeleted}
            />
          </TabsContent>
        </Tabs>

        {/* 추가 정보 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>문서 관리 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">지원 파일 형식</h4>
                <ul className="text-sm text-gray-600 text-gray-500 space-y-1">
                  <li>• PDF 문서 (.pdf)</li>
                  <li>• 이미지 파일 (.jpg, .jpeg, .png, .gif)</li>
                  <li>• Word 문서 (.doc, .docx)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">파일 크기 제한</h4>
                <ul className="text-sm text-gray-600 text-gray-500 space-y-1">
                  <li>• 최대 파일 크기: 10MB</li>
                  <li>• 여러 파일을 개별적으로 업로드</li>
                  <li>• 파일명에 특수문자 사용 자제</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">보안 및 개인정보</h4>
                <ul className="text-sm text-gray-600 text-gray-500 space-y-1">
                  <li>• 업로드된 문서는 안전하게 암호화</li>
                  <li>• 관리자만 문서 내용 확인 가능</li>
                  <li>• 검증 완료 후 필요시 삭제 가능</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">검토 프로세스</h4>
                <ul className="text-sm text-gray-600 text-gray-500 space-y-1">
                  <li>• 업로드 후 1-3일 내 검토</li>
                  <li>• 승인/거부 결과 이메일 알림</li>
                  <li>• 거부 시 사유 안내 및 재업로드 가능</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
