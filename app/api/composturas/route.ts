import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const composturas = await prisma.compostura.findMany({
    where: { estatus: 'pendiente' },
    orderBy: { entrega: 'asc' }
  })
  return NextResponse.json(composturas)
}

export async function POST(req: NextRequest) {
  const { cliente, prenda, descripcion, entrega } = await req.json()
  const c = await prisma.compostura.create({
    data: {
      cliente,
      prenda,
      descripcion,
      entrega: entrega ? new Date(entrega) : null,
      estatus: 'pendiente'
    }
  })
  return NextResponse.json(c)
}
