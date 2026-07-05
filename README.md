# FixPoint — Real-Time Chat Support

An enterprise-grade, real-time chat support platform built for an electronics
repair shop, replacing manual paper/Excel intake workflows with a live,
persistent WebSocket-based conversation system for both customers and staff.

<br/>

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Security](#security)
- [Accessibility](#accessibility)
- [Edge case handling](#edge-case-handling)
- [Deployment](#deployment)
- [Linting](#linting)

<br/>

## Overview

Two entry points share one real-time backend:

| Route | Audience | Purpose |
|---|---|---|
| `#/chat` | Customers | Start a support conversation about a device repair, chat live with a technician |
| `#/staff` | Staff (access-code gated) | Live dashboard of every conversation, filterable by status, with instant message delivery |

Messages, conversation status, and typing indicators all propagate over a
persistent Socket.io connection — no polling, no manual refresh.

<br/>

## Architecture

```
┌────────────────────┐        Socket.io (WebSocket)        ┌────────────────────┐
│   React Client      │ <────────────────────────────────> │   Node/Express      │
│  (Customer widget +  │        REST (initial loads)        │   + Socket.io       │
│   Staff console)     │ <────────────────────────────────> │   server            │
└────────────────────┘                                      └─────────┬──────────┘
                                                                        │
                                                              ┌─────────▼──────────┐
                                                              │  Repository layer   │
                                                              │  (storage-agnostic) │
                                                              └────┬───────────┬────┘
                                                                   │           │
                                                       ┌───────────▼──┐   ┌────▼─────────────┐
                                                       │  MongoDB      │   │  In-memory store   │
                                                       │  (Mongoose)   │   │  (automatic fallback)│
                                                       └───────────────┘   └────────────────────┘
```

**Why the fallback store matters:** the app remains fully runnable and
demoable even with zero external infrastructure. If `MONGODB_URI` is unset
or unreachable, the server logs a warning and transparently serves every
request from an in-memory store with an identical interface. Nothing in the
controllers, routes, or socket handlers needs to know which backend is
active.

Real-time events are scoped with Socket.io rooms:
- `agents` — every open staff console session; receives conversation-level
  events (new conversation, status/message updates) so the dashboard list
  stays live.
- `conversation:<id>` — the customer tab and any staff member currently
  viewing that thread; receives messages and typing indicators for that
  conversation only.

<br/>

## Tech stack

- **Frontend:** React 18, Tailwind CSS, Vite, Socket.io-client, Zod, DOMPurify
- **Backend:** Node.js, Express, Socket.io, Mongoose, Zod, sanitize-html, Helmet
- **Database:** MongoDB (with automatic in-memory fallback for zero-config demos)
- **Validation:** Zod schemas shared in spirit between client and server (client validates for instant feedback; server re-validates as the source of truth)

<br/>

## Getting started

### Prerequisites
- Node.js 18+
- npm
- (Optional) A running MongoDB instance — the app works without one

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

The server starts on `http://localhost:5000`. Check `http://localhost:5000/api/health`
to confirm it's running and see whether it's using MongoDB or the in-memory store.

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

- Visit `/#/chat` to open the customer chat widget.
- Visit `/#/staff` to open the staff console (default access code: `repair-shop-staff`,
  configurable via `AGENT_ACCESS_CODE` in `server/.env`).

Open both in separate browser tabs/windows to see real-time delivery in action.

<br/>

## Environment variables

**`server/.env`**

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port | `5000` |
| `NODE_ENV` | Environment name | `development` |
| `MONGODB_URI` | MongoDB connection string. Omit to run in-memory. | _(none)_ |
| `CLIENT_ORIGIN` | Comma-separated allowed CORS origins | `http://localhost:5173` |
| `AGENT_ACCESS_CODE` | Shared code staff enter to open the console | `repair-shop-staff` |

**`client/.env`**

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend | `http://localhost:5000` |

No secrets are hardcoded anywhere in source; both `.env` files are
git-ignored and only `.env.example` templates are committed.

<br/>

## Project structure

```
chat-support/
├── client/                      # React + Vite + Tailwind frontend
│   └── src/
│       ├── components/
│       │   ├── chat/            # Domain components (composer, bubbles, list items…)
│       │   └── ui/               # Generic design-system primitives
│       ├── context/              # Toast notification provider
│       ├── hooks/                 # useConversation, useConversations, connection status…
│       ├── lib/                   # Socket.io client singleton
│       ├── pages/                 # Landing, Customer, Agent pages
│       └── utils/                 # Sanitization, validation, analytics, formatting
└── server/                       # Node + Express + Socket.io backend
    └── src/
        ├── config/                # Env loader, DB connection
        ├── models/                # Mongoose schemas
        ├── routes/                # REST endpoints (initial loads, health, agent auth)
        ├── sockets/               # All real-time event handlers
        ├── store/                 # Repository (Mongo/in-memory abstraction)
        ├── utils/                 # Sanitization, logging
        └── validators/            # Zod schemas
```

<br/>

## Security

- **XSS prevention:** every text field is sanitized twice — once client-side
  before it's ever sent (`dompurify`), and again server-side on receipt
  (`sanitize-html`) before persistence or broadcast. All tags are stripped;
  chat is plain text only. React's default escaping is also relied upon as a
  final layer — message text is never rendered via `dangerouslySetInnerHTML`.
- **Input validation:** Zod schemas enforce length and type constraints on
  both sides. The server is the source of truth; client-side validation is
  purely for immediate feedback.
- **Rate limiting:** the REST API is rate-limited (120 requests/min/IP) via
  `express-rate-limit`.
- **Security headers:** `helmet` is applied to every response.
- **No hardcoded secrets:** the staff access code and DB URI are read from
  environment variables; `.env` is git-ignored in both packages.
- **Least-privilege staff gate:** the agent console requires a shared access
  code verified server-side; the code itself is never shipped in the client
  bundle.

<br/>

## Accessibility

Built to meet a 100% Lighthouse accessibility score:

- Every interactive element is a real `<button>`, `<input>`, `<textarea>`,
  or `<a>` — never a styled `<div>`.
- All form fields have bound `<label>` elements plus `aria-describedby` /
  `aria-invalid` wiring so validation errors are announced immediately.
- Live regions (`aria-live="polite"` / `"assertive"`) cover the message
  thread, connection status, and toast notifications.
- A visible "Skip to main content" link is the first focusable element.
- Every interactive element has a visible focus ring
  (`focus-visible:outline`), never suppressed.
- Color is never the only signal — status pills carry text labels, unread
  indicators pair a dot with list-order and bold text.
- Respects `prefers-reduced-motion`.

<br/>

## Edge case handling

| Scenario | Behavior |
|---|---|
| Empty conversation list / empty thread | "No data found." empty state with icon and description |
| Slow network / initial load | Skeleton loaders for the conversation list and message thread |
| Socket disconnects mid-session | Live "Reconnecting…" / "Offline" indicator; composer disables with an explanatory placeholder; Socket.io auto-reconnects indefinitely |
| Invalid form input | Field-level red border + inline error text, submission blocked client-side and re-validated server-side |
| Conversation resolved | Composer disables with a clear reason; status remains visible |
| Unknown route | Falls back to the landing page |
| Unexpected render error | Caught by a top-level `ErrorBoundary` with a reload action, instead of a blank white screen |

<br/>

## Deployment

**Backend (Render, or any Node host):**
1. Set `MONGODB_URI`, `CLIENT_ORIGIN`, and `AGENT_ACCESS_CODE` in the host's
   environment variable settings.
2. Build command: `npm install`. Start command: `npm start`.

**Frontend (Vercel, or any static host):**
1. Set `VITE_API_URL` to the deployed backend URL.
2. Build command: `npm run build`. Output directory: `dist`.

Both `client` and `server` are independent npm packages, so they can be
deployed as two separate services (recommended) or combined behind a single
reverse proxy.

<br/>

## Linting

```bash
cd server && npm run lint
cd client && npm run lint
```

Both packages are configured for zero warnings (`--max-warnings=0`).
