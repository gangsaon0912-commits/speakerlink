'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createProject, getAllCompanies } from '@/lib/auth'
import { ArrowLeft, Plus, Building2, Calendar, MapPin, DollarSign, Clock } from 'lucide-react'

export default function CreateProjectPage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading } = useAuth()
  const [companies, setCompanies] = useState<any[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_id: '',
    budget_range: '',
    duration: '',
    location: '',
    status: 'open'
  })

  // 관리자 권한 확인
  const isAdmin = user?.email === 'admin@test.com'

  // 기업 데이터 로드
  useEffect(() => {
    const loadCompanies = async () => {
      if (isAdmin) {
        try {
          console.log('📊 Loading companies data...')
          const companiesResult = await getAllCompanies()
          if (companiesResult.success && companiesResult.data) {
            setCompanies(companiesResult.data)
            console.log('✅ Companies loaded:', companiesResult.data.length)
          }
        } catch (error) {
          console.error('❌ Error loading companies:', error)
        } finally {
          setLoadingCompanies(false)
        }
      }
    }

    loadCompanies()
  }, [isAdmin])

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Redirecting to login page')
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Select 필드 변경 핸들러
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    
    console.log('=== CREATE PROJECT FORM SUBMIT ===')
    console.log('Form data:', formData)
    
    try {
      const result = await createProject(formData)
      console.log('Create project result:', result)
      
      if (result.success) {
        console.log('✅ Project created successfully')
        router.push('/admin/projects')
      } else {
        console.error('❌ Project creation failed:', result.error?.message)
        setError(result.error?.message || '프로젝트 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ Project creation exception:', error)
      setError('프로젝트 생성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우 리다이렉트 중 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">리다이렉트 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 관리자가 아닌 경우 접근 제한
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>접근 권한이 없습니다</CardTitle>
              <CardDescription>
                관리자 권한이 필요합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push('/')}>
                홈으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/projects')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">새 프로젝트 생성</h1>
            <p className="text-gray-600">새로운 프로젝트를 등록합니다.</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                프로젝트 정보
              </CardTitle>
              <CardDescription>
                프로젝트의 기본 정보를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 프로젝트 제목 */}
                <div className="space-y-2">
                  <Label htmlFor="title">프로젝트 제목 *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="예: 웹 개발 프로젝트"
                    required
                  />
                </div>

                {/* 프로젝트 설명 */}
                <div className="space-y-2">
                  <Label htmlFor="description">프로젝트 설명 *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="프로젝트에 대한 자세한 설명을 입력해주세요."
                    rows={4}
                    required
                  />
                </div>

                {/* 기업 선택 */}
                <div className="space-y-2">
                  <Label htmlFor="company_id">담당 기업 *</Label>
                  {loadingCompanies ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-500">기업 목록을 불러오는 중...</span>
                    </div>
                  ) : (
                    <Select value={formData.company_id} onValueChange={(value) => handleSelectChange('company_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="기업을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* 예산 범위 */}
                <div className="space-y-2">
                  <Label htmlFor="budget_range">예산 범위</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="budget_range"
                      name="budget_range"
                      value={formData.budget_range}
                      onChange={handleInputChange}
                      placeholder="예: 5000000-8000000"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">최소-최대 예산을 입력해주세요 (원 단위)</p>
                </div>

                {/* 기간 */}
                <div className="space-y-2">
                  <Label htmlFor="duration">프로젝트 기간</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="예: 8주"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 위치 */}
                <div className="space-y-2">
                  <Label htmlFor="location">프로젝트 위치</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="예: 서울, 부산, 대구"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 상태 */}
                <div className="space-y-2">
                  <Label htmlFor="status">프로젝트 상태</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">모집중</SelectItem>
                      <SelectItem value="in_progress">진행중</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                      <SelectItem value="cancelled">취소됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 버튼 */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/projects')}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !formData.title || !formData.description || !formData.company_id}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        생성 중...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        프로젝트 생성
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
