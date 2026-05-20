from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from ..schemas.user import UserCreate
from ..services.auth_service import create_user, authenticate_user

router = APIRouter(prefix='/auth', tags=['auth'])


class LoginData(BaseModel):
    username: EmailStr
    password: str


@router.post('/signup')
async def signup(user: UserCreate):
    print('SIGNUP REQUEST:', user)

    created = await create_user(user.dict())

    if not created:
        raise HTTPException(
            status_code=400,
            detail='User already exists'
        )

    return {
        'message': 'user created',
        'user': {
            'id': str(created.get('_id')),
            'email': created.get('email')
        }
    }


@router.post('/login')
async def login(data: LoginData):
    print('LOGIN REQUEST:', data)

    token = await authenticate_user(
        data.username,
        data.password
    )

    print('TOKEN RESULT:', token)

    if not token:
        raise HTTPException(
            status_code=401,
            detail='Invalid credentials'
        )

    return token
