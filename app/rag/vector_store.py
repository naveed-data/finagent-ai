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

    def add_chunks(
        self,
        filename: str,
        chunks: list,
        document_type: str = "application",
        user_id: str | None = None,
    ) -> int:
        document_id = str(uuid.uuid4())
        uploaded_at = datetime.now(timezone.utc).isoformat()

        texts = [chunk.text for chunk in chunks]
        embeddings = self.embedding_model.encode(texts).tolist()
        ids = [str(uuid.uuid4()) for _ in texts]

        metadatas = []
        for chunk in chunks:
            metadata = {
                "document_id": document_id,
                "filename": filename,
                "chunk_id": chunk.chunk_id,
                "character_count": chunk.character_count,
                "uploaded_at": uploaded_at,
                "document_type": document_type,
            }
            if user_id:
                metadata["user_id"] = user_id
            metadatas.append(metadata)

        self.collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        return len(texts)

    def _build_where_filter(self, conditions: list[dict]) -> dict | None:
        if len(conditions) > 1:
            return {"$and": conditions}
        if conditions:
            return conditions[0]
        return None

    def search(
        self,
        query: str,
        top_k: int = 3,
        filename: str | None = None,
        document_type: str | None = None,
        user_id: str | None = None,
    ) -> list[dict]:
        query_embedding = self.embedding_model.encode([query]).tolist()[0]

        conditions = []
        if filename:
            conditions.append({"filename": filename})
        if document_type:
            conditions.append({"document_type": document_type})
        if user_id:
            conditions.append({"user_id": user_id})

        where_filter = self._build_where_filter(conditions)

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
                    "document_type": metadata.get("document_type", "application"),
                }
            )

        return search_results

    def list_documents(self, user_id: str | None = None) -> list[dict]:
        where_filter = self._build_where_filter(
            [{"user_id": user_id}] if user_id else []
        )
        results = self.collection.get(where=where_filter)

        metadatas = results.get("metadatas", [])

        documents = {}

        for metadata in metadatas:
            filename = metadata.get("filename", "unknown")
            document_id = metadata.get("document_id", "")
            uploaded_at = metadata.get("uploaded_at", "")
            document_type = metadata.get("document_type", "application")

            if filename not in documents:
                documents[filename] = {
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_count": 0,
                    "uploaded_at": uploaded_at,
                    "document_type": document_type,
                }

            documents[filename]["chunk_count"] += 1

        return list(documents.values())

    def get_document_owner(self, filename: str) -> str | None:
        results = self.collection.get(where={"filename": filename}, limit=1)
        metadatas = results.get("metadatas", [])

        if not metadatas:
            return None

        return metadatas[0].get("user_id")

    def delete_document(self, filename: str, user_id: str | None = None) -> int:
        conditions = [{"filename": filename}]
        if user_id:
            conditions.append({"user_id": user_id})

        results = self.collection.get(where=self._build_where_filter(conditions))

        ids = results.get("ids", [])

        if not ids:
            return 0

        self.collection.delete(ids=ids)

        return len(ids)
