# Project Plan

**Status**: Ready
**Created**: 2026-06-09
**Mode**: NEW

---

## 1. Project Overview

**Goal**: A couples photo scrapbook app where two users pair their accounts via invite code, upload photos to a shared scrapbook, and each photo receives an AI-generated caption. The scrapbook UI presents photos in a warm, nostalgic layout. The project is designed so that every module is independently testable.

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
| Blob Storage | Store uploaded photo files | `STORAGE_CONNECTION_STRING` | `UseDevelopmentStorage=true` | Essential |
| PostgreSQL | Users, couples, photos metadata, AI captions | `DATABASE_URL` | `postgresql://localdev:localdevpassword@localhost:5432/scrapbookdb` | Essential |
| Azure OpenAI | Generate AI captions for uploaded photos | `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY` | _(no local emulator)_ | Enhancement |

---

## 5. Design System & UI

**Component Library**: Tailwind CSS + shadcn/ui
**Style Direction**: Dreamy purple scrapbook aesthetic with soft shadows, rounded corners (8px), and a cozy nostalgic feel. Photos displayed as polaroid-style cards with tilted angles and tape/pin decorations.
**Typography**: Inter, system-ui

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#7C3AED` | Rich violet — primary buttons, links, nav accents |
| `accent` | `#A78BFA` | Soft lavender — highlights, photo borders, badges |
| `surface` | `#FAF5FF` | Pale lilac — page backgrounds |
| `text` | `#1E1B2E` | Deep plum — body text |
| `muted` | `#8B7FA8` | Muted mauve — secondary text, captions, timestamps |
| `border` | `#E9E0F5` | Light wisteria — dividers, card borders |

### Pages

| Page | Route | Purpose | Layout |
|------|-------|---------|--------|
| Login / Register | `/login` | Sign in or create an account | `header + form + footer` |
| Scrapbook | `/` | Main scrapbook view — photos displayed as polaroid cards with AI captions | `header + nav + hero + grid + footer` |
| Upload | `/upload` | Upload new photos to the shared scrapbook | `header + nav + form + footer` |
| Pair | `/pair` | Generate or enter an invite code to pair with a partner | `header + nav + card-list + form + footer` |
| Profile | `/profile` | View and edit user profile, see partner info | `header + nav + card-list + footer` |

---

## 6. Project Structure

```
project-root/
├── .azure/
│   ├── project-plan.md
│   └── frontend-preview/
│       └── index.html
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
│   │   │   │   ├── auth-register.ts
│   │   │   │   ├── auth-login.ts
│   │   │   │   ├── auth-me.ts
│   │   │   │   ├── couples-invite.ts
│   │   │   │   ├── couples-join.ts
│   │   │   │   ├── couples-me.ts
│   │   │   │   ├── photos-upload.ts
│   │   │   │   ├── photos-list.ts
│   │   │   │   ├── photos-get.ts
│   │   │   │   └── photos-delete.ts
│   │   │   ├── services/
│   │   │   │   ├── interfaces/
│   │   │   │   │   ├── storage.ts
│   │   │   │   │   ├── database.ts
│   │   │   │   │   ├── caption.ts
│   │   │   │   │   └── auth.ts
│   │   │   │   ├── config.ts
│   │   │   │   └── registry.ts
│   │   │   ├── errors/
│   │   │   │   └── index.ts
│   │   │   └── middleware/
│   │   │       └── auth.ts
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
│   │   ├── index.html
│   │   └── src/
│   │       ├── api/client.ts
│   │       ├── components/
│   │       │   ├── PhotoCard.tsx
│   │       │   ├── ScrapbookGrid.tsx
│   │       │   ├── UploadForm.tsx
│   │       │   ├── PairForm.tsx
│   │       │   └── AuthForm.tsx
│   │       ├── pages/
│   │       │   ├── Scrapbook.tsx
│   │       │   ├── Upload.tsx
│   │       │   ├── Login.tsx
│   │       │   ├── Pair.tsx
│   │       │   └── Profile.tsx
│   │       └── hooks/
│   │           ├── useAuth.ts
│   │           └── usePhotos.ts
│   └── shared/
│       ├── package.json
│       ├── types/
│       │   ├── entities.ts
│       │   └── api.ts
│       └── schemas/
│           └── validation.ts
```

---

## 7. Route Definitions

| # | Method | Path | Description | Request Body | Response Body | Auth | Status Codes |
|---|--------|------|-------------|-------------|--------------|------|-------------|
| 1 | GET | `/api/health` | Health check | — | `{ status, services }` | None | 200, 503 |
| 2 | POST | `/api/auth/register` | Register a new user | `{ email, displayName, password }` | `{ user, token }` | None | 201, 409, 422 |
| 3 | POST | `/api/auth/login` | Log in an existing user | `{ email, password }` | `{ user, token }` | None | 200, 401, 422 |
| 4 | GET | `/api/auth/me` | Get current user profile | — | `{ user }` | Required | 200, 401 |
| 5 | POST | `/api/couples/invite` | Generate an invite code for couple pairing | — | `{ inviteCode, expiresAt }` | Required | 201, 401, 409 |
| 6 | POST | `/api/couples/join` | Join a couple using an invite code | `{ inviteCode }` | `{ couple }` | Required | 200, 401, 404, 409, 422 |
| 7 | GET | `/api/couples/me` | Get the current user's couple info | — | `{ couple, partner }` | Required | 200, 401, 404 |
| 8 | POST | `/api/photos` | Upload a photo to the shared scrapbook | `multipart/form-data { file }` | `{ photo }` | Required | 201, 401, 403, 422 |
| 9 | GET | `/api/photos` | List all photos in the couple's scrapbook | — | `{ photos[], total }` | Required | 200, 401, 403 |
| 10 | GET | `/api/photos/:id` | Get a single photo with caption | — | `{ photo }` | Required | 200, 401, 403, 404 |
| 11 | DELETE | `/api/photos/:id` | Delete a photo | — | `{ success }` | Required | 200, 401, 403, 404 |

---

## 8. Execution Checklist

> The detailed execution checklist is auto-generated by `azure-project-scaffold` when it begins execution. It copies this section's high-level phases and expands them into step-by-step items with build gates.

### High-Level Phases
- [ ] Step 1: Regenerate Frontend (build the real React + Vite frontend in `src/web/` from the approved static preview `.azure/frontend-preview/index.html`; do NOT copy the static file)
- [ ] Step 2: Foundation (project config, directory structure, build verification)
- [ ] Step 3: Configuration & Environment (config module, .env, local.settings.json)
- [ ] Step 4: Service Abstraction Layer (interfaces + concrete implementations + registry)
- [ ] Step 5: Database Schema & Migrations (PostgreSQL tables for users, couples, photos)
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
