import type { NovelCreate, NovelUpdate, Origin, Status } from '@/lib/types'

const VALID_ORIGINS = new Set<Origin>(['chinese', 'korean', 'japanese', 'other'])
const VALID_STATUSES = new Set<Status>(['finished', 'dropped', 'translation_dropped', 'translation_finished'])

export function validateNovelCreate(body: unknown): { data: NovelCreate; error: null } | { data: null; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { data: null, error: 'Invalid request body' }
  }
  const b = body as Record<string, unknown>

  if (typeof b.name !== 'string' || !b.name.trim()) {
    return { data: null, error: 'Name is required' }
  }
  if (b.chapter !== undefined && b.chapter !== null && typeof b.chapter !== 'string') {
    return { data: null, error: 'chapter must be a string or null' }
  }
  if (b.last_read !== undefined && b.last_read !== null && typeof b.last_read !== 'string') {
    return { data: null, error: 'last_read must be a date string or null' }
  }
  if (b.notes !== undefined && b.notes !== null && typeof b.notes !== 'string') {
    return { data: null, error: 'notes must be a string or null' }
  }
  if (b.origin !== undefined && b.origin !== null && !VALID_ORIGINS.has(b.origin as Origin)) {
    return { data: null, error: `origin must be one of: ${[...VALID_ORIGINS].join(', ')}` }
  }
  if (b.status !== undefined) {
    if (!Array.isArray(b.status)) {
      return { data: null, error: 'status must be an array' }
    }
    const bad = (b.status as unknown[]).find((s) => !VALID_STATUSES.has(s as Status))
    if (bad !== undefined) {
      return { data: null, error: `invalid status value: "${bad}". Must be one of: ${[...VALID_STATUSES].join(', ')}` }
    }
  }
  if (b.liked !== undefined && typeof b.liked !== 'boolean') {
    return { data: null, error: 'liked must be a boolean' }
  }

  return {
    data: {
      name: (b.name as string).trim(),
      chapter: (b.chapter as string | null | undefined) ?? null,
      last_read: (b.last_read as string | null | undefined) ?? null,
      notes: (b.notes as string | null | undefined) ?? null,
      origin: (b.origin as Origin | null | undefined) ?? null,
      status: (b.status as Status[] | undefined) ?? [],
      liked: (b.liked as boolean | undefined) ?? false,
    },
    error: null,
  }
}

export function validateNovelUpdate(body: unknown): { data: NovelUpdate; error: null } | { data: null; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { data: null, error: 'Invalid request body' }
  }
  const b = body as Record<string, unknown>
  const ALLOWED = new Set(['name', 'chapter', 'last_read', 'notes', 'origin', 'status', 'liked'])
  const unknownKey = Object.keys(b).find((k) => !ALLOWED.has(k))
  if (unknownKey) return { data: null, error: `Unknown field: "${unknownKey}"` }

  const data: NovelUpdate = {}

  if ('name' in b) {
    if (typeof b.name !== 'string' || !b.name.trim()) return { data: null, error: 'Name is required' }
    data.name = b.name.trim()
  }
  if ('chapter' in b) {
    if (b.chapter !== null && typeof b.chapter !== 'string') return { data: null, error: 'chapter must be a string or null' }
    data.chapter = b.chapter as string | null
  }
  if ('last_read' in b) {
    if (b.last_read !== null && typeof b.last_read !== 'string') return { data: null, error: 'last_read must be a date string or null' }
    data.last_read = b.last_read as string | null
  }
  if ('notes' in b) {
    if (b.notes !== null && typeof b.notes !== 'string') return { data: null, error: 'notes must be a string or null' }
    data.notes = b.notes as string | null
  }
  if ('origin' in b) {
    if (b.origin !== null && !VALID_ORIGINS.has(b.origin as Origin)) return { data: null, error: `origin must be one of: ${[...VALID_ORIGINS].join(', ')}` }
    data.origin = b.origin as Origin | null
  }
  if ('status' in b) {
    if (!Array.isArray(b.status)) return { data: null, error: 'status must be an array' }
    const bad = (b.status as unknown[]).find((s) => !VALID_STATUSES.has(s as Status))
    if (bad !== undefined) return { data: null, error: `invalid status value: "${bad}". Must be one of: ${[...VALID_STATUSES].join(', ')}` }
    data.status = b.status as Status[]
  }
  if ('liked' in b) {
    if (typeof b.liked !== 'boolean') return { data: null, error: 'liked must be a boolean' }
    data.liked = b.liked
  }

  return { data, error: null }
}
