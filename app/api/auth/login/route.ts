import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const user = await prisma.usuario.findUnique({ where: { email } })
  if (!user || !await bcrypt.compare(password, user.password)) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 })
  }
  const store = await cookies()
  store.set('oikko-auth', 'true', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365 * 10, // 10 años (sin expiración práctica)
    path: '/'
  })
  store.set('oikko-email', email, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365 * 10,
    path: '/'
  })
  return NextResponse.json({ ok: true })
}
