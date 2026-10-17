# Security Policy

## Scope and authorization

Security testing is permitted only against this project, systems you own, or targets for which you have explicit written authorization. Prefer local development and isolated staging environments. Do not run destructive tests against production or third-party systems.

## Reporting a suspected issue

Please do not publish credentials, personal data, or exploit details that would put users at risk. Record the affected component, impact, safe reproduction steps, and evidence with secrets and personal data redacted. Fixes should include a regression test where practical.

## Development expectations

- Keep dependencies maintained and review advisories.
- Never commit real credentials or service-role keys.
- Enforce access control on the server, not only in the UI.
- Apply least privilege and database Row Level Security when database features are introduced.
- Validate untrusted input and avoid exposing secrets or sensitive data in logs.
- Retest fixes and run automated checks before release.

## Current status

This repository is an early foundation. The presence of this policy or security headers is not a certification or guarantee that the application is secure.
