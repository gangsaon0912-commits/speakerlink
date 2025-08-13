import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'

// 강사 프로필 타입
export interface InstructorProfile {
  id: string
  profile_id: string
  bio: string
  expertise: string[]
  hourly_rate: number
  availability: string[]
  rating: number
  total_reviews: number
  experience: string
  education: string
  certifications: string[]
  languages: string[]
  created_at: string
  updated_at: string
}

// 기업 프로필 타입
export interface CompanyProfile {
  id: string
  profile_id: string
  company_name: string
  industry: string
  company_size: string
  description: string
  website: string | null
  founded_year: string
  employee_count: number
  specialties: string[]
  projects: number
  completed_projects: number
  created_at: string
  updated_at: string
}

// 프로필 가져오기
export const useProfile = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

// 강사 프로필 가져오기
export const useInstructorProfile = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['instructor-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      const { data, error } = await supabase
        .from('instructors')
        .select('*')
        .eq('profile_id', user.id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

// 기업 프로필 가져오기
export const useCompanyProfile = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['company-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('profile_id', user.id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

// 프로필 업데이트
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: async (updates: Partial<InstructorProfile | CompanyProfile>) => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      // 프로필 타입에 따라 다른 테이블 업데이트
      const profile = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()
      
      if (profile.data?.user_type === 'instructor') {
        const { data, error } = await supabase
          .from('instructors')
          .update(updates)
          .eq('profile_id', user.id)
          .select()
          .single()
        
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('companies')
          .update(updates)
          .eq('profile_id', user.id)
          .select()
          .single()
        
        if (error) throw error
        return data
      }
    },
    onSuccess: (data) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      if ('bio' in data) {
        queryClient.invalidateQueries({ queryKey: ['instructor-profile', user?.id] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['company-profile', user?.id] })
      }
    },
  })
}

// 프로필 생성
export const useCreateProfile = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: async ({ 
      userType, 
      profileData 
    }: { 
      userType: 'instructor' | 'company'
      profileData: Partial<InstructorProfile | CompanyProfile>
    }) => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      // 먼저 profiles 테이블에 사용자 타입 업데이트
      await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', user.id)
      
      // 프로필 타입에 따라 해당 테이블에 데이터 삽입
      if (userType === 'instructor') {
        const { data, error } = await supabase
          .from('instructors')
          .insert({
            profile_id: user.id,
            ...profileData
          })
          .select()
          .single()
        
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('companies')
          .insert({
            profile_id: user.id,
            ...profileData
          })
          .select()
          .single()
        
        if (error) throw error
        return data
      }
    },
    onSuccess: (data) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      if ('bio' in data) {
        queryClient.invalidateQueries({ queryKey: ['instructor-profile', user?.id] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['company-profile', user?.id] })
      }
    },
  })
}

// 아바타 업로드
export const useUploadAvatar = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('사용자가 로그인되지 않았습니다.')
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      // 프로필에 아바타 URL 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      
      return publicUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
  })
}
