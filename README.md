# Secure App Lab

A security-first application and practical security engineering project.

## Mission

Build a real application with secure defaults, verify its protections through authorized testing, fix weaknesses, and retest.

## Principles

- Least privilege and deny-by-default authorization.
- Secure authentication and session management.
- Server-side validation and access control.
- Database Row Level Security where appropriate.
- Secure handling of secrets and sensitive data.
- Automated tests, dependency auditing, and security reviews.
- Authorized testing in local and staging environments.

## Planned stack

- Next.js
- TypeScript
- Supabase Auth
- PostgreSQL
- GitHub Actions

## Security references

- OWASP ASVS
- OWASP Top 10
- NIST Secure Software Development Framework

Security claims require evidence from implementation, testing, and review.

## Current validation exercise

The dashboard includes a lazy-loaded **Input validation** lab. It sends controlled requests only to this application's own `POST /api/security/input-check` endpoint.

The endpoint:
- Requires `application/json`.
- Limits request bodies to 4 KiB while reading the stream.
- Rejects malformed JSON, unexpected fields, invalid field types, control characters, and values outside the documented length limits.
- Normalizes surrounding whitespace and email casing.
- Returns only validation metadata. It does **not** store the submitted values, send email, or authenticate a user.

Run the validation unit tests with:

```bash
node --test lib/contact-validation.test.mjs
```

The GitHub Actions workflow also tests the production endpoint with valid, malformed, unsupported-content-type, missing-field, and oversized requests.

This exercise demonstrates server-side input validation only. It does not establish authentication, authorization, rate limiting, persistence security, or overall application security.
