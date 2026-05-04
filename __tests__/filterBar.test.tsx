import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NovelTable } from '@/components/NovelTable'
import type { Novel } from '@/lib/types'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

const NOVELS: Novel[] = [
  {
    id: '1', name: 'Chinese Novel', chapter: '10', last_read: '2024-01-01',
    notes: null, origin: 'chinese', status: ['dropped'], liked: false,
    created_at: '', updated_at: '',
  },
  {
    id: '2', name: 'Korean Novel', chapter: '20', last_read: '2024-01-02',
    notes: null, origin: 'korean', status: ['finished'], liked: true,
    created_at: '', updated_at: '',
  },
  {
    id: '3', name: 'Japanese Novel', chapter: '30', last_read: '2024-01-03',
    notes: null, origin: 'japanese', status: [], liked: false,
    created_at: '', updated_at: '',
  },
]

function visibleNames() {
  return screen.queryAllByRole('row')
    .flatMap((row) => Array.from(row.querySelectorAll('td')))
    .filter((td) => td.classList.contains('font-medium'))
    .map((td) => td.textContent)
}

describe('Origin filter pills', () => {
  it('shows All pill as active by default', () => {
    render(<NovelTable initialNovels={NOVELS} />)
    const allBtn = screen.getByRole('button', { name: 'All' })
    expect(allBtn.className).toMatch(/bg-slate/)
  })

  it('filters to Chinese novels when Chinese pill is clicked', async () => {
    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)
    await user.click(screen.getByRole('button', { name: 'Chinese' }))
    expect(visibleNames()).toEqual(['Chinese Novel'])
  })

  it('clicking All restores full list', async () => {
    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)
    await user.click(screen.getByRole('button', { name: 'Korean' }))
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(visibleNames()).toHaveLength(3)
  })
})

describe('Clear all filters', () => {
  it('does not show Clear button when no filters are active', () => {
    render(<NovelTable initialNovels={NOVELS} />)
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })

  it('shows Clear button when a status filter is active', async () => {
    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)
    await user.click(screen.getByRole('button', { name: 'Finished' }))
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('shows Clear button when origin filter is active', async () => {
    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)
    await user.click(screen.getByRole('button', { name: 'Korean' }))
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('clicking Clear resets all filters and shows all novels', async () => {
    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)
    await user.click(screen.getByRole('button', { name: 'Chinese' }))
    await user.click(screen.getByRole('button', { name: 'Finished' }))
    await user.click(screen.getByRole('button', { name: /clear/i }))
    expect(visibleNames()).toHaveLength(3)
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })
})
