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
    
    def euclidean_distance(self, embedding1, embedding2):
     """
     Compute Euclidean distance between two embeddings.
     Smaller distance means more similar.
     """

     embedding1 = np.array(embedding1)
     embedding2 = np.array(embedding2)

     return np.linalg.norm(embedding1 - embedding2)
    
    def euclidean_similarity(self, embedding1, embedding2):
     """
     Convert Euclidean distance into a similarity score.
     Higher similarity is better.
     """

     distance = self.euclidean_distance(
        embedding1,
        embedding2
     )

     similarity = 1 / (1 + distance)

     return similarity
     
    def fused_similarity(
    self,
    embedding1,
    embedding2,
    cosine_weight=0.7,
    euclidean_weight=0.3
       ):
     """
     Combine Cosine Similarity and
     Euclidean Similarity into one score.
     """

     cosine = self.cosine_similarity(
        embedding1,
        embedding2
     )

     euclidean = self.euclidean_similarity(
        embedding1,
        embedding2
     )

     final_score = (
        cosine_weight * cosine
        +
        euclidean_weight * euclidean
     )

     return final_score, cosine, euclidean 
    

    def recognize(self, live_embedding, threshold=0.50):
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

                similarity, cosine, euclidean = self.fused_similarity(
                   live_embedding,
                  stored_embedding
                    )

                print( f"Pose {index}")

                print(f"Cosine Similarity    : {cosine:.4f}")

                print(f"Euclidean Similarity : {euclidean:.4f}")

                print(f"Final Score          : {similarity:.4f}")

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
    

    def recognize_multiple(self, live_embeddings, threshold=0.50):
     """
     Recognize a student using multiple live embeddings
     against multiple stored embeddings.
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

        print("\n" + "=" * 60)
        print(f"Student : {student['name']}")

        student_scores = []

        # ----------------------------------------------
        # Compare every LIVE embedding
        # ----------------------------------------------
        for live_index, live_embedding in enumerate(live_embeddings, start=1):

            best_live_similarity = -1
            best_cosine = 0 
            best_euclidean = 0

            # Compare against every STORED embedding
            for stored_index, stored_embedding in enumerate(
                student["embeddings"], start=1
            ):

             similarity, cosine, euclidean = self.fused_similarity(
             live_embedding,
              stored_embedding
            )

             if similarity > best_live_similarity:
                    best_live_similarity = similarity
                    best_cosine = cosine
                    best_euclidean = euclidean
 
            student_scores.append(best_live_similarity)

            print(f"\nLive Frame {live_index}")

            print(f"Cosine Similarity    : {best_cosine:.4f}")

            print(f"Euclidean Similarity : {best_euclidean:.4f}")

            print(f"Final Score          : {best_live_similarity:.4f}")
        # ----------------------------------------------
        # Keep only the TOP similarities
        # ----------------------------------------------
        if not student_scores:
          continue
        # Sort scores from highest to lowest
        student_scores.sort(reverse=True)

        # Number of scores to keep
        TOP_K = min(8,len(student_scores))

        # Keep only the best scores
        best_scores = student_scores[:TOP_K]

        print("\nTop Scores:")

        for i, score in enumerate(best_scores, start=1):
            print(f"Top {i} : {score:.4f}")

        # Average only the best scores
        final_similarity = np.mean(best_scores)

        print(
            f"\nFinal Similarity (Top {TOP_K} Average) : "
            f"{final_similarity:.4f}"
        )

        # Keep the best student
        if final_similarity > highest_similarity:
            highest_similarity = final_similarity
            best_student = student

     # --------------------------------------------------
     # Final Result
     # --------------------------------------------------
     print("\n" + "=" * 60)
     print(f"Highest Average Similarity : {highest_similarity:.4f}")
     print("=" * 60)

     if highest_similarity >= threshold:

        return {
            "student": best_student,
            "similarity": highest_similarity
        }

     return None