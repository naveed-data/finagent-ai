from pydantic import BaseModel


class SearchResult(BaseModel):
    text: str
    filename: str
    chunk_id: int
    distance: float


class SearchResponse(BaseModel):
    query: str
    result_count: int
    results: list[SearchResult]