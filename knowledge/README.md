# Quake OS — Knowledge Store

Persistent SQLite knowledge bases for long-term agent memory.

| Database | Category | Contents |
|----------|----------|----------|
| `research.db` | research | Market research, association trends, AI/AMS intel |
| `requirements.db` | requirements | User stories, build plans, acceptance criteria |
| `lessons.db` | lessons | Wave reports, daily cycles, lessons learned |
| `competitors.db` | competitors | Competitive intelligence, vendor parity |
| `roadmap.db` | roadmaps | Sprint plans, roadmap initiatives |
| `decisions.db` | decisions | Architecture & executive decisions (ADRs) |
| `audits.db` | audits | QA, security, auditor reviews |
| `tasks.db` | tasks | Autonomous task backlog |

## Commands

```bash
pnpm quake:knowledge:init      # create databases + schema
pnpm quake:knowledge:migrate   # import JSON memory → SQLite
pnpm quake:knowledge:status    # row counts per database
```

Databases are created on first write if missing. Files are local (`knowledge/*.db`) and gitignored.

**API:** `quake-os/knowledge/store.ts`
