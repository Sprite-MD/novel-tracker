export type Origin = 'chinese' | 'korean' | 'japanese' | 'other'
export type Status =
  | 'finished'
  | 'dropped'
  | 'translation_dropped'
  | 'translation_finished'

export interface Novel {
  id: string
  name: string
  chapter: string | null
  last_read: string | null  // ISO date string yyyy-MM-dd
  notes: string | null
  origin: Origin | null
  status: Status[]          // empty array = currently reading
  liked: boolean
  created_at: string
  updated_at: string
}

export type NovelCreate = Omit<Novel, 'id' | 'created_at' | 'updated_at'>
export type NovelUpdate = Partial<NovelCreate>

export const ORIGIN_LABELS: Record<Origin, string> = {
  chinese: 'Chinese',
  korean: 'Korean',
  japanese: 'Japanese',
  other: 'Other',
}

export const STATUS_LABELS: Record<Status, string> = {
  finished: 'Finished Reading',
  dropped: 'Dropped',
  translation_dropped: 'Translation Dropped',
  translation_finished: 'Translation Finished',
}
