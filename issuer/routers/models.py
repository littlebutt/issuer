from enum import Enum
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
