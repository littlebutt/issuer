import hashlib
from fastapi import APIRouter, HTTPException

import db
from db import User
from routers.models import UserModel


router = APIRouter(
    prefix='/users',
    tags=["users"],
    responses={404: {"description": "Not Found"}}
)


@router.post('/sign_up')
async def sign_up(user: "UserModel"):
    md5 = hashlib.md5()
    md5.update(user.passwd.encode('utf-8'))
    passwd_md5 = md5.hexdigest()
    user_do = User(user_name=user.user_name,
                   passwd=passwd_md5,
                   role=user.role,
                   email=user.email,
                   description=user.description,
                   phone=user.phone)
    db.insert_user(user_do)
