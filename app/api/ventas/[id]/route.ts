import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const venta = await prisma.venta.findUnique({ where: { id: Number(id) }, include: { items: true } })
  if (!venta) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  // Restaurar inventario
  for (const item of venta.items) {
    await prisma.producto.updateMany({
      where: { id: item.productoId },
      data: { piezas: { increment: item.cantidad } }
    })
  }

  // Eliminar movimiento financiero relacionado
  await prisma.movimiento.deleteMany({
    where: { concepto: `Venta a ${venta.cliente}`, monto: venta.total }
  })

  // Eliminar items y venta
  await prisma.ventaItem.deleteMany({ where: { ventaId: Number(id) } })
  await prisma.venta.delete({ where: { id: Number(id) } })

  return NextResponse.json({ ok: true })
}
