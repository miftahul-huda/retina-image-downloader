# Cookie Configuration Guide

## Environment Variables

Add these to your `.env` file:

```bash
# Cookie Configuration
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

## Configuration Options

### COOKIE_SECURE
Controls whether cookies require HTTPS:
- `false` - Cookies work on HTTP (for localhost development)
- `true` - Cookies require HTTPS (for production)

### COOKIE_SAME_SITE
Controls cross-site cookie behavior:
- `lax` - Cookies sent for same-site requests (localhost:5173 ↔ localhost:3000)
- `strict` - Cookies only sent for exact same-site
- `none` - Cookies sent for cross-domain (requires COOKIE_SECURE=true)

## Recommended Settings

### Localhost Development
```bash
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

### Production (Separate Services)
```bash
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

### Production (Unified Service - Same Domain)
```bash
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
```

## Notes

- `sameSite: 'none'` requires `secure: true` (HTTPS only)
- Modern browsers block third-party cookies by default
- For production with separate services, users may need to enable third-party cookies
