'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { TagBadge } from '@/components/TagBadge'
import { NovelModal } from '@/components/NovelModal'
import { DeleteDialog } from '@/components/DeleteDialog'
import { SearchFilterBar } from '@/components/SearchFilterBar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useNovelFilters } from '@/hooks/useNovelFilters'
import type { Novel, NovelCreate } from '@/lib/types'

interface NovelTableProps {
  initialNovels: Novel[]
}

export function NovelTable({ initialNovels }: NovelTableProps) {
  const [novels, setNovels] = useState<Novel[]>(initialNovels)
  const [modalOpen, setModalOpen] = useState(false)
  const [editNovel, setEditNovel] = useState<Novel | null>(null)
  const [duplicateNotice, setDuplicateNotice] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Novel | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const {
    filtered,
    search, setSearch,
    originFilter, setOriginFilter,
    statusFilter, setStatusFilter,
    likedFilter, setLikedFilter,
    sortKey, sortDir, toggleSort,
    clearAll,
  } = useNovelFilters(novels)

  function arrow(key: 'name' | 'chapter' | 'last_read') {
    if (sortKey !== key) return <span className="text-gray-400 dark:text-zinc-600 ml-1">↕</span>
    return <span className="text-teal-500 dark:text-teal-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  async function handleSave(data: NovelCreate): Promise<'stay' | void> {
    if (!editNovel) {
      const match = novels.find(
        (n) => n.name.toLowerCase() === data.name.trim().toLowerCase()
      )
      if (match) {
        setEditNovel({ ...match, ...data, id: match.id, created_at: match.created_at, updated_at: match.updated_at })
        setDuplicateNotice(true)
        return 'stay'
      }
    }
    if (editNovel) {
      const res = await fetch(`/api/novels/${editNovel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        let msg = 'Save failed'
        try { msg = (await res.json()).error ?? msg } catch { /* non-JSON body */ }
        throw new Error(msg)
      }
      const updated: Novel = await res.json()
      setNovels((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    } else {
      const res = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        let msg = 'Save failed'
        try { msg = (await res.json()).error ?? msg } catch { /* non-JSON body */ }
        throw new Error(msg)
      }
      const created: Novel = await res.json()
      setNovels((prev) => [...prev, created])
    }
  }

  async function handleDelete(novel: Novel) {
    setDeleting(true)
    setDeleteError('')
    const res = await fetch(`/api/novels/${novel.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) { setDeleteError('Delete failed. Please try again.'); return }
    setNovels((prev) => prev.filter((n) => n.id !== novel.id))
    setDeleteTarget(null)
  }

  function openAdd() { setEditNovel(null); setDuplicateNotice(false); setModalOpen(true) }
  function openEdit(novel: Novel) { setEditNovel(novel); setDuplicateNotice(false); setModalOpen(true) }

  const rowStyle = (n: Novel) => n.status.includes('dropped') && !n.status.includes('finished') ? 'opacity-50' : ''

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <SearchFilterBar
          search={search}
          originFilter={originFilter}
          statusFilter={statusFilter}
          likedFilter={likedFilter}
          onSearch={setSearch}
          onOriginFilter={setOriginFilter}
          onStatusFilter={setStatusFilter}
          onLikedFilter={setLikedFilter}
          onClearAll={clearAll}
        />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={openAdd} className="bg-teal-600 hover:bg-teal-500 text-white">
            + Add Novel
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-gray-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-left">
              <th
                className="px-4 py-3 cursor-pointer hover:text-gray-900 dark:hover:text-white select-none"
                onClick={() => toggleSort('name')}
              >
                Novel Name {arrow('name')}
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-gray-900 dark:hover:text-white select-none w-28"
                onClick={() => toggleSort('chapter')}
              >
                Chapter {arrow('chapter')}
              </th>
              <th
                className="px-4 py-3 cursor-pointer hover:text-gray-900 dark:hover:text-white select-none w-36"
                onClick={() => toggleSort('last_read')}
              >
                Last Read {arrow('last_read')}
              </th>
              <th className="px-4 py-3 w-64">Tags</th>
              <th className="px-4 py-3 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-zinc-500">
                  No novels found.
                </td>
              </tr>
            )}
            {filtered.map((novel) => (
              <tr
                key={novel.id}
                className={`border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors ${rowStyle(novel)}`}
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{novel.name}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-zinc-300 tabular-nums">
                  {novel.chapter ?? <span className="text-gray-300 dark:text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                  {novel.last_read
                    ? format(parseISO(novel.last_read), 'M/d/yyyy')
                    : <span className="text-gray-300 dark:text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-3">
                  <TagBadge origin={novel.origin} status={novel.status} liked={novel.liked} />
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button
                    onClick={() => openEdit(novel)}
                    className="text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(novel)}
                    className="text-gray-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-gray-400 dark:text-zinc-600 text-xs">{filtered.length} of {novels.length} novels</p>

      <NovelModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setDuplicateNotice(false) }}
        onSave={handleSave}
        novel={editNovel}
        duplicateNotice={duplicateNotice}
      />

      {deleteTarget && (
        <DeleteDialog
          novel={deleteTarget}
          deleting={deleting}
          error={deleteError}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => { setDeleteTarget(null); setDeleteError('') }}
        />
      )}
    </div>
  )
}
