'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Search, Building2, Eye, Edit, Trash2, Plus, ArrowLeft } from 'lucide-react'
import { getAllCompanies, updateCompanyProfile, deleteCompanyProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Company {
  id: string
  profile_id: string
  company_name: string
  industry: string
  company_size: string
  description: string
  created_at: string
  updated_at: string
  profile?: {
    id: string
    email: string
    full_name: string
    is_verified: boolean
  }
}

export default function AdminCompaniesPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedDetail, setSelectedDetail] = useState<Company | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    company_name: '',
    industry: '',
    company_size: '',
    description: ''
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)

  const isAdmin = user?.email === 'admin@test.com'

  console.log('🏢 AdminCompaniesPage render:', {
    user: user?.email,
    authLoading,
    isAuthenticated,
    isAdmin,
    companiesCount: companies.length,
    loading
  })

  // 기업 데이터 로드
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        console.log('🔍 Loading companies...')
        setLoading(true)
        
        // 강제로 세션 확인
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔐 Current session:', session?.user?.email)
        
        const result = await getAllCompanies()
        console.log('📊 getAllCompanies result:', result)
        
        if (result.success && result.data) {
          console.log('✅ Companies loaded:', result.data.length)
          setCompanies(result.data)
        } else {
          console.error('❌ Failed to load companies:', result.error)
        }
      } catch (error) {
        console.error('❌ Error loading companies:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && isAdmin) {
      console.log('🚀 Starting to load companies...')
      loadCompanies()
    } else {
      console.log('⚠️ Not authenticated or not admin:', { isAuthenticated, isAdmin })
      // 강제로 세션 확인
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔐 Forced session check:', session?.user?.email)
        if (session?.user?.email === 'admin@test.com') {
          console.log('✅ Admin session found, loading companies...')
          loadCompanies()
        }
      }
      checkSession()
    }
  }, [isAuthenticated, isAdmin])

  // 인증 및 권한 확인 - 조건부 렌더링을 return 문으로 이동
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">확인 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/login')
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">접근 권한 없음</CardTitle>
              <CardDescription className="text-center">
                관리자만 접근할 수 있는 페이지입니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  // 필터링된 기업 목록
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.profile?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.profile?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry
    return matchesSearch && matchesIndustry
  })

  // 상세보기 모달 열기
  const handleDetailClick = (company: Company) => {
    setSelectedDetail(company)
    setEditForm({
      company_name: company.company_name,
      industry: company.industry,
      company_size: company.company_size,
      description: company.description
    })
    setIsEditMode(false)
  }

  // 편집 모드 토글
  const handleEditClick = () => {
    setIsEditMode(!isEditMode)
  }

  // 편집 저장
  const handleSaveEdit = async () => {
    if (!selectedDetail) return

    try {
      const result = await updateCompanyProfile(selectedDetail.id, editForm)
      if (result.success) {
        // 목록 새로고침
        const updatedResult = await getAllCompanies()
        if (updatedResult.success && updatedResult.data) {
          setCompanies(updatedResult.data)
        }
        setIsEditMode(false)
        alert('기업 정보가 성공적으로 업데이트되었습니다.')
      } else {
        alert(`저장 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('Error updating company:', error)
      alert('기업 정보 업데이트 중 오류가 발생했습니다.')
    }
  }

  // 삭제 확인
  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company)
    setIsDeleteModalOpen(true)
  }

  // 삭제 실행
  const confirmDelete = async () => {
    if (!companyToDelete) return

    try {
      const result = await deleteCompanyProfile(companyToDelete.id)
      if (result.success) {
        // 목록에서 제거
        setCompanies(companies.filter(c => c.id !== companyToDelete.id))
        setIsDeleteModalOpen(false)
        setCompanyToDelete(null)
        setSelectedDetail(null)
        alert('기업이 성공적으로 삭제되었습니다.')
      } else {
        alert(`삭제 실패: ${result.error?.message}`)
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('기업 삭제 중 오류가 발생했습니다.')
    }
  }

  // 업계 옵션
  const industries = ['all', 'IT/소프트웨어', '금융', '제조업', '의료/바이오', '교육', '마케팅/광고', '기타']

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-gray-900 mb-2">기업 관리</h1>
              <p className="text-gray-600 text-gray-500">등록된 기업들을 관리할 수 있습니다.</p>
            </div>
            <Button onClick={() => router.push('/admin')} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="기업명, 이메일, 담당자명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry === 'all' ? '전체 업계' : industry}
              </option>
            ))}
          </select>
        </div>

        {/* 기업 목록 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">기업 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <Building2 className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{company.company_name}</h3>
                        <p className="text-gray-600 text-gray-500">
                          {company.profile?.full_name} • {company.profile?.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{company.industry}</Badge>
                          <Badge variant="outline">{company.company_size}</Badge>
                          {company.profile?.is_verified && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              인증됨
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDetailClick(company)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        상세보기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredCompanies.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 text-gray-900 mb-2">
                등록된 기업이 없습니다
              </h3>
              <p className="text-gray-600 text-gray-500">
                검색 조건을 변경해보세요.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 상세보기/편집 모달 */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {isEditMode ? '기업 정보 편집' : '기업 상세 정보'}
                </h2>
                <div className="flex space-x-2">
                  {!isEditMode && (
                    <Button variant="outline" onClick={handleEditClick}>
                      <Edit className="h-4 w-4 mr-1" />
                      편집
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDetail(null)
                      setIsEditMode(false)
                    }}
                  >
                    닫기
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">기업명</label>
                  {isEditMode ? (
                    <Input
                      value={editForm.company_name}
                      onChange={(e) => setEditForm({...editForm, company_name: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900 text-gray-900">{selectedDetail.company_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">업계</label>
                  {isEditMode ? (
                    <Input
                      value={editForm.industry}
                      onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900 text-gray-900">{selectedDetail.industry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">기업 규모</label>
                  {isEditMode ? (
                    <Input
                      value={editForm.company_size}
                      onChange={(e) => setEditForm({...editForm, company_size: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900 text-gray-900">{selectedDetail.company_size}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">기업 설명</label>
                  {isEditMode ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-900 text-gray-900">{selectedDetail.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">담당자 정보</label>
                  <p className="text-gray-900 text-gray-900">
                    {selectedDetail.profile?.full_name} ({selectedDetail.profile?.email})
                  </p>
                </div>

                {isEditMode && (
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleSaveEdit}>
                      저장
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditMode(false)}>
                      취소
                    </Button>
                  </div>
                )}

                {!isEditMode && (
                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(selectedDetail)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && companyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">기업 삭제 확인</h3>
              <p className="text-gray-600 text-gray-500 mb-6">
                "{companyToDelete.company_name}" 기업을 삭제하시겠습니까?<br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex space-x-2">
                <Button variant="destructive" onClick={confirmDelete}>
                  삭제
                </Button>
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  취소
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
