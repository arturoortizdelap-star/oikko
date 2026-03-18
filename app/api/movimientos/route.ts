import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const movimientos = await prisma.movimiento.findMany({ orderBy: { fecha: 'desc' } })
  return NextResponse.json(movimientos)
}

export async function POST(req: NextRequest) {
  const { tipo, categoria, concepto, monto } = await req.json()
  const m = await prisma.movimiento.create({
    data: { tipo, categoria: categoria || 'otros', concepto, monto: Number(monto) }
  })
  return NextResponse.json(m)
}
