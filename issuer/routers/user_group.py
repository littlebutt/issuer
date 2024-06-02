from typing import Annotated
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db import UserGroup, UserToUserGroup
from issuer.routers.models import UserGroupReq, UserGroupRes, UserModel
from issuer.routers.users import check_cookie


router = APIRouter(
    prefix='/user_group',
    tags=["user_group"],
    responses={404: {"description": "Not Found"}}
)


@router.post('/new')
async def new_user_group(user_group_model: "UserGroupReq",
                         current_user: Annotated[str | None, Cookie()] = None):
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    user_group_do = UserGroup(group_name=user_group_model.group_name,
                              group_owner=user_group_model.owner)
    res = db.insert_user_group(user_group=user_group_do)
    if res is False:
        return {"success": res}
    # 把自己添加入members列表
    user_groups = db.find_user_group_by_owner(owner=user_group_model.owner)
    # XXX: 找到刚才新增的用户组
    user_group = user_groups[-1] if len(user_groups) > 0 else None
    res = db.insert_user_to_user_group(
        UserToUserGroup(user_code=user_group_model.owner,
                        group_code=user_group.group_code)
    )
    return {"success": res}


@router.post('/delete')
async def delete_user_group(user_group_model: "UserGroupReq",
                            current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    res = db.delete_user_group_by_code(user_group_model.group_code)
    if res is False:
        return {"success": res}
    res = db.delete_user_to_user_group_by_group(user_group_model.group_code)
    return {"success": res}


@router.post('/change')
async def change_user_group(user_group_model: "UserGroupReq",
                            current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    _group_code = user_group_model.group_code
    _user_group = db.find_user_group_by_code(_group_code)
    _user_group.group_name = user_group_model.group_name
    _user_group.group_owner = user_group_model.owner
    res = db.update_user_group_by_code(_user_group)

    db.delete_user_to_user_group_by_group(_group_code)
    if user_group_model.members is not None:
        users = user_group_model.members.split(',')
        for user in users:
            res = db.insert_user_to_user_group(
                UserToUserGroup(user_code=user,
                                group_code=_group_code)
            )
            if res is False:
                return {"success": False, "reason": "Internal error"}
    return {"success": res}


@router.get('/query', response_model=UserGroupRes)
async def query_user_group_by_code(group_code: str,
                                   current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    user_group = db.find_user_group_by_code(group_code)
    user_to_user_groups = db.find_user_to_user_group_by_group(group_code)
    users = list()
    for user_to_user_group in user_to_user_groups:
        user = db.find_user_by_code(user_to_user_group.user_code)
        if user is not None:
            users.append(UserModel(user_code=user.user_code,
                                   user_name=user.user_name,
                                   email=user.email,
                                   role=user.role,
                                   description=user.description,
                                   phone=user.phone))

    res = UserGroupRes(group_code=group_code,
                       group_name=user_group.group_name,
                       owner=user_group.group_owner,
                       members=users)
    return res


@router.get('/query_group')
async def query_user_group_by_user(user_code: str,
                             current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    user_to_user_groups = db.\
        find_user_to_user_group_by_user(user_code=user_code)
    user_groups = list()
    for user_to_user_group in user_to_user_groups:
        user_group = db.find_user_group_by_code(user_to_user_group.group_code)
        user_groups.append(user_group)
    return {
        "success": True,
        "user_code": user_code,
        "user_groups": user_groups
    }
