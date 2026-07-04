import numpy as np

embedding = np.load("Outputs/Embeddings/face_1.npy")

print("Embedding Shape :", embedding.shape)
print("Embedding Length:", len(embedding))
print("\nFirst 10 values:")
print(embedding[:10])