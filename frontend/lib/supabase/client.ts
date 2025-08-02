/**
 * AI Leadership 4Dx - Supabase 클라이언트 설정
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { mockAuth } from '@/lib/auth/mockAuth'

// 개발 모드에서 Mock Auth 사용 여부
const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.')
    // 개발 모드에서는 더미 클라이언트 반환
    return createBrowserClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }
  
  return createBrowserClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

// 기본 클라이언트 인스턴스
export const supabase = createClient()

// 인증 헬퍼 함수들
export const auth = USE_MOCK_AUTH ? {
  // Mock Auth 사용 시
  getCurrentUser: async () => {
    const { session } = await mockAuth.getSession()
    return { user: session?.user || null, error: null }
  },

  getSession: async () => {
    return mockAuth.getSession()
  },

  signIn: async (email: string, password: string) => {
    const result = await mockAuth.signIn(email, password)
    return { data: result.user ? { user: result.user, session: { user: result.user } } : null, error: result.error }
  },

  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    const result = await mockAuth.signUp(email, password, metadata)
    return { data: result.user ? { user: result.user, session: { user: result.user } } : null, error: result.error }
  },

  signOut: async () => {
    return mockAuth.signOut()
  },

  signInWithProvider: async (provider: 'google' | 'github') => {
    return { data: null, error: { message: 'Social login not available in development mode' } }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return mockAuth.onAuthStateChange(callback)
  }
} : {
  // 실제 Supabase 사용 시
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  signInWithProvider: async (provider: 'google' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default supabase