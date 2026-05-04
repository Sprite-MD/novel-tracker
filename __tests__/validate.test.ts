import { describe, it, expect } from 'vitest'
import { validateNovelCreate, validateNovelUpdate } from '@/lib/validate'

describe('validateNovelCreate', () => {
  const valid = {
    name: 'Renegade Immortal',
    chapter: '1044',
    last_read: '2024-01-01',
    notes: null,
    origin: 'chinese',
    status: ['finished'],
    liked: true,
  }

  it('accepts a fully valid payload', () => {
    const { data, error } = validateNovelCreate(valid)
    expect(error).toBeNull()
    expect(data?.name).toBe('Renegade Immortal')
  })

  it('rejects missing name', () => {
    const { error } = validateNovelCreate({ ...valid, name: '  ' })
    expect(error).toMatch(/name is required/i)
  })

  it('rejects invalid status value', () => {
    const { error } = validateNovelCreate({ ...valid, status: ['reading'] })
    expect(error).toMatch(/invalid status value/i)
  })

  it('rejects non-array status', () => {
    const { error } = validateNovelCreate({ ...valid, status: 'finished' })
    expect(error).toMatch(/status must be an array/i)
  })

  it('rejects invalid origin', () => {
    const { error } = validateNovelCreate({ ...valid, origin: 'martian' })
    expect(error).toMatch(/origin must be one of/i)
  })

  it('accepts null origin', () => {
    const { data, error } = validateNovelCreate({ ...valid, origin: null })
    expect(error).toBeNull()
    expect(data?.origin).toBeNull()
  })

  it('accepts empty status array', () => {
    const { data, error } = validateNovelCreate({ ...valid, status: [] })
    expect(error).toBeNull()
    expect(data?.status).toEqual([])
  })
})

describe('validateNovelUpdate', () => {
  it('accepts a partial update', () => {
    const { data, error } = validateNovelUpdate({ chapter: '500' })
    expect(error).toBeNull()
    expect(data?.chapter).toBe('500')
    expect(data?.name).toBeUndefined()
  })

  it('rejects unknown fields', () => {
    const { error } = validateNovelUpdate({ chapter: '1', injected: 'bad' })
    expect(error).toMatch(/unknown field/i)
  })

  it('rejects invalid status in update', () => {
    const { error } = validateNovelUpdate({ status: ['reading'] })
    expect(error).toMatch(/invalid status value/i)
  })

  it('accepts empty body', () => {
    const { data, error } = validateNovelUpdate({})
    expect(error).toBeNull()
    expect(data).toEqual({})
  })
})
