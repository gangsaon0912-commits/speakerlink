'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/navigation'
import { useAuthStore } from '@/lib/store'
import { 
  ArrowLeft, 
  Pin, 
  Eye, 
  Calendar,
  User,
  Edit,
  Trash2,
  AlertTriangle,
  Info,
  Wrench,
  Bell,
  AlertCircle
} from 'lucide-react'
import { useAnnouncement, useIncrementViewCount } from '@/lib/hooks/useAnnouncements'
import { useDeleteAnnouncement } from '@/lib/hooks/useAnnouncements'
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function AnnouncementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAdmin } = useAuthStore()
  const { toast } = useToast()
  
  const { data: announcement, isLoading, error } = useAnnouncement(params.id as string)
  const incrementViewCount = useIncrementViewCount()
  const deleteAnnouncement = useDeleteAnnouncement()

  // 조회수 증가
  useEffect(() => {
    if (announcement && !isAdmin) {
      incrementViewCount.mutate(announcement.id)
    }
  }, [announcement, isAdmin, incrementViewCount])

  const handleDelete = async () => {
    if (!announcement) return
    
    if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      return
    }

    try {
      await deleteAnnouncement.mutateAsync(announcement.id)
      toast({
        title: "성공",
        description: "공지사항이 삭제되었습니다",
      })
      router.push('/announcements')
    } catch (error) {
      toast({
        title: "오류",
        description: "공지사항 삭제에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
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
              <Link href="/announcements">
                <Button>목록으로 돌아가기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const category = categoryConfig[announcement.category]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/announcements">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* 공지사항 헤더 */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {announcement.is_pinned && (
                    <Pin className="w-5 h-5 text-blue-600" />
                  )}
                  <Badge className={`${category.color} flex items-center gap-1`}>
                    {category.icon}
                    {category.label}
                  </Badge>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Link href={`/admin/announcements/${announcement.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        수정
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </Button>
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl mb-2">{announcement.title}</CardTitle>
              <CardDescription className="text-base">
                <div className="flex items-center gap-4 text-sm text-gray-600 text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{announcement.author_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(announcement.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>조회 {announcement.view_count || 0}</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 공지사항 내용 */}
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 추가 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">공지사항 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 text-gray-600">작성자:</span>
                  <span className="ml-2 text-gray-600 text-gray-500">{announcement.author_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 text-gray-600">작성일:</span>
                  <span className="ml-2 text-gray-600 text-gray-500">{formatDate(announcement.created_at)}</span>
                </div>
                {announcement.updated_at !== announcement.created_at && (
                  <div>
                    <span className="font-medium text-gray-700 text-gray-600">수정일:</span>
                    <span className="ml-2 text-gray-600 text-gray-500">{formatDate(announcement.updated_at)}</span>
                  </div>
                )}
                {announcement.published_at && (
                  <div>
                    <span className="font-medium text-gray-700 text-gray-600">발행일:</span>
                    <span className="ml-2 text-gray-600 text-gray-500">{formatDate(announcement.published_at)}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700 text-gray-600">조회수:</span>
                  <span className="ml-2 text-gray-600 text-gray-500">{announcement.view_count || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 text-gray-600">상태:</span>
                  <span className="ml-2 text-gray-600 text-gray-500">
                    {announcement.is_published ? '발행됨' : '임시저장'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
