'use client'

import dynamic from 'next/dynamic'

const AdminProyectosContent = dynamic(() => import('./AdminProyectosContent'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
    </div>
  )
})

export default function ProjectsAdminPage() {
  return <AdminProyectosContent />
}
