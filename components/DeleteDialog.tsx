'use client'

import { Button } from '@/components/ui/button'
import type { Novel } from '@/lib/types'

interface DeleteDialogProps {
  novel: Novel
  deleting: boolean
  error: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteDialog({ novel, deleting, error, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 rounded-lg p-6 max-w-sm w-full mx-4 space-y-4">
        <p className="text-gray-900 dark:text-white font-medium">Delete &ldquo;{novel.name}&rdquo;?</p>
        <p className="text-gray-500 dark:text-zinc-400 text-sm">This cannot be undone.</p>
        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-500 text-white"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
