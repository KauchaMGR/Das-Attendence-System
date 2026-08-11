from app.utils.password import hash_password, verify_password

# Original password
password = "Password123"

print("=" * 50)
print("Original Password:")
print(password)

print("\nHashing Password...")
hashed_password = hash_password(password)

print("\nHashed Password:")
print(hashed_password)

print("\nVerifying Correct Password...")
result = verify_password(password, hashed_password)
print("Verification Result:", result)

print("\nVerifying Wrong Password...")
wrong_result = verify_password("WrongPassword", hashed_password)
print("Verification Result:", wrong_result)

print("=" * 50)