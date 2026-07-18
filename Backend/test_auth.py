from app.schemas.user_schema import UserLogin
from app.services.auth_service import login_user

login = UserLogin(
    email="abc@gmail.com",
    password="123456"
)

try:

    token = login_user(login)

    print("="*50)
    print("Login Successful")
    print("="*50)

    print(token)

except Exception as e:

    print(e)