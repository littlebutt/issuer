from pydantic import BaseModel


class UserModel(BaseModel):
    '''
    User model.

    '''
    user_name: str
    passwd: str
    role: str
    email: str
    description: str | None = None
    phone: str | None = None
