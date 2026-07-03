import uuid

import chromadb
from sentence_transformers import SentenceTransformer

from app.config.settings import settings


class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.chroma_db_path)
        self.collection = self.client.get_or_create_collection(
            name="banking_documents"
        )
        self.embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5")

    def add_chunks(self, filename: str, chunks: list) -> int:
        texts = [chunk.text for chunk in chunks]
        embeddings = self.embedding_model.encode(texts).tolist()
        ids = [str(uuid.uuid4()) for _ in texts]

        metadatas = [
            {
                "filename": filename,
                "chunk_id": chunk.chunk_id,
                "character_count": chunk.character_count,
            }
            for chunk in chunks
        ]

        self.collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        return len(texts)

    def search(self, query: str, top_k: int = 3) -> list[dict]:
        query_embedding = self.embedding_model.encode([query]).tolist()[0]

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
        )

        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        search_results = []

        for document, metadata, distance in zip(documents, metadatas, distances):
            search_results.append(
                {
                    "text": document,
                    "filename": metadata.get("filename", ""),
                    "chunk_id": metadata.get("chunk_id", 0),
                    "distance": distance,
                }
            )

        return search_results