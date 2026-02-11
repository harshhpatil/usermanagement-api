# Security Considerations for User Management API

## CSRF Protection

This API uses JWT tokens for authentication, which can be provided in two ways:
1. **Cookie-based**: Token stored in HTTP-only cookie
2. **Bearer Token**: Token sent in Authorization header

### Current CSRF Mitigation

The API implements several CSRF protections for cookie-based authentication:

1. **SameSite Cookies**: 
   - Set to `strict` in production
   - Set to `lax` in development
   - Prevents cookies from being sent with cross-site requests

2. **CORS Configuration**:
   - Restricts which origins can make requests
   - Configured via `CORS_ORIGIN` environment variable

3. **Bearer Token Support**:
   - Clients can use Authorization header instead of cookies
   - Eliminates CSRF vulnerability entirely for API clients

### Recommendations for Production

For browser-based applications in production:

1. **Use HTTPS**: Always deploy with TLS/SSL
2. **Configure CORS**: Set `CORS_ORIGIN` to your frontend domain
3. **Use Bearer Tokens**: Prefer Authorization header over cookies when possible
4. **Set Secure Cookies**: Ensure `NODE_ENV=production` to enable secure cookies

### Additional CSRF Protection (Optional)

If you need additional CSRF protection for cookie-based authentication:

1. Install a CSRF package:
   ```bash
   npm install csrf-csrf
   ```

2. Add CSRF middleware in app.js:
   ```javascript
   import { doubleCsrf } from 'csrf-csrf';
   
   const { generateToken, doubleCsrfProtection } = doubleCsrf({
       getSecret: () => process.env.CSRF_SECRET,
       cookieName: '__Host-csrf',
       cookieOptions: {
           sameSite: 'strict',
           secure: true,
           httpOnly: true
       }
   });
   
   app.use(doubleCsrfProtection);
   ```

3. Generate CSRF tokens for your frontend:
   ```javascript
   app.get('/api/csrf-token', (req, res) => {
       res.json({ csrfToken: generateToken(req, res) });
   });
   ```

### Why CSRF is Less Critical for This API

1. **API-First Design**: Primarily designed for programmatic access (mobile apps, SPAs)
2. **JWT Tokens**: Not susceptible to CSRF when using Bearer tokens
3. **SameSite Cookies**: Already provides strong CSRF protection
4. **CORS**: Restricts cross-origin requests

### CodeQL Alert Response

CodeQL flagged potential CSRF vulnerabilities with cookie middleware. This is acknowledged and mitigated through:
- SameSite cookie attribute
- CORS configuration
- Bearer token support
- Security headers via Helmet.js

For applications requiring additional CSRF protection, follow the optional steps above.
