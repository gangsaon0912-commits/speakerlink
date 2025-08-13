import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: any | null
  isLoading: boolean
  isAdmin: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: any | null) => void
  setLoading: (loading: boolean) => void
  setIsAdmin: (isAdmin: boolean) => void
}

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
}))

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
