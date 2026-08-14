'use client'

import dynamic from 'next/dynamic'

const AdminLeccionesContent = dynamic(() => import('./AdminLeccionesContent'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chaski-primary"></div>
    </div>
  )
})

export default function LeccionesAdminPage() {
  return <AdminLeccionesContent />
}
