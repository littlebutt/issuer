import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from issuer.db import DatabaseFactory, User, Metas, insert_user, insert_metas
from issuer.routers import users, user_group, project, issue, comment, notice


def get_statics_path():
    pardir = os.path.dirname(__file__)
    return os.path.join(pardir, 'statics')


def get_index_path():
    pardir = os.path.dirname(__file__)
    parpardir = os.path.join(pardir, os.path.pardir)
    webdir = os.path.join(parpardir, 'web')
    return os.path.join(webdir, 'build')


app = FastAPI()


app.include_router(users.router)
app.include_router(user_group.router)
app.include_router(project.router)
app.include_router(issue.router)
app.include_router(comment.router)
app.include_router(notice.router)
app.mount("/statics",
          StaticFiles(directory=get_statics_path()), name="statics")
app.mount("/",
          StaticFiles(directory=get_index_path(), html=True))


@app.on_event('startup')
async def create_engine():
    # 创建schema
    app.db = DatabaseFactory.get_db()

    # 添加管理员
    admin = User(user_name="admin", passwd="21232f297a57a5a743894a0e4a801fc3",
                 role='admin', email="admin@issuer.com")
    insert_user(admin)

    # 添加管理员角色
    user_role_admin = Metas(meta_type='USER_ROLE',
                            meta_value='admin',
                            note="管理员")
    insert_metas(user_role_admin)

    user_role_default = Metas(meta_type='USER_ROLE',
                              meta_value='default',
                              note="默认")
    insert_metas(user_role_default)

    # 添加项目状态
    project_status_start = Metas(meta_type='PROJECT_STATUS',
                                 meta_value='start', note="开始")
    insert_metas(project_status_start)
    project_status_processing = Metas(meta_type='PROJECT_STATUS',
                                      meta_value='processing', note="进行")
    insert_metas(project_status_processing)
    project_status_checking = Metas(meta_type='PROJECT_STATUS',
                                    meta_value='checking', note="验收")
    insert_metas(project_status_checking)
    project_status_finished = Metas(meta_type='PROJECT_STATUS',
                                    meta_value='checked', note="完工")
    insert_metas(project_status_finished)

    # 添加议题状态
    issue_status_open = Metas(meta_type='ISSUE_STATUS',
                              meta_value='open', note="开放")
    insert_metas(issue_status_open)
    issue_status_finished = Metas(meta_type='ISSUE_STATUS',
                                  meta_value='finished', note="完成")
    insert_metas(issue_status_finished)
    issue_status_closed = Metas(meta_type='ISSUE_STATUS',
                                meta_value='closed', note="关闭")
    insert_metas(issue_status_closed)
