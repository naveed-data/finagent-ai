from fastapi import FastAPI

app = FastAPI(
    title="FinAgent AI",
    description="Enterprise Banking Operations Platform",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to FinAgent AI 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }