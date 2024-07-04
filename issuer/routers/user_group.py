import logging
from typing import Annotated, Dict, List, Optional
from fastapi import APIRouter, Cookie

from issuer import db
from issuer.db import UserGroup, UserToUserGroup
from issuer.routers.convertors import convert_user_group
from issuer.routers.models import UserGroupReq, UserGroupRes
from issuer.routers.users import check_cookie
from issuer.routers.utils import empty_string_to_none, empty_strings_to_none


router = APIRouter(
    prefix='/user_group',
    tags=["user_group"],
    responses={404: {"description": "Not Found"}}
)


Logger = logging.getLogger(__name__)


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
        UserToUserGroup(user_code=_user.user_code,
                        group_code=user_group.group_code)
    )
    # 把其他人添加入members列表
    if user_group_model.members is not None and user_group_model.members != "":
        for member in user_group_model.members.split(','):
            db.insert_user_to_user_group(
                UserToUserGroup(user_code=member,
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
    user_group_model = empty_strings_to_none(user_group_model)
    user_group = db.find_user_group_by_code(user_group_model.group_code)
    if user_group.group_owner != _user.user_code:
        return {"success": False, "reason": "Permission denied"}

    if user_group_model.group_name is not None:
        user_group.group_name = user_group_model.group_name

    if user_group_model.owner is not None:
        user_group.group_owner = user_group_model.owner

    res = db.update_user_group_by_code(user_group)

    if user_group_model.members is not None:
        db.delete_user_to_user_group_by_group(user_group_model.group_code)
        if user_group_model.owner not in user_group_model.members:
            tmp = user_group_model.members.split(',')
            tmp.append(user_group_model.owner)
            user_group_model.members = ','.join(tmp)
        users = user_group_model.members.split(',')
        for user in users:
            res = db.insert_user_to_user_group(
                UserToUserGroup(user_code=user,
                                group_code=user_group_model.group_code)
            )
            if res is False:
                return {"success": False, "reason": "Internal error"}
    return {"success": res}


@router.post('/add')
async def add_user_group(user_group_model: "UserGroupReq",
                         current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    用户组加入新成员。

    Args:
        user_group_model: 提供:attr:`group_code`和:attr:`new_member`字段，其中
            :attr:`new_member`是新加入用户的user_code。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    user_group_model = empty_strings_to_none(user_group_model)
    res = db.insert_user_to_user_group(
        UserToUserGroup(
            user_code=user_group_model.new_member,
            group_code=user_group_model.group_code
        )
    )
    return {"success": res}


@DeprecationWarning
@router.get('/query_group',
            response_model=Dict[str, bool | str | List[UserGroupRes]])
async def query_user_group_by_user(user_code: str,
                                   page_num: int = 1,
                                   page_size: int = 10,
                                   current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    根据:arg:`user_code`查询参与的所有项目。

    Args:
        user_code: 用户码。
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
        user_group_do = db.\
            find_user_group_by_code(user_to_user_group.group_code)
        if user_group_do is None:
            Logger.error("Cannot find UserGroup with group_code: "
                         f"{user_to_user_group.group_code}")
            continue
        user_group = convert_user_group(user_group_do)
        user_groups.append(user_group)
    return {"success": True, "data": user_groups}


@router.get('/list_groups',
            response_model=Dict[str, bool | str | List[UserGroupRes]])
async def list_groups_by_condition(group_code: Optional[str] = None,
                                   group_name: Optional[str] = None,
                                   owner: Optional[str] = None,
                                   members: Optional[str] = None,
                                   page_num: int = 1,
                                   page_size: int = 10,
                                   current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    根据条件查询用户组列表。

    Args:
        group_code (Optional[str]): 用户组码。
        group_name (Optional[str]): 用户组名，模糊匹配。
        owner (Optional[str]): 该用户组组长的用户码。
        members (Optional[str]): 用户组成员，是一个用半角逗号分隔的用户码字符串。该
            字段在SQL中用``OR``连接。
        page_num (int): 页码，默认为1。
        page_size (int): 页数，默认为10。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    group_code = empty_string_to_none(group_code)
    group_name = empty_string_to_none(group_name)
    owner = empty_string_to_none(owner)
    members = empty_string_to_none(members)
    if members is not None:
        members = members.split(',')
    user_group_dos = db.list_user_group_by_condition(group_code=group_code,
                                                     group_name=group_name,
                                                     owner=owner,
                                                     members=members,
                                                     page_num=page_num,
                                                     page_size=page_size)
    user_groups = list()
    for user_group_do in user_group_dos:
        user_groups.append(convert_user_group(user_group_do))
    return {"success": True, "data": user_groups}


@router.get('/count_groups',
            response_model=Dict[str, bool | str | int])
async def count_groups_by_condition(group_code: Optional[str] = None,
                                    group_name: Optional[str] = None,
                                    owner: Optional[str] = None,
                                    members: Optional[str] = None,
                                    current_user: Annotated[str | None, Cookie()] = None): # noqa
    '''
    获取根据条件查询用户组列表的总数。

    Args:
        group_code (Optional[str]): 用户组码。
        group_name (Optional[str]): 用户组名，模糊匹配。
        owner (Optional[str]): 该用户组组长的用户码。
        members (Optional[str]): 用户组成员，是一个用半角逗号分隔的用户码字符串。该
            字段在SQL中用``OR``连接。
        current_user: 请求Cookies，键为:arg:`current_user`，值为 user_code:token
            形式。

    '''
    _user = check_cookie(cookie=current_user)
    if _user is None:
        return {"success": False, "reason": "Invalid token"}
    group_code = empty_string_to_none(group_code)
    group_name = empty_string_to_none(group_name)
    owner = empty_string_to_none(owner)
    members = empty_string_to_none(members)
    if members is not None:
        members = members.split(',')
    count = db.count_user_group_by_condition(group_code=group_code,
                                             group_name=group_name,
                                             owner=owner,
                                             members=members)
    if count is None:
        return {"success": False, "reason": "Internal error"}
    return {"success": True, "data": count}
