# GitHub Pages and PulsePoint

## Live static demo (same marketing UI as localhost)

GitHub Pages deploys a **static export of the real Next.js marketing site** via `scripts/gh-pages-build.sh` → `out/`.

| URL | What you get |
| --- | --- |
| **https://jordanz00.github.io/pulsepoint/** | Same marketing homepage as `http://localhost:3000/` |
| **https://jordanz00.github.io/pulsepoint/demo/** | Instructions to run the full AMS demo locally |
| **https://jordanz00.github.io/pulsepoint/compare-protech/** | vs Protech page |
| **https://jordanz00.github.io/pulsepoint/whats-new/** | What's new |

**Enable once:** GitHub → **Settings** → **Pages** → Build source: **GitHub Actions**.

**Private repo:** GitHub Pages on private repos requires a paid plan; make the repo **public** for free Pages.

### Static vs full Next.js app

| Feature | GitHub Pages (`out/` from marketing export) | Local / Node host (`pnpm dev`) |
| --- | --- | --- |
| Marketing homepage | Yes — same React + CSS as localhost | Yes |
| Interactive marketing modules | Yes (client components) | Yes |
| One-click AMS demo / SQLite / Stripe | No — `/demo` explains local setup | Yes |
| Clerk / Entra | No | Optional |

### Local build

```bash
pnpm build:gh-pages
# inspect ./out (basePath /pulsepoint)
```

CI: `.github/workflows/github-pages.yml` runs on marketing-related pushes to `main` and `workflow_dispatch`.

### Legacy folder

`gh-pages-site/` is the old hand-written HTML landing. It is **no longer deployed**. Prefer deleting it in a follow-up once Pages parity is confirmed.
