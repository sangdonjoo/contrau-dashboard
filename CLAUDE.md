# Contrau Shrimp Dashboard

Next.js web dashboard for Ca Mau shrimp farm production monitoring.

## Quick Start

```bash
npm run dev    # http://localhost:3000
npm run build  # production build
```

## Pages

- `/` — Overview: KPI bar, Line 1 phase flow, Gantt timeline
- `/line/1` — Detail: growth curve, scoreboard, measurements, water quality, infrastructure, feeding

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- Recharts (line/bar/area charts)
- TypeScript

## Data

All data is mock (see `src/data/mock.ts`). Based on B11 actual batch data from Tomota app.

## Spec Reference

Full spec: `contrau-ssot/05_production/08_spec/SPEC_SHRIMP_DASHBOARD.md`
