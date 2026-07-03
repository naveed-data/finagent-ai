# FinAgent AI

Enterprise Banking Operations Intelligence Platform powered by RAG, local embeddings, ChromaDB, and FastAPI.

## Features

- PDF document upload
- Banking document parsing
- Text chunking
- Local BGE embeddings
- ChromaDB vector search
- Semantic document search
- Conversational Q&A
- Session-based memory
- Loan risk assessment
- Compliance checklist
- Supervisor analysis endpoint

## Tech Stack

- Python
- FastAPI
- Pydantic
- PyPDF
- Sentence Transformers
- BAAI/bge-small-en-v1.5
- ChromaDB
- Uvicorn

## Run Locally

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```
