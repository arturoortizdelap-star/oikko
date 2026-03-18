import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const c = await prisma.compostura.update({
    where: { id: Number(id) },
    data: body
  })
  return NextResponse.json(c)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.compostura.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
