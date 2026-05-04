'use client'

import { Input } from '@/components/ui/input'
import type { Origin, Status } from '@/lib/types'

export type OriginFilter = Origin | 'all'

const ORIGIN_FILTERS: { value: OriginFilter; label: string }[] = [
  { value: 'all',      label: 'All'      },
  { value: 'chinese',  label: 'Chinese'  },
  { value: 'korean',   label: 'Korean'   },
  { value: 'japanese', label: 'Japanese' },
  { value: 'other',    label: 'Other'    },
]

const STATUS_FILTERS: { value: Status; label: string }[] = [
  { value: 'finished',             label: 'Finished'      },
  { value: 'dropped',              label: 'Dropped'       },
  { value: 'translation_dropped',  label: 'Trans Dropped' },
  { value: 'translation_finished', label: 'Trans Finished'},
]

const inputCls = "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 dark:bg-zinc-800 dark:border-zinc-600 dark:text-white dark:placeholder:text-zinc-500"

interface SearchFilterBarProps {
  search: string
  originFilter: OriginFilter
  statusFilter: Status[]
  likedFilter: boolean
  onSearch: (v: string) => void
  onOriginFilter: (v: OriginFilter) => void
  onStatusFilter: (v: Status[]) => void
  onLikedFilter: (v: boolean) => void
  onClearAll: () => void
}

function pill(active: boolean, activeColor: string) {
  const base = 'px-2.5 py-1 rounded text-xs font-medium border transition-colors'
  const on = `${activeColor} text-white`
  const off = 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400'
  return `${base} ${active ? on : off}`
}

export function SearchFilterBar({
  search,
  originFilter,
  statusFilter,
  likedFilter,
  onSearch,
  onOriginFilter,
  onStatusFilter,
  onLikedFilter,
  onClearAll,
}: SearchFilterBarProps) {
  const hasActiveFilters = search || originFilter !== 'all' || statusFilter.length > 0 || likedFilter

  function toggleStatus(value: Status) {
    onStatusFilter(
      statusFilter.includes(value)
        ? statusFilter.filter((s) => s !== value)
        : [...statusFilter, value]
    )
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search novels…"
        className={`${inputCls} w-52`}
      />

      {/* Origin pills */}
      <div className="flex flex-wrap gap-1.5">
        {ORIGIN_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onOriginFilter(value)}
            className={pill(originFilter === value, 'bg-slate-600 border-slate-600 dark:bg-slate-500 dark:border-slate-500')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 self-center" />

      {/* Status + like pills */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => toggleStatus(value)}
            className={pill(statusFilter.includes(value), 'bg-teal-600 border-teal-600 dark:bg-teal-500 dark:border-teal-500')}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => onLikedFilter(!likedFilter)}
          className={pill(likedFilter, 'bg-green-600 border-green-600 dark:bg-green-500 dark:border-green-500')}
        >
          Like
        </button>
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="px-2.5 py-1 rounded text-xs font-medium text-gray-400 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
        >
          × Clear
        </button>
      )}
    </div>
  )
}
