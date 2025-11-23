'use client'

import { usePathname } from 'next/navigation'
import { NavigationTabs } from '@/components/linear/NavigationTabs'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <div
        key={pathname}
        className="min-h-screen pb-14"
      >
        {children}
      </div>
      <NavigationTabs />
    </>
  )
}
