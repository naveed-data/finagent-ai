from fastapi import APIRouter, Depends, HTTPException

from app.api.v1.auth_routes import get_current_user
from app.models.user import User
from app.schemas.chat_schema import (
    ChatSessionDetailResponse,
    ChatSessionListResponse,
)
from app.services.chat_history_service import ChatHistoryService

router = APIRouter(prefix="/chat-sessions", tags=["Chat History"])

chat_history_service = ChatHistoryService()


@router.get("", response_model=ChatSessionListResponse)
async def list_chat_sessions(current_user: User = Depends(get_current_user)):
    sessions = chat_history_service.list_sessions(user_id=current_user.id)
    return {"session_count": len(sessions), "sessions": sessions}


@router.get("/search", response_model=ChatSessionListResponse)
async def search_chat_sessions(
    query: str,
    current_user: User = Depends(get_current_user),
):
    sessions = chat_history_service.search_sessions(query, user_id=current_user.id)
    return {"session_count": len(sessions), "sessions": sessions}


@router.get("/{session_id}", response_model=ChatSessionDetailResponse)
async def get_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    messages = chat_history_service.get_session_messages(
        session_id, user_id=current_user.id
    )

    if not messages:
        raise HTTPException(
            status_code=404,
            detail=f"No chat history found for session: {session_id}",
        )

    return {"session_id": session_id, "messages": messages}


@router.delete("/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    deleted_count = chat_history_service.delete_session(
        session_id, user_id=current_user.id
    )

    if not deleted_count:
        raise HTTPException(
            status_code=404,
            detail=f"No chat history found for session: {session_id}",
        )

    return {"session_id": session_id, "deleted_messages": deleted_count}
