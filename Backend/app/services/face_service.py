from app.config.database import face_embeddings
from app.models.face_embedding import FaceEmbedding


def register_face(data):

    existing = face_embeddings.find_one(
        {
            "student_id": data.student_id
        }
    )

    if existing:
        raise ValueError("Face embedding already exists")

    face = FaceEmbedding(
        data.student_id,
        data.embedding_vector,
        data.model_name,
        data.photo_count
    )

    result = face_embeddings.insert_one(
        face.to_dict()
    )

    return str(result.inserted_id)


def get_all_faces():

    faces = []

    for face in face_embeddings.find():

        face["_id"] = str(face["_id"])

        faces.append(face)

    return faces


def get_face(student_id):

    face = face_embeddings.find_one(
        {
            "student_id": student_id
        }
    )

    if not face:
        raise ValueError("Embedding not found")

    face["_id"] = str(face["_id"])

    return face


def update_face(student_id, update_data):

    result = face_embeddings.update_one(
        {
            "student_id": student_id
        },
        {
            "$set": update_data
        }
    )

    if result.matched_count == 0:
        raise ValueError("Student not found")

    return "Embedding Updated Successfully"


def delete_face(student_id):

    result = face_embeddings.delete_one(
        {
            "student_id": student_id
        }
    )

    if result.deleted_count == 0:
        raise ValueError("Student not found")

    return "Embedding Deleted Successfully"