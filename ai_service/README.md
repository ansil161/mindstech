# Mindstec AI Service — conversational RAG (v2)

FastAPI microservice providing the website assistant: intent-routed
conversation, hybrid retrieval over Qdrant, and grounded generation across
OpenAI / Groq / Gemini.

**The HTTP contract is identical to v1.** Django's `AIClient` and the React
widget need no changes. Everything below sits behind the same endpoints.

---

## Architecture

```
                          Django  ──►  POST /api/v1/internal/chat
                                             │
                                             ▼
                        ┌──────────────────────────────────────┐
                        │  api/v1/chat.py                      │
                        │  auth · rate limit · request-id · SSE│
                        └──────────────────┬───────────────────┘
                                           ▼
                        ┌──────────────────────────────────────┐
                        │  services/guard.py                   │
                        │  injection screen → flag or refuse   │
                        └──────────────────┬───────────────────┘
                                           ▼
                        ┌──────────────────────────────────────┐
                        │  conversation/memory.py              │
                        │  load session (Redis → bounded RAM)  │
                        └──────────────────┬───────────────────┘
                                           ▼
                        ┌──────────────────────────────────────┐
       free, instant ──►│  conversation/rules.py     (tier 1)  │
                        │  greeting·thanks·bye·yes·no·more…    │
                        └──────────────────┬───────────────────┘
                                           ▼
                        ┌──────────────────────────────────────┐
       no model call ──►│  conversation/faq.py                 │
                        │  canonical company facts (verbatim)  │
                        └──────────────────┬───────────────────┘
                                           ▼  (only if still unresolved)
                        ┌──────────────────────────────────────┐
        1 LLM call   ──►│  conversation/classifier.py (tier 2) │
                        │  intent + standalone rewrite + topic │
                        └──────────────────┬───────────────────┘
                                           ▼
                        ┌──────────────────────────────────────┐
                        │  conversation/dialogue.py            │
                        │  route intent → handler              │
                        └───────┬──────────────────────┬───────┘
                                │                      │
          conversational ◄──────┘                      └──────► knowledge
          template reply                                        │
          (0 model calls)                                        ▼
                                     ┌───────────────────────────────────────┐
                                     │  conversation/rewriter.py             │
                                     │  resolve "yes"/"more" from state      │
                                     └──────────────────┬────────────────────┘
                                                        ▼
                                     ┌───────────────────────────────────────┐
                                     │  services/retrieval.py                │
                                     │   ├ vector branch  (N query variants) │
                                     │   ├ keyword branch (Qdrant full-text) │
                                     │   ├ RRF fusion                        │
                                     │   └ relaxed-threshold retry           │
                                     └──────────────────┬────────────────────┘
                                                        ▼
                                     services/reranker.py  →  context_builder.py
                                     (blend for ORDER;         dedupe · diversity
                                      keep cosine for           merge · token budget
                                      CONFIDENCE)
                                                        ▼
                                     ┌───────────────────────────────────────┐
                                     │  services/rag.py → services/llm.py    │
                                     │  prompt (config/prompts.yaml)         │
                                     │  failover · retry · circuit breaker   │
                                     └──────────────────┬────────────────────┘
                                                        ▼
                                     services/guard.py  scrub_output()
                                                        ▼
                                     persist turn + emit one `turn.completed` record
```

### Layout

```
app/
├─ api/v1/          chat.py (+SSE), ingest.py
├─ conversation/    intents · rules · classifier · faq · rewriter
│                   state · memory · dialogue          ← new in v2
├─ core/            config · logging · observability · resilience
│                   prompts · security · cache · embedding_config
├─ services/        rag · retrieval · reranker · context_builder
│                   llm · embedder · chunker · guard · parser
├─ storage/         vector_db (async Qdrant) · document_store
└─ models/          llm.py · rag.py
config/             prompts.yaml · faq.yaml     ← operator-editable
scripts/            bootstrap.py (pre-flight gate)
tests/              356 tests, fully offline
```

---

## Endpoints

| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/internal/chat` | v1 contract. `stream:true` → SSE (new) |
| GET | `/api/v1/internal/chat/history/{id}` | v1 contract |
| DELETE | `/api/v1/internal/chat/history/{id}` | new |
| POST | `/api/v1/internal/ingest` · `/update-document` · `/parse` | v1 contract |
| DELETE | `/api/v1/internal/document/{id}` | v1 contract |
| GET | `/health` | liveness — always 200 while the process runs |
| GET | `/health/ready` | readiness — checks Qdrant, embeddings, LLM, Redis |
| GET | `/metrics` | counters + p50/p95 latency per stage |

### Streaming

`stream: true` returns `text/event-stream`:

```
event: citations   data: {"type":"citations","citations":[…]}
event: delta       data: {"type":"delta","content":"We "}
event: done        data: {"type":"done","answer":"…","confidence":0.85}
event: end         data: {}
```

Default (`stream: false`) is byte-compatible with v1, so nothing existing changes.

---

## Running

```bash
cp .env.example .env          # fill AI_SERVICE_API_KEY, QDRANT_URL, one LLM key
pip install -r requirements.txt

python scripts/bootstrap.py   # pre-flight: config, live embedding call, Qdrant, Redis
uvicorn app.main:app --reload
pytest -q
```

`scripts/bootstrap.py` exits non-zero on a blocking problem — run it in CI
before deploying. It makes a **real embedding call**, which is the only way to
catch a provider that has silently dropped support for your model.

---

## Operational notes

**Timeout budget.** Keep these coherent or Django abandons requests this
service is still completing:

```
classifier 8s + generation 20s = 28s  <  Django 30s  <  Gunicorn 120s
```

**Sizing.** The request path is fully async, so a worker serves many concurrent
chats. Size `WEB_CONCURRENCY` to CPU cores, not to expected conversations.

**Redis is optional but recommended.** Without it, conversation state falls back
to bounded per-worker memory, so history is *not* shared across workers and a
user's context appears to vanish between turns under multi-worker load.

**`QDRANT_ALLOW_DESTRUCTIVE_RECREATE` must stay `false`.** It exists only for a
supervised re-index. With it on, a vector-dimension mismatch deletes the entire
collection.

### Editing behaviour without a deploy

- `config/prompts.yaml` — tone, guardrails, small-talk phrasings
- `config/faq.yaml` — canonical company facts

Every FAQ entry must be verifiable against the public site. An absent entry
degrades gracefully to retrieval; a wrong one is served with full confidence.

---

## What changed from v1

| Area | v1 | v2 |
|---|---|---|
| Concurrency | blocking I/O inside `async def` | fully async end-to-end |
| Conversation | every message → RAG | intent router; only knowledge turns retrieve |
| `"yes"` / `"tell me more"` | vector-searched literally | resolved from conversation state |
| Company facts | depended on what was indexed | structured FAQ layer |
| Retrieval | single dense query | hybrid + multi-query + RRF + fallback retry |
| Confidence | compared *blended* score to a cosine threshold | cosine preserved separately |
| Document update | left orphaned chunks forever | delete-then-write |
| Ingest embedding | one HTTP call per chunk | batched |
| Structured logs | silently discarded | fixed; one `turn.completed` per turn |
| Streaming | field accepted, ignored | SSE |
| Boot | ~33s (`transformers` via text-splitter) | ~2.6s |
| Tests | 18 | 356 |
