import type { Novel, NovelCreate, NovelUpdate, Status } from '@/lib/types'

function normalizeRow(row: Record<string, unknown>): Novel {
  return {
    ...row,
    liked: row.liked === 1 || row.liked === true,
    status: typeof row.status === 'string' ? JSON.parse(row.status) as Status[] : (row.status ?? []) as Status[],
  } as Novel
}

const LOWERCASE_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet',
  'at', 'by', 'in', 'of', 'on', 'to', 'up', 'as', 'is', 'it',
])

function toTitleCase(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map((word, i) => {
      const lower = word.toLowerCase()
      if (i !== 0 && LOWERCASE_WORDS.has(lower)) return lower
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

function now() {
  return new Date().toISOString()
}

export async function listNovels(): Promise<{ data: Novel[]; error: string | null }> {
  try {
    const { getDb } = await import('@/lib/sqlite')
    const rows = getDb().prepare('SELECT * FROM novels ORDER BY name ASC').all() as Record<string, unknown>[]
    return { data: rows.map(normalizeRow), error: null }
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function createNovel(input: NovelCreate): Promise<{ data: Novel | null; error: string | null }> {
  try {
    const { getDb } = await import('@/lib/sqlite')
    const id = crypto.randomUUID()
    const ts = now()
    const row = {
      id,
      name: toTitleCase(input.name),
      chapter: input.chapter ?? null,
      last_read: input.last_read ?? null,
      notes: input.notes ?? null,
      origin: input.origin ?? null,
      status: JSON.stringify(input.status ?? []),
      liked: input.liked ? 1 : 0,
      created_at: ts,
      updated_at: ts,
    }
    getDb().prepare(`
      INSERT INTO novels (id, name, chapter, last_read, notes, origin, status, liked, created_at, updated_at)
      VALUES (@id, @name, @chapter, @last_read, @notes, @origin, @status, @liked, @created_at, @updated_at)
    `).run(row)
    const created = getDb().prepare('SELECT * FROM novels WHERE id = ?').get(id)
    return { data: normalizeRow(created as Record<string, unknown>), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function updateNovel(id: string, input: NovelUpdate): Promise<{ data: Novel | null; error: string | null }> {
  try {
    const { getDb } = await import('@/lib/sqlite')
    const db = getDb()
    const existing = db.prepare('SELECT * FROM novels WHERE id = ?').get(id) as Record<string, unknown> | undefined
    if (!existing) return { data: null, error: 'Not found' }

    const merged = {
      ...existing,
      ...input,
      name: input.name ? toTitleCase(input.name) : existing.name,
      status: JSON.stringify(input.status ?? JSON.parse(existing.status as string)),
      liked: 'liked' in input ? (input.liked ? 1 : 0) : existing.liked,
      updated_at: now(),
    }

    db.prepare(`
      UPDATE novels SET
        name = @name, chapter = @chapter, last_read = @last_read,
        notes = @notes, origin = @origin, status = @status,
        liked = @liked, updated_at = @updated_at
      WHERE id = @id
    `).run(merged)

    const updated = db.prepare('SELECT * FROM novels WHERE id = ?').get(id)
    return { data: normalizeRow(updated as Record<string, unknown>), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteNovel(id: string): Promise<{ error: string | null }> {
  try {
    const { getDb } = await import('@/lib/sqlite')
    getDb().prepare('DELETE FROM novels WHERE id = ?').run(id)
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
