"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Search, Bookmark, User } from 'lucide-react'

const tabs = [
  { href: '/home', label: 'Home', Icon: Home },
  { href: '/map', label: 'Map', Icon: Map },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/saved', label: 'Saved', Icon: Bookmark },
  { href: '/profile', label: 'Profile', Icon: User },
]

export function NavigationTabs() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          const Icon = tab.Icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
