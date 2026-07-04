from datetime import datetime

from pydantic import BaseModel


class ChatMessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime
    document_filename: str | None = None


class ChatSessionSummary(BaseModel):
    session_id: str
    title: str
    message_count: int
    last_active: datetime


class ChatSessionListResponse(BaseModel):
    session_count: int
    sessions: list[ChatSessionSummary]


class ChatSessionDetailResponse(BaseModel):
    session_id: str
    messages: list[ChatMessageOut]
