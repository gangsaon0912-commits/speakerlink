'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Star, Zap, Shield, Target } from "lucide-react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { LogoWithText } from "@/components/ui/logo";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, profile, loading, user } = useAuth();

  console.log('Home page auth state:', { isAuthenticated, profile: !!profile, loading, userEmail: profile?.email })

  // 로딩 중이면 간단한 로딩 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 인증 상태가 확실히 false일 때만 로그인 페이지로 리다이렉트하지 않음
  // (useAuth에서 이미 처리됨)

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {isAuthenticated && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                🎉 환영합니다! {profile?.full_name || user?.email}님
              </p>
            </div>
          )}
          <div className="mb-8 flex justify-center">
            <LogoWithText size="lg" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            AI 기반 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">강사 매칭</span> 플랫폼
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            강사온스쿨는 강사와 기업을 효율적으로 연결하는 AI 기반 매칭 플랫폼입니다. 
            개인화된 알고리즘으로 최적의 매칭을 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/projects">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    강사공고 보기
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button size="lg" variant="outline">
                    프로필 관리
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup/instructor">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    강사 등록하기
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline">
                    강사공고 찾기
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            왜 강사온스쿨인가요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>AI 기반 매칭</CardTitle>
                <CardDescription>
                  개인화된 알고리즘으로 강사와 기업의 요구사항을 정확히 분석하여 최적의 매칭을 제공합니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>안전한 거래</CardTitle>
                <CardDescription>
                  검증된 강사와 기업만 등록되며, 안전하고 투명한 거래 환경을 보장합니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>효율적인 연결</CardTitle>
                <CardDescription>
                  복잡한 매칭 과정을 간소화하여 빠르고 효율적인 연결을 제공합니다.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">등록된 강사</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">200+</div>
              <div className="text-blue-100">협력 기업</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1000+</div>
              <div className="text-blue-100">성공한 매칭</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
              지금 시작하세요
            </h2>
            <p className="text-lg text-gray-600 mb-8">
            강사온스쿨와 함께 성공적인 강사 매칭을 경험해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    프로필 관리
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline">
                    강사공고 탐색
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    무료로 시작하기
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    더 알아보기
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
