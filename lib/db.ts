import type { Novel, NovelCreate, NovelUpdate, Status } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeNovel(row: any): Novel {
  return { ...row, status: (row.status ?? []) as Status[] }
}

// Small words that stay lowercase unless they're the first word
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

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.startsWith('http') && !url.includes('your_supabase')
}

export async function listNovels(): Promise<{ data: Novel[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const { mockStore } = await import('@/lib/mockStore')
    return { data: mockStore.list(), error: null }
  }
  const { getSupabaseServer } = await import('@/lib/supabase')
  const { data, error } = await getSupabaseServer()
    .from('novels')
    .select('*')
    .order('name', { ascending: true })
  return { data: (data ?? []).map(normalizeNovel), error: error?.message ?? null }
}

export async function createNovel(input: NovelCreate): Promise<{ data: Novel | null; error: string | null }> {
  const normalized = { ...input, name: toTitleCase(input.name) }
  if (!isSupabaseConfigured()) {
    const { mockStore } = await import('@/lib/mockStore')
    return { data: mockStore.create(normalized), error: null }
  }
  const { getSupabaseServer } = await import('@/lib/supabase')
  const { data, error } = await getSupabaseServer()
    .from('novels')
    .insert(normalized)
    .select()
    .single()
  return { data: data ? normalizeNovel(data) : null, error: error?.message ?? null }
}

export async function updateNovel(id: string, input: NovelUpdate): Promise<{ data: Novel | null; error: string | null }> {
  const normalized = input.name ? { ...input, name: toTitleCase(input.name) } : input
  if (!isSupabaseConfigured()) {
    const { mockStore } = await import('@/lib/mockStore')
    const updated = mockStore.update(id, normalized)
    return { data: updated, error: updated ? null : 'Not found' }
  }
  const { getSupabaseServer } = await import('@/lib/supabase')
  const { data, error } = await getSupabaseServer()
    .from('novels')
    .update(normalized)
    .eq('id', id)
    .select()
    .single()
  return { data: data ? normalizeNovel(data) : null, error: error?.message ?? null }
}

export async function deleteNovel(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    const { mockStore } = await import('@/lib/mockStore')
    mockStore.delete(id)
    return { error: null }
  }
  const { getSupabaseServer } = await import('@/lib/supabase')
  const { error } = await getSupabaseServer().from('novels').delete().eq('id', id)
  return { error: error?.message ?? null }
}
