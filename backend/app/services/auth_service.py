from ..db.mongodb import db
from ..utils.security import (
    hash_password,
    verify_password,
    create_access_token
)


async def create_user(user_data):

    existing = await db.users.find_one({
        "email": user_data["email"]
    })

    if existing:
        return None

    user_data["password"] = hash_password(
        user_data["password"]
    )

    result = await db.users.insert_one(user_data)

    user_data["_id"] = str(result.inserted_id)

    return user_data


async def authenticate_user(email, password):

    user = await db.users.find_one({
        "email": email
    })

    if not user:
        return None

    valid = verify_password(
        password,
        user["password"]
    )

    if not valid:
        return None

    token = create_access_token({
        "sub": user["email"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }