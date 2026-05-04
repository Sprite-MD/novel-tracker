'use client'

import { useTheme } from '@/components/ThemeProvider'

export function ThemeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium
        border border-gray-200 bg-white text-gray-600 hover:bg-gray-100
        dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700
        transition-colors"
    >
      {dark ? '☀ Light' : '☾ Dark'}
    </button>
  )
}
