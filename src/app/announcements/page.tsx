'use client'

import { Navigation } from '@/components/layout/navigation'
import AnnouncementList from '@/components/announcements/AnnouncementList'

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnnouncementList />
      </div>
    </div>
  )
}
