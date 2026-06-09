import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login']
const TOKEN_KEY    = 'mf_hospital_token'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token        = request.cookies.get(TOKEN_KEY)?.value
  const isPublic     = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  // 토큰 없고 공개 페이지 아니면 → 로그인으로
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 이미 로그인됐는데 /login 접근하면 → 대시보드로
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
