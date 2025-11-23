"use client"

import { Search, SlidersHorizontal } from 'lucide-react'

type SearchBarProps = {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onFilterClick?: () => void
}

export function SearchBar({
  placeholder = "Search places...",
  value,
  onChange,
  onFilterClick
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
      <Search className="h-4 w-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="flex-1 text-sm bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
      />
      {onFilterClick && (
        <button
          onClick={onFilterClick}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}
