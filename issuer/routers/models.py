from enum import Enum
from typing import List
from pydantic import BaseModel


class UserModel(BaseModel):
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
    group_code: str
    group_name: str
    owner: UserModel
    members: List[UserModel] | str


class ProjectReq(BaseModel):
    project_code: str | None = None
    project_name: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    owner: str | None = None
    description: str | None = None
    status: str | None = None
    budget: str | None = None
    privilege: str | None = None
    members: str | None = None


class ProjectRes(BaseModel):
    project_code: str
    project_name: str
    start_date: str
    end_date: str | None = None
    owner: UserModel
    description: str | None = None
    status: str
    budget: str | None = None
    privilege: str
    participants: List[UserModel] | str


class ProjectStatusEnum(Enum):
    Start = 1
    Processing = 2
    Check = 3
    Finished = 4


class ProjectPrivilegeEnum(Enum):
    Public = 1
    Private = 2


class IssueReq(BaseModel):
    issue_code: str | None = None
    project_code: str | None = None
    issue_id: int | None = None
    title: str | None = None
    owner: str | None = None
    propose_date: str | None = None
    status: str | None = None
    tags: str | None = None
    followers: str | None = None


class IssueStatusEnum(Enum):
    Open = 1
    Finished = 2
    Closed = 3


class IssueRes(BaseModel):
    issue_code: str
    project_code: str
    issue_id: int
    title: str
    owner: UserModel
    propose_date: str
    status: str
    tags: str
    followers: List[UserModel]
