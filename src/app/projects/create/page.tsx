'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/layout/navigation'
import { useAuthStore } from '@/lib/store'
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Save,
  BookOpen,
  Megaphone,
  Code,
  Palette,
  TrendingUp
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

interface ProjectForm {
  title: string
  description: string
  category: string
  budget_range: string
  duration: string
  location: string
  requirements: string[]
  additional_info: string
}

export default function CreateProjectPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [newRequirement, setNewRequirement] = useState('')
  const [formData, setFormData] = useState<ProjectForm>({
    title: '',
    description: '',
    category: '',
    budget_range: '',
    duration: '',
    location: '',
    requirements: [],
    additional_info: ''
  })

  const categories = [
    { value: '강의', label: '강의', icon: <BookOpen className="w-4 h-4" /> },
    { value: '마케팅', label: '마케팅', icon: <Megaphone className="w-4 h-4" /> },
    { value: '디자인', label: '디자인', icon: <Palette className="w-4 h-4" /> },
    { value: '개발', label: '개발', icon: <Code className="w-4 h-4" /> },
    { value: '비즈니스', label: '비즈니스', icon: <TrendingUp className="w-4 h-4" /> }
  ]

  const budgetRanges = [
    '50만원 - 100만원',
    '100만원 - 200만원',
    '200만원 - 300만원',
    '300만원 - 500만원',
    '500만원 - 800만원',
    '800만원 - 1,000만원',
    '1,000만원 이상'
  ]

  const durations = [
    '1개월',
    '2개월',
    '3개월',
    '4개월',
    '5개월',
    '6개월',
    '6개월 이상'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // TODO: Supabase에 프로젝트 저장
      console.log('프로젝트 생성:', formData)
      
      // 성공 시 프로젝트 목록으로 이동
      router.push('/projects')
    } catch (error) {
      console.error('프로젝트 생성 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()]
      })
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    })
  }

  const getCategoryIcon = (category: string) => {
    const found = categories.find(cat => cat.value === category)
    return found ? found.icon : <BookOpen className="w-4 h-4" />
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '강의':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case '마케팅':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case '디자인':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
      case '개발':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case '비즈니스':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>로그인이 필요합니다</CardTitle>
              <CardDescription>
                프로젝트를 등록하려면 로그인해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/login">
                <Button>로그인하기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            프로젝트 등록
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            새로운 프로젝트를 등록하고 적합한 전문가를 찾아보세요.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 메인 폼 */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>
                    프로젝트의 기본 정보를 입력해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">프로젝트 제목 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="프로젝트 제목을 입력하세요"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">카테고리 *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              {category.icon}
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">프로젝트 설명 *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="프로젝트에 대한 자세한 설명을 입력하세요"
                      rows={6}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>프로젝트 세부사항</CardTitle>
                  <CardDescription>
                    프로젝트의 세부 조건을 설정해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">예산 범위 *</Label>
                      <Select value={formData.budget_range} onValueChange={(value) => setFormData({...formData, budget_range: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="예산 범위를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">진행 기간 *</Label>
                      <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="진행 기간을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">진행 지역 *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="예: 서울시 강남구, 온라인, 부산시 해운대구"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>요구사항</CardTitle>
                  <CardDescription>
                    필요한 기술이나 경험을 추가해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {req}
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="새로운 요구사항"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <Button type="button" onClick={addRequirement} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>추가 정보</CardTitle>
                  <CardDescription>
                    기타 참고사항이나 특별한 요구사항이 있다면 입력해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.additional_info}
                    onChange={(e) => setFormData({...formData, additional_info: e.target.value})}
                    placeholder="추가 정보를 입력하세요 (선택사항)"
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>프로젝트 미리보기</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.title && (
                    <div>
                      <h3 className="font-semibold text-lg">{formData.title}</h3>
                      {formData.category && (
                        <Badge className={`${getCategoryColor(formData.category)} flex items-center gap-1 mt-2`}>
                          {getCategoryIcon(formData.category)}
                          {formData.category}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {formData.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {formData.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {formData.budget_range && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">예산:</span>
                        <span className="font-medium">{formData.budget_range}</span>
                      </div>
                    )}
                    {formData.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">기간:</span>
                        <span className="font-medium">{formData.duration}</span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">지역:</span>
                        <span className="font-medium">{formData.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {formData.requirements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">요구사항</h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.requirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>등록 가이드</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium">프로젝트 제목</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      명확하고 구체적인 제목을 사용하세요.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">프로젝트 설명</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      목표, 범위, 기대 결과를 포함하여 작성하세요.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">요구사항</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      필요한 기술, 경험, 자격을 구체적으로 명시하세요.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Link href="/projects">
              <Button variant="outline">취소</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  프로젝트 등록
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
