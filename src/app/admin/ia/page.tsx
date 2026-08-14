'use client'

import dynamic from 'next/dynamic'

const AdminIAContent = dynamic(() => import('./AdminIAContent'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chaski-primary"></div>
    </div>
  )
})

export default function IAAdminPage() {
  return <AdminIAContent />
}
