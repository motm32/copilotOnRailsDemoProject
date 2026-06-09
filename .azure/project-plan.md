# Project Plan

**Status**: Scaffolded
**Created**: 2026-06-09
**Mode**: NEW

---

## 1. Project Overview

**Goal**: A couples photo scrapbook app where two paired users upload photos that are displayed in a scrapbook-style gallery UI with AI-generated captions. Features sign-in authentication, user pairing, and full test coverage. The project is designed so that every module is independently testable.

**App Type**: SPA + API

**Mode**: NEW

**Deployment Plan**: No deployment plan found

---

## 2. Runtime & Framework

| Component | Technology |
|-----------|-----------|
| **Runtime** | TypeScript |
| **Backend** | Azure Functions v4 |
| **Orchestration** | docker-compose |
| **Frontend** | React + Vite |
| **Package Manager** | npm |

---

## 3. Test Runner & Configuration

| Component | Technology |
|-----------|-----------|
| **Test Runner** | vitest |
| **Mocking Library** | vi.mock |
| **Test Command** | npm test |

---

## 4. Services Required

| Azure Service | Role in App | Environment Variable | Default Value (Local) | Classification |
|---------------|------------|---------------------|----------------------|----------------|
| Blob Storage | Store uploaded photos | STORAGE_CONNECTION_STRING | UseDevelopmentStorage=true | Essential |
| PostgreSQL | Users, couples, photo metadata, captions | DATABASE_URL | postgresql://localdev:localdevpassword@localhost:5432/scrapbookdb | Essential |
| Azure OpenAI | Generate captions for uploaded photos | AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY | _(no local emulator)_ | Enhancement |

---

## 5. Design System & UI

**Component Library**: Tailwind CSS + shadcn/ui
**Style Direction**: Warm, whimsical scrapbook feel with soft elevations, rounded 8px corners, and a cozy, personal aesthetic emphasizing photo-first layouts.
**Typography**: Inter, system-ui

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#E07A5F` | Brand color, primary buttons, links (warm terracotta) |
| `accent` | `#81B29A` | Secondary accents, partner highlights (sage green) |
| `surface` | `#FDF6F0` | Page backgrounds (warm cream) |
| `text` | `#2D3436` | Body text |
| `muted` | `#8E8E8E` | Secondary text, captions, timestamps |
| `border` | `#E8DDD5` | Dividers, card borders (warm neutral) |

### Pages

| Page | Route | Purpose | Layout |
|------|-------|---------|--------|
| Sign In | `/login` | Authentication entry point | `main + form` |
| Scrapbook | `/` | Main gallery — shared photo scrapbook view | `header + grid` |
| Upload | `/upload` | Upload new photos | `header + main + form` |
| Pair | `/pair` | Invite and link with a partner | `header + main + card-list` |
| Profile | `/profile` | Account settings and partner info | `header + main + form` |

---

## 6. Project Structure

```
project-root/
├── .azure/
│   └── project-plan.md
├── .env.example
├── .gitignore
├── package.json
├── src/
│   ├── functions/
│   │   ├── host.json
│   │   ├── local.settings.json
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── functions/
│   │   │   │   ├── health.ts
│   │   │   │   ├── auth-login.ts
│   │   │   │   ├── auth-me.ts
│   │   │   │   ├── users-create.ts
│   │   │   │   ├── pair-invite.ts
│   │   │   │   ├── pair-accept.ts
│   │   │   │   ├── pair-status.ts
│   │   │   │   ├── photos-upload.ts
│   │   │   │   ├── photos-list.ts
│   │   │   │   ├── photos-delete.ts
│   │   │   │   └── captions-generate.ts
│   │   │   ├── services/
│   │   │   │   ├── interfaces/
│   │   │   │   │   ├── storage.ts
│   │   │   │   │   ├── database.ts
│   │   │   │   │   ├── auth.ts
│   │   │   │   │   └── captions.ts
│   │   │   │   ├── config.ts
│   │   │   │   └── registry.ts
│   │   │   ├── errors/
│   │   │   │   └── index.ts
│   │   │   └── middleware/
│   │   │       ├── auth.ts
│   │   │       └── error-handler.ts
│   │   ├── tests/
│   │   │   ├── fixtures/
│   │   │   ├── mocks/
│   │   │   ├── services/
│   │   │   ├── functions/
│   │   │   └── validation/
│   │   └── seeds/
│   ├── web/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── src/
│   │       ├── api/client.ts
│   │       ├── components/
│   │       │   ├── ui/
│   │       │   ├── ScrapbookGrid.tsx
│   │       │   ├── PhotoCard.tsx
│   │       │   ├── UploadForm.tsx
│   │       │   └── PairInvite.tsx
│   │       ├── pages/
│   │       │   ├── LoginPage.tsx
│   │       │   ├── ScrapbookPage.tsx
│   │       │   ├── UploadPage.tsx
│   │       │   ├── PairPage.tsx
│   │       │   └── ProfilePage.tsx
│   │       └── hooks/
│   │           ├── useAuth.ts
│   │           ├── usePhotos.ts
│   │           └── usePair.ts
│   └── shared/
│       ├── package.json
│       ├── types/
│       │   ├── entities.ts
│       │   └── api.ts
│       └── schemas/
│           └── validation.ts
├── docker-compose.yml
└── vitest.config.ts
```

---

## 7. Route Definitions

| # | Method | Path | Description | Request Body | Response Body | Auth | Status Codes |
|---|--------|------|-------------|-------------|--------------|------|-------------|
| 1 | GET | `/api/health` | Health check | — | `{ status, services }` | None | 200, 503 |
| 2 | POST | `/api/auth/login` | Sign in with credentials | `{ email, password }` | `{ token, user }` | None | 200, 401 |
| 3 | GET | `/api/auth/me` | Get current user profile | — | `{ user }` | Required | 200, 401 |
| 4 | POST | `/api/users` | Create new user account | `{ email, password, displayName }` | `{ user }` | None | 201, 409, 422 |
| 5 | POST | `/api/pair/invite` | Send pair invite to partner | `{ partnerEmail }` | `{ invite }` | Required | 201, 404, 409, 422 |
| 6 | POST | `/api/pair/accept` | Accept a pair invite | `{ inviteId }` | `{ pair }` | Required | 200, 404, 409 |
| 7 | GET | `/api/pair/status` | Get current pair status | — | `{ pair, partner }` | Required | 200, 404 |
| 8 | POST | `/api/photos/upload` | Upload a photo to the shared scrapbook | `multipart/form-data { file }` | `{ photo }` | Required | 201, 413, 422 |
| 9 | GET | `/api/photos` | List all photos in the shared scrapbook | — | `{ photos[] }` | Required | 200 |
| 10 | DELETE | `/api/photos/:id` | Delete a photo (own photos only) | — | `{ success }` | Required | 200, 403, 404 |
| 11 | POST | `/api/photos/:id/caption` | Generate AI caption for a photo | — | `{ caption }` | Required | 200, 404, 503 |

---

## 8. Execution Checklist

> The detailed execution checklist is auto-generated by `azure-project-scaffold` when it begins execution. It copies this section's high-level phases and expands them into step-by-step items with build gates.

### High-Level Phases
- [ ] Step 1: Regenerate Frontend (build the real React frontend in `src/web/` from the approved static preview `.azure/frontend-preview/index.html`; do NOT copy the static file)
- [ ] Step 2: Foundation (project config, directory structure, build verification)
- [ ] Step 3: Configuration & Environment (config module, .env, local.settings.json)
- [ ] Step 4: Service Abstraction Layer (interfaces + concrete implementations + registry)
- [ ] Step 5: Database Schema & Migrations (PostgreSQL tables for users, pairs, photos, captions)
- [ ] Step 6: Shared Types & Validation Schemas
- [ ] Step 7: API Routes / Functions (one handler per route)
- [ ] Step 8: Error Handling Middleware
- [ ] Step 9: Health Check Endpoint
- [ ] Step 10: OpenAPI Contract
- [ ] Step 11: Structured Logging
- [ ] Step 12: Wire Frontend (replace mock data/types with real backend)
- [ ] Step 13: Wrap Up & Smoke Test

---

## 9. Next Steps

1. Run **azure-project-scaffold** to execute this plan
2. Run **azure-project-test** to add test coverage and validate the build
3. Run **azure-localdev** for Docker emulators and VS Code debugging
4. Run **azure-prepare** → **azure-deploy** when ready to deploy
