'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Novel, NovelCreate, Origin, Status } from '@/lib/types'

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'finished',             label: 'Finished Reading' },
  { value: 'dropped',              label: 'Dropped'          },
  { value: 'translation_dropped',  label: 'Trans Dropped'    },
  { value: 'translation_finished', label: 'Trans Finished'   },
]

interface NovelModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: NovelCreate) => Promise<'stay' | void>
  novel?: Novel | null
  duplicateNotice?: boolean
}

const EMPTY_FORM: NovelCreate = {
  name: '',
  chapter: '',
  last_read: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
  origin: null,
  status: [],
  liked: false,
}

const inputCls = "bg-gray-50 border-gray-300 text-gray-900 dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
const triggerCls = "bg-gray-50 border-gray-300 text-gray-900 dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
const contentCls = "bg-white border-gray-200 text-gray-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"

export function NovelModal({ open, onClose, onSave, novel, duplicateNotice }: NovelModalProps) {
  const [form, setForm] = useState<NovelCreate>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (novel) {
      setForm({
        name: novel.name,
        chapter: novel.chapter ?? '',
        last_read: novel.last_read ?? format(new Date(), 'yyyy-MM-dd'),
        notes: novel.notes ?? '',
        origin: novel.origin,
        status: novel.status,
        liked: novel.liked,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
  }, [novel, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    try {
      const result = await onSave({
        ...form,
        name: form.name.trim(),
        chapter: form.chapter?.trim() || null,
        notes: form.notes?.trim() || null,
        last_read: form.last_read || null,
      })
      if (result !== 'stay') onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{novel ? 'Edit Novel' : 'Add Novel'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Novel Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="e.g. Renegade Immortal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="chapter">Chapter</Label>
              <Input
                id="chapter"
                value={form.chapter ?? ''}
                onChange={(e) => setForm({ ...form, chapter: e.target.value })}
                className={inputCls}
                placeholder="e.g. 1044 or FIN"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="last_read">Last Read Date</Label>
              <Input
                id="last_read"
                type="date"
                value={form.last_read ?? ''}
                onChange={(e) => setForm({ ...form, last_read: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Origin</Label>
              <Select
                value={form.origin ?? 'none'}
                onValueChange={(v) =>
                  setForm({ ...form, origin: v === 'none' ? null : (v as Origin) })
                }
              >
                <SelectTrigger className={triggerCls}>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent className={contentCls}>
                  <SelectItem value="none">Unknown</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="korean">Korean</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {STATUS_OPTIONS.map(({ value, label }) => {
                  const active = form.status.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          status: active
                            ? form.status.filter((s) => s !== value)
                            : [...form.status, value],
                        })
                      }
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-teal-600 border-teal-600 text-white dark:bg-teal-500 dark:border-teal-500'
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-gray-400 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="liked"
              type="checkbox"
              checked={form.liked}
              onChange={(e) => setForm({ ...form, liked: e.target.checked })}
              className="w-4 h-4 accent-green-500"
            />
            <Label htmlFor="liked">Mark as Liked</Label>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Any notes about this novel..."
            />
          </div>

          {duplicateNotice && (
            <p className="text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded px-3 py-2">
              A novel with this name already exists — editing the existing entry instead.
            </p>
          )}
          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
