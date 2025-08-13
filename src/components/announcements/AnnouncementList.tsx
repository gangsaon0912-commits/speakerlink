'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Navigation } from '@/components/layout/navigation'
import { 
  Search, 
  Pin, 
  Eye, 
  Calendar,
  User,
  AlertTriangle,
  Info,
  Wrench,
  Bell,
  Plus
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAnnouncements, Announcement } from '@/lib/hooks/useAnnouncements'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'

interface AnnouncementListProps {
  showCreateButton?: boolean
  className?: string
}

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
    day: 'numeric'
  })
}

export default function AnnouncementList({ showCreateButton = false, className }: AnnouncementListProps) {
  const { user, isAdmin } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Announcement['category'] | 'all'>('all')

  const { data: announcements, isLoading, error } = useAnnouncements(
    categoryFilter === 'all' ? undefined : categoryFilter
  )

  const filteredAnnouncements = announcements?.filter(announcement => 
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">공지사항을 불러오는 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <p className="text-red-600">공지사항을 불러오는데 실패했습니다</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            공지사항
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            최신 소식과 업데이트를 확인하세요
          </p>
        </div>
        {showCreateButton && isAdmin && (
          <Link href="/admin/announcements/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              공지사항 작성
            </Button>
          </Link>
        )}
      </div>

      {/* 필터 및 검색 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="공지사항 제목 또는 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={(value: Announcement['category'] | 'all') => setCategoryFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="general">일반</SelectItem>
            <SelectItem value="important">중요</SelectItem>
            <SelectItem value="update">업데이트</SelectItem>
            <SelectItem value="maintenance">점검</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 공지사항 목록 */}
      {filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || categoryFilter !== 'all' 
                ? '검색 조건에 맞는 공지사항이 없습니다.' 
                : '아직 등록된 공지사항이 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => {
            const category = categoryConfig[announcement.category]
            
            return (
              <Card 
                key={announcement.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  announcement.is_pinned ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950' : ''
                }`}
              >
                <Link href={`/announcements/${announcement.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {announcement.is_pinned && (
                            <Pin className="w-4 h-4 text-blue-600" />
                          )}
                          <Badge className={`${category.color} flex items-center gap-1`}>
                            {category.icon}
                            {category.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-1">
                          {announcement.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {announcement.content.replace(/<[^>]*>/g, '')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{announcement.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(announcement.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{announcement.view_count || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
