import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Ruta para crear/actualizar usuario — solo usar una vez
export async function POST(req: NextRequest) {
  const { email, password, secretKey } = await req.json()
  if (secretKey !== 'oikko-setup-2024') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const hash = await bcrypt.hash(password, 10)
  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash }
  })
  return NextResponse.json({ ok: true, email: usuario.email })
}
