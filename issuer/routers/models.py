from enum import Enum
from typing import List
from pydantic import BaseModel


class UserModel(BaseModel):
    '''
    User model.

    '''
    user_code: str | None = None
    user_name: str | None = None
    passwd: str | None = None
    email: str | None = None
    role: str | None = None
    description: str | None = None
    phone: str | None = None


class UserRoleEnum(Enum):
    Admin = 1
    Normal = 2
    Suspend = 3


class UserGroupReq(BaseModel):
    group_code: str | None = None
    group_name: str | None = None
    owner: str | None = None
    members: str | None = None


class UserGroupRes(BaseModel):
    status: int = 200
    group_code: str
    group_name: str
    owner: str
    members: List[UserModel]
