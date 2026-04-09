# Nirogi G-One AI - AI Healthcare Agent

## Overview

Nirogi G-One AI is a production-quality AI Healthcare web application with 6 pages, a global AI chatbot, multilingual support (EN/HI), and a calm medical-grade design built with React + Vite.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion (`artifacts/medagent`, package `@workspace/nirogi-g-one-ai`)
- **Backend**: Express 5 API server (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Features

- **6 Pages**: Home, Diagnosis, Dashboard, Reports, About, Login/Register (+ Profile)
- **AI Chatbot**: Floating chat window (bottom-right), streaming AI responses with triage levels
- **AI Diagnosis**: Text symptoms, image upload, voice input (Web Speech API)
- **Dashboard**: Real-time stats (8 seeded patients), recharts pie chart for risk distribution
- **Reports**: Patient cards organized by triage priority (Emergency/Urgent/Routine), PDF download
- **Auth**: localStorage-based auth with AuthProvider
- **i18n**: English/Hindi toggle via I18nProvider
- **Design**: Soft sage green (#84A98C), beige/off-white palette, Framer Motion animations

## Database Tables

- `patients` — patient cases with triage_level, diagnosis, confidence
- `chat_logs` — chat session messages

## API Endpoints

- `POST /api/chat` — AI chatbot with triage analysis
- `GET /api/chat/history` — chat history by session
- `POST /api/analyze-text` — symptom text analysis
- `POST /api/analyze-image` — medical image analysis
- `POST /api/analyze-voice` — voice transcript analysis
- `GET /api/reports` — patient reports
- `GET /api/reports/:id/pdf` — HTML report download
- `POST /api/save-case` — save patient case
- `GET /api/dashboard/stats` — dashboard statistics
- `GET /api/dashboard/activity` — recent activity
- `GET /api/dashboard/risk-breakdown` — risk level distribution

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Project Structure

```
artifacts/
  api-server/    — Express 5 backend (all API routes)
  medagent/      — React + Vite frontend (all 6 pages), branded Nirogi G-One AI
lib/
  api-spec/      — OpenAPI spec (source of truth)
  api-client-react/ — generated React Query hooks
  api-zod/       — generated Zod schemas
  db/            — Drizzle ORM schema + connection
```
