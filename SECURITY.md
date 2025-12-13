# Security Documentation

This document outlines the security measures implemented to protect against CVE-2025-55184 and CVE-2025-55183 vulnerabilities in Next.js React Server Components.

## Vulnerabilities Addressed

### CVE-2025-55184 (High Severity - Denial of Service)
A malicious HTTP request sent to any App Router endpoint can cause the server process to hang and consume CPU when deserialized.

**Mitigation Implemented:**
- ✅ Updated Next.js to version 16.0.10 (patched version)
- ✅ Implemented rate limiting middleware (100 requests/minute per IP)
- ✅ Added request size validation (10MB limit)
- ✅ Configured Server Action payload size limit (2MB)

### CVE-2025-55183 (Medium Severity - Source Code Exposure)
A malicious HTTP request can return compiled source code of Server Actions, potentially revealing business logic.

**Mitigation Implemented:**
- ✅ Updated Next.js to version 16.0.10 (patched version)
- ✅ Implemented security headers to prevent information disclosure
- ✅ Added Content Security Policy (CSP)

## Security Features Implemented

### 1. Rate Limiting
**Location:** `middleware.ts`

The middleware implements IP-based rate limiting:
- **Window:** 60 seconds
- **Max Requests:** 100 requests per window per IP
- **Response:** 429 Too Many Requests with Retry-After header

**Configuration:**
```typescript
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100
```

### 2. Request Size Validation
**Location:** `middleware.ts`

Validates incoming request sizes to prevent large payload attacks:
- **Max Size:** 10MB for general requests
- **Server Actions:** 2MB limit (configured in next.config.mjs)

### 3. Security Headers
**Location:** `middleware.ts` and `next.config.mjs`

Comprehensive security headers applied to all responses:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME type sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | Enable XSS protection |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer information |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | Disable unnecessary features |
| Strict-Transport-Security | max-age=63072000 | Enforce HTTPS |
| Content-Security-Policy | (see below) | Restrict resource loading |

### 4. Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self';
frame-ancestors 'none';
```

## Server Actions Security Guidelines

> [!IMPORTANT]
> If you plan to use Server Actions in the future, follow these guidelines:

### DO ✅
- Store secrets in environment variables
- Use proper authentication and authorization
- Validate all inputs
- Implement proper error handling
- Log security-relevant events
- Use TypeScript for type safety

### DON'T ❌
- Hardcode secrets or API keys in Server Actions
- Trust client input without validation
- Expose sensitive business logic unnecessarily
- Return detailed error messages to clients
- Skip authentication checks

### Example: Secure Server Action
```typescript
'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'

const schema = z.object({
  userId: z.string(),
  action: z.enum(['create', 'update', 'delete'])
})

export async function secureAction(formData: FormData) {
  // 1. Authenticate
  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  // 2. Validate input
  const data = schema.parse({
    userId: formData.get('userId'),
    action: formData.get('action')
  })
  
  // 3. Authorize
  if (session.user.id !== data.userId) {
    throw new Error('Forbidden')
  }
  
  // 4. Use environment variables for secrets
  const apiKey = process.env.API_KEY // ✅ Good
  // const apiKey = 'hardcoded-key' // ❌ Bad
  
  // 5. Perform action
  // ...
}
```

## Deployment Security Checklist

Before deploying to production:

- [ ] Verify Next.js version is 16.0.10 or higher
- [ ] Test rate limiting with load testing tools
- [ ] Verify security headers in production environment
- [ ] Review all Server Actions for hardcoded secrets
- [ ] Configure monitoring and alerting
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up DDoS protection (if using cloud provider)
- [ ] Review and update CSP as needed

## Monitoring and Alerting

### Metrics to Monitor
1. **Rate Limit Hits:** Track 429 responses to identify potential attacks
2. **Request Size Rejections:** Monitor 413 responses
3. **Server CPU/Memory:** Watch for unusual spikes
4. **Error Rates:** Sudden increases may indicate attacks
5. **Response Times:** Degradation may indicate DoS attempts

### Recommended Tools
- **Application Monitoring:** Vercel Analytics, New Relic, Datadog
- **Error Tracking:** Sentry, Rollbar
- **Log Aggregation:** Logtail, Papertrail
- **Uptime Monitoring:** UptimeRobot, Pingdom

## Incident Response

If you suspect an attack:

1. **Immediate Actions:**
   - Check server metrics and logs
   - Identify attack patterns (IPs, endpoints)
   - Temporarily lower rate limits if needed
   - Block malicious IPs at firewall level

2. **Investigation:**
   - Review access logs
   - Analyze attack vectors
   - Document findings

3. **Recovery:**
   - Restore normal operations
   - Update security measures
   - Notify stakeholders if data was compromised

4. **Post-Incident:**
   - Conduct post-mortem
   - Update security procedures
   - Implement additional safeguards

## Maintenance

### Regular Tasks
- **Weekly:** Review security logs and metrics
- **Monthly:** Update dependencies (`pnpm update`)
- **Quarterly:** Security audit and penetration testing
- **Annually:** Review and update security policies

### Dependency Updates
```bash
# Check for updates
pnpm outdated

# Update Next.js
pnpm update next@latest

# Update all dependencies
pnpm update
```

## Additional Resources

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Server Components Security](https://react.dev/reference/rsc/server-actions)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Support

For security concerns or questions:
1. Review this documentation
2. Check Next.js security advisories
3. Consult with your security team
4. Report vulnerabilities responsibly

---

**Last Updated:** December 13, 2025  
**Next Review:** March 13, 2026
