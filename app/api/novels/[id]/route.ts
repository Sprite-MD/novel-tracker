import { NextRequest, NextResponse } from 'next/server'
import { updateNovel, deleteNovel } from '@/lib/db'
import { validateNovelUpdate } from '@/lib/validate'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { data: input, error: validationError } = validateNovelUpdate(body)
  if (input === null) return NextResponse.json({ error: validationError }, { status: 400 })

  const { data, error } = await updateNovel(id, input)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error } = await deleteNovel(id)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
