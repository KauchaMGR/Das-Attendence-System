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
        Recognize the most similar student using
        multiple stored embeddings.
        """

        students = self.database.get_all_students()

        if not students:

           return None

        best_student = None
        highest_similarity = -1

        # --------------------------------------------------
        # Compare against every student
        # --------------------------------------------------
        for student in students:

            best_similarity_for_student = -1

            print("\n" + "=" * 50)
            print(f"Student : {student['name']}")

            # Compare with every stored embedding
            for index, stored_embedding in enumerate(student["embeddings"], start=1):

                similarity = self.cosine_similarity(
                    live_embedding,
                    stored_embedding
                )

                print(f"Pose {index} Similarity : {similarity:.4f}")

                if similarity > best_similarity_for_student:
                    best_similarity_for_student = similarity

            print(f"Best Similarity : {best_similarity_for_student:.4f}")

            # Keep the best matching student
            if best_similarity_for_student > highest_similarity:
                highest_similarity = best_similarity_for_student
                best_student = student

        print("\n" + "=" * 50)
        print(f"Highest Similarity Overall : {highest_similarity:.4f}")

        # Final decision
        if highest_similarity >= threshold:

            return {
                "student": best_student,
                "similarity": highest_similarity
            }

        return None
