import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const productos = await prisma.producto.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(productos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const producto = await prisma.producto.create({
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
