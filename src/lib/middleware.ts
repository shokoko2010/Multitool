import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Protect tool routes
  if (pathname.startsWith('/tools/')) {
    if (!session) {
      const loginUrl = new URL('/auth/signin', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Extract tool ID from pathname
    const toolId = pathname.split('/')[2]
    
    // Check tool access permissions
    try {
      const accessResponse = await fetch(`${request.nextUrl.origin}/api/tools/${toolId}/access`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        }
      })

      if (!accessResponse.ok) {
        // If access check fails, redirect to subscription page
        return NextResponse.redirect(new URL('/subscription', request.url))
      }

      const accessData = await accessResponse.json()
      
      if (!accessData.hasAccess) {
        // User doesn't have access to this tool
        return NextResponse.redirect(new URL('/subscription', request.url))
      }

    } catch (error) {
      console.error('Error checking tool access:', error)
      // If there's an error checking access, allow access but log the error
      // In production, you might want to be more strict here
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect profile and subscription routes
  if (pathname.startsWith('/profile') || pathname.startsWith('/subscription')) {
    if (!session) {
      const loginUrl = new URL('/auth/signin', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/tools/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/subscription/:path*',
  ],
}