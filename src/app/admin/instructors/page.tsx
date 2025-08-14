'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navigation } from '@/components/layout/navigation'
import { useAuth } from '@/hooks/useAuth'
import { updateInstructorProfile, deleteInstructorProfile, getAllInstructors } from '@/lib/auth'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Eye,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Mail,
  Phone,
  Globe,
  Award,
  BookOpen,
  User,
  X,
  ArrowLeft
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Instructor {
  id: string
  profile_id: string
  full_name: string
  email: string
  bio: string
  expertise: string[]
  hourly_rate: number
  rating: number
  total_reviews: number
  is_verified: boolean
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  location?: string
  avatar_url?: string
}

export default function AdminInstructorsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [instructorToDelete, setInstructorToDelete] = useState<Instructor | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    bio: '',
    expertise: [] as string[],
    hourly_rate: 0,
    location: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    is_verified: false
  })

  // 관리자 권한 확인
  const isAdmin = user?.email === 'admin@test.com'

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // 관리자가 아닌 경우 접근 제한
  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin) {
      console.log('Not admin, redirecting to admin dashboard')
      router.push('/admin')
    }
  }, [isAuthenticated, loading, isAdmin, router])

  // 실제 데이터베이스에서 강사 목록 로드
  useEffect(() => {
    const loadInstructors = async () => {
      if (isAuthenticated && isAdmin) {
        try {
          console.log('Loading instructors from database...')
          const result = await getAllInstructors()
          
          if (result.data && result.data.length > 0) {
            console.log('Instructors loaded successfully:', result.data.length)
            // 데이터베이스에서 가져온 데이터를 UI 형식에 맞게 변환
            const formattedInstructors: Instructor[] = result.data.map((instructor: any) => ({
              id: instructor.id,
              profile_id: instructor.profile_id,
              full_name: instructor.full_name || '이름 없음',
              email: instructor.email || '이메일 없음',
              bio: instructor.bio || '자기소개 없음',
              expertise: instructor.expertise || [],
              hourly_rate: instructor.hourly_rate || 0,
              rating: instructor.rating || 0,
              total_reviews: instructor.total_reviews || 0,
              is_verified: instructor.is_verified || false,
              status: instructor.is_verified ? 'approved' : 'pending',
              created_at: instructor.created_at || new Date().toISOString(),
              location: instructor.location || '위치 없음',
              avatar_url: instructor.avatar_url || undefined
            }))
            setInstructors(formattedInstructors)
            setFilteredInstructors(formattedInstructors)
          } else {
            console.log('No instructors found in database')
            setInstructors([])
            setFilteredInstructors([])
          }
        } catch (error) {
          console.error('Error loading instructors:', error)
          // 오류 발생 시 빈 배열로 설정
          setInstructors([])
          setFilteredInstructors([])
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadInstructors()
  }, [isAuthenticated, isAdmin])

  // 검색 및 필터링
  useEffect(() => {
    let filtered = instructors

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(instructor =>
        (instructor.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 상태 필터링
    if (statusFilter !== 'all') {
      filtered = filtered.filter(instructor => instructor.status === statusFilter)
    }

    setFilteredInstructors(filtered)
  }, [instructors, searchTerm, statusFilter])

  const handleStatusChange = (instructorId: string, newStatus: 'approved' | 'rejected') => {
    setInstructors(prev => prev.map(instructor =>
      instructor.id === instructorId
        ? { ...instructor, status: newStatus, is_verified: newStatus === 'approved' }
        : instructor
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">승인됨</Badge>
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>
      case 'rejected':
        return <Badge variant="destructive">거부됨</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  const getStatusCount = (status: string) => {
    return instructors.filter(instructor => instructor.status === status).length
  }

  const handleViewDetails = (instructor: Instructor) => {
    console.log('상세보기 버튼 클릭됨:', instructor.full_name)
    setSelectedInstructor(instructor)
    setIsDetailModalOpen(true)
  }

  const handleCloseModal = () => {
    console.log('모달 닫기')
    setIsDetailModalOpen(false)
    setSelectedInstructor(null)
    setIsEditMode(false)
    setEditForm({
      full_name: '',
      email: '',
      bio: '',
      expertise: [],
      hourly_rate: 0,
      location: '',
      status: 'pending',
      is_verified: false
    })
  }

  const handleEditMode = () => {
    if (selectedInstructor) {
      setEditForm({
        full_name: selectedInstructor.full_name,
        email: selectedInstructor.email,
        bio: selectedInstructor.bio,
        expertise: [...selectedInstructor.expertise],
        hourly_rate: selectedInstructor.hourly_rate,
        location: selectedInstructor.location || '',
        status: selectedInstructor.status,
        is_verified: selectedInstructor.is_verified
      })
      setIsEditMode(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    if (selectedInstructor) {
      setEditForm({
        full_name: selectedInstructor.full_name,
        email: selectedInstructor.email,
        bio: selectedInstructor.bio,
        expertise: [...selectedInstructor.expertise],
        hourly_rate: selectedInstructor.hourly_rate,
        location: selectedInstructor.location || '',
        status: selectedInstructor.status,
        is_verified: selectedInstructor.is_verified
      })
    }
  }

  const handleSaveEdit = async () => {
    if (selectedInstructor) {
      try {
        console.log('Saving instructor data to database...')
        
        const result = await updateInstructorProfile(selectedInstructor.id, {
          full_name: editForm.full_name,
          email: editForm.email,
          location: editForm.location,
          hourly_rate: editForm.hourly_rate,
          bio: editForm.bio,
          expertise: editForm.expertise,
          is_verified: editForm.is_verified
        })

        if (result.success) {
          console.log('강사 정보가 데이터베이스에 성공적으로 저장되었습니다:', editForm.full_name)
          
          // 데이터베이스에서 최신 데이터를 다시 가져와서 UI 업데이트
          const refreshResult = await getAllInstructors()
          if (refreshResult.data) {
            const formattedInstructors: Instructor[] = refreshResult.data.map((instructor: any) => ({
              id: instructor.id,
              profile_id: instructor.profile_id,
              full_name: instructor.full_name || '이름 없음',
              email: instructor.email || '이메일 없음',
              bio: instructor.bio || '자기소개 없음',
              expertise: instructor.expertise || [],
              hourly_rate: instructor.hourly_rate || 0,
              rating: instructor.rating || 0,
              total_reviews: instructor.total_reviews || 0,
              is_verified: instructor.is_verified || false,
              status: instructor.is_verified ? 'approved' : 'pending',
              created_at: instructor.created_at || new Date().toISOString(),
              location: instructor.location || '위치 없음',
              avatar_url: instructor.avatar_url || undefined
            }))
            
            setInstructors(formattedInstructors)
            setFilteredInstructors(formattedInstructors)
            
            // 현재 편집 중인 강사의 최신 정보로 업데이트
            const updatedInstructor = formattedInstructors.find(i => i.id === selectedInstructor.id)
            if (updatedInstructor) {
              setSelectedInstructor(updatedInstructor)
            }
          }
          
          setIsEditMode(false)
          
          // 성공 메시지 표시
          alert('강사 정보가 성공적으로 저장되었습니다!')
        } else {
          console.error('강사 정보 저장 실패:', result.error?.message)
          alert(`저장 실패: ${result.error?.message}`)
        }
      } catch (error) {
        console.error('강사 정보 저장 중 오류 발생:', error)
        alert('저장 중 오류가 발생했습니다.')
      }
    }
  }

  const handleAddExpertise = () => {
    const newSkill = prompt('새로운 전문 분야를 입력하세요:')
    if (newSkill && newSkill.trim()) {
      setEditForm(prev => ({
        ...prev,
        expertise: [...prev.expertise, newSkill.trim()]
      }))
    }
  }

  const handleRemoveExpertise = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }))
  }

  const handleDeleteInstructor = (instructor: Instructor) => {
    setInstructorToDelete(instructor)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (instructorToDelete) {
      try {
        console.log('Deleting instructor from database...')
        
        const result = await deleteInstructorProfile(instructorToDelete.id)
        
        if (result.success) {
          console.log('강사가 데이터베이스에서 삭제되었습니다:', instructorToDelete.full_name)
          
          // 데이터베이스에서 최신 데이터를 다시 가져와서 UI 업데이트
          const refreshResult = await getAllInstructors()
          if (refreshResult.data) {
            const formattedInstructors: Instructor[] = refreshResult.data.map((instructor: any) => ({
              id: instructor.id,
              profile_id: instructor.profile_id,
              full_name: instructor.full_name || '이름 없음',
              email: instructor.email || '이메일 없음',
              bio: instructor.bio || '자기소개 없음',
              expertise: instructor.expertise || [],
              hourly_rate: instructor.hourly_rate || 0,
              rating: instructor.rating || 0,
              total_reviews: instructor.total_reviews || 0,
              is_verified: instructor.is_verified || false,
              status: instructor.is_verified ? 'approved' : 'pending',
              created_at: instructor.created_at || new Date().toISOString(),
              location: instructor.location || '위치 없음',
              avatar_url: instructor.avatar_url || undefined
            }))
            
            setInstructors(formattedInstructors)
            setFilteredInstructors(formattedInstructors)
          } else {
            // 데이터가 없으면 빈 배열로 설정
            setInstructors([])
            setFilteredInstructors([])
          }
          
          // 상세보기 모달이 열려있고 삭제된 강사가 선택된 강사라면 모달 닫기
          if (selectedInstructor?.id === instructorToDelete.id) {
            handleCloseModal()
          }
          
          alert('강사가 성공적으로 삭제되었습니다!')
        } else {
          console.error('강사 삭제 실패:', result.error?.message)
          alert(`삭제 실패: ${result.error?.message}`)
        }
      } catch (error) {
        console.error('강사 삭제 중 오류 발생:', error)
        alert('삭제 중 오류가 발생했습니다.')
      }
    }
    setIsDeleteModalOpen(false)
    setInstructorToDelete(null)
  }

  const cancelDelete = () => {
    setIsDeleteModalOpen(false)
    setInstructorToDelete(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 로딩 중이거나 인증/권한 확인 중인 경우 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">인증 상태 확인 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우 null 반환 (리다이렉트는 useEffect에서 처리)
  if (!isAuthenticated) {
    return null
  }

  // 관리자가 아닌 경우 null 반환 (리다이렉트는 useEffect에서 처리)
  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-gray-900 mb-2">
                강사 관리
              </h1>
              <p className="text-gray-600 text-gray-600">
                등록된 강사들을 관리하고 검토합니다.
              </p>
            </div>
            <Button onClick={() => router.push('/admin')} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">전체 강사</p>
                    <p className="text-2xl font-bold">{instructors.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">승인됨</p>
                    <p className="text-2xl font-bold text-green-600">{getStatusCount('approved')}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">대기중</p>
                    <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</p>
                  </div>
                  <Filter className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">거부됨</p>
                    <p className="text-2xl font-bold text-red-600">{getStatusCount('rejected')}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="강사 이름, 이메일, 전문 분야로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                전체
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                대기중
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('approved')}
              >
                승인됨
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('rejected')}
              >
                거부됨
              </Button>
            </div>
          </div>
        </div>

        {/* 강사 목록 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">강사 목록을 불러오는 중...</p>
            </div>
          ) : filteredInstructors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredInstructors.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={instructor.avatar_url || undefined} />
                        <AvatarFallback className="text-lg">
                          {instructor.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{instructor.full_name || '이름 없음'}</h3>
                          {getStatusBadge(instructor.status)}
                          {instructor.is_verified && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              검증됨
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{instructor.email}</p>
                        <p className="text-sm text-gray-500 mb-3">{instructor.bio}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {instructor.hourly_rate > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>시급 {instructor.hourly_rate.toLocaleString()}원</span>
                            </div>
                          )}
                          {instructor.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{instructor.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {instructor.expertise.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(instructor)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        상세보기
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {instructor.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(instructor.id, 'approved')}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                승인
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(instructor.id, 'rejected')}>
                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                거부
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => {
                            handleViewDetails(instructor)
                            setTimeout(() => handleEditMode(), 100)
                          }}>
                            프로필 편집
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteInstructor(instructor)}
                          >
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      {isDetailModalOpen && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedInstructor.avatar_url || undefined} />
                    <AvatarFallback className="text-xl">
                                              {isEditMode ? editForm.full_name?.charAt(0) || '?' : selectedInstructor.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {isEditMode ? (
                      <Input
                        value={editForm.full_name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                        className="text-2xl font-bold border-none p-0 h-auto"
                        placeholder="강사 이름"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900">{selectedInstructor.full_name || '이름 없음'}</h2>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {isEditMode ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm(prev => ({ 
                            ...prev, 
                            status: e.target.value as 'pending' | 'approved' | 'rejected' 
                          }))}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="pending">대기중</option>
                          <option value="approved">승인됨</option>
                          <option value="rejected">거부됨</option>
                        </select>
                      ) : (
                        getStatusBadge(selectedInstructor.status)
                      )}
                      {isEditMode ? (
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.is_verified}
                            onChange={(e) => setEditForm(prev => ({ ...prev, is_verified: e.target.checked }))}
                            className="rounded"
                          />
                          검증됨
                        </label>
                      ) : (
                        selectedInstructor.is_verified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            검증됨
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditMode ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSaveEdit}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        저장
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleEditMode}
                      >
                        편집
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteInstructor(selectedInstructor)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              {/* 기본 정보 섹션 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      기본 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">이메일:</span>
                      {isEditMode ? (
                        <Input
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="flex-1"
                          placeholder="이메일"
                        />
                      ) : (
                        <span className="text-gray-700">{selectedInstructor.email || '이메일 없음'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">가입일:</span>
                                              <span className="text-gray-700">{selectedInstructor.created_at ? formatDate(selectedInstructor.created_at) : '날짜 없음'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">위치:</span>
                      {isEditMode ? (
                        <Input
                          value={editForm.location || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          className="flex-1"
                          placeholder="위치"
                        />
                      ) : (
                        <span className="text-gray-700">{selectedInstructor.location || '미설정'}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      성과 및 평가
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    
                    {(isEditMode || (selectedInstructor.hourly_rate && selectedInstructor.hourly_rate > 0)) && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-500" />
                          <span className="font-medium">시급</span>
                        </div>
                        {isEditMode ? (
                          <Input
                            type="number"
                            value={editForm.hourly_rate || 0}
                            onChange={(e) => setEditForm(prev => ({ ...prev, hourly_rate: parseInt(e.target.value) || 0 }))}
                            className="w-32 text-right"
                            placeholder="시급"
                          />
                        ) : (
                          <div className="text-2xl font-bold text-green-600">
                            {(selectedInstructor.hourly_rate || 0).toLocaleString()}원
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 전문 분야 섹션 */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    전문 분야
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                                            {(isEditMode ? (editForm.expertise || []) : (selectedInstructor.expertise || [])).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                        {isEditMode && (
                          <button
                            onClick={() => handleRemoveExpertise(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                    {isEditMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddExpertise}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        + 추가
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 자기소개 섹션 */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    자기소개
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditMode ? (
                    <textarea
                                              value={editForm.bio || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full p-3 border rounded-md resize-none"
                      rows={4}
                      placeholder="자기소개를 입력하세요"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      {selectedInstructor.bio || '자기소개가 없습니다.'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* 관리 액션 */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  강사 ID: {selectedInstructor.id}
                </div>
                <div className="flex gap-3">
                  {!isEditMode && selectedInstructor.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          handleStatusChange(selectedInstructor.id, 'approved')
                          handleCloseModal()
                        }}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        승인
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          handleStatusChange(selectedInstructor.id, 'rejected')
                          handleCloseModal()
                        }}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        거부
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteInstructor(selectedInstructor)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                  <Button variant="outline" onClick={handleCloseModal}>
                    닫기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && instructorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">강사 삭제</h3>
                <p className="text-sm text-gray-600">이 작업은 되돌릴 수 없습니다.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                다음 강사를 삭제하시겠습니까?
              </p>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={instructorToDelete.avatar_url || undefined} />
                    <AvatarFallback>
                      {instructorToDelete.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{instructorToDelete.full_name}</p>
                    <p className="text-sm text-gray-600">{instructorToDelete.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(instructorToDelete.status)}
                      {instructorToDelete.is_verified && (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          검증됨
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={cancelDelete}
              >
                취소
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
