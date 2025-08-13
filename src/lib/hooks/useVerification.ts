import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'

// 검증 요청 타입
export interface VerificationRequest {
  id: string
  user_id: string
  user_type: 'instructor' | 'company'
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  profile_data: any
}

// 검증 요청 생성
export const useCreateVerificationRequest = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: async (profileData: any) => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          user_type: profileData.user_type,
          status: 'pending',
          profile_data: profileData,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] })
    },
  })
}

// 검증 요청 목록 가져오기 (관리자용)
export const useVerificationRequests = (filters?: {
  status?: string
  user_type?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['verification-requests', filters],
    queryFn: async () => {
      let query = supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('submitted_at', { ascending: false })
      
      // 필터 적용
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      
      if (filters?.user_type) {
        query = query.eq('user_type', filters.user_type)
      }
      
      if (filters?.search) {
        query = query.or(`profile_data->>'fullName'.ilike.%${filters.search}%,profile_data->>'companyName'.ilike.%${filters.search}%,profiles.email.ilike.%${filters.search}%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as VerificationRequest[]
    },
  })
}

// 검증 요청 승인
export const useApproveVerification = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      // 검증 요청 상태 업데이트
      const { data: verificationData, error: verificationError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', requestId)
        .select()
        .single()
      
      if (verificationError) throw verificationError
      
      // 프로필 상태 업데이트
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', verificationData.user_id)
      
      if (profileError) throw profileError
      
      return verificationData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

// 검증 요청 거부
export const useRejectVerification = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      const { data, error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          rejection_reason: reason
        })
        .eq('id', requestId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] })
    },
  })
}

// 사용자별 검증 상태 확인
export const useVerificationStatus = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['verification-status', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!user,
  })
}

// 검증 통계 (관리자용)
export const useVerificationStats = () => {
  return useQuery({
    queryKey: ['verification-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('status, user_type')
      
      if (error) throw error
      
      const stats = {
        total: data.length,
        pending: data.filter(req => req.status === 'pending').length,
        approved: data.filter(req => req.status === 'approved').length,
        rejected: data.filter(req => req.status === 'rejected').length,
        instructors: data.filter(req => req.user_type === 'instructor').length,
        companies: data.filter(req => req.user_type === 'company').length,
      }
      
      return stats
    },
  })
}

// 검증 요청 재제출
export const useResubmitVerification = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: async (profileData: any) => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      // 기존 거부된 요청이 있다면 삭제
      await supabase
        .from('verification_requests')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'rejected')
      
      // 새로운 요청 생성
      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          user_type: profileData.user_type,
          status: 'pending',
          profile_data: profileData,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] })
      queryClient.invalidateQueries({ queryKey: ['verification-status', user?.id] })
    },
  })
}

// 검증 이메일 알림
export const useSendVerificationNotification = () => {
  return useMutation({
    mutationFn: async ({ 
      userId, 
      status, 
      reason 
    }: { 
      userId: string; 
      status: 'approved' | 'rejected'; 
      reason?: string 
    }) => {
      // TODO: 이메일 서비스 연동 (SendGrid, AWS SES 등)
      console.log('검증 알림 전송:', { userId, status, reason })
      
      // 임시로 콘솔에 출력
      return { success: true }
    },
  })
}
