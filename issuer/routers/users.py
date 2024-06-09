from datetime import datetime
import hashlib
import os
from typing import Annotated, Optional
from fastapi import APIRouter, Cookie, UploadFile

from issuer import db
from issuer.db import User
from issuer.routers.models import UserModel


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
            :attr:`passwd`字段，可提供:attr:`role`，:attr:`description`,
            :attr:`role`和:attr:`phone`字段。

    '''
    if user.role is None:
        user.role = 'default'
    md5 = hashlib.md5()
    md5.update(user.passwd.encode('utf-8'))
    passwd_md5 = md5.hexdigest()
    user_do = User(user_name=user.user_name,
                   passwd=passwd_md5,
                   role=user.role,
                   email=user.email,
                   description=user.description,
                   phone=user.phone,
                   avator=user.avator)
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


def get_statics() -> str:
    this_dir = os.path.dirname(__file__)
    par_dir = os.path.abspath(os.path.join(this_dir, os.path.pardir))
    st_dir = os.path.join(par_dir, 'statics')
    return st_dir


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
async def sign_out(user: "UserModel",
                   current_user: Annotated[str | None, Cookie()] = None):
    '''
    用户登出接口。

    Args:
        user: :class:`UserModel`模型，必须提供:attr:`user_code`字段。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None or _user.user_code != user.user_code:
        return {
            "success": False,
            "reason": "Invalid token",
        }

    user = db.find_user_by_code(user.user_code)
    user.token = None
    res = db.update_user_by_code(user)
    return {
        "success": res
    }


@router.post('/change')
async def change_user(user: "UserModel",
                      current_user: Annotated[str | None, Cookie()] = None):
    '''
    更改用户属性。

    Args:
        user: :class:`UserModel`模型，必填:attr:`user_code`。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None or _user.user_code != user.user_code:
        return {
            "success": False,
            "reason": "Invalid token",
        }
    user_do = db.find_user_by_code(user.user_code)
    if user.user_name is not None:
        user_do.user_name = user.user_name
    if user.passwd is not None:
        md5 = hashlib.md5()
        md5.update(user.passwd.encode('utf-8'))
        passwd_md5 = md5.hexdigest()
        user_do.passwd = passwd_md5
    if user.email is not None:
        user_do.email = user.email
    if user.description is not None:
        user_do.description = user.description
    if user.phone is not None:
        user_do.phone = user.phone
    if user.avator is not None:
        user_do.avator = user.avator
    res = db.update_user_by_code(user_do)
    return {"success": res}


@router.get('/roles')
async def query_roles():
    '''获取所有用户角色'''
    metas = db.list_metas_by_type('USER_ROLE')
    return {
        "success": True,
        "data": [meta.meta_value for meta in metas]
    }


@router.post('/upload_avator')
async def upload_avator(file: "UploadFile",
                        current_user: Annotated[str | None, Cookie()] = None):
    '''上传头像'''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {
            "success": False,
            "reason": "Invalid token",
        }
    try:
        filename = f"{_user.user_code}_{file.filename}"
        data = await file.read()
        with open(os.path.join(get_statics(), filename), "wb") as f:
            f.write(data)
            f.flush()
    except Exception as e:
        return {"success": False, "reason": str(e)}
    return {"success": True, "filename": '/statics/' + filename}
