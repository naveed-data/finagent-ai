# 🏦 FinAgent AI

<div align="center">

# Enterprise Banking Document Intelligence Platform

An AI-powered Retrieval-Augmented Generation (RAG) platform for analyzing banking and loan documents using semantic search, vector databases, and intelligent document analysis.

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688?style=for-the-badge&logo=fastapi)
![ChromaDB](https://img.shields.io/badge/ChromaDB-VectorDB-orange?style=for-the-badge)
![Sentence Transformers](https://img.shields.io/badge/SentenceTransformers-BGE-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</div>

---

# 📖 Overview

FinAgent AI is an enterprise-style banking document intelligence platform built using Retrieval-Augmented Generation (RAG). It enables users to upload banking documents, perform semantic search, ask contextual questions, generate executive summaries, assess loan risk, perform compliance checks, and produce consolidated banking analysis through a modular FastAPI architecture.

The application uses local embeddings with **BAAI/bge-small-en-v1.5** and **ChromaDB** for semantic retrieval, making it cost-effective without relying on paid embedding APIs.

---

# ✨ Features

## 📄 Document Processing

- Upload PDF loan applications
- Automatic PDF text extraction
- Intelligent text chunking
- Local embedding generation
- ChromaDB vector indexing
- Multi-document support

---

## 🔍 Semantic Search

- Vector similarity search
- Context-aware retrieval
- Metadata filtering
- Source attribution

---

## 💬 Conversational AI

- Banking document Q&A
- Session-based conversation memory
- Context-aware responses
- Source-backed answers

---

## 🏦 Banking Intelligence

### 📋 Document Summary

Generate structured summaries including:

- Applicant Name
- Employer
- Annual Income
- Credit Score
- Loan Type
- Requested Loan Amount

---

### 📈 Loan Risk Assessment

Automatically evaluates:

- Credit Score
- Annual Income
- Debt-to-Income Ratio
- Down Payment
- Missing Documentation

Provides:

- Overall Risk
- Risk Reasons
- Attention Required
- Recommendation

---

### ✅ Compliance Check

Performs:

- KYC completeness check
- Missing document detection
- Compliance observations
- Required documentation review

---

### 🧠 Supervisor Analysis

Combines:

- Document Summary
- Loan Risk Assessment
- Compliance Review

Produces a consolidated executive banking report.

---

# 🏗 System Architecture

```text
                           FinAgent AI

                    ┌──────────────────┐
                    │   Upload PDF     │
                    └────────┬─────────┘
                             │
                             ▼
                    PDF Text Extraction
                             │
                             ▼
                     Intelligent Chunking
                             │
                             ▼
               BGE Embedding Generation
                             │
                             ▼
                        ChromaDB
                             │
          ┌──────────────────┼─────────────────┐
          ▼                  ▼                 ▼
   Semantic Search      AI Retrieval     Document Manager
          │
          ▼
     Banking Intelligence Layer
          │
 ┌────────┼────────┬──────────────┐
 ▼        ▼        ▼              ▼
Summary  Risk  Compliance      Q&A Service
 Agent   Agent     Agent
          │
          ▼
    Supervisor Agent
          │
          ▼
 Executive Banking Report
```

---

# ⚙ Tech Stack

| Category             | Technology             |
| -------------------- | ---------------------- |
| Programming Language | Python 3.12            |
| Backend Framework    | FastAPI                |
| API Validation       | Pydantic               |
| PDF Processing       | PyPDF                  |
| Embeddings           | BAAI/bge-small-en-v1.5 |
| ML Library           | Sentence Transformers  |
| Vector Database      | ChromaDB               |
| Server               | Uvicorn                |
| Version Control      | Git & GitHub           |

---

# 📁 Project Structure

```text
FinAgent-AI/
│
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── document_routes.py
│   │
│   ├── config/
│   │
│   ├── rag/
│   │   ├── text_chunker.py
│   │   └── vector_store.py
│   │
│   ├── schemas/
│   │   ├── answer_schema.py
│   │   ├── analysis_schema.py
│   │   ├── compliance_schema.py
│   │   ├── document_management_schema.py
│   │   ├── document_schema.py
│   │   ├── risk_schema.py
│   │   ├── search_schema.py
│   │   └── summary_schema.py
│   │
│   ├── services/
│   │   ├── answer_service.py
│   │   ├── compliance_service.py
│   │   ├── document_parser.py
│   │   ├── loan_risk_service.py
│   │   ├── memory_service.py
│   │   ├── summary_service.py
│   │   └── supervisor_service.py
│   │
│   └── main.py
│
├── datasets/
│   └── raw/
│
├── data/
│   └── chroma/
│
├── requirements.txt
├── Dockerfile
├── .env
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/FinAgent-AI.git

cd FinAgent-AI
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### macOS / Linux

```bash
python -m venv venv

source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment

Create a `.env` file in the project root.

Example:

```env
CHROMA_DB_PATH=data/chroma
```

---

## Run Application

```bash
uvicorn app.main:app --reload --port 8002
```

Swagger UI:

```
http://127.0.0.1:8002/docs
```

---

# 📡 API Endpoints

## Document Management

| Method | Endpoint                       | Description     |
| ------ | ------------------------------ | --------------- |
| POST   | `/api/v1/documents/upload`     | Upload PDF      |
| GET    | `/api/v1/documents`            | List Documents  |
| DELETE | `/api/v1/documents/{filename}` | Delete Document |

---

## AI Retrieval

| Method | Endpoint                   | Description     |
| ------ | -------------------------- | --------------- |
| GET    | `/api/v1/documents/search` | Semantic Search |
| GET    | `/api/v1/documents/ask`    | Ask Questions   |

---

## Banking Intelligence

| Method | Endpoint                             | Description                |
| ------ | ------------------------------------ | -------------------------- |
| GET    | `/api/v1/documents/summary`          | Document Summary           |
| GET    | `/api/v1/documents/risk-assessment`  | Loan Risk Assessment       |
| GET    | `/api/v1/documents/compliance-check` | Compliance Analysis        |
| GET    | `/api/v1/documents/analyze`          | Executive Banking Analysis |

---

# 📊 Example Workflow

```text
Upload Loan PDF
        │
        ▼
Extract Text
        │
        ▼
Chunk Document
        │
        ▼
Generate Embeddings
        │
        ▼
Store in ChromaDB
        │
        ▼
Semantic Search
        │
        ▼
Banking Intelligence Services
        │
        ▼
Executive Banking Analysis
```

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

- Retrieval-Augmented Generation (RAG)
- FastAPI Development
- REST API Design
- Vector Databases
- Semantic Search
- PDF Processing
- Sentence Transformers
- ChromaDB
- Banking Document Intelligence
- AI Service Architecture
- Session Management
- Modular Backend Development

---

# 🔮 Future Enhancements

- Ollama integration for local LLM inference
- LangChain or LlamaIndex retrieval pipeline
- React dashboard
- JWT authentication
- Docker Compose deployment
- GitHub Actions CI/CD
- Unit and integration tests
- Streaming AI responses
- Persistent conversation history
- Advanced banking analytics

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Naveed Shaik**

If you found this project useful or interesting, consider giving it a ⭐ on GitHub.
