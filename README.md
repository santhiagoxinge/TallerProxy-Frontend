# Microservices Monitoring — Frontend

Real-time observability dashboard for the **Proxy pattern workshop**. It visualizes the calls that the
[backend](https://github.com/santhiagoxinge/TallerProxy-backend-) logging proxy intercepts across three
microservices (Inventory, Orders, Payments). The interface is in Spanish; the code is in English.

Built with React, TypeScript, Vite and Recharts, with a liquid glass visual style (translucent, blurred
surfaces over a softly moving color backdrop).

## Features

- **Service cards** for Inventory, Orders and Payments: total calls, success rate and average response time.
- **Problem indicator**: a service whose error rate exceeds **15%** is highlighted in red with a "Con problemas" badge.
- **Line chart** with the last 20 calls per service and their response time. Failed calls are marked in red.
- **Live logs table** that polls the backend every **3 seconds**: request ID, service, operation, duration and status.
- **Filters** by service, status (`SUCCESS` / `ERROR`) and date range, plus server-side pagination.
- **Log details**: click a row to expand the input parameters and the full response (or the summarized error).
- **Simulate load** button that calls the simulation endpoint and refreshes the dashboard.
- If the backend becomes unreachable, the last received data stays visible with a retry banner.

## Stack

- React 19 + TypeScript
- Vite
- Recharts

## Run locally

Requires Node.js 20+ and the backend running.

```bash
npm install
cp .env.example .env.local      # set VITE_API_URL to your backend
npm run dev                     # http://localhost:5173
```

| Script | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Type-check and production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Configuration

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the backend, without trailing slash (default `http://localhost:8080`) |

`VITE_API_URL` is read at build time, so changing it requires a new build/deploy.

## Deploy (Vercel)

1. Import this repository in Vercel (framework preset: **Vite**).
2. Add the environment variable `VITE_API_URL` pointing to the deployed backend (Railway).
3. Deploy. Optionally restrict the backend with `CORS_ALLOWED_ORIGINS` set to the Vercel URL.

Or with the CLI:

```bash
vercel env add VITE_API_URL production
vercel --prod
```

## Project structure

```
src
├── api.ts                    Backend client (summary, logs, simulate load)
├── labels.ts                 Spanish UI copy
├── types.ts                  Shared types
├── hooks/useDashboardData.ts 3-second polling and stale-data handling
├── components/               ServiceCard, ResponseChart, LogFilters, LogsTable, Icons
├── App.tsx                   Page composition
└── index.css                 Design tokens and liquid glass styles
```
