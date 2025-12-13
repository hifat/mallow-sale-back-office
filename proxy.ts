import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100 // 100 requests per minute per IP
const MAX_REQUEST_SIZE = 10 * 1024 * 1024 // 10MB

// In-memory rate limiting store (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, RATE_LIMIT_WINDOW)

function getClientIP(request: NextRequest): string {
  // Try to get real IP from headers (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback to a default identifier
  return 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const clientData = rateLimitStore.get(ip)
  
  if (!clientData || now > clientData.resetTime) {
    // New window
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }
  
  clientData.count++
  return true
}

export function proxy(request: NextRequest) {
  const ip = getClientIP(request)
  
  // Rate limiting check
  if (!checkRateLimit(ip)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      }
    )
  }
  
  // Request size validation
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    return new NextResponse(
      JSON.stringify({
        error: 'Payload too large',
        message: 'Request size exceeds maximum allowed limit.'
      }),
      {
        status: 413,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
  
  // Add security headers to response
  const response = NextResponse.next()
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  
  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
