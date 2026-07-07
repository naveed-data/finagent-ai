# 🏦 FinAgent AI

<div align="center">

# Enterprise Banking Document Intelligence Platform

A full-stack, multi-tenant AI platform for loan document intelligence — customers upload or manually enter a loan application, then ask an AI analyst about approval odds, risk, compliance, and rates, grounded in both their own document and the bank's real policies via Retrieval-Augmented Generation (RAG).

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)
![ChromaDB](https://img.shields.io/badge/ChromaDB-VectorDB-orange?style=for-the-badge)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-black?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</div>

---

# 📖 Overview

FinAgent AI started as a Retrieval-Augmented Generation (RAG) service for banking documents and has grown into a full-stack, multi-tenant application: a React/TypeScript dashboard on top of a FastAPI backend, with real authentication, per-user data isolation, persistent chat history, and an AI analyst that grounds its answers in both the customer's own application and the bank's actual rate sheets, KYC rules, and underwriting guidelines.

Every account only ever sees its own documents and conversations — enforced at the database and vector-store level, not just hidden in the UI. Embeddings run locally via **BAAI/bge-small-en-v1.5** and **ChromaDB**, and the LLM runs locally via **Ollama**, so there's no per-request API cost.

---

# ✨ Features

## 🔐 Authentication & Multi-Tenancy

- Email/password signup and login (JWT, bcrypt-hashed passwords)
- Every document, chat session, and message is scoped to the signed-in account — enforced server-side, not just hidden in the UI
- Profile settings: edit display name, change password
- Sessions expire automatically and prompt re-login instead of failing silently

## 📄 Getting an Application In

- Upload a PDF loan application, or fill out a manual entry form — no PDF required
- LLM-based structured field extraction (applicant, income, credit score, loan type, DTI inputs, etc.), with a regex fallback if the model output isn't parseable
- Automatic text chunking and local embedding generation into ChromaDB

## 💬 Conversational AI

- Ask questions about your own application in plain language, answered only from what's actually in your document
- Ask about bank policy — APR by credit tier, KYC requirements, DTI limits — grounded in real seeded policy documents via RAG, kept completely separate from any one customer's application data
- Voice input: press-to-talk with live transcription, keeps listening until you stop it (never cuts you off), then asks you to confirm or discard before sending
- Session-based conversation memory with source-backed answers

## 🗂 Chat History & Document Management

- Every conversation is saved, searchable by keyword, resumable, and deletable
- Uploaded documents are listed, downloadable, and deletable per account

## 🏦 Banking Intelligence

- **Document Summary** — applicant, employer, income, credit score, loan type, requested amount
- **Loan Risk Assessment** — credit score, income, DTI, down payment, missing documentation, with an overall risk rating and recommendation
- **Compliance Check** — KYC completeness, missing documents, compliance notes
- **Executive Analysis** — summary + risk + compliance combined into one report

---

# 🏗 System Architecture

```text
                        React / TypeScript Dashboard
                                    │
                            JWT-authenticated API
                                    ▼
                              FastAPI Backend
                    ┌───────────────┼────────────────┐
                    ▼               ▼                ▼
              PostgreSQL       ChromaDB          Ollama (LLM)
           (users, chat      (per-user doc      (extraction +
            history)          embeddings +       answers)
                               shared policy
                               documents)
                    │
                    ▼
          Banking Intelligence Layer
    ┌───────────┬───────────┬─────────────┐
    ▼           ▼           ▼             ▼
 Summary      Risk      Compliance     Q&A / Chat
 Service     Service     Service        Service
    └───────────┴───────────┴─────────────┘
                    ▼
          Executive Banking Report
```

---

# ⚙ Tech Stack

| Category            | Technology                                     |
| ------------------- | ---------------------------------------------- |
| Backend Framework   | FastAPI (async)                                |
| Frontend            | React 19 + TypeScript + Vite                   |
| Styling             | Tailwind CSS v4                                |
| Relational Database | PostgreSQL + SQLAlchemy                        |
| Authentication      | JWT (PyJWT) + bcrypt                           |
| Vector Database     | ChromaDB                                       |
| Embeddings          | BAAI/bge-small-en-v1.5 (Sentence Transformers) |
| LLM                 | Ollama (llama3.2:3b), async client             |
| PDF Processing      | pypdf                                          |
| API Validation      | Pydantic                                       |
| Server              | Uvicorn                                        |
| Version Control     | Git & GitHub                                   |

---

# 📁 Project Structure

```text
finagent-ai/
│
├── app/
│   ├── api/v1/
│   │   ├── auth_routes.py
│   │   ├── chat_routes.py
│   │   └── document_routes.py
│   │
│   ├── config/
│   ├── database/
│   │   └── session.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   └── chat.py
│   │
│   ├── rag/
│   │   ├── text_chunker.py
│   │   └── vector_store.py
│   │
│   ├── schemas/
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── chat_history_service.py
│   │   ├── document_extraction_service.py
│   │   ├── document_parser.py
│   │   ├── ollama_service.py
│   │   ├── loan_risk_service.py
│   │   ├── compliance_service.py
│   │   ├── summary_service.py
│   │   └── supervisor_service.py
│   │
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── documents/
│   │   │   └── settings/
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   └── services/
│   │       ├── api.ts
│   │       └── authStorage.ts
│   └── package.json
│
├── datasets/raw/          # uploaded PDFs
├── data/chroma/           # ChromaDB persistent store
├── requirements.txt
├── Dockerfile
├── .env
└── README.md
```

---

# 🚀 Installation

## Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (running locally or reachable via `DATABASE_URL`)
- [Ollama](https://ollama.com) installed, with a model pulled: `ollama pull llama3.2:3b`

## Backend

```bash
git clone https://github.com/YOUR_USERNAME/finagent-ai.git
cd finagent-ai

python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
APP_NAME=FinAgent AI
APP_VERSION=1.0.0
ENVIRONMENT=development
DEBUG=true

API_V1_PREFIX=/api/v1
HOST=127.0.0.1
PORT=8002

DATABASE_URL=postgresql://user:password@localhost:5432/finagent

VECTOR_DB=chroma
CHROMA_DB_PATH=data/chroma

LOG_LEVEL=info

SECRET_KEY=change-this-to-a-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Run the backend:

```bash
uvicorn app.main:app --reload --port 8002
```

Swagger UI: `http://127.0.0.1:8002/docs`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173` by default.

---

# 📡 API Endpoints

## Auth

| Method | Endpoint                       | Description                 |
| ------ | ------------------------------ | --------------------------- |
| POST   | `/api/v1/auth/signup`          | Create account, returns JWT |
| POST   | `/api/v1/auth/login`           | Log in, returns JWT         |
| GET    | `/api/v1/auth/me`              | Get current user profile    |
| PATCH  | `/api/v1/auth/me`              | Update full name            |
| POST   | `/api/v1/auth/change-password` | Change password             |

## Chat History

| Method | Endpoint                       | Description                |
| ------ | ------------------------------ | -------------------------- |
| GET    | `/api/v1/chat-sessions`        | List your chat sessions    |
| GET    | `/api/v1/chat-sessions/search` | Search your chat history   |
| GET    | `/api/v1/chat-sessions/{id}`   | Get one session's messages |
| DELETE | `/api/v1/chat-sessions/{id}`   | Delete a chat session      |

## Documents

| Method | Endpoint                                | Description                    |
| ------ | --------------------------------------- | ------------------------------ |
| POST   | `/api/v1/documents/upload`              | Upload a PDF                   |
| POST   | `/api/v1/documents/manual-entry`        | Submit a loan application form |
| GET    | `/api/v1/documents`                     | List your documents            |
| GET    | `/api/v1/documents/{filename}/download` | Download a document            |
| DELETE | `/api/v1/documents/{filename}`          | Delete a document              |
| GET    | `/api/v1/documents/search`              | Semantic search                |
| GET    | `/api/v1/documents/ask`                 | Ask a question (chat)          |

## Banking Intelligence

| Method | Endpoint                             | Description                |
| ------ | ------------------------------------ | -------------------------- |
| GET    | `/api/v1/documents/summary`          | Document summary           |
| GET    | `/api/v1/documents/risk-assessment`  | Loan risk assessment       |
| GET    | `/api/v1/documents/compliance-check` | Compliance analysis        |
| GET    | `/api/v1/documents/analyze`          | Executive banking analysis |

All endpoints above require a Bearer JWT except signup/login.

---

# 📋 Sample Executive Analysis Response

```json
{
  "filename": "loan_application_001.pdf",
  "summary": {
    "applicant_name": "Daniel Matthews",
    "employer": "Northstar Logistics LLC",
    "annual_income": "$118,000",
    "credit_score": "724",
    "loan_type": "Home Mortgage",
    "requested_loan_amount": "$350,000"
  },
  "risk_assessment": {
    "overall_risk": "LOW",
    "reasons": [
      "Good credit score of 724.",
      "Strong annual income of $118,000."
    ],
    "attention_required": [
      "Home insurance quote is missing.",
      "Final property appraisal is pending."
    ]
  },
  "compliance_check": {
    "kyc_status": "INCOMPLETE",
    "missing_documents": ["Home insurance quote", "Final property appraisal"]
  },
  "executive_recommendation": "Applicant shows low financial risk, but pending documents must be resolved before final approval."
}
```

---

# 🎯 Skills Demonstrated

- Full-stack development (FastAPI + React/TypeScript)
- Retrieval-Augmented Generation (RAG) with per-tenant and shared-knowledge retrieval scoping
- JWT authentication, password hashing, and multi-tenant data isolation
- Relational + vector database design (PostgreSQL, ChromaDB)
- Async backend design (non-blocking LLM calls)
- LLM-based structured data extraction with deterministic fallback
- REST API design
- PDF processing and semantic search
- Voice input via the Web Speech API
- Banking domain modeling (risk, compliance, KYC, DTI, rate tiers)

---

# ⚠️ Known Limitations

- **No role-based permission system yet.** Every account currently has identical access — there is no distinction between a customer and a bank employee/admin account. Any authenticated user can technically call the policy-document upload endpoint, even though the customer-facing UI only exposes application uploads.
- **APR figures are not authoritative.** APR answers are generated by the LLM from retrieved rate-sheet text, not computed by a deterministic pricing engine. Treat them as an illustrative estimate, not a compliant, auditable rate calculation suitable for real lending decisions.

---

# 🔮 Future Enhancements

- Customer vs. bank-employee account roles
- Deterministic APR/pricing calculation engine (real code, not LLM-generated)
- Streaming AI responses
- Unit and integration tests
- GitHub Actions CI/CD
- Demo/guest login for quick recruiter access without signing up

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Naveed Shaik**

If you found this project useful or interesting, consider giving it a ⭐ on GitHub.
