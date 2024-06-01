from datetime import datetime
import hashlib
from typing import Annotated, Optional
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db import User
from issuer.routers.models import UserModel, UserRoleEnum


router = APIRouter(
    prefix='/users',
    tags=["users"],
    responses={404: {"description": "Not Found"}}
)


@router.post('/sign_up')
async def sign_up(user: "UserModel"):
    if user.role is None:
        user.role = UserRoleEnum.Normal.name
    md5 = hashlib.md5()
    md5.update(user.passwd.encode('utf-8'))
    passwd_md5 = md5.hexdigest()
    user_do = User(user_name=user.user_name,
                   passwd=passwd_md5,
                   role=user.role,
                   email=user.email,
                   description=user.description,
                   phone=user.phone)
    is_success = db.insert_user(user_do)
    return {"success": is_success}


def generate_token(user_code: str) -> str:
    timestamp = datetime.now().timestamp()
    md5 = hashlib.md5()
    md5.update(str(timestamp).encode('utf-8'))
    return md5.hexdigest()


def check_cookie(cookie: Optional[str]) -> Optional["User"]:
    # cookie格式: user_code:token
    if cookie is not None:
        user_code, token = cookie.split(':')
        user = db.find_user_by_code(user_code)
        if user is not None and user.token == token:
            return user
    return None


@router.post('/sign_in')
async def sign_in(email: str,
                  passwd: str,
                  cookie: Annotated[str | None, Cookie()] = None):
    user = check_cookie(cookie=cookie)
    if user is not None:
        return {
            "success": True,
            "reason": "Valid token",
            "user": user
        }

    md5 = hashlib.md5()
    md5.update(passwd.encode('utf-8'))
    passwd_md5 = md5.hexdigest()

    user = db.find_user_by_email(email)
    if user is None:
        return {
            "success": "False",
            "reason": "Not exist"
        }

    if user.passwd != passwd_md5:
        return {
            "success": False,
            "reason": "Wrong passwd"
        }
    else:
        token = generate_token(user.user_code)
        expr = 60 * 60 * 1000
        user.token = token
        res = db.update_user_by_code(user)
        if res is False:
            return {
                "success": False,
                "reason": "Internal error"
            }
        else:
            return {
                "success": True,
                "token": token,
                "expr": expr,
                "user": user
            }


@router.post('/sign_out')
async def sign_out(user_code: str,
                   cookie: Annotated[str | None, Cookie()] = None):
    user = check_cookie(cookie)
    if user is None:
        return {
            "success": False,
            "reason": "Already sign out"
        }
    else:
        user.token = None
        res = db.update_user_by_code(user)
        return {
            "success": res
        }


@router.post('/cancel')
async def concel(user_code: str,
                 cookie: Annotated[str | None, Cookie()] = None):
    user = check_cookie(cookie)
    if user is None:
        return {
            "success": False,
            "reason": "Invalid token"
        }
    else:
        res = db.delete_user_by_code(user_code)
        return {
            "success": res
        }
