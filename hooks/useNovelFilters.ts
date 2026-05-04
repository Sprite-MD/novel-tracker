'use client'

import { useState, useMemo } from 'react'
import type { Novel, Status } from '@/lib/types'
import type { OriginFilter } from '@/components/SearchFilterBar'

type SortKey = 'name' | 'chapter' | 'last_read'
type SortDir = 'asc' | 'desc'

export function useNovelFilters(novels: Novel[]) {
  const [search, setSearch] = useState('')
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all')
  const [statusFilter, setStatusFilter] = useState<Status[]>([])
  const [likedFilter, setLikedFilter] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let list = novels
    if (search) list = list.filter((n) => n.name.toLowerCase().includes(search.toLowerCase()))
    if (originFilter !== 'all') list = list.filter((n) => n.origin === originFilter)
    if (statusFilter.length > 0) list = list.filter((n) => statusFilter.some((s) => n.status.includes(s)))
    if (likedFilter) list = list.filter((n) => n.liked)

    return [...list].sort((a, b) => {
      let av = '', bv = ''
      if (sortKey === 'name') { av = a.name; bv = b.name }
      else if (sortKey === 'chapter') { av = a.chapter ?? ''; bv = b.chapter ?? '' }
      else if (sortKey === 'last_read') { av = a.last_read ?? ''; bv = b.last_read ?? '' }
      const cmp = av.localeCompare(bv, undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [novels, search, originFilter, statusFilter, likedFilter, sortKey, sortDir])

  function clearAll() {
    setSearch('')
    setOriginFilter('all')
    setStatusFilter([])
    setLikedFilter(false)
  }

  return {
    filtered,
    search, setSearch,
    originFilter, setOriginFilter,
    statusFilter, setStatusFilter,
    likedFilter, setLikedFilter,
    sortKey, sortDir, toggleSort,
    clearAll,
  }
}
