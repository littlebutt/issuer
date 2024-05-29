from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: datetime = Field(default_factory=datetime.utcnow)
    gmt_modified: datetime = Field(default_factory=datetime.utcnow)

    user_code: str = Field(nullable=False, index=True)
    user_name: str = Field(nullable=False)
    passwd: str = Field(nullable=False)
    role: str = Field(nullable=False)
    description: str = Field(nullable=True)
    phone: str = Field(nullable=False)




