'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navigation } from '@/components/layout/navigation'
import { useAuthStore } from '@/lib/store'
import { Building2, Mail, Phone, MapPin, Globe, Users, Save, X } from 'lucide-react'

interface CompanyProfile {
  id: string
  companyName: string
  email: string
  phone: string
  description: string
  industry: string
  companySize: string
  website: string
  location: string
  foundedYear: string
  employeeCount: number
  avatarUrl: string | null
  specialties: string[]
  projects: number
  completedProjects: number
}

export default function CompanyProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<CompanyProfile>({
    id: '',
    companyName: '',
    email: '',
    phone: '',
    description: '',
    industry: '',
    companySize: '',
    website: '',
    location: '',
    foundedYear: '',
    employeeCount: 0,
    avatarUrl: null,
    specialties: [],
    projects: 0,
    completedProjects: 0
  })

  const [newSpecialty, setNewSpecialty] = useState('')

  useEffect(() => {
    setProfile({
      id: '1',
      companyName: '테크스타트업',
      email: 'contact@techstartup.com',
      phone: '02-1234-5678',
      description: '혁신적인 기술 솔루션을 제공하는 스타트업입니다. 고객의 비즈니스 성장을 위한 최적의 교육 프로그램을 찾고 있습니다.',
      industry: 'IT/소프트웨어',
      companySize: '50-100명',
      website: 'https://techstartup.com',
      location: '서울시 강남구',
      foundedYear: '2020',
      employeeCount: 75,
      avatarUrl: null,
      specialties: ['웹 개발', '모바일 앱', 'AI/ML'],
      projects: 15,
      completedProjects: 12
    })
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      console.log('프로필 저장:', profile)
      setIsEditing(false)
    } catch (error) {
      console.error('프로필 저장 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !profile.specialties.includes(newSpecialty.trim())) {
      setProfile({
        ...profile,
        specialties: [...profile.specialties, newSpecialty.trim()]
      })
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (index: number) => {
    setProfile({
      ...profile,
      specialties: profile.specialties.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              기업 프로필
            </h1>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                    취소
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? '저장 중...' : '저장'}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)}>
                    프로필 편집
                  </Button>
                  <Link href="/profile/verification">
                    <Button variant="outline">
                      검증 상태
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl">
                      {profile.companyName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{profile.companyName}</CardTitle>
                <CardDescription>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{profile.employeeCount}명</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.website}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.industry}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  기본 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">회사명</Label>
                    <Input
                      id="companyName"
                      value={profile.companyName}
                      onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">웹사이트</Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">회사 소개</Label>
                  <Textarea
                    id="description"
                    value={profile.description}
                    onChange={(e) => setProfile({...profile, description: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>회사 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">산업 분야</Label>
                    <Input
                      id="industry"
                      value={profile.industry}
                      onChange={(e) => setProfile({...profile, industry: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">회사 규모</Label>
                    <Input
                      id="companySize"
                      value={profile.companySize}
                      onChange={(e) => setProfile({...profile, companySize: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foundedYear">설립년도</Label>
                    <Input
                      id="foundedYear"
                      value={profile.foundedYear}
                      onChange={(e) => setProfile({...profile, foundedYear: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">직원 수</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      value={profile.employeeCount}
                      onChange={(e) => setProfile({...profile, employeeCount: parseInt(e.target.value) || 0})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>전문 분야</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((item, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {item}
                      {isEditing && (
                        <button
                          onClick={() => removeSpecialty(index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="새로운 전문 분야"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                    />
                    <Button onClick={addSpecialty} size="sm">추가</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>프로젝트 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {profile.projects}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      총 프로젝트
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {profile.completedProjects}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      완료된 프로젝트
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
