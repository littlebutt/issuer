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
    '''
    用户注册接口。

    Args:
        user: :class:`UserModel`模型，必须提供:attr:`email`，:attr:`user_name`和
            :attr:`passwd`字段，可提供:attr:`role`，:attr:`description`和
            :attr:`phone`字段。若未提供:attr:`role`字段则采用默认
            :enum:`UserRoleEnum.Normal`枚举值。

    '''
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
async def sign_in(user: "UserModel",
                  current_user: Annotated[str | None, Cookie()] = None):
    '''
    用户登录接口。

    Args:
        user: :class:`UserModel`模型，必须提供:attr:`email`字段以及:attr:`passwd`字
            段。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is not None:
        return {
            "success": True,
            "reason": "Valid token",
            "user": _user
        }

    md5 = hashlib.md5()
    md5.update(user.passwd.encode('utf-8'))
    passwd_md5 = md5.hexdigest()

    user = db.find_user_by_email(user.email)
    if user is None:
        return {
            "success": False,
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
async def sign_out(user: "UserModel"):
    '''
    用户登出接口。

    Args:
        user: :class:`UserModel`模型，必须提供:attr:`user_code`字段。

    '''
    user = db.find_user_by_code(user.user_code)
    user.token = None
    res = db.update_user_by_code(user)
    return {
        "success": res
    }


@router.post('/cancel')
async def cancel(user: "UserModel"):
    '''
    用户注销接口。

    Args:
        user: :class:`UserModel`模型，必须提供:attr:`user_code`字段。

    '''
    res = db.delete_user_by_code(user.user_code)
    if res is False:
        return {"success": False}
    res = db.delete_user_to_user_group_by_user(user.user_code)
    # TODO: 检查是否存在项目owner和未关闭的issue
    return {
        "success": res
    }
