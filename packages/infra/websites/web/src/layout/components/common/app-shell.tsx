import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Sidebar } from '@/layout/components/sidebar/sidebar'

export function AppShell() {
  return (
    <div className="grid min-h-screen grid-cols-[248px_1fr]">
      <Sidebar />
      <main>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
