from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import UniqueConstraint


class Generator(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: Optional[datetime] = Field(default_factory=datetime.utcnow)
    gmt_modified: Optional[datetime] = Field(default_factory=datetime.utcnow)

    meta_type: str = Field(nullable=False, index=True)


class User(SQLModel, table=True):
    __table__args__ = (UniqueConstraint("email"),)
    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: Optional[datetime] = Field(default_factory=datetime.utcnow)
    gmt_modified: Optional[datetime] = Field(default_factory=datetime.utcnow)

    user_code: Optional[str] = Field(nullable=False, index=True)
    user_name: str = Field(nullable=False)
    passwd: str = Field(nullable=False)
    role: str = Field(nullable=False)
    email: str = Field(nullable=False, index=True)
    description: Optional[str] = Field(nullable=True)
    phone: Optional[str] = Field(nullable=True)




