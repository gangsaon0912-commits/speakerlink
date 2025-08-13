import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Document {
  id: string
  user_id: string
  document_type: 'business_license' | 'identity_card' | 'certificate' | 'portfolio' | 'other'
  file_name: string
  file_url: string
  file_size: number
  mime_type: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  uploaded_at: string
  reviewed_at?: string
  reviewed_by?: string
  description?: string
}

export interface UploadDocumentData {
  file: File
  document_type: Document['document_type']
  description?: string
}

// 문서 목록 조회
export const useDocuments = (userId?: string) => {
  return useQuery({
    queryKey: ['documents', userId],
    queryFn: async () => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Documents fetch error:', error)
        throw error
      }
      return data as Document[]
    },
    enabled: !!userId
  })
}

// 특정 타입의 문서 조회
export const useDocumentsByType = (userId?: string, documentType?: Document['document_type']) => {
  return useQuery({
    queryKey: ['documents', userId, documentType],
    queryFn: async () => {
      if (!userId || !documentType) return []
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .eq('document_type', documentType)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      return data as Document[]
    },
    enabled: !!userId && !!documentType
  })
}

// 문서 업로드
export const useUploadDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, document_type, description }: UploadDocumentData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('사용자 인증이 필요합니다')

      // 파일 크기 검증 (10MB 제한)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('파일 크기는 10MB를 초과할 수 없습니다')
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
        throw new Error('지원하지 않는 파일 형식입니다. PDF, 이미지, Word 문서만 업로드 가능합니다')
      }

      // Supabase Storage에 파일 업로드
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = fileName

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error('파일 업로드에 실패했습니다')
      }

      // 파일 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // 데이터베이스에 문서 정보 저장
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          document_type,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          description,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)
        // 업로드된 파일 삭제
        await supabase.storage.from('documents').remove([filePath])
        throw new Error('문서 정보 저장에 실패했습니다')
      }

      return data as Document
    },
    onSuccess: (data) => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['documents', data.user_id] })
      queryClient.invalidateQueries({ queryKey: ['documents', data.user_id, data.document_type] })
    }
  })
}

// 문서 삭제
export const useDeleteDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (documentId: string) => {
      // 문서 정보 조회
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (fetchError) throw fetchError

      // Storage에서 파일 삭제
      const filePath = document.file_url.split('/').pop()
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([`documents/${filePath}`])

        if (storageError) throw storageError
      }

      // 데이터베이스에서 문서 삭제
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error
      return document
    },
    onSuccess: (data) => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['documents', data.user_id] })
      queryClient.invalidateQueries({ queryKey: ['documents', data.user_id, data.document_type] })
    }
  })
}

// 문서 상태 업데이트 (관리자용)
export const useUpdateDocumentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      documentId, 
      status, 
      rejection_reason 
    }: { 
      documentId: string
      status: Document['status']
      rejection_reason?: string 
    }) => {
      const { data, error } = await supabase
        .from('documents')
        .update({
          status,
          rejection_reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', documentId)
        .select()
        .single()

      if (error) throw error
      return data as Document
    },
    onSuccess: (data) => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['documents', data.user_id] })
      queryClient.invalidateQueries({ queryKey: ['documents', data.user_id, data.document_type] })
    }
  })
}

// 대량 문서 상태 업데이트 (관리자용) - API 라우트 사용
export const useBulkUpdateDocumentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      documentIds, 
      status, 
      rejection_reason 
    }: { 
      documentIds: string[]
      status: Document['status']
      rejection_reason?: string 
    }) => {
      // 현재 세션에서 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      const response = await fetch('/api/admin/documents/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          documentIds,
          status,
          rejection_reason
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    },
    onSuccess: () => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'document-stats'] })
    }
  })
}

// 관리자용 문서 목록 조회 (API 라우트 사용)
export const useAdminDocuments = (status?: Document['status']) => {
  return useQuery({
    queryKey: ['admin', 'documents', status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) {
        params.append('status', status)
      }

      // 현재 세션에서 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      const response = await fetch(`/api/admin/documents?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.documents as (Document & { profiles: { id: string; full_name: string; email: string; user_type: string } })[]
    }
  })
}

// 문서 통계 (관리자용) - API 라우트 사용
export const useDocumentStats = () => {
  return useQuery({
    queryKey: ['admin', 'document-stats'],
    queryFn: async () => {
      // 현재 세션에서 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      const response = await fetch('/api/admin/documents', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.stats
    }
  })
}

// 문서 삭제 (관리자용) - API 라우트 사용
export const useDeleteDocuments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      documentIds 
    }: { 
      documentIds: string[]
    }) => {
      // 현재 세션에서 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      const response = await fetch('/api/admin/documents/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          documentIds
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    },
    onSuccess: () => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'document-stats'] })
    }
  })
}
