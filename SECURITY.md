# Security Notes — StudyForge

## Authentication

All `/api/*` routes support JWT bearer token auth via Supabase GoTrue.

To enable in production:
1. Set `JWT_SECRET=<your-supabase-jwt-secret>` in environment
2. Set `AUTH_ENABLED=true`
3. The frontend must pass `Authorization: Bearer <token>` on every request
   (Supabase JS client does this automatically via `supabase.auth.getSession()`)

In local dev, leave `AUTH_ENABLED=false` (default) to skip auth checks entirely.

## SSRF Protection

`parse_url()` in `notes_service.py` resolves hostnames to IP before fetching.
Blocked ranges include:
- `127.0.0.0/8` (loopback)
- `169.254.0.0/16` (AWS/GCP metadata)
- `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (RFC 1918 private)
- `::1/128`, `fc00::/7`, `fe80::/10` (IPv6 loopback/link-local)

## Pickle Model Security

`quiz_model.pkl` and `vectorizer.pkl` are trained from hardcoded in-code text.
Never replace these files with externally sourced pickles.
If deploying to a shared environment, consider switching the classifier
to a pure-Python serialization format (e.g., `joblib` with file hash verification).

## Content Security

- File uploads are restricted to PDF and plain text by the `/ingest` route
- Max upload size is controlled via `MAX_CONTENT_LENGTH` in `config.py`
- All HTML from URL parsing is stripped before storage
