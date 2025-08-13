'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Navigation } from '@/components/layout/navigation'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // 비밀번호 유효성 검사
  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  }

  const passwordValidation = validatePassword(password)
  const passwordsMatch = password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!passwordValidation.isValid) {
      setError('비밀번호가 요구사항을 충족하지 않습니다.')
      setLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      console.error('Password update error:', err)
      setError(err.message || '비밀번호 변경에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">새 비밀번호 설정</CardTitle>
            <CardDescription>
              새로운 비밀번호를 입력해주세요.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    비밀번호가 성공적으로 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.
                  </AlertDescription>
                </Alert>
                
                <div className="text-center">
                  <Button asChild>
                    <Link href="/login">
                      로그인 페이지로 이동
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password">새 비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="새 비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pr-10"
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
                  
                  {/* 비밀번호 요구사항 */}
                  <div className="text-xs space-y-1">
                    <p className="font-medium text-gray-700 text-gray-600">비밀번호 요구사항:</p>
                    <div className={`${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      • 최소 8자 이상
                    </div>
                    <div className={`${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      • 대문자 포함
                    </div>
                    <div className={`${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      • 소문자 포함
                    </div>
                    <div className={`${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                      • 숫자 포함
                    </div>
                    <div className={`${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                      • 특수문자 포함
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {confirmPassword && (
                    <div className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordsMatch ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !passwordValidation.isValid || !passwordsMatch}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      변경 중...
                    </>
                  ) : (
                    '비밀번호 변경'
                  )}
                </Button>
                
                <div className="text-center">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    로그인으로 돌아가기
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
