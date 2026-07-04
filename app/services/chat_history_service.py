from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.chat import ChatMessage

TITLE_MAX_LENGTH = 80


class ChatHistoryService:
    def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        user_id: str | None = None,
        document_filename: str | None = None,
    ) -> None:
        with SessionLocal() as db:
            db.add(
                ChatMessage(
                    session_id=session_id,
                    user_id=user_id,
                    document_filename=document_filename,
                    role=role,
                    content=content,
                )
            )
            db.commit()

    def list_sessions(self, user_id: str | None = None) -> list[dict]:
        with SessionLocal() as db:
            messages = (
                db.execute(
                    select(ChatMessage)
                    .where(ChatMessage.user_id == user_id)
                    .order_by(ChatMessage.created_at.asc())
                )
                .scalars()
                .all()
            )

        sessions_by_id: dict[str, list[ChatMessage]] = {}
        for message in messages:
            sessions_by_id.setdefault(message.session_id, []).append(message)

        summaries = []
        for session_id, session_messages in sessions_by_id.items():
            first_user_message = next(
                (m for m in session_messages if m.role == "user"),
                session_messages[0],
            )
            title = first_user_message.content[:TITLE_MAX_LENGTH]

            summaries.append(
                {
                    "session_id": session_id,
                    "title": title,
                    "message_count": len(session_messages),
                    "last_active": session_messages[-1].created_at,
                }
            )

        summaries.sort(key=lambda summary: summary["last_active"], reverse=True)
        return summaries

    def get_session_messages(
        self, session_id: str, user_id: str | None = None
    ) -> list[ChatMessage]:
        with SessionLocal() as db:
            return (
                db.execute(
                    select(ChatMessage)
                    .where(
                        ChatMessage.session_id == session_id,
                        ChatMessage.user_id == user_id,
                    )
                    .order_by(ChatMessage.created_at.asc())
                )
                .scalars()
                .all()
            )

    def search_sessions(self, query: str, user_id: str | None = None) -> list[dict]:
        with SessionLocal() as db:
            matching_session_ids = (
                db.execute(
                    select(ChatMessage.session_id)
                    .where(
                        ChatMessage.user_id == user_id,
                        ChatMessage.content.ilike(f"%{query}%"),
                    )
                    .distinct()
                )
                .scalars()
                .all()
            )

        if not matching_session_ids:
            return []

        all_sessions = self.list_sessions(user_id=user_id)
        matching_ids = set(matching_session_ids)
        return [s for s in all_sessions if s["session_id"] in matching_ids]
