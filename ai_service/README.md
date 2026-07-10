# AI Service (RAG Chatbot)

This is a production-ready, modular directory layout for the AI / RAG Chatbot service.

## Directory Structure

```
ai_service/
├── app/                        # Main application logic
│   ├── api/                    # API routes and dependencies
│   │   ├── deps.py             # Dependency injection (e.g. database sessions, settings, clients)
│   │   └── v1/                 # API Version 1
│   │       ├── chat.py         # Chatbot & RAG querying endpoints
│   │       └── ingest.py       # Data ingestion and document processing endpoints
│   ├── core/                   # Core application configuration
│   │   ├── config.py           # Application settings / environment variables loading
│   │   ├── logging.py          # Production logger configuration
│   │   └── security.py         # Security utilities, CORS, JWT helpers if needed
│   ├── models/                 # Request/Response schemas (Pydantic models)
│   │   ├── chat.py             # Schemas for chat messages and responses
│   │   └── ingest.py           # Schemas for documents and ingestion status
│   ├── services/               # Core business logic wrappers
│   │   ├── embedder.py         # Vector embeddings generation service
│   │   ├── llm.py              # LLM client service (OpenAI, Anthropic, local model, etc.)
│   │   └── rag.py              # RAG orchestration logic (Retrieval, Context Compilation, Generation)
│   ├── storage/                # Database and persistence adapters
│   │   ├── document_store.py   # SQL or Document database client/adapter
│   │   └── vector_db.py        # Vector database client/adapter (e.g. Qdrant)
│   └── main.py                 # FastAPI application entry point
├── config/                     # Configuration files
│   └── prompts.yaml            # LLM Prompt templates
├── scripts/                    # Maintenance, seeding, and migration scripts
│   └── bootstrap.py            # Local initialization / collection setup script
├── tests/                      # Automated test suite
│   ├── conftest.py             # Pytest fixtures and test setup
│   ├── api/                    # Unit/Integration tests for endpoints
│   ├── services/               # Unit tests for business logic
│   └── storage/                # Unit tests for database adapters
├── .env.example                # Example environment variables template
├── Dockerfile                  # Production container configuration
├── docker-compose.yml          # Container configuration for local development
└── requirements.txt            # Python dependencies
```

## How to Get Started

1. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in the required credentials (e.g., API keys, database URLs).

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Development Run**:
   Run the FastAPI dev server:
   ```bash
   uvicorn app.main:app --reload
   ```
