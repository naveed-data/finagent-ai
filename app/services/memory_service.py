from collections import defaultdict, deque


class MemoryService:
    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.sessions = defaultdict(lambda: deque(maxlen=max_history))

    def add(self, session_id: str, role: str, message: str) -> None:
        self.sessions[session_id].append(
            {
                "role": role,
                "message": message,
            }
        )

    def get_context(self, session_id: str) -> str:
        history = self.sessions.get(session_id, [])

        return "\n".join(
            f"{item['role']}: {item['message']}"
            for item in history
        )

    def clear(self, session_id: str) -> None:
        if session_id in self.sessions:
            self.sessions[session_id].clear()