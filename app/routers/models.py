from pydantic impoert BaseModel


class User(BaseModel):
    '''
    User model.

    '''
    user_name: str
    passwd: str
    role: str
    description: str | None = None
    phone: str | None = None



