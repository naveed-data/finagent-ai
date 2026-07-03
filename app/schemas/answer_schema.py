from pydantic import BaseModel


class AnswerSource(BaseModel):
    filename: str
    chunk_id: int
    text: str


class AnswerResponse(BaseModel):
    question: str
    answer: str
    sources: list[AnswerSource]