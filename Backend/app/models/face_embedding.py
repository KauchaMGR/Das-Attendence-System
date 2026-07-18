from datetime import datetime


class FaceEmbedding:

    def __init__(
        self,
        student_id,
        embedding_vector,
        model_name="SFace",
        photo_count=1
    ):

        self.student_id = student_id
        self.embedding_vector = embedding_vector
        self.model_name = model_name
        self.photo_count = photo_count
        self.created_at = datetime.utcnow()

    def to_dict(self):

        return {

            "student_id": self.student_id,

            "embedding_vector": self.embedding_vector,

            "model_name": self.model_name,

            "photo_count": self.photo_count,

            "created_at": self.created_at
        }