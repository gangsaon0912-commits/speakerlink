import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 브라우저 환경에서만 localStorage 사용
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage
  }
  return undefined
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'speakerlink-auth',
    autoRefreshToken: true, // 자동 토큰 갱신 활성화
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    storage: getStorage(),
    storageKey: 'speakerlink-auth'
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          user_type: 'instructor' | 'company'
          is_verified: boolean
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          user_type: 'instructor' | 'company'
          is_verified?: boolean
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          user_type?: 'instructor' | 'company'
          is_verified?: boolean
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      instructors: {
        Row: {
          id: string
          profile_id: string
          bio: string
          expertise: string[]
          hourly_rate: number
          availability: string[]
          rating: number
          total_reviews: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          bio: string
          expertise: string[]
          hourly_rate: number
          availability: string[]
          rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          bio?: string
          expertise?: string[]
          hourly_rate?: number
          availability?: string[]
          rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          profile_id: string
          company_name: string
          industry: string
          company_size: string
          description: string
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          company_name: string
          industry: string
          company_size: string
          description: string
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          company_name?: string
          industry?: string
          company_size?: string
          description?: string
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          requirements: string[]
          budget_range: string
          duration: string
          location: string
          status: 'open' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          requirements: string[]
          budget_range: string
          duration: string
          location: string
          status?: 'open' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string
          requirements?: string[]
          budget_range?: string
          duration?: string
          location?: string
          status?: 'open' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          project_id: string
          instructor_id: string
          proposal: string
          proposed_rate: number
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          instructor_id: string
          proposal: string
          proposed_rate: number
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          instructor_id?: string
          proposal?: string
          proposed_rate?: number
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      verification_requests: {
        Row: {
          id: string
          user_id: string
          user_type: 'instructor' | 'company'
          status: 'pending' | 'approved' | 'rejected'
          submitted_at: string
          reviewed_at?: string
          reviewed_by?: string
          rejection_reason?: string
          profile_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_type: 'instructor' | 'company'
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
          reviewed_at?: string
          reviewed_by?: string
          rejection_reason?: string
          profile_data: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_type?: 'instructor' | 'company'
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
          reviewed_at?: string
          reviewed_by?: string
          rejection_reason?: string
          profile_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          document_type: 'business_license' | 'identity_card' | 'certificate' | 'portfolio' | 'other'
          file_name: string
          file_url: string
          file_size: number
          mime_type: string
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          uploaded_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          description: string | null
        }
        Insert: {
          id?: string
          user_id: string
          document_type: 'business_license' | 'identity_card' | 'certificate' | 'portfolio' | 'other'
          file_name: string
          file_url: string
          file_size: number
          mime_type: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          uploaded_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: 'business_license' | 'identity_card' | 'certificate' | 'portfolio' | 'other'
          file_name?: string
          file_url?: string
          file_size?: number
          mime_type?: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          uploaded_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          description?: string | null
        }
      }
      announcements: {
        Row: {
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
        Insert: {
          id?: string
          title: string
          content: string
          category: 'general' | 'important' | 'update' | 'maintenance'
          is_pinned?: boolean
          is_published?: boolean
          author_id: string
          author_name: string
          view_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: 'general' | 'important' | 'update' | 'maintenance'
          is_pinned?: boolean
          is_published?: boolean
          author_id?: string
          author_name?: string
          view_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
    }
  }
}
