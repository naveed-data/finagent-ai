import ollama


class OllamaService:
    def __init__(self, model_name: str = "llama3.2:3b"):
        self.model_name = model_name

    def generate_answer(self, question: str, context: str) -> str:
        prompt = f"""
You are FinAgent AI, a banking document intelligence assistant.

Answer the user's question using only the provided document context.
If the answer is not found in the context, say:
"I could not find that information in the uploaded document."

Document Context:
{context}

User Question:
{question}

Answer:
"""

        response = ollama.chat(
            model=self.model_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        return response["message"]["content"]