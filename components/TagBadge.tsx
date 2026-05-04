'use client'

import type { Origin, Status } from '@/lib/types'

const ORIGIN_STYLES: Record<Origin, string> = {
  chinese:  'bg-rose-500 text-white',
  korean:   'bg-teal-600 text-white',
  japanese: 'bg-orange-500 text-white',
  other:    'bg-slate-500 text-white',
}

const STATUS_STYLES: Record<Status, { pill: boolean; cls: string }> = {
  finished:             { pill: true,  cls: 'bg-pink-600 text-white' },
  dropped:              { pill: true,  cls: 'bg-zinc-400 dark:bg-zinc-600 text-white' },
  translation_dropped:  { pill: true,  cls: 'bg-amber-500 text-white' },
  translation_finished: { pill: true,  cls: 'bg-purple-600 text-white' },
}

const STATUS_LABELS: Record<Status, string> = {
  finished: 'Finished Reading',
  dropped: 'Dropped',
  translation_dropped: 'Translation Dropped',
  translation_finished: 'Translation Finished',
}

const ORIGIN_LABELS: Record<Origin, string> = {
  chinese: 'Chinese',
  korean: 'Korean',
  japanese: 'Japanese',
  other: 'Other',
}

interface TagBadgeProps {
  origin?: Origin | null
  status?: Status[]
  liked?: boolean
}

export function TagBadge({ origin, status = [], liked }: TagBadgeProps) {
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {origin && (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${ORIGIN_STYLES[origin]}`}>
          {ORIGIN_LABELS[origin]}
        </span>
      )}
      {status.map((s) => {
        const { pill, cls } = STATUS_STYLES[s]
        return (
          <span key={s} className={pill ? `px-2 py-0.5 rounded text-xs font-medium ${cls}` : `text-xs ${cls}`}>
            {STATUS_LABELS[s]}
          </span>
        )
      })}
      {liked && (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-600 text-white">
          Like
        </span>
      )}
    </div>
  )
}
