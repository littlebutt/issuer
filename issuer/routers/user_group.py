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
    '''
    新增用户组接口。

    Args:
        user_group_model: :class:`UserGroupReq`模型，必须提供:attr:`group_name`和
            :attr:`owner`字段。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
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
    '''
    删除用户组，必须是组长(owner)才能进行的操作。

    Args:
        user_group_model: :class:`UserGroupReq`模型，必须提供:attr:`group_code`
            字段。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。
    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    user_group = db.find_user_group_by_code(user_group_model.group_code)
    if user_group.group_owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}
    res = db.delete_user_group_by_code(user_group_model.group_code)
    if res is False:
        return {"success": res}
    res = db.delete_user_to_user_group_by_group(user_group_model.group_code)
    return {"success": res}


@router.post('/change')
async def change_user_group(user_group_model: "UserGroupReq",
                            current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    变更用户组，必须是组长(owner)才能进行的操作。

    Args:
        user_group_model: :class:`UserGroupReq`模型，必须提供:attr:`group_code`，
            :attr:`group_name`和:attr:`owner`字段。可以提供:attr:`members`字段，
            若不提供则清除所有关联成员。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    user_group = db.find_user_group_by_code(user_group_model.group_code)
    if user_group.group_owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}
    if _user.user_code not in user_group_model.members:
        return {"success": False, "reason": "Owner not in members"}
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
    '''
    根据:arg:`group_code`查询用户组。

    Args:
        group_code: 用户组码。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    user_group = db.find_user_group_by_code(group_code)
    user_to_user_groups = db.list_user_to_user_group_by_group(group_code)
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
    '''
    根据:arg:`user_code`查询参与的所有项目。

    Args:
        user_code: 用户码
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}

    user_to_user_groups = db.\
        list_user_to_user_group_by_user(user_code=user_code)
    user_groups = list()
    for user_to_user_group in user_to_user_groups:
        user_group = db.find_user_group_by_code(user_to_user_group.group_code)
        user_groups.append(user_group)
    return {
        "success": True,
        "user_code": user_code,
        "user_groups": user_groups
    }
# TODO: 新增根据用户码查询所有组长为该用户的用户组。


