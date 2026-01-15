'use client'

import dynamic from 'next/dynamic'

const AdminProyectosContent = dynamic(() => import('./AdminProyectosContent'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
    </div>
  )
})

export default function ProjectsAdminPage() {
  return <AdminProyectosContent />
}
