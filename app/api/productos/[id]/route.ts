import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const producto = await prisma.producto.findUnique({ where: { id: Number(id) } })
  return NextResponse.json(producto)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const producto = await prisma.producto.update({
    where: { id: Number(id) },
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion,
      color: body.color,
      tallas: body.tallas,
      piezas: Number(body.piezas),
      precio: Number(body.precio),
      costo: Number(body.costo),
      categoria: body.categoria,
      imagen: body.imagen,
    }
  })
  return NextResponse.json(producto)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.producto.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
