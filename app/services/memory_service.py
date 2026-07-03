from collections import deque


class MemoryService:
    def __init__(self, max_history: int = 10):
        self.history = deque(maxlen=max_history)

    def add(self, role: str, message: str):
        self.history.append(
            {
                "role": role,
                "message": message,
            }
        )

    def get_context(self) -> str:
        return "\n".join(
            f"{item['role']}: {item['message']}"
            for item in self.history
        )

    def clear(self):
        self.history.clear()