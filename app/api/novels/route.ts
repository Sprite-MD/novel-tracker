import { NextRequest, NextResponse } from 'next/server'
import { listNovels, createNovel } from '@/lib/db'
import { validateNovelCreate } from '@/lib/validate'

export async function GET() {
  const { data, error } = await listNovels()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { data: input, error: validationError } = validateNovelCreate(body)
  if (input === null) return NextResponse.json({ error: validationError }, { status: 400 })

  const { data, error } = await createNovel(input)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
