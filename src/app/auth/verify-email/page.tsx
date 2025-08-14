'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  RefreshCw, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | null>(null)

  // URL에서 토큰 확인
  const token = searchParams.get('token')
  const type = searchParams.get('type')

  useEffect(() => {
    // 이미 로그인된 사용자의 이메일 설정
    if (user?.email) {
      setEmail(user.email)
    }

    // URL에 토큰이 있으면 자동으로 인증 처리
    if (token && type === 'signup') {
      handleEmailVerification(token)
    }
  }, [user, token, type])

  const handleEmailVerification = async (verificationToken: string) => {
    try {
      setVerificationStatus('pending')
      
      // Supabase 클라이언트로 이메일 확인
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase.auth.verifyOtp({
        token_hash: verificationToken,
        type: 'signup'
      })

      if (error) {
        console.error('이메일 인증 오류:', error)
        setVerificationStatus('error')
      } else {
        setVerificationStatus('success')
        // 3초 후 프로필 설정 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/profile/setup')
        }, 3000)
      }
    } catch (error) {
      console.error('이메일 인증 처리 오류:', error)
      setVerificationStatus('error')
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage('이메일을 입력해주세요.')
      return
    }

    try {
      setIsResending(true)
      setResendMessage('')

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage('인증 이메일이 발송되었습니다. 이메일을 확인해주세요.')
      } else {
        setResendMessage(data.error || '이메일 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('이메일 재전송 오류:', error)
      setResendMessage('이메일 전송 중 오류가 발생했습니다.')
    } finally {
      setIsResending(false)
    }
  }

  // 이미 인증된 사용자는 프로필 페이지로 리다이렉트
  if (isAuthenticated && user?.email_confirmed_at) {
    router.push('/profile/instructor')
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">이메일 인증</CardTitle>
            <CardDescription>
              계정을 활성화하려면 이메일을 인증해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 인증 상태 표시 */}
            {verificationStatus === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">이메일 인증 완료!</p>
                  <p className="text-sm text-green-600">프로필 페이지로 이동합니다...</p>
                </div>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">인증 실패</p>
                  <p className="text-sm text-red-600">인증 링크가 유효하지 않거나 만료되었습니다.</p>
                </div>
              </div>
            )}

            {verificationStatus === 'pending' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-medium text-blue-800">인증 처리 중...</p>
                  <p className="text-sm text-blue-600">잠시만 기다려주세요.</p>
                </div>
              </div>
            )}

            {/* 이메일 재전송 폼 */}
            {!token && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 주소</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <Button 
                  onClick={handleResendEmail} 
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      인증 이메일 발송
                    </>
                  )}
                </Button>

                {resendMessage && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    resendMessage.includes('실패') || resendMessage.includes('오류')
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    {resendMessage.includes('실패') || resendMessage.includes('오류') ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <p className={`text-sm ${
                      resendMessage.includes('실패') || resendMessage.includes('오류')
                        ? 'text-red-700'
                        : 'text-green-700'
                    }`}>
                      {resendMessage}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="text-center text-sm text-gray-600 text-gray-500 space-y-2">
              <p>
                이메일을 확인하지 못하셨나요? 스팸 폴더도 확인해보세요.
              </p>
              <p>
                여전히 문제가 있으시면{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  로그인 페이지
                </Link>
                로 돌아가서 다시 시도해보세요.
              </p>
            </div>

            {/* 뒤로가기 버튼 */}
            <div className="text-center">
              <Link href="/login">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  로그인으로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
