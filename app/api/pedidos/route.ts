import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const pedidos = await prisma.pedido.findMany({ orderBy: { fecha: 'desc' } })
  return NextResponse.json(pedidos)
}

export async function POST(req: NextRequest) {
  const { origen, proveedor, notas, linkRastreo, fechaEstimada } = await req.json()
  const pedido = await prisma.pedido.create({
    data: {
      origen,
      proveedor,
      notas,
      linkRastreo: linkRastreo || null,
      fechaEstimada: fechaEstimada ? new Date(fechaEstimada) : null,
      estatus: 'en_camino'
    }
  })
  return NextResponse.json(pedido)
}
