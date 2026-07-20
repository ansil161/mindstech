# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Three independent services behind an Nginx gateway, orchestrated by the root `docker-compose.yml`:

- **`client/`** — React 19 + Vite 8 SPA (public site + admin dashboard). Plain JSX, no TypeScript.
- **`server/`** — Django 6 + DRF REST API (`server/mindstech/`), the system of record. Talks to Postgres and Redis, and calls `ai_service` over HTTP for chat/RAG.
- **`ai_service/`** — FastAPI RAG/chat microservice (`ai_service/app/`). Owns Qdrant (vector DB) and the LLM calls (OpenAI/Gemini/Groq via LangChain).
- **`nginx/`** — reverse proxy: `/api/` → django-backend, `/ai/` → ai-service (rewritten to `/api/v1/internal/`).
- **`celery-worker`** — runs Django's Celery app (`mindstech/celery.py`) against Redis, for async tasks defined in `adminpanel/tasks/ai_tasks.py`.

Request flow for chat: client → nginx `/ai/` → FastAPI `app/api/v1/chat.py` → `app/services/rag.py` (retrieval from Qdrant + LLM generation). Django's `adminpanel/services/ai_client.py` also calls into `ai_service` for document ingestion triggered from admin CRUD actions.

### Frontend (`client/`)

- Routing is a **single route table**: `client/src/routes/index.jsx` (`createBrowserRouter`), no lazy loading. User-facing routes are nested under `Layout`; `/admin/login` and `/admin/dashboard` are siblings outside `Layout`, with the dashboard wrapped in `ProtectedRoute`. `/ewaste` is gated by `RegionGuard`.
- Provider order matters: `main.jsx` (`LanguageProvider`) → `App.jsx` (`AuthProvider` → `RegionProvider` → `RouterProvider`).
- **Admin is a self-contained module** (`src/pages/admin/`): each domain follows `tabs/XTab.jsx` → `hooks/useX.js` → `services/xService.js` → `src/api/axios.js`, and pairs 1:1 with a `server/mindstech/adminpanel/views/*.py` module. Admin does not reuse the top-level `components/`/`hooks/`.
- `src/components/` is organized **by role, not feature**: `layout/` (chrome), `common/` (shared), `ui/` (shadcn-style primitives, kebab-case filenames — the one naming exception), `chat/` (chat widget), `admin/` (admin-only shared). Several scaffolded dirs (`common/Card/`, `Modal/`, `Loader/`, `Section/`, `components/blocks/`) exist but are empty — check before assuming a component is implemented there.
- `src/api/axios.js` is the only HTTP client: `withCredentials: true` for HttpOnly JWT cookies, manually reads the `csrftoken` cookie into `X-CSRFToken`, injects `Accept-Language`, and on a 401 retries once via `POST /accounts/refresh/` with a queued-request lock, dispatching `auth:unauthorized` on failure.
- Styling is **Tailwind v4** via `@tailwindcss/vite` — there is no `tailwind.config.js`. Design tokens (colors, fonts) are defined in `src/index.css` inside an `@theme` block, mirrored as `:root` CSS vars.
- i18n: 5 languages (en/fr/ar/de/zh) via i18next, static strings in `src/locales/<lang>/common.json`. Dynamic DB content (blogs, solutions, etc.) is translated at runtime through `src/services/translationService.js` + `src/hooks/useDynamicTranslation.js`, hitting Django's `/api/v1/translate/`. `LanguageContext` intentionally forces `dir='ltr'` even for Arabic.

### Backend (`server/mindstech/`)

- Custom user model: `accounts.User`. Auth is SimpleJWT with tokens in **HttpOnly cookies** (`access_token`/`refresh_token`, 15 min / 7 day, rotation + blacklist) — see `accounts/authentication.py` (`HttpOnlyCookieJWTAuthentication`).
- DRF's global default permission is `IsAuthenticated`. Public endpoints must opt in via the `public/` URL prefix convention in `adminpanel/urls.py` (e.g. `public/regions/`, `public/events/`, `public/news/`).
- `adminpanel/` is the CMS app: `views/` is a package split by domain (`blogs.py`, `events.py`, `gallery.py`, `solutions.py`, `chatbot.py`, `region.py`, `documents.py`, `fieldwork.py`, `collection_centres.py`, `enquiries.py`, `dashboard.py`), while `models.py`, `serializers.py`, and `urls.py` stay monolithic — add new views into the matching domain file, not a catch-all.
- Media files live under `server/mindstech/media/` (served by Django in DEBUG, by Nginx `alias` + the shared `media_data` volume otherwise).
- CORS: `corsheaders` with `CORS_ALLOW_CREDENTIALS=True` and an explicit allowlist for ports 5173/3000. If testing through the Nginx gateway (port 80, what `client/.env`'s `VITE_API_URL` points at by default), that origin is **not** currently in the allowlist — credentialed requests through nginx will be rejected unless this is fixed.

### AI service (`ai_service/app/`)

- Layout: `api/v1/` (routes) → `services/` (`rag.py` orchestration, `llm.py`, `embedder.py`, `parser.py`, `classifier.py`) → `storage/` (`vector_db.py` for Qdrant, `document_store.py`). Pydantic schemas in `models/`. Prompts are externalized in `config/prompts.yaml`, not inline in code.
- Settings load via `app/core/config.py` (pydantic-settings) from `.env` — see `.env.example` for the full var list (`OPENAI_API_KEY`, `LLM_MODEL`, `EMBEDDING_MODEL`, `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION_NAME`).

## Commands

### Frontend (`client/`)
```bash
npm run dev       # Vite dev server
npm run build     # production build
npm run preview   # preview a production build
npm run lint      # oxlint (not ESLint — repo has no ESLint config)
```
No frontend test suite exists yet.

### Backend (`server/mindstech/`)
```bash
python manage.py runserver
python manage.py migrate
python manage.py makemigrations <app>
python manage.py createsuperuser
celery -A mindstech worker --loglevel=info   # run from server/mindstech/, needs Redis
```
No Django test suite exists yet (`manage.py test` has nothing to run against).

### AI service (`ai_service/`)
```bash
uvicorn app.main:app --reload      # dev server
pytest                              # run tests (tests/api, tests/services, tests/storage)
pytest tests/test_main.py::test_x  # run a single test
python scripts/bootstrap.py         # local Qdrant collection init
```

### Full stack via Docker
```bash
docker compose up --build           # postgres, redis, qdrant, ai-service, django-backend, celery-worker, nginx on :80
```
Each service needs its own `.env` (`server/.env`, `ai_service/.env`) — see the `.env.example` in each directory.
