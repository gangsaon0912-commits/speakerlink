import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Announcement {
  id: string
  title: string
  content: string
  category: 'general' | 'important' | 'update' | 'maintenance'
  is_pinned: boolean
  is_published: boolean
  author_id: string
  author_name: string
  view_count: number
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface CreateAnnouncementData {
  title: string
  content: string
  category: Announcement['category']
  is_pinned: boolean
  is_published: boolean
}

export interface UpdateAnnouncementData {
  title?: string
  content?: string
  category?: Announcement['category']
  is_pinned?: boolean
  is_published?: boolean
}

// 공지사항 목록 조회 (사용자용)
export const useAnnouncements = (category?: Announcement['category']) => {
  return useQuery({
    queryKey: ['announcements', category],
    queryFn: async () => {
      let query = supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Announcement[]
    }
  })
}

// 공지사항 상세 조회
export const useAnnouncement = (id: string) => {
  return useQuery({
    queryKey: ['announcements', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Announcement
    },
    enabled: !!id
  })
}

// 공지사항 생성 (관리자용)
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (announcementData: CreateAnnouncementData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('사용자 인증이 필요합니다')

      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...announcementData,
          author_id: user.id,
          author_name: user.user_metadata?.full_name || user.email,
          published_at: announcementData.is_published ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (error) throw error
      return data as Announcement
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    }
  })
}

// 공지사항 수정 (관리자용)
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & UpdateAnnouncementData) => {
      const { data, error } = await supabase
        .from('announcements')
        .update({
          ...updateData,
          published_at: updateData.is_published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Announcement
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcements', data.id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    }
  })
}

// 공지사항 삭제 (관리자용)
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    }
  })
}

// 조회수 증가
export const useIncrementViewCount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('announcements')
        .update({ view_count: supabase.rpc('increment_view_count') })
        .eq('id', id)
        .select('view_count')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['announcements', id] })
    }
  })
}

// 관리자용 공지사항 목록 조회
export const useAdminAnnouncements = (status?: 'published' | 'draft') => {
  return useQuery({
    queryKey: ['admin', 'announcements', status],
    queryFn: async () => {
      let query = supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (status === 'published') {
        query = query.eq('is_published', true)
      } else if (status === 'draft') {
        query = query.eq('is_published', false)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Announcement[]
    }
  })
}

// 공지사항 통계 (관리자용)
export const useAnnouncementStats = () => {
  return useQuery({
    queryKey: ['admin', 'announcement-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('category, is_published, view_count')

      if (error) throw error

      const stats = {
        total: data.length,
        published: data.filter(a => a.is_published).length,
        draft: data.filter(a => !a.is_published).length,
        pinned: data.filter(a => a.is_pinned).length,
        totalViews: data.reduce((sum, a) => sum + (a.view_count || 0), 0),
        byCategory: {
          general: data.filter(a => a.category === 'general').length,
          important: data.filter(a => a.category === 'important').length,
          update: data.filter(a => a.category === 'update').length,
          maintenance: data.filter(a => a.category === 'maintenance').length
        }
      }

      return stats
    }
  })
}
