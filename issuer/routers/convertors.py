import logging
from issuer import db
from issuer.db import UserGroup, User
from issuer.routers.models import UserGroupRes, UserModel


Logger = logging.getLogger(__name__)


def convert_user(do_: User) -> "UserModel":
    return UserModel(
        user_code=do_.user_code,
        user_name=do_.user_name,
        passwd=do_.passwd,
        email=do_.email,
        role=do_.role,
        description=do_.description,
        phone=do_.phone,
        avatar=do_.avatar
    )


def convert_user_group(do_: UserGroup) -> "UserGroupRes":
    user_do = db.find_user_by_code(do_.group_owner)
    if user_do is None:
        Logger.error("Cannot find User with user_code: "
                     f"{do_.group_owner}")
    users = db.list_user_to_user_group_by_group(do_.group_code)
    members = list()
    for user in users:
        _user = db.find_user_by_code(user.user_code)
        if _user is None:
            Logger.error("Cannot find User with user_code: "
                         f"{user.user_code}")
            continue
        members.append(convert_user(_user))
    return UserGroupRes(
        group_code=do_.group_code,
        group_name=do_.group_name,
        owner=convert_user(user_do),
        members=members
    )
