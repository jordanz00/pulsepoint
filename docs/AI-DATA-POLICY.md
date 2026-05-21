# AI & member data policy

## Do not

- Paste member CSVs, exports, or production DB dumps into public LLM chats (ChatGPT, Claude web, etc.) without org DPA.
- Commit API keys, webhook secrets, or `.env.local` to git.
- Let AI generate auth/payment code without human review and `pnpm security:audit`.

## Do

- Use AI for UI, tests, docs, boilerplate — review tenant + permission paths manually.
- Redact PII in prompts (use fake data or field names only).
- Run `scripts/security-audit.sh` after each AI session touching `app/` or `lib/`.

## PHI

PulsePoint is **PII-only**. Do not store clinical PHI without a separate HIPAA architecture review.
