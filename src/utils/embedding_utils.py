import numpy as np
import os


def create_directory(directory):
    """
    Create a directory if it does not exist.
    """
    os.makedirs(directory, exist_ok=True)


def save_embedding(embedding, filename):
    """
    Save an embedding as a NumPy (.npy) file.
    """

    directory = os.path.dirname(filename)

    create_directory(directory)

    np.save(filename, embedding)

    print(f"Embedding saved to: {filename}")