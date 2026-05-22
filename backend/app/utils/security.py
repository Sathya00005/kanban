from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# 🚀 NEW: Configure FastAPI to expect the token in the request header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=1)
    to_encode.update({
        "exp": expire
    })
    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# 🔒 NEW: The missing dependency function that tasks.py was searching for!
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Interceptors incoming network tokens from headers, decodes the claims layout, 
    and returns verified owner context back to the active request handlers.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials, authorization token missing or expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Look for the email identifier inside your token payload 'sub' field
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return {"email": email}
    except JWTError:
        raise credentials_exception