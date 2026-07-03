import uuid
from datetime import datetime, timezone

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
        document_id = str(uuid.uuid4())
        uploaded_at = datetime.now(timezone.utc).isoformat()

        texts = [chunk.text for chunk in chunks]
        embeddings = self.embedding_model.encode(texts).tolist()
        ids = [str(uuid.uuid4()) for _ in texts]

        metadatas = [
            {
                "document_id": document_id,
                "filename": filename,
                "chunk_id": chunk.chunk_id,
                "character_count": chunk.character_count,
                "uploaded_at": uploaded_at,
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

    def search(self, query: str, top_k: int = 3, filename: str | None = None) -> list[dict]:
        query_embedding = self.embedding_model.encode([query]).tolist()[0]

        where_filter = {"filename": filename} if filename else None

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_filter,
        )

        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        search_results = []

        for document, metadata, distance in zip(documents, metadatas, distances):
            search_results.append(
                {
                    "text": document,
                    "document_id": metadata.get("document_id", ""),
                    "filename": metadata.get("filename", ""),
                    "chunk_id": metadata.get("chunk_id", 0),
                    "distance": distance,
                    "uploaded_at": metadata.get("uploaded_at", ""),
                }
            )

        return search_results

    def list_documents(self) -> list[dict]:
        results = self.collection.get()

        metadatas = results.get("metadatas", [])

        documents = {}

        for metadata in metadatas:
            filename = metadata.get("filename", "unknown")
            document_id = metadata.get("document_id", "")
            uploaded_at = metadata.get("uploaded_at", "")

            if filename not in documents:
                documents[filename] = {
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_count": 0,
                    "uploaded_at": uploaded_at,
                }

            documents[filename]["chunk_count"] += 1

        return list(documents.values())

    def delete_document(self, filename: str) -> int:
        results = self.collection.get(
            where={"filename": filename}
        )

        ids = results.get("ids", [])

        if not ids:
            return 0

        self.collection.delete(ids=ids)

        return len(ids)