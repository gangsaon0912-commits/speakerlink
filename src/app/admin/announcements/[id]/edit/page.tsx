'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/navigation'
import { useAuthStore } from '@/lib/store'
import { 
  ArrowLeft, 
  Save, 
  Eye,
  Pin,
  AlertTriangle,
  Info,
  Wrench,
  Bell,
  AlertCircle
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAnnouncement, useUpdateAnnouncement, UpdateAnnouncementData } from '@/lib/hooks/useAnnouncements'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

const categoryConfig = {
  general: {
    label: '일반',
    icon: <Info className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  important: {
    label: '중요',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  update: {
    label: '업데이트',
    icon: <Bell className="w-4 h-4" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  maintenance: {
    label: '점검',
    icon: <Wrench className="w-4 h-4" />,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  }
}

export default function EditAnnouncementPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAdmin } = useAuthStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateAnnouncementData>({
    title: '',
    content: '',
    category: 'general',
    is_pinned: false,
    is_published: false
  })

  const { data: announcement, isLoading: isLoadingAnnouncement, error } = useAnnouncement(params.id as string)
  const updateAnnouncement = useUpdateAnnouncement()

  // 기존 데이터로 폼 초기화
  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        is_pinned: announcement.is_pinned,
        is_published: announcement.is_published
      })
    }
  }, [announcement])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await updateAnnouncement.mutateAsync({
        id: params.id as string,
        ...formData
      })
      toast({
        title: "성공",
        description: "공지사항이 성공적으로 수정되었습니다",
      })
      router.push('/admin/announcements')
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : '공지사항 수정에 실패했습니다',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle>접근 권한이 없습니다</CardTitle>
              <CardDescription>
                관리자만 공지사항을 수정할 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoadingAnnouncement) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-gray-500">공지사항을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle>공지사항을 찾을 수 없습니다</CardTitle>
              <CardDescription>
                요청하신 공지사항이 존재하지 않거나 삭제되었습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/admin/announcements">
                <Button>목록으로 돌아가기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const selectedCategory = categoryConfig[formData.category as keyof typeof categoryConfig]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/announcements">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-gray-900 mb-2">
            공지사항 수정
          </h1>
          <p className="text-gray-600 text-gray-600">
            기존 공지사항을 수정합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 메인 폼 */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>
                    공지사항의 기본 정보를 수정해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">제목 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="공지사항 제목을 입력하세요"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">카테고리 *</Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            일반
                          </div>
                        </SelectItem>
                        <SelectItem value="important">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            중요
                          </div>
                        </SelectItem>
                        <SelectItem value="update">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            업데이트
                          </div>
                        </SelectItem>
                        <SelectItem value="maintenance">
                          <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            점검
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">내용 *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      placeholder="공지사항 내용을 입력하세요. HTML 태그를 사용할 수 있습니다."
                      rows={12}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      HTML 태그를 사용하여 텍스트를 꾸밀 수 있습니다. (예: &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>설정</CardTitle>
                  <CardDescription>
                    공지사항의 표시 옵션을 설정해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>상단 고정</Label>
                      <p className="text-sm text-gray-500">
                        공지사항을 목록 상단에 고정합니다.
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_pinned}
                      onCheckedChange={(checked) => setFormData({...formData, is_pinned: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>발행 상태</Label>
                      <p className="text-sm text-gray-500">
                        체크하면 사용자에게 공개됩니다.
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData({...formData, is_published: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>미리보기</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.title && (
                    <div>
                      <h3 className="font-semibold text-lg">{formData.title}</h3>
                      <Badge className={`${selectedCategory.color} flex items-center gap-1 mt-2`}>
                        {selectedCategory.icon}
                        {selectedCategory.label}
                      </Badge>
                    </div>
                  )}
                  
                  {formData.content && (
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">상단 고정:</span>
                      <span className="font-medium">{formData.is_pinned ? '예' : '아니오'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">발행 상태:</span>
                      <span className="font-medium">{formData.is_published ? '발행됨' : '임시저장'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>원본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 text-gray-600">작성자:</span>
                    <span className="ml-2 text-gray-600 text-gray-500">{announcement.author_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 text-gray-600">작성일:</span>
                    <span className="ml-2 text-gray-600 text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 text-gray-600">조회수:</span>
                    <span className="ml-2 text-gray-600 text-gray-500">{announcement.view_count || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Link href="/admin/announcements">
              <Button variant="outline">취소</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  수정 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  공지사항 수정
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
