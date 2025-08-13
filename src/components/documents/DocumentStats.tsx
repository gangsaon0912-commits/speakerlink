'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useDocuments } from '@/lib/hooks/useDocuments'
import { useAuth } from '@/hooks/useAuth'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock 
} from 'lucide-react'

export default function DocumentStats() {
  const { user } = useAuth()
  const { data: documents } = useDocuments(user?.id)

  // 통계 계산
  const total = documents?.length || 0
  const approved = documents?.filter(d => d.status === 'approved').length || 0
  const pending = documents?.filter(d => d.status === 'pending').length || 0
  const rejected = documents?.filter(d => d.status === 'rejected').length || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">전체 문서</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">승인됨</p>
              <p className="text-2xl font-bold text-green-600">{approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">검토중</p>
              <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">거부됨</p>
              <p className="text-2xl font-bold text-red-600">{rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
