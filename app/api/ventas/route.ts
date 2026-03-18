import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const ventas = await prisma.venta.findMany({
    include: { items: true },
    orderBy: { fecha: 'desc' }
  })
  return NextResponse.json(ventas)
}

export async function POST(req: NextRequest) {
  const { cliente, telefono, items } = await req.json()
  // items: [{ productoId, nombre, precio, cantidad, talla, imagen }]

  const total = items.reduce((s: number, i: any) => s + i.precio * i.cantidad, 0)

  const venta = await prisma.venta.create({
    data: {
      cliente,
      telefono,
      total,
      items: { create: items }
    },
    include: { items: true }
  })

  // Descontar inventario
  for (const item of items) {
    await prisma.producto.update({
      where: { id: item.productoId },
      data: { piezas: { decrement: item.cantidad } }
    })
  }

  // Registrar ingreso en finanzas
  await prisma.movimiento.create({
    data: {
      tipo: 'ingreso',
      concepto: `Venta a ${cliente}`,
      monto: total
    }
  })

  return NextResponse.json(venta)
}
