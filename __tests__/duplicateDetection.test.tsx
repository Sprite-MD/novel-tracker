import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NovelTable } from '@/components/NovelTable'
import type { Novel } from '@/lib/types'

const EXISTING: Novel = {
  id: '1', name: 'Renegade Immortal', chapter: '1044', last_read: '2024-01-01',
  notes: null, origin: 'chinese', status: [], liked: false,
  created_at: '', updated_at: '',
}

const NOVELS: Novel[] = [EXISTING]

beforeEach(() => { vi.stubGlobal('fetch', vi.fn()) })

async function openAddModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /\+ add novel/i }))
}

describe('Duplicate detection', () => {
  it('shows duplicate notice when an existing name is submitted', async () => {
    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)
    await openAddModal(user)

    // Verify modal opened
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    const nameInput = screen.getByLabelText(/novel name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Renegade Immortal')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument()
  })

  it('switches modal title to Edit Novel after duplicate is detected', async () => {
    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)
    await openAddModal(user)

    await screen.findByRole('dialog')

    const nameInput = screen.getByLabelText(/novel name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Renegade Immortal')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(await screen.findByText('Edit Novel')).toBeInTheDocument()
  })

  it('preserves the new chapter entered by the user after switching to edit mode', async () => {
    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)
    await openAddModal(user)

    await screen.findByRole('dialog')

    await user.clear(screen.getByLabelText(/novel name/i))
    await user.type(screen.getByLabelText(/novel name/i), 'Renegade Immortal')
    const chapterInput = screen.getByLabelText(/chapter/i)
    await user.clear(chapterInput)
    await user.type(chapterInput, '2000')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await screen.findByText(/already exists/i)
    expect((screen.getByLabelText(/chapter/i) as HTMLInputElement).value).toBe('2000')
  })

  it('sends a PATCH (not POST) when saving after duplicate detection', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...EXISTING, chapter: '2000' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)
    await openAddModal(user)

    await screen.findByRole('dialog')

    const nameInput = screen.getByLabelText(/novel name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Renegade Immortal')
    const chapterInput = screen.getByLabelText(/chapter/i)
    await user.clear(chapterInput)
    await user.type(chapterInput, '2000')

    await user.click(screen.getByRole('button', { name: /^save$/i }))
    await screen.findByText(/already exists/i)

    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/novels/${EXISTING.id}`,
        expect.objectContaining({ method: 'PATCH' })
      )
    })
  })

  it('does not send a POST request when a duplicate is detected', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    const user = userEvent.setup()
    render(<NovelTable initialNovels={NOVELS} />)
    await openAddModal(user)

    await screen.findByRole('dialog')

    await user.clear(screen.getByLabelText(/novel name/i))
    await user.type(screen.getByLabelText(/novel name/i), 'Renegade Immortal')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await screen.findByText(/already exists/i)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
