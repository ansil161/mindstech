# Mindstec Production RAG Chatbot System

A production-ready Retrieval-Augmented Generation (RAG) chatbot stack with real-time vector database synchronization and an administration control panel.

---

## 🏗️ Project Architecture

The system is composed of four decoupled, scalable layers:

1. **Frontend (client)**: React (Vite, Tailwind CSS) providing a glassmorphic floating Chat Widget and a dashboard for Knowledge base administration.
2. **Backend Server (server)**: Django (Django REST Framework) managing models, user auth, signals, REST APIs, and task enqueuing.
3. **AI microservice (ai_service)**: FastAPI service executing document chunking, embedding generation (SentenceTransformers/OpenAI), semantic similarity matching in Qdrant, conversational session history tracking, and Groq/OpenAI LLM prompt grounding.
4. **Vector Database (Qdrant)**: High-performance vector database storing document embeddings and payload metadata.
5. **Background Task Queue (Celery & Redis)**: Offloads heavy model embedding and syncing actions asynchronously to ensure fast API responses.

---

## 🛠️ Technology Stack & Ports
- **Frontend client**: `http://localhost:5173`
- **Django backend server**: `http://localhost:8000`
- **FastAPI AI microservice**: `http://localhost:8000/api/v1/internal` (internally mapped)
- **Qdrant DB console**: `http://localhost:6333`
- **Redis server**: `redis://localhost:6379/0`

---

## 🔑 Environment Configuration

### Django Backend (`server/mindstech/mindstech/settings.py` / `.env`)
Create an `.env` file inside `server/` with the following variables:
```env
DB_NAME=mindstech_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=django-insecure-f0+&...
DEBUG=True
AI_SERVICE_URL=http://localhost:8000   # Set to http://ai-service:8000 when running in Docker
AI_SERVICE_API_KEY=secret-key
```

### FastAPI AI Service (`ai_service/.env`)
Create an `.env` file inside `ai_service/` with the following variables:
```env
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=info
OPENAI_API_KEY=your-openai-api-key       # (Optional) Required if embedding/LLM provider is set to openai
GROQ_API_KEY=gsk_your_groq_api_key_here  # Required for LLM generation
LLM_PROVIDER=groq                       # Options: groq, openai, gemini
LLM_MODEL=llama-3.3-70b-versatile
EMBEDDING_PROVIDER=sentence_transformer   # Options: sentence_transformer, openai
EMBEDDING_MODEL=all-MiniLM-L6-v2
QDRANT_HOST=localhost                   # Set to 'qdrant' inside Docker
QDRANT_PORT=6333
QDRANT_COLLECTION_NAME=mindstec_rag
AI_SERVICE_API_KEY=secret-key
```

---

## 🐳 Docker Deployment (Recommended)

To launch the entire stack (Redis, Qdrant, FastAPI service, and Celery worker) automatically, make sure **Docker Desktop** is running and execute the following at the project root:

```bash
docker compose up --build -d
```

To view logs for all running containers:
```bash
docker compose logs -f
```

To stop all containers:
```bash
docker compose down
```

---

## 💻 Running Locally (Development Mode)

If you prefer to run services individually for debugging, follow these instructions:

### 1. Prerequisite: Run Qdrant & Redis in Docker
```bash
docker run -d -p 6379:6379 --name mindstec-redis redis:alpine
docker run -d -p 6333:6333 -p 6334:6334 --name mindstec-qdrant qdrant/qdrant:v1.9.1
```

### 2. Start the FastAPI AI service
```bash
cd ai_service
# Set up a python environment and install requirements
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Run the FastAPI server
uvicorn app.main:app --port 8000 --reload
```

### 3. Start the Django Server & Celery Worker
```bash
# Terminal 1: Run Django Server
cd server/mindstech
..\venv\Scripts\activate
python manage.py migrate
python manage.py runserver

# Terminal 2: Run Celery Worker
cd server/mindstech
..\venv\Scripts\activate
celery -A mindstech worker --loglevel=info -P threads
```

### 4. Start the React Frontend client
```bash
cd client
npm install
npm run dev
```

---

## 🔌 API Documentation (FastAPI Internal Endpoints)

- **GET `/api/v1/internal/health`**: Verifies liveness.
- **POST `/api/v1/internal/ingest`**: Standard endpoint to compute document embeddings and index in Qdrant.
- **POST `/api/v1/internal/chat`**: Standard RAG search-grounded completion query.
- **GET `/api/v1/internal/chat/history/{conversation_id}`**: Retrieves chat history logs.

---

## 🔧 Troubleshooting

1. **Celery tasks are failing**:
   - Ensure your local Redis instance is running (`docker ps`).
   - On Windows, make sure you start Celery with `-P threads` or `-P solo` because the default worker pool does not support Windows natively.
2. **"Failed to resolve reference... TLS handshake timeout" inside Docker**:
   - This occurs when Docker Hub times out. Restart Docker Desktop, check your internet connectivity, or try running behind a VPN.
3. **Chatbot response is generic/not grounded**:
   - Ensure you set `USE_MOCK = false` inside chatApi.js.
   - Ensure the FAQ or Company pages are set to **Active** inside the admin dashboard.
