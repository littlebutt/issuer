from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(
        prefix='/users',
        tags=["users"],
        response={404: {"description": "Not Found"}}
        )


class User(BaseModel):
    '''
    User model.

    '''
    user_code: str | None = None
    user_name: str | None = None
    passwd: str | None = None
    description: str | None = None
    phone: str | None = None


@router.post('/sign_in')
async def sign_up(user: User):
    if user.user_name is None:
        raise HTTPException(status_code=404, detail="user_name not provided")
    if user.passwd is None:
        raise HTTPException(status_code=404, detail="passwd not provided")

