'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Eye, EyeOff, AlertCircle, ArrowRight, User, Building2 } from 'lucide-react'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
  })

  const { register, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (!formData.userType) {
      setError('계정 유형을 선택해주세요.')
      return
    }

    const result = await register(
      formData.email, 
      formData.password, 
      formData.fullName, 
      formData.userType as 'instructor' | 'company'
    )
    
    if (result.success) {
      // 회원가입 성공 시 이메일 인증 페이지로 이동
      if (result.error?.message?.includes('이메일을 확인')) {
        router.push('/auth/verify-email')
      } else {
        // 이메일 인증이 이미 완료된 경우 프로필 설정 페이지로 이동
        router.push('/profile/setup')
      }
    } else if (result.error) {
      setError(result.error.message)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      userType: value,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="w-full max-w-4xl">
                              <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 text-gray-900 mb-2">
                        강사온스쿨에 가입하세요
                      </h1>
                      <p className="text-gray-600 text-gray-600">
                        원하는 방식으로 시작하세요
                      </p>
                    </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-gray-900 mb-2">
              빠른 시작
            </h2>
            <p className="text-gray-600 text-gray-600 max-w-md mx-auto">
              간단한 회원가입으로 시작하고 나중에 프로필을 완성하세요
            </p>
            
            {/* 특징 목록 */}
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 text-gray-500">빠른 계정 생성</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 text-gray-500">단계별 프로필 설정</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 text-gray-500">유연한 정보 입력</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 text-gray-500">즉시 서비스 이용</span>
              </div>
            </div>
          </div>

                              {/* 빠른 시작 회원가입 폼 */}
                    <div className="mt-8">
                      <Card className="w-full max-w-md mx-auto">
                        <CardHeader className="text-center">
                          <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <CardTitle className="text-2xl">회원가입</CardTitle>
                          <CardDescription>
                            간단한 정보로 계정을 만들어보세요
                          </CardDescription>
                        </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">이름</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="홍길동"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

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
                    <Label htmlFor="userType">계정 유형</Label>
                    <Select value={formData.userType} onValueChange={handleSelectChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="계정 유형을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instructor">강사</SelectItem>
                        <SelectItem value="company">기업</SelectItem>
                      </SelectContent>
                    </Select>
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="비밀번호를 다시 입력하세요"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
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
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? '회원가입 중...' : '회원가입'}
                  </Button>

                  <div className="text-center text-sm text-gray-600 text-gray-500">
                    이미 계정이 있으신가요?{' '}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                    >
                      로그인
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
