from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class FaceEmbeddingCreate(BaseModel):
    student_id: str
    embedding_vector: List[float]
    model_name: str = "SFace"
    photo_count: int


class FaceEmbeddingUpdate(BaseModel):
    embedding_vector: Optional[List[float]] = None
    photo_count: Optional[int] = None


class FaceEmbeddingResponse(BaseModel):
    student_id: str
    embedding_vector: List[float]
    model_name: str
    photo_count: int
    created_at: datetime