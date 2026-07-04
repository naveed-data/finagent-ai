import ollama


class OllamaService:
    def __init__(self, model_name: str = "llama3.2:3b"):
        self.model_name = model_name

    def generate_raw(self, prompt: str) -> str:
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

    def generate_answer(self, question: str, context: str) -> str:
        prompt = f"""
You are FinAgent AI, a professional banking document intelligence assistant.

Use the provided document context and structured analysis to answer the user's question.

Rules:
1. If the user asks for a specific fact, answer only if it exists in the context.
2. If the user asks for approval chance, risk opinion, decision support, or next steps, provide a cautious professional assessment using the available facts.
3. Do not invent missing information.
4. Clearly mention missing documents, pending items, or limitations.
5. Do not guarantee loan approval.
6. Keep the answer clear, practical, and banking-focused.

Document Context and Structured Analysis:
{context}

User Question:
{question}

Answer:
"""

        return self.generate_raw(prompt)