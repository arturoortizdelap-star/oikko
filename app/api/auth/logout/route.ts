import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const store = await cookies()
  store.delete('oikko-auth')
  store.delete('oikko-email')
  return NextResponse.json({ ok: true })
}
