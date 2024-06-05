from typing import Annotated, Dict, List
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
                              group_owner=_user.user_code)
    res = db.insert_user_group(user_group=user_group_do)
    if res is None:
        return {"success": False}
    # 把自己添加入members列表
    user_group = db.find_user_group_by_code(res)
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


@router.get('/query', response_model=UserGroupRes | Dict)
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
    owner = db.find_user_by_code(user_group.group_owner)
    res = UserGroupRes(group_code=group_code,
                       group_name=user_group.group_name,
                       owner=UserModel(
                           user_code=owner.user_code,
                           user_name=owner.user_name,
                           email=owner.email,
                           role=owner.role,
                           description=owner.description,
                           phone=owner.phone
                       ),
                       members=users)
    return res


@router.get('/list_users', response_model=List[UserModel] | Dict)
async def list_users_by_group_code(group_code: str,
                                   page_num: int = 1,
                                   page_size: int = 10,
                                   current_user: Annotated[str | None, Cookie()] = None): # noqa
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    u2ugs = db.list_user_to_user_group_by_group(group_code,
                                                page_num=page_num,
                                                page_size=page_size)
    res = list()
    for u2ug in u2ugs:
        u = db.find_user_by_code(u2ug.user_code)
        res.append(UserModel(
            user_code=u.user_code,
            user_name=u.user_name,
            email=u.email,
            role=u.role,
            description=u.description,
            phone=u.phone
        ))
    return res


@router.get('/query_group', response_model=List[UserGroupRes] | Dict)
async def query_user_group_by_user(user_code: str,
                                   page_num: int = 1,
                                   page_size: int = 10,
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
        list_user_to_user_group_by_user(user_code=user_code,
                                        page_num=page_num, page_size=page_size)
    user_groups = list()
    for user_to_user_group in user_to_user_groups:
        user_group = db.find_user_group_by_code(user_to_user_group.group_code)
        owner = db.find_user_by_code(user_group.group_owner)
        members = list()
        us = db.list_user_to_user_group_by_group(user_group.group_code)
        for u in us:
            members.append(u.user_code)
        user_groups.append(UserGroupRes(
            group_code=user_group.group_code,
            group_name=user_group.group_name,
            owner=UserModel(user_code=owner.user_code,
                            user_name=owner.user_name,
                            email=owner.email,
                            role=owner.role,
                            description=owner.description,
                            phone=owner.phone),
            members=','.join(members)
        ))
    return user_groups
