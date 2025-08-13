'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Users, AlertCircle } from 'lucide-react'
import { use } from 'react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const { login, loading, isAuthenticated, emailVerified } = useAuth()
  const router = useRouter()
  
  // Next.js 15: searchParams를 React.use()로 감싸기
  const resolvedSearchParams = use(searchParams)

  console.log('🔐 LoginPage render:', {
    loading,
    isAuthenticated,
    hasMessage: !!resolvedSearchParams?.message
  })

  // URL 파라미터에서 메시지 가져오기
  useEffect(() => {
    const messageParam = resolvedSearchParams?.message
    if (messageParam) {
      setMessage(messageParam)
    }
  }, [resolvedSearchParams])

  // 이미 로그인된 사용자는 홈페이지로 리다이렉트
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to home')
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  // 로딩 중이거나 이미 로그인된 경우 로딩 화면 표시
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">
              {loading ? '인증 상태 확인 중...' : '리다이렉트 중...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    console.log('=== LOGIN FORM SUBMIT ===')
    console.log('Form data:', formData)
    
    try {
      const result = await login(formData.email, formData.password)
      console.log('Login result:', result)
      
      if (result.success) {
        console.log('✅ Login successful, redirecting...')
        router.push('/')
      } else {
        console.error('❌ Login failed:', result.error?.message)
        setError(result.error?.message || '로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ Login exception:', error)
      setError('로그인 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>
                              강사온스쿨 계정으로 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>

                                    <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <div>
                          계정이 없으신가요?{' '}
                          <Link
                            href="/signup"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                          >
                            회원가입
                          </Link>
                        </div>

                        <div>
                          로그인 후{' '}
                          <Link
                            href="/profile"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                          >
                            프로필 관리
                          </Link>
                          를 통해 계정을 관리하세요
                        </div>
                      </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
