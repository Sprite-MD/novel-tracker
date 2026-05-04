import type { Novel, NovelCreate, NovelUpdate } from '@/lib/types'

function uuid() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}

const SEED: Novel[] = [
  {
    id: uuid(), name: 'Renegade Immortal', chapter: '1044',
    last_read: '2020-07-14', notes: null, origin: 'chinese',
    status: [], liked: true,
    created_at: now(), updated_at: now(),
  },
  {
    id: uuid(), name: 'I Might Be a Fake Cultivator', chapter: '623',
    last_read: '2020-07-14', notes: null, origin: 'chinese',
    status: [], liked: false,
    created_at: now(), updated_at: now(),
  },
  {
    id: uuid(), name: 'The Ultimate Evolution', chapter: 'FIN',
    last_read: '2020-07-14', notes: null, origin: 'chinese',
    status: ['finished'], liked: false,
    created_at: now(), updated_at: now(),
  },
  {
    id: uuid(), name: 'God of Fishing', chapter: '191',
    last_read: '2020-07-14', notes: null, origin: 'chinese',
    status: ['translation_dropped'], liked: false,
    created_at: now(), updated_at: now(),
  },
  {
    id: uuid(), name: "The Surgeon's Studio", chapter: '148',
    last_read: '2020-07-14', notes: null, origin: 'chinese',
    status: [], liked: false,
    created_at: now(), updated_at: now(),
  },
  {
    id: uuid(), name: 'Monarch of Evernight', chapter: null,
    last_read: '2020-07-14', notes: null, origin: 'chinese',
    status: [], liked: false,
    created_at: now(), updated_at: now(),
  },
  {
    id: uuid(), name: "Kingdom's Bloodline", chapter: null,
    last_read: '2020-07-14', notes: null, origin: 'chinese',
    status: ['dropped'], liked: false,
    created_at: now(), updated_at: now(),
  },
  {
    id: uuid(), name: 'Otherworldly Merchant', chapter: null,
    last_read: '2020-07-14', notes: null, origin: 'korean',
    status: ['translation_finished'], liked: false,
    created_at: now(), updated_at: now(),
  },
  {
    id: uuid(), name: 'Archean Eon Art', chapter: null,
    last_read: '2020-07-14', notes: null, origin: 'japanese',
    status: [], liked: false,
    created_at: now(), updated_at: now(),
  },
]

const store = new Map<string, Novel>(SEED.map((n) => [n.id, n]))

export const mockStore = {
  list(): Novel[] {
    return [...store.values()].sort((a, b) => a.name.localeCompare(b.name))
  },

  get(id: string): Novel | undefined {
    return store.get(id)
  },

  create(data: NovelCreate): Novel {
    const novel: Novel = { ...data, id: uuid(), created_at: now(), updated_at: now() }
    store.set(novel.id, novel)
    return novel
  },

  update(id: string, data: NovelUpdate): Novel | null {
    const existing = store.get(id)
    if (!existing) return null
    const updated: Novel = { ...existing, ...data, id, updated_at: now() }
    store.set(id, updated)
    return updated
  },

  delete(id: string): boolean {
    return store.delete(id)
  },
}
