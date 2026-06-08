# Quake OS Master Build Directive

This document is the canonical charter for Quake OS. Implementation lives in `quake-os/` TypeScript modules + `quake-os/memory/` persistence.

**Primary objective:** Build the autonomous system that continuously builds, improves, audits, researches, and expands PulsePoint AMS — not just individual features.

## Phases

1. **Quake OS** — orchestration, memory, engines (this package)  
2. **AMS modules** — membership, events, advocacy, CRM, etc. (Pulse app)

## Autonomous execution rules

- Never stop at plans — implement files, tests, docs  
- Store plans in memory when context limits hit  
- Always move highest-priority backlog forward  
- Human gates remain for: staging pilot, legal, production secrets  

## Success condition

Quake OS becomes a self-improving AI software company with persistent memory, autonomous workflows, continuous learning, and collaborative multi-agent execution.

**Status board:** Run `pnpm quake:os` for live OS health.
