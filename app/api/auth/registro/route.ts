import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const existe = await prisma.usuario.findUnique({ where: { email } })
  if (existe) return NextResponse.json({ error: 'Este correo ya tiene una cuenta' }, { status: 400 })

  const hash = await bcrypt.hash(password, 10)
  await prisma.usuario.create({ data: { email, password: hash } })

  const store = await cookies()
  store.set('oikko-auth', 'true', { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60*60*24*30, path: '/' })
  store.set('oikko-email', email, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60*60*24*30, path: '/' })

  return NextResponse.json({ ok: true })
}
