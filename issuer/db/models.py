from datetime import date, datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import UniqueConstraint


class Generator(SQLModel, table=True):
    '''
    简易发号器
    '''

    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: Optional[datetime] = Field(default_factory=datetime.utcnow)
    gmt_modified: Optional[datetime] = Field(default_factory=datetime.utcnow)

    meta_type: str = Field(nullable=False, index=True)
    '''发号标识'''


class User(SQLModel, table=True):
    '''
    用户模型，发号标识为US
    '''

    __table_args__ = (UniqueConstraint("email"),)
    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: Optional[datetime] = Field(default_factory=datetime.utcnow)
    gmt_modified: Optional[datetime] = Field(default_factory=datetime.utcnow)

    user_code: Optional[str] = Field(index=True)
    '''统一用户码'''

    user_name: str
    '''用户名'''

    passwd: str
    '''密码，采用md5加密'''

    role: str
    '''
    角色，分为管理员(Admin)、普通(Normal)和挂起(Suspend)。
    '''

    email: str = Field(index=True)
    '''电子邮箱，用于登录，唯一键'''

    description: Optional[str]
    '''个人描述'''

    phone: Optional[str]
    '''联系方式'''

    token: Optional[str]
    '''
    登录token，如果为空代表已登出，否则存放最近一次Cookie中的token。
    '''


class UserGroup(SQLModel, table=True):
    '''
    用户组模型，发号标识为UG
    '''
    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: Optional[datetime] = Field(default_factory=datetime.utcnow)
    gmt_modified: Optional[datetime] = Field(default_factory=datetime.utcnow)

    group_code: Optional[str] = Field(index=True)
    '''统一用户组码'''

    group_name: str
    '''用户组名'''

    group_owner: str
    '''
    用户组组长，用户码。
    '''


class UserToUserGroup(SQLModel, table=True):
    '''
    用户-用户组关系模型
    '''
    __table_args__ = (UniqueConstraint("user_code", "group_code"),)
    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: Optional[datetime] = Field(default_factory=datetime.utcnow)
    gmt_modified: Optional[datetime] = Field(default_factory=datetime.utcnow)

    user_code: str = Field(index=True)
    '''用户码'''

    group_code: str = Field(index=True)
    '''用户组码'''


class Project(SQLModel, table=True):
    '''
    项目模型，发号标识为PJ
    '''

    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: Optional[datetime] = Field(default_factory=datetime.utcnow)
    gmt_modified: Optional[datetime] = Field(default_factory=datetime.utcnow)

    project_code: Optional[str] = Field(index=True)
    '''统一项目码'''

    project_name: str
    '''项目名称'''

    start_date: Optional[date] = Field(default=datetime.now().date())
    '''项目开始日期'''

    end_date: Optional[date] = Field(default=None)
    '''项目计划截止日期'''

    owner: str
    '''项目负责人，用户码标识'''

    description: Optional[str]
    '''项目描述'''

    status: str
    '''
    项目状态
    '''

    budget: Optional[str]
    '''项目预算'''

    privilege: str
    '''
    权限，分为公开(Public)和私有(Private)，若私有权限仅限参与者查看。
    '''


class ProjectToUser(SQLModel, table=True):
    '''
    项目-用户关系模型
    '''
    __table_args__ = (UniqueConstraint("project_code", "user_code"),)
    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: Optional[datetime] = Field(default_factory=datetime.utcnow)
    gmt_modified: Optional[datetime] = Field(default_factory=datetime.utcnow)

    project_code: str = Field(index=True)
    '''项目码'''

    user_code: str = Field(index=True)
    '''用户码'''


class Issue(SQLModel, table=True):
    '''
    议题模型，发号标识为IS。

    '''
    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: Optional[datetime] = Field(default_factory=datetime.utcnow)
    gmt_modified: Optional[datetime] = Field(default_factory=datetime.utcnow)

    issue_code: Optional[str] = Field(index=True)
    '''议题码'''

    project_code: str = Field(index=True)
    '''项目码'''

    issue_id: Optional[int]
    '''议题编号'''

    title: str
    '''议题标题'''

    owner: str
    '''议题作者，用户码标识'''

    propose_date: date = Field(default=datetime.now().date())
    '''提出时间'''

    status: str
    '''
    议题状态，包括开启(Open)，完成(Finished)，关闭(Closed)
    '''

    tags: Optional[str]
    '''
    议题标签，用逗号分隔
    '''

    followers: Optional[str]
    '''议题关注者'''

# TODO: 添加assigned指派


class IssueComment(SQLModel, table=True):
    '''
    议题评论模型，发号标识为IC。

    '''
    id: Optional[int] = Field(default=None, primary_key=True)
    gmt_create: Optional[datetime] = Field(default_factory=datetime.utcnow)
    gmt_modified: Optional[datetime] = Field(default_factory=datetime.utcnow)

    comment_code: Optional[str] = Field(index=True)
    '''评论码'''

    issue_code: str = Field(index=True)
    '''议题码'''

    comment_time: datetime
    '''评论时间'''

    commenter: str
    '''评论人'''

    fold: bool
    '''是否折叠'''

    content: str
    '''评论内容'''

# TODO: Misc, Statics
