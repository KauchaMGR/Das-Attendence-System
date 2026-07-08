import numpy as np

from src.database.mongodb import MongoDB


class RecognitionService:
    """
    Compare a live face embedding with all registered
    student embeddings stored in MongoDB.
    """

    def __init__(self):

        self.database = MongoDB()

        print("Recognition Service Initialized.")

    def cosine_similarity(self, embedding1, embedding2):
        """
        Compute cosine similarity between two embeddings.
        """

        embedding1 = np.array(embedding1)
        embedding2 = np.array(embedding2)

        numerator = np.dot(embedding1, embedding2)

        denominator = (
            np.linalg.norm(embedding1)
            * np.linalg.norm(embedding2)
        )

        return numerator / denominator

    def recognize(self, live_embedding, threshold=0.70):
        """
        Recognize the most similar student.
        """

        students = self.database.get_all_students()

        best_student = None

        best_similarity = -1

        for student in students:

            similarity = self.cosine_similarity(
                live_embedding,
                student["embedding"]
            )

            if similarity > best_similarity:

                best_similarity = similarity

                best_student = student

        if best_similarity >= threshold:

            return {
                "student": best_student,
                "similarity": best_similarity
            }

        return None