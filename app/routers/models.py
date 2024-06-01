from enum import Enum
from pydantic import BaseModel


class UserModel(BaseModel):
    '''
    User model.

    '''
    user_name: str
    passwd: str
    email: str
    role: str | None = None
    description: str | None = None
    phone: str | None = None


class UserRoleEnum(Enum):
    Admin = 1
    Normal = 2
    Suspend = 3
