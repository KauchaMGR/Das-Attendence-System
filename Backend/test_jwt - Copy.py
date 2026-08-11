from app.utils.jwt_handler import (
    create_access_token,
    verify_token
)

print("=" * 60)
print("Generating JWT Token...")
print("=" * 60)

payload = {
    "user_id": "USR001",
    "email": "admin@gmail.com",
    "role": "admin"
}

token = create_access_token(payload)

print("\nGenerated Token:\n")
print(token)

print("\n" + "=" * 60)
print("Verifying Token...")
print("=" * 60)

decoded = verify_token(token)

print("\nDecoded Payload:\n")
print(decoded)