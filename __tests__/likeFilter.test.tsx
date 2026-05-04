import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NovelTable } from '@/components/NovelTable'
import type { Novel } from '@/lib/types'

// NovelTable calls fetch for CRUD — stub it so tests don't hit the network
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

const NOVELS: Novel[] = [
  {
    id: '1', name: 'Liked Novel', chapter: '10', last_read: '2024-01-01',
    notes: null, origin: 'chinese', status: [], liked: true,
    created_at: '', updated_at: '',
  },
  {
    id: '2', name: 'Unliked Novel', chapter: '20', last_read: '2024-01-02',
    notes: null, origin: 'korean', status: [], liked: false,
    created_at: '', updated_at: '',
  },
  {
    id: '3', name: 'Another Liked', chapter: '30', last_read: '2024-01-03',
    notes: null, origin: null, status: [], liked: true,
    created_at: '', updated_at: '',
  },
]

function getRows() {
  // Rows that contain novel data (exclude the "No novels found" empty-state row)
  return screen.queryAllByRole('row').filter((row) => {
    const cells = within(row).queryAllByRole('cell')
    return cells.length > 1
  })
}

describe('Like filter', () => {
  it('shows all novels before the like filter is active', () => {
    render(<NovelTable initialNovels={NOVELS} />)
    expect(getRows()).toHaveLength(3)
  })

  it('filters to only liked novels when the Like pill is clicked', async () => {
    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)

    await user.click(screen.getByRole('button', { name: 'Like' }))

    const rows = getRows()
    expect(rows).toHaveLength(2)
    expect(screen.getByText('Liked Novel')).toBeInTheDocument()
    expect(screen.getByText('Another Liked')).toBeInTheDocument()
    expect(screen.queryByText('Unliked Novel')).not.toBeInTheDocument()
  })

  it('restores all novels when the Like pill is clicked again', async () => {
    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)

    const likeBtn = screen.getByRole('button', { name: 'Like' })
    await user.click(likeBtn)  // activate
    await user.click(likeBtn)  // deactivate

    expect(getRows()).toHaveLength(3)
    expect(screen.getByText('Unliked Novel')).toBeInTheDocument()
  })

  it('shows empty state when no novels are liked and filter is active', async () => {
    const user = userEvent.setup()
    const noLikes: Novel[] = NOVELS.map((n) => ({ ...n, liked: false }))
    render(<NovelTable initialNovels={noLikes} />)

    await user.click(screen.getByRole('button', { name: 'Like' }))

    expect(getRows()).toHaveLength(0)
    expect(screen.getByText('No novels found.')).toBeInTheDocument()
  })
})
