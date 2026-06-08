# Wedge UI audit — Sprint E (UI-QUALITY-BAR)

**Date:** June 2026  
**Rubric:** [UI-QUALITY-BAR.md](./UI-QUALITY-BAR.md)  
**Routes:** Overview, Members directory, Events list, Member detail, Event form

---

## Summary

| Route | Verdict | Notes |
|-------|---------|-------|
| Overview (`/{orgSlug}`) | Pass | `PageHeader` + one primary CTA; stat row via `GlassStatCardLive`; `min-w-0` on admin shell |
| Members directory | Pass (fixed) | Virtual rows use grid + mobile collapse; load-more ≥44px |
| Events list | Pass | `PageHeader` + single “New event” primary; `EventEventsList` cards on light inset |
| Member detail Summary | Pass | `pp-readable-on-light` on summary cards; one-screen regs/tags/notes |
| Event form | Pass | Save draft / create & publish; publish panel on detail |
| Exceptions empty | Pass (fixed) | Empty state uses `pp-readable-on-light` tokens |

---

## Fixes applied (E3 + E4)

1. **Member directory** — `member-directory-row` grid in `app/admin-surfaces.css`; mobile hides Joined/Updated/Tags; thead hidden &lt;720px.
2. **Check-in** — `ec-check-in-btn` `min-h-11` / `min-w-[7.5rem]`; roster actions align on narrow screens.
3. **Exceptions** — empty-state contrast on light inset panel.
4. **Email drill** — `PULSE_DRILL_EMAIL_FAIL=true` in `lib/adapters/email/index.ts` for local exception queue drill ([EXCEPTIONS-DRILL.md](./EXCEPTIONS-DRILL.md)).

---

## Spot-check before pilot

- [ ] Desktop: directory columns align with table header
- [ ] Phone: directory shows name + status only; tap target on row
- [ ] Event detail → Attendees → Check in button ≥44px
- [ ] Member Summary tab readable (dark canvas vs light cards)

---

## Deferred (not wedge-blocking)

- Full WCAG audit on alpha modules (Learn, Giving, etc.)
- Marketing homepage polish (separate from admin wedge)
