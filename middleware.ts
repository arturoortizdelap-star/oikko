import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const auth = req.cookies.get('oikko-auth')?.value
  const isLogin = req.nextUrl.pathname === '/login'
  const isSetup = req.nextUrl.pathname.startsWith('/api/auth')

  if (!auth && !isLogin && !isSetup) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (auth && isLogin) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|logo|icon|apple|manifest|public).*)'],
}
